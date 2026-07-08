import { NextResponse } from 'next/server';
import { listPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const result = await listPosts({
    editoria: searchParams.get('editoria') ?? undefined,
    regiao: searchParams.get('regiao') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    page: Number(searchParams.get('page') ?? '1'),
    limit: Number(searchParams.get('limit') ?? '12'),
  });
  return NextResponse.json(result);
}
