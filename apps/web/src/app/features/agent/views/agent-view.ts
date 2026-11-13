import { Component, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Button } from '../../../ui/atoms/button/button'
import { Icon } from '../../../ui/atoms/icon/icon'
import { StatusBadge } from '../../../ui/atoms/status-badge/status-badge'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'

/**
 * DEMO ONLY — mock-up of the DOCU agent (the AI inside the product, #85).
 * The agent answers questions about the installation's data, always with
 * citations, and proposes actions; it never publishes official data
 * (ADR-0006). Answers here are scripted from the case until the LLM with
 * citations lands.
 */
export interface Citation {
  label: string
  fileName: string
  rule: string | null
  link: { path: string; q?: string; rule?: string }
}

export interface AgentAction {
  label: string
  path: string
  q?: string
  rule?: string
}

export interface ChatMessage {
  id: number
  from: 'user' | 'agent'
  text: string
  bullets?: string[]
  citations?: Citation[]
  actions?: AgentAction[]
  trace?: string
}

const SUGGESTIONS = [
  '¿Qué órdenes dependen del rollo R-017?',
  '¿Por qué paró TP-01 el lunes?',
  '¿Qué está detenido en la bandeja?',
  'Resume el reporte del 26 de octubre',
]

function answer(question: string): Omit<ChatMessage, 'id' | 'from'> {
  const q = question.toLowerCase()
  if (q.includes('r-017') || q.includes('rollo')) {
    return {
      text: 'Del rollo R-017 dependen tres órdenes. Ninguna puede correr mientras el rollo siga sin certificado:',
      bullets: [
        'ORD-2026-0042 · TP-01 · lunes 26, T1',
        'ORD-2026-0043 · TP-01 · lunes 26, T2',
        'ORD-2026-0048 · TP-01 · martes 27, T1 (en replan)',
      ],
      citations: [
        {
          label: 'Recepción del 24-oct',
          fileName: 'recepcion-sab-24oct.xlsx',
          rule: 'R-P1',
          link: { path: '/search', q: 'R-017' },
        },
        {
          label: 'Correo de la hermana',
          fileName: 'aviso-embarque-tyvek.eml',
          rule: 'R-P4',
          link: { path: '/search', q: 'ORD-2026-0042' },
        },
      ],
      actions: [
        { label: 'Ver trazabilidad de R-017', path: '/search', q: 'R-017' },
        { label: 'Ver bloqueos en el programa', path: '/schedule' },
      ],
      trace:
        'Motor: LLM local (Ollama) · 412 tokens · 1.8 s · 3 fuentes consultadas',
    }
  }
  if (q.includes('tp-01') || q.includes('paro') || q.includes('paró')) {
    return {
      text: 'TP-01 estuvo detenida unos 180 minutos en el turno T1 del 26-oct. El film del rollo montado corrió mal y hubo que purgarlo:',
      bullets: [
        '45 min de paro por revisión y re-tensado',
        '135 min de espera de material',
        '36 kg de merma (2 kg de film corrido y 34 kg de purga)',
      ],
      citations: [
        {
          label: 'Excel de turno TP-01',
          fileName: 'turno-TP01-T1-2026-10-26.xlsx',
          rule: null,
          link: { path: '/search', q: 'TP-01' },
        },
      ],
      actions: [
        {
          label: 'Capturar el motivo del paro (R-A1)',
          path: '/inbox',
          rule: 'R-A1',
        },
      ],
      trace:
        'Motor: LLM local (Ollama) · 356 tokens · 1.5 s · 2 fuentes consultadas',
    }
  }
  if (
    q.includes('bandeja') ||
    q.includes('detenido') ||
    q.includes('cuarentena')
  ) {
    return {
      text: 'Hay 4 registros detenidos. Cada uno lleva la regla que lo detuvo:',
      bullets: [
        'R-017 sin certificado (R-P1)',
        'R-019 con medida distinta a la pedida (R-P2)',
        'Paro de 45 min sin motivo en TP-01 (R-A1)',
        'Correo de la hermana que cambia 3 órdenes (R-P4)',
      ],
      citations: [
        {
          label: 'Bandeja de cuarentena',
          fileName: '4 archivos de origen',
          rule: null,
          link: { path: '/inbox' },
        },
      ],
      actions: [{ label: 'Abrir la bandeja', path: '/inbox' }],
      trace:
        'Motor: LLM local (Ollama) · 298 tokens · 1.2 s · 4 fuentes consultadas',
    }
  }
  if (q.includes('reporte') || q.includes('resume') || q.includes('26')) {
    return {
      text: 'El 26-oct cerró con TP-01 detenida casi todo el turno T1 y una alerta de merma: 36 kg contra un umbral de 20 kg. TB-01 y TB-02 produjeron 9,430 piezas buenas entre las dos.',
      citations: [
        {
          label: 'Reporte del día',
          fileName: 'Derivado de 6 documentos oficiales',
          rule: null,
          link: { path: '/reports' },
        },
      ],
      actions: [{ label: 'Abrir el reporte del día', path: '/reports' }],
      trace:
        'Motor: LLM local (Ollama) · 371 tokens · 1.6 s · 6 fuentes consultadas',
    }
  }
  return {
    text: 'No encontré datos oficiales que respondan esa pregunta. Prueba con un rollo, una orden, una máquina o un día (por ejemplo, R-017 o TP-01).',
    trace: 'Motor: LLM local (Ollama) · 120 tokens · 0.6 s · 0 fuentes',
  }
}

@Component({
  imports: [Button, Icon, PageHeader, RouterLink, StatusBadge],
  selector: 'app-agent',
  templateUrl: './agent-view.html',
})
export class AgentView {
  private nextId = 1
  protected readonly suggestions = SUGGESTIONS

  readonly messages = signal<ChatMessage[]>([
    {
      id: this.nextId++,
      from: 'agent',
      text: 'Hola. Puedo responder preguntas sobre los datos de esta instalación, siempre con la fuente de cada cifra, y proponerte acciones. No publico datos oficiales: eso lo confirma una persona.',
    },
  ])
  readonly draft = signal('')
  readonly thinking = signal(false)

  onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value)
  }

  ask(text: string): void {
    const question = text.trim()
    if (!question || this.thinking()) return
    this.messages.update((m) => [
      ...m,
      { id: this.nextId++, from: 'user', text: question },
    ])
    this.draft.set('')
    this.thinking.set(true)
    setTimeout(() => {
      this.messages.update((m) => [
        ...m,
        { id: this.nextId++, from: 'agent', ...answer(question) },
      ])
      this.thinking.set(false)
    }, 900)
  }

  submit(event: Event): void {
    event.preventDefault()
    this.ask(this.draft())
  }
}
