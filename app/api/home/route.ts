import { NextResponse } from 'next/server';
import { getHome } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await getHome());
}
