-- Tira do portal as notícias originadas de smafel@santanadeparnaiba.sp.gov.br
-- (Secretaria de Esportes): agenda de estádio, tabela de campeonato e
-- programação semanal entravam pelo pipeline e se publicavam sozinhas.
-- A partir daqui o remetente está na blocklist (lib/sender-policy.ts).
--
-- O e-mail NÃO é apagado: o log de auditoria fica, marcado como descartado,
-- e o Message-ID já gravado impede que o mesmo release seja reingerido.

DELETE FROM "post"
WHERE "email_id" IN (
  SELECT "id" FROM "ingest_email"
  WHERE lower("from_addr") LIKE '%smafel@santanadeparnaiba.sp.gov.br%'
);

UPDATE "ingest_email"
SET "status" = 'discarded'
WHERE lower("from_addr") LIKE '%smafel@santanadeparnaiba.sp.gov.br%'
  AND "status" <> 'discarded';
