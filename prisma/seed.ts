/**
 * Seed do conteúdo real (Prefeitura de Santana de Parnaíba).
 * Limpa o conteúdo anterior e recria, para cada notícia, os registros de
 * auditoria (ingest_email), classificação e o post publicado — com a
 * editoria/região curadas (conteúdo real, não e-mail de teste).
 */
import { prisma } from '../lib/db';
import { editoriaBySlug, TAXONOMIA_VERSAO } from '../lib/taxonomy';
import { slugify, readTimeMin, excerptFrom, normalize } from '../lib/format';
import { SEED_ITEMS, SECOM_ALLOWLIST_DEFAULT } from './seed-emails';

const FROM = SECOM_ALLOWLIST_DEFAULT;

function matchedFor(editoriaSlug: string, body: string): string[] {
  const ed = editoriaBySlug(editoriaSlug);
  if (!ed) return [];
  const nb = normalize(body);
  return ed.keywords.filter((k) => nb.includes(normalize(k))).slice(0, 6);
}

async function main() {
  console.log('\n▶ Limpando conteúdo anterior…');
  await prisma.classification.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.ingestEmail.deleteMany({});

  console.log(`▶ Criando ${SEED_ITEMS.length} notícias reais…\n`);

  for (const item of SEED_ITEMS) {
    const ed = editoriaBySlug(item.editoria);
    const when = new Date(item.date);
    const slug = slugify(item.title);
    const matched = matchedFor(item.editoria, item.body);
    const scores: Record<string, number> = { [item.editoria]: 0.94 };

    const email = await prisma.ingestEmail.create({
      data: {
        messageId: `real-${item.id}@secom`,
        fromAddr: FROM,
        subject: item.title,
        bodyText: item.body,
        attachments: [],
        rawHeaders: {},
        status: 'published',
        receivedAt: when,
      },
    });

    await prisma.classification.create({
      data: {
        emailId: email.id,
        editoriaSlug: item.editoria,
        regiaoSlug: item.regiao,
        score: 0.94,
        scores,
        matchedTerms: matched,
        taxonomiaVersao: TAXONOMIA_VERSAO,
        method: 'rules',
      },
    });

    await prisma.post.create({
      data: {
        slug,
        title: item.title,
        excerpt: excerptFrom(item.body),
        body: item.body,
        editoriaSlug: item.editoria,
        regiaoSlug: item.regiao,
        coverImageUrl: `https://picsum.photos/seed/${slug}/1200/700`,
        author: 'Redação Gazeta',
        source: 'SECOM · Prefeitura de Santana de Parnaíba',
        readTimeMin: readTimeMin(item.body),
        status: 'published',
        featured: !!item.featured,
        confidence: 0.94,
        emailId: email.id,
        publishedAt: when,
      },
    });

    console.log(`  ✓ [${(ed?.nome ?? item.editoria).padEnd(10)}] ${item.title.slice(0, 56)}`);
  }

  const total = await prisma.post.count({ where: { status: 'published' } });
  console.log(`\n✔ Seed concluído. ${total} notícias publicadas.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
