// Sincroniza el Project de GitHub con las etiquetas y el estado de los issues.
// Las etiquetas son la fuente: epica:*, prioridad:*, sprint:N. Los campos del
// Project (Épica, Prioridad, Sprint, Status, Inicio, Fin) se derivan de ellas
// para poder agrupar y planear. Idempotente: solo escribe lo que cambió.
//
// Local:  GH_TOKEN=$(env -u GITHUB_TOKEN gh auth token) bun run project:sync
// CI:     .github/workflows/project-sync.yml con el secreto PROJECT_TOKEN.

const OWNER = process.env.PROJECT_OWNER ?? 'reeinharddd'
const REPO = process.env.PROJECT_REPO ?? 'docu'
const NUMBER = Number(process.env.PROJECT_NUMBER ?? '1')
const TOKEN = process.env.PROJECT_TOKEN || process.env.GH_TOKEN
const DRY = process.argv.includes('--dry-run')

if (!TOKEN) {
  console.log('Sin PROJECT_TOKEN ni GH_TOKEN: no hay nada que sincronizar.')
  process.exit(0)
}

type Json = Record<string, unknown>
type Option = { id: string; name: string }
type Field = {
  id: string
  name: string
  dataType: string
  options?: Option[]
  configuration?: { iterations: { id: string; title: string }[] }
}
type Value = {
  text?: string
  date?: string
  optionId?: string
  iterationId?: string
  field: { name: string }
}
type Item = {
  id: string
  fieldValues: { nodes: Value[] }
  content: Issue | null
}
type Issue = {
  id: string
  number: number
  state: 'OPEN' | 'CLOSED'
  body: string
  labels: { nodes: { name: string }[] }
  parent: { number: number } | null
  closedByPullRequestsReferences: { totalCount: number }
}

const gql = async <T>(query: string, variables: Json = {}): Promise<T> => {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  const j = (await r.json()) as { data?: T; errors?: unknown }
  if (j.errors || !j.data) throw new Error(JSON.stringify(j.errors ?? j))
  return j.data
}

const EPICAS: Record<string, string> = {
  infraestructura: 'Infraestructura',
  backend: 'Backend',
  frontend: 'Frontend',
  'base-de-datos': 'Base de datos',
  autenticacion: 'Autenticación',
  'qa-documentacion': 'QA/Documentación',
  diseno: 'Diseño',
}
const PRIORIDADES: Record<string, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

const ISSUE_FIELDS = `id number state body labels(first: 30) { nodes { name } } parent { number }
  closedByPullRequestsReferences(first: 1, includeClosedPrs: false) { totalCount }`

const project = await gql<{
  user: { projectV2: { id: string; fields: { nodes: Field[] } } }
}>(
  `query($o: String!, $n: Int!) { user(login: $o) { projectV2(number: $n) { id fields(first: 50) { nodes {
    ... on ProjectV2FieldCommon { id name dataType }
    ... on ProjectV2SingleSelectField { options { id name } }
    ... on ProjectV2IterationField { configuration { iterations { id title } } } } } } } }`,
  { o: OWNER, n: NUMBER },
)
const projectId = project.user.projectV2.id
const field = (name: string) => {
  const f = project.user.projectV2.fields.nodes.find((x) => x.name === name)
  if (!f) throw new Error(`El Project no tiene el campo ${name}`)
  return f
}
const F = {
  status: field('Status'),
  epica: field('Épica'),
  prioridad: field('Prioridad'),
  sprint: field('Sprint'),
  inicio: field('Inicio'),
  fin: field('Fin'),
}

const issues: Issue[] = []
for (let cursor: string | null = null; ; ) {
  const d: {
    repository: {
      issues: {
        pageInfo: { hasNextPage: boolean; endCursor: string }
        nodes: Issue[]
      }
    }
  } = await gql(
    `query($o: String!, $r: String!, $c: String) { repository(owner: $o, name: $r) {
        issues(first: 100, after: $c) { pageInfo { hasNextPage endCursor } nodes { ${ISSUE_FIELDS} } } } }`,
    { o: OWNER, r: REPO, c: cursor },
  )
  issues.push(...d.repository.issues.nodes)
  if (!d.repository.issues.pageInfo.hasNextPage) break
  cursor = d.repository.issues.pageInfo.endCursor
}

