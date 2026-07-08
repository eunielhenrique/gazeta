import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updatePost } from '@/lib/admin';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    excerpt?: string;
    body?: string;
    cover_image_url?: string;
    coverImageUrl?: string;
  };
  const updated = await updatePost(id, {
    title: body.title,
    excerpt: body.excerpt,
    body: body.body,
    coverImageUrl: body.cover_image_url ?? body.coverImageUrl,
  });
  return NextResponse.json(updated);
}
