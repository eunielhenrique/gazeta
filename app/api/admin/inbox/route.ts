import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getInbox } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const status = new URL(req.url).searchParams.get('status') as
    | 'review'
    | 'published'
    | 'draft'
    | 'all'
    | null;
  return NextResponse.json(await getInbox(status ?? 'review'));
}
