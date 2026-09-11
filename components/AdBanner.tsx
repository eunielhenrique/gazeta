import Image from 'next/image';

/** Proporção real do arquivo do banner (2427x303). */
const BANNER_W = 2427;
const BANNER_H = 303;

/**
 * Banner publicitário do masthead — ocupa TODA a largura que sobra ao lado
 * do logo (flex:1), até a borda direita do container (alinhado com o botão
 * "Assine" da linha de cima), crescendo na proporção original da imagem:
 * a caixa trava o aspect-ratio, então nunca estica nem corta.
 */
export default function AdBanner() {
  return (
    <a
      href="https://santanadeparnaiba.sp.gov.br"
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', flex: 1, minWidth: 0, aspectRatio: `${BANNER_W} / ${BANNER_H}`, overflow: 'hidden', borderRadius: 'var(--r-sm)' }}
    >
      <Image
        src="/assets/banners/santana-bicampea-melhor-cidade.jpg"
        alt="Santana de Parnaíba — Bicampeã do Brasil, melhor cidade do país de porte médio (Veja Negócios / Austin Rating)"
        width={BANNER_W}
        height={BANNER_H}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        priority
      />
    </a>
  );
}
