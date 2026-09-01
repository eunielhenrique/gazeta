import Image from 'next/image';

/** Faixa publicitária entre o menu e o bloco de destaques da home. */
export default function AdBanner() {
  return (
    <a
      href="https://santanadeparnaiba.sp.gov.br"
      target="_blank"
      rel="noopener noreferrer"
      className="gz-container"
      style={{ display: 'block', maxWidth: 1240, margin: '20px auto 0', padding: '0 32px' }}
    >
      <Image
        src="/assets/banners/educando-no-parque.jpg"
        alt="Prefeitura de Santana de Parnaíba — Educando no Parque, mais de 3 mil alunos atendidos"
        width={2427}
        height={303}
        style={{ width: '100%', height: 'auto', borderRadius: 'var(--r-md)' }}
        priority
      />
    </a>
  );
}
