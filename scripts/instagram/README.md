# Instagram · deixar de seguir contas pequenas

Script local que deixa de seguir, na sua conta, perfis com menos de N
seguidores (padrão: 1000). Roda na sua máquina, com um Chrome real e a sua
sessão logada. Nada de senha em arquivo nem serviço externo.

> **Risco.** A API oficial do Instagram não permite seguir/deixar de seguir.
> Este script usa os mesmos endpoints internos que o site usa no navegador, o
> que viola os termos de uso da Meta. Contas podem receber bloqueio temporário
> de ações ou pedido de verificação. Os limites padrão são conservadores;
> reduzir as pausas ou rodar várias vezes ao dia aumenta muito o risco.

## Pré-requisitos

- Node 22+ e `npm install` feito na raiz do projeto.
- Google Chrome (ou Edge) instalado. Alternativamente, defina
  `IG_BROWSER_PATH` com o caminho de um executável Chromium.

## Passo a passo

1. **Simulação** (não deixa de seguir ninguém):

   ```bash
   npm run ig:unfollow
   ```

   Na primeira vez uma janela do Chrome abre: faça login normalmente. A sessão
   fica salva em `.instagram/profile`. O script então lista quem você segue,
   consulta o número de seguidores de cada um (2–5 s por perfil, com cache de
   7 dias) e grava `.instagram/report.csv`.

2. **Revise o CSV** e proteja quem não pode sair. Crie `.instagram/whitelist.txt`
   com um usuário por linha:

   ```
   @cliente_importante
   @parceiro
   # linhas com # são ignoradas
   ```

3. **Aplicar**, em lotes:

   ```bash
   npm run ig:unfollow -- --apply
   ```

   Deixa de seguir até 25 perfis por execução, começando pelos menores, com
   pausas aleatórias de 45–120 s entre cada um. Rode uma vez por dia até
   acabar. O histórico fica em `.instagram/unfollowed.jsonl`.

## Opções

| Flag | Padrão | Efeito |
|---|---|---|
| `--threshold N` | 1000 | Limite de seguidores (estritamente menor que N) |
| `--limit N` | 25 | Máximo de unfollows por execução |
| `--apply` | off | Sem esta flag é só simulação |
| `--refresh` | off | Ignora o cache de seguindo e de contagens |
| `--min-pause S` / `--max-pause S` | 45 / 120 | Pausa entre unfollows, em segundos (mínimo 20) |
| `--no-skip-verified` | | Inclui contas verificadas nos candidatos |
| `--data-dir DIR` | `.instagram` | Onde ficam perfil, caches e relatório |

## Quando algo dá errado

- **"Rate limit"**: o script pausa 10 minutos sozinho e tenta de novo.
- **"pediu verificação/bloqueou a sessão"**: abra o Instagram no Chrome do
  perfil (`.instagram/profile`), resolva o aviso e espere pelo menos 24 h.
- **Nenhum navegador encontrado**: instale o Chrome ou aponte `IG_BROWSER_PATH`.
