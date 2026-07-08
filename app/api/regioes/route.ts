import { NextResponse } from 'next/server';
import { REGIOES } from '@/lib/taxonomy';

export async function GET() {
  return NextResponse.json(REGIOES);
}
