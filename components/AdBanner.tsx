import Image from 'next/image';

const RATIO = 2427 / 303;

/**
 * Banner publicitário do masthead — cresce/encolhe pra preencher a linha
 * (flex:1), com a altura seguindo a mesma proporção da imagem original, então
 * nunca corta nem estica: a caixa sempre tem o mesmo formato da arte.
 */
export default function AdBanner({ maxHeight }: { maxHeight: number }) {
  return (
    <a
      href="https://santanadeparnaiba.sp.gov.br"
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', flex: 1, minWidth: 0, maxHeight, aspectRatio: RATIO, overflow: 'hidden', borderRadius: 'var(--r-sm)' }}
    >
      <Image
        src="/assets/banners/educando-no-parque.jpg"
        alt="Prefeitura de Santana de Parnaíba — Educando no Parque, mais de 3 mil alunos atendidos"
        width={2427}
        height={303}
        style={{ height: '100%', width: '100%' }}
        priority
      />
    </a>
  );
}
