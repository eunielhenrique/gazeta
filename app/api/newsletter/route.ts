import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const email = (body.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: {},
  });
  return NextResponse.json({ ok: true });
}
