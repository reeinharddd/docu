// Servidor estático del playground. Cero dependencias, funciona offline.
// Arranque: bun run start (puerto PLAYGROUND_PORT o 4200).
import { join } from "node:path";

const ROOT = import.meta.dir;
const PORT = Number(process.env.PLAYGROUND_PORT ?? 4200);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let rel = url.pathname === "/" ? "/src/index.html" : url.pathname;
    if (rel.includes("..")) return new Response("No", { status: 400 });
    const file = Bun.file(join(ROOT, rel));
    if (!(await file.exists())) return new Response("No existe", { status: 404 });
    const ext = rel.slice(rel.lastIndexOf("."));
    return new Response(file, {
      headers: { "Content-Type": TYPES[ext] ?? "application/octet-stream" },
    });
  },
});

console.log(`Playground en http://localhost:${PORT} (CTRL+C para parar)`);
