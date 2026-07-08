import { NextResponse } from 'next/server';

/**
 * Auth simples para rotas internas: bearer token == ADMIN_TOKEN.
 * Se ADMIN_TOKEN não estiver setado, libera (ambiente de dev).
 * Retorna null quando autorizado, ou uma resposta 401 quando não.
 */
export function requireAdmin(req: Request): NextResponse | null {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return null;
  const header = req.headers.get('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : req.headers.get('x-admin-token');
  if (provided !== token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return null;
}