const items = new Map<number, Item>()
for (let cursor: string | null = null; ; ) {
  const d: {
    node: {
      items: {
        pageInfo: { hasNextPage: boolean; endCursor: string }
        nodes: Item[]
      }
    }
  } = await gql(
    `query($p: ID!, $c: String) { node(id: $p) { ... on ProjectV2 { items(first: 100, after: $c) {
      pageInfo { hasNextPage endCursor } nodes { id content { ... on Issue { number } }
      fieldValues(first: 30) { nodes {
        ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } }
        ... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2FieldCommon { name } } }
        ... on ProjectV2ItemFieldSingleSelectValue { optionId field { ... on ProjectV2FieldCommon { name } } }
        ... on ProjectV2ItemFieldIterationValue { iterationId field { ... on ProjectV2FieldCommon { name } } } } } } } } } }`,
    { p: projectId, c: cursor },
  )
  for (const it of d.node.items.nodes)
    if (it.content?.number) items.set(it.content.number, it)
  if (!d.node.items.pageInfo.hasNextPage) break
  cursor = d.node.items.pageInfo.endCursor
}

const byNumber = new Map(issues.map((i) => [i.number, i]))
const label = (i: Issue, prefix: string): string | undefined => {
  const own = i.labels.nodes
    .map((l) => l.name)
    .find((n) => n.startsWith(prefix))
  if (own) return own.slice(prefix.length)
  const parent = i.parent ? byNumber.get(i.parent.number) : undefined
  return parent ? label(parent, prefix) : undefined
}
const optionId = (f: Field, name?: string) =>
  name ? f.options?.find((o) => o.name === name)?.id : undefined
const iterationId = (n?: string) =>
  F.sprint.configuration?.iterations.find((x) => x.title === `Sprint ${n}`)?.id

let writes = 0
const set = async (
  itemId: string,
  f: Field,
  value: Json,
  current: Value | undefined,
  tag: string,
) => {
  const same =
    (value.singleSelectOptionId &&
      current?.optionId === value.singleSelectOptionId) ||
    (value.iterationId && current?.iterationId === value.iterationId) ||
    (value.date && current?.date === value.date)
  if (same) return
  writes++
  console.log(`  ${tag}: ${f.name} -> ${JSON.stringify(value)}`)
  if (DRY) return
  await gql(
    `mutation($p: ID!, $i: ID!, $f: ID!, $v: ProjectV2FieldValue!) {
      updateProjectV2ItemFieldValue(input: { projectId: $p, itemId: $i, fieldId: $f, value: $v }) { clientMutationId } }`,
    { p: projectId, i: itemId, f: f.id, v: value },
  )
}

for (const issue of issues) {
  let item = items.get(issue.number)
  if (!item) {
    console.log(`#${issue.number}: se agrega al Project`)
    writes++
    if (DRY) continue
    const d = await gql<{ addProjectV2ItemById: { item: { id: string } } }>(
      `mutation($p: ID!, $c: ID!) { addProjectV2ItemById(input: { projectId: $p, contentId: $c }) { item { id } } }`,
      { p: projectId, c: issue.id },
    )
    item = {
      id: d.addProjectV2ItemById.item.id,
      fieldValues: { nodes: [] },
      content: issue,
    }
  }
  const cur = (name: string) =>
    item?.fieldValues.nodes.find((v) => v.field?.name === name)
  const tag = `#${issue.number}`

  const statusName =
    issue.state === 'CLOSED'
      ? 'Listo'
      : issue.closedByPullRequestsReferences.totalCount > 0
        ? 'En revisión'
        : cur('Status')
          ? undefined
          : 'Por hacer'
  const statusId = optionId(F.status, statusName)
  if (statusId)
    await set(
      item.id,
      F.status,
      { singleSelectOptionId: statusId },
      cur('Status'),
      tag,
    )

  const epica = optionId(F.epica, EPICAS[label(issue, 'epica:') ?? ''])
  if (epica)
    await set(
      item.id,
      F.epica,
      { singleSelectOptionId: epica },
      cur('Épica'),
      tag,
    )

  const prioridad = optionId(
    F.prioridad,
    PRIORIDADES[label(issue, 'prioridad:') ?? ''],
  )
  if (prioridad)
    await set(
      item.id,
      F.prioridad,
      { singleSelectOptionId: prioridad },
      cur('Prioridad'),
      tag,
    )

  const sprint = iterationId(label(issue, 'sprint:'))
  if (sprint)
    await set(item.id, F.sprint, { iterationId: sprint }, cur('Sprint'), tag)

  const m = issue.body?.match(
    /Cronograma(?::\*\*|\s*\n)\s*(\d{4}-\d{2}-\d{2})\s*(?:→|->)\s*(\d{4}-\d{2}-\d{2})/,
  )
  if (m && !cur('Inicio'))
    await set(item.id, F.inicio, { date: m[1] }, undefined, tag)
  if (m && !cur('Fin'))
    await set(item.id, F.fin, { date: m[2] }, undefined, tag)
}

console.log(
  `${issues.length} issues revisados, ${writes} cambios${DRY ? ' (dry-run)' : ''}.`,
)
