/**
 * Seed idempotente. Cada e-mail passa pelo pipeline real (ingestEmail),
 * então o banco reflete o classificador de verdade. O e-mail marcado como
 * `featured` vira o destaque (hero) da home.
 */
import { prisma } from '../lib/db';
import { ingestEmail } from '../lib/pipeline';
import { SEED_EMAILS, SECOM_ALLOWLIST_DEFAULT } from './seed-emails';

async function main() {
  // Garante que o remetente simulado passe na allowlist durante o seed.
  if (!process.env.SECOM_ALLOWLIST) process.env.SECOM_ALLOWLIST = SECOM_ALLOWLIST_DEFAULT;
  const from = SECOM_ALLOWLIST_DEFAULT;

  console.log(`\n▶ Seed: ingerindo ${SEED_EMAILS.length} e-mails da SECOM pelo pipeline…\n`);

  for (const em of SEED_EMAILS) {
    const outcome = await ingestEmail({
      messageId: em.messageId,
      fromAddr: from,
      subject: em.subject,
      bodyText: em.body,
      receivedAt: new Date(em.receivedAt),
    });

    // Marca o destaque + garante publicação dos itens de exemplo (para uma
    // home cheia mesmo quando o classificador sugere "revisão").
    if (outcome.postId) {
      await prisma.post.update({
        where: { id: outcome.postId },
        data: {
          featured: !!em.featured,
          status: 'published',
          publishedAt: new Date(em.receivedAt),
        },
      });
    }

    const tag =
      outcome.action === 'publish' ? '✓ publicado' : outcome.action === 'review' ? '~ revisão' : '× descarte';
    console.log(
      `  ${tag.padEnd(12)} [${(outcome.editoria ?? '—').padEnd(10)}] ${outcome.regiao?.padEnd(20) ?? ''} score=${outcome.score?.toFixed(2) ?? '—'}  ${em.subject.slice(0, 48)}`,
    );
  }

  const total = await prisma.post.count({ where: { status: 'published' } });
  console.log(`\n✔ Seed concluído. ${total} posts publicados.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
