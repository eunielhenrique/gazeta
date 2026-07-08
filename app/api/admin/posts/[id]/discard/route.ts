import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { discardPost } from '@/lib/admin';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const { id } = await params;
  return NextResponse.json(await discardPost(id));
}
