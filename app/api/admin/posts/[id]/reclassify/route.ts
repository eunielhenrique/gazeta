import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { reclassifyPost } from '@/lib/admin';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { editoria_slug?: string; editoriaSlug?: string };
  const slug = body.editoria_slug ?? body.editoriaSlug;
  if (!slug) return NextResponse.json({ error: 'missing_editoria_slug' }, { status: 400 });
  try {
    return NextResponse.json(await reclassifyPost(id, slug));
  } catch {
    return NextResponse.json({ error: 'editoria_invalida' }, { status: 400 });
  }
}
