import { taxonomia, type Taxonomia } from './taxonomy';
import { normalize, cleanSubject } from './format';

/**
 * Classificador determinístico de editoria (keywords + regex), portado de
 * `classifier.reference.js` do handoff. Sem dependências externas. O LLM
 * (opcional) só entra como desempate no incerto — não implementado aqui,
 * mas o ponto de extensão está marcado.
 */

export type Decision = {
  action: 'publish' | 'review' | 'discard';
  postStatus: 'published' | 'review' | 'draft';
  emailStatus: 'published' | 'review' | 'discarded';
};

export type ClassifyResult = {
  editoria: string;
  regiao: string;
  score: number;
  scores: Record<string, number>;
  matched: string[];
  allMatched: Record<string, string[]>;
  taxonomiaVersao: string;
  method: 'rules';
  decision: Decision;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countOccurrences(haystack: string, needle: string): number {
  const n = normalize(needle);
  if (!n) return 0;
  const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(n)}([^a-z0-9]|$)`, 'g');
  return (haystack.match(re) || []).length;
}

export function classify(
  email: { subject: string; body: string },
  tax: Taxonomia = taxonomia,
): ClassifyResult {
  const subject = cleanSubject(email.subject);
  const nSubject = normalize(subject);
  const nBody = normalize(email.body);
  const full = `${nSubject} ${nSubject} ${nBody}`; // título conta 2x

  const scoresBrutos: Record<string, number> = {};
  const matchedByEd: Record<string, string[]> = {};

  for (const ed of tax.editorias) {
    let s = 0;
    const matched: string[] = [];

    for (const kw of ed.keywords) {
      const inTitle = countOccurrences(nSubject, kw);
      const inBody = countOccurrences(nBody, kw);
      const hits = inTitle * 2 + inBody; // título 2x
      if (hits > 0) {
        s += hits;
        matched.push(kw);
      }
    }
    for (const rx of ed.regex || []) {
      try {
        const re = new RegExp(rx, 'gi');
        const m = (full.match(re) || []).length;
        if (m > 0) {
          s += m * 2;
          matched.push(`/${rx}/`);
        }
      } catch {
        /* regex inválida na taxonomia — ignora */
      }
    }
    s *= ed.peso || 1;
    scoresBrutos[ed.slug] = s;
    matchedByEd[ed.slug] = matched;
  }

  // normalização score/(score+K)
  const K = 3;
  const scores: Record<string, number> = {};
  let winner = tax.editorias[0].slug;
  let best = -1;
  for (const ed of tax.editorias) {
    const raw = scoresBrutos[ed.slug];
    scores[ed.slug] = Number((raw / (raw + K)).toFixed(4));
    if (raw > best) {
      best = raw;
      winner = ed.slug;
    }
  }
  const score = scores[winner] || 0;

  // região
  let regiao = tax.regiao_padrao;
  for (const r of tax.regioes) {
    if (countOccurrences(full, r.nome) > 0 || full.includes(normalize(r.slug))) {
      regiao = r.slug;
      break;
    }
  }

  // decisão pelos limiares
  const L = tax.limiares;
  let decision: Decision;
  if (best === 0 || score < L.descartar_abaixo_de) {
    decision = { action: 'discard', postStatus: 'draft', emailStatus: 'discarded' };
    winner = winner || tax.fallback.editoria;
  } else if (score >= L.auto_publicar) {
    decision = { action: 'publish', postStatus: 'published', emailStatus: 'published' };
  } else {
    decision = { action: 'review', postStatus: 'review', emailStatus: 'review' };
  }

  return {
    editoria: winner,
    regiao,
    score,
    scores,
    matched: matchedByEd[winner] || [],
    allMatched: matchedByEd,
    taxonomiaVersao: tax.versao,
    method: 'rules',
    decision,
  };
}
