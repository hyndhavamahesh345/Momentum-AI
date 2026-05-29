import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
const { globSync } = fg;

const routes = globSync('src/app/api/**/route.js', { absolute: true });

const appendCode = `\n
// Auto-appended to fix React Router v7 static analysis
export async function loader({ request, params }) {
  if (typeof GET !== 'undefined') return GET(request, { params });
  return new Response("Method Not Allowed", { status: 405 });
}
export async function action({ request, params }) {
  const method = request.method;
  if (method === "POST" && typeof POST !== 'undefined') return POST(request, { params });
  if (method === "PUT" && typeof PUT !== 'undefined') return PUT(request, { params });
  if (method === "PATCH" && typeof PATCH !== 'undefined') return PATCH(request, { params });
  if (method === "DELETE" && typeof DELETE !== 'undefined') return DELETE(request, { params });
  return new Response("Method Not Allowed", { status: 405 });
}
`;

for (const file of routes) {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('export async function loader') && !content.includes('export async function action')) {
    fs.writeFileSync(file, content + appendCode);
    console.log('Fixed', file);
  } else {
    console.log('Already fixed', file);
  }
}
