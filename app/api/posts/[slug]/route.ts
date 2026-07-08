import { NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ...data.post, related: data.related });
}
