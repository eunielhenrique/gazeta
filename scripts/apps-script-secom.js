/**
 * Gazeta de Alphaville / aaah! — ingestão automática dos releases da SECOM.
 *
 * Roda no Google Apps Script da conta que recebe os e-mails da Prefeitura.
 * A cada 10 minutos procura e-mails do domínio da SECOM ainda não
 * processados e manda para o site em DUAS fases:
 *
 *   1. texto (assunto, corpo, data) — requisição pequena: é o que publica a
 *      matéria. Se falhar, a thread fica SEM rótulo e é tentada de novo na
 *      próxima execução (até MAX_TENTATIVAS; só então recebe "gazeta-erro").
 *   2. fotos, uma por requisição — best-effort: foto que falhar é registrada
 *      no log e tentada de novo enquanto a thread não for marcada como
 *      processada, mas nunca segura a publicação. A primeira foto que chegar
 *      vira capa; sem foto, o site usa a capa da editoria.
 *
 * A versão anterior mandava tudo num POST só (texto + até 4 fotos em base64,
 * ~25 MB) e marcava "gazeta-erro" na primeira falha, sem retentativa — foi
 * assim que releases inteiros (Marcha para Jesus, Ideb, Sabesp...) se perderam.
 *
 * INSTALAÇÃO / ATUALIZAÇÃO:
 *   1. script.google.com > abra o projeto existente (ou "Novo projeto")
 *   2. Substitua TODO o conteúdo de Código.gs por este arquivo
 *   3. Em WEBHOOK_SECRET, cole o mesmo valor de INBOUND_WEBHOOK_SECRET do
 *      site (está na versão anterior do script ou no painel da DigitalOcean)
 *   4. Salve, selecione a função "configurar" e clique em Executar
 *      (autorize o Gmail se pedir). O gatilho de 10 min é recriado sozinho.
 */

const CONFIG = {
  WEBHOOK_URL: 'https://gazetadealphaville.com.br/api/webhooks/inbound-email',
  WEBHOOK_SECRET: 'COLE_AQUI_O_INBOUND_WEBHOOK_SECRET',
  // Domínio aceito — igual ao SECOM_ALLOWLIST configurado no site.
  GMAIL_QUERY: 'from:santanadeparnaiba.sp.gov.br -label:gazeta-processado -label:gazeta-erro',
  LABEL_OK: 'gazeta-processado',
  LABEL_ERRO: 'gazeta-erro',
  MAX_FOTOS: 4,
  MAX_BYTES_FOTO: 7 * 1024 * 1024, // 7 MB por foto
  MAX_TENTATIVAS: 3, // falhas do texto antes de marcar gazeta-erro
  THREADS_POR_EXECUCAO: 10,
};

/** Executar UMA VEZ para instalar: cria o gatilho e processa o que já estiver na caixa. */
function configurar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processarEmailsSecom') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processarEmailsSecom').timeBased().everyMinutes(10).create();
  processarEmailsSecom();
  Logger.log('Instalado: verificação a cada 10 minutos ativa.');
}

/** Função chamada pelo gatilho. */
function processarEmailsSecom() {
  const labelOk = obterLabel_(CONFIG.LABEL_OK);
  const labelErro = obterLabel_(CONFIG.LABEL_ERRO);
  const props = PropertiesService.getScriptProperties();
  const threads = GmailApp.search(CONFIG.GMAIL_QUERY, 0, CONFIG.THREADS_POR_EXECUCAO);

  threads.forEach(function (thread) {
    const chave = 'tentativas:' + thread.getId();
    let textoOk = true;
    thread.getMessages().forEach(function (msg) {
      try {
        const resultado = enviarTexto_(msg);
        Logger.log('%s -> %s', msg.getSubject(), JSON.stringify(resultado));
        // Fotos só depois que o texto entrou; falha aqui não segura a matéria.
        if (resultado && resultado.status !== 'rejected') enviarFotos_(msg);
      } catch (e) {
        textoOk = false;
        Logger.log('ERRO em "%s": %s', msg.getSubject(), e && e.message ? e.message : e);
      }
    });

    if (textoOk) {
      thread.addLabel(labelOk);
      props.deleteProperty(chave);
      return;
    }
    const tentativas = Number(props.getProperty(chave) || '0') + 1;
    if (tentativas >= CONFIG.MAX_TENTATIVAS) {
      thread.addLabel(labelErro);
      props.deleteProperty(chave);
      Logger.log('Desistindo de "%s" após %s tentativas.', thread.getFirstMessageSubject(), tentativas);
    } else {
      props.setProperty(chave, String(tentativas));
      Logger.log('"%s" falhou (%s/%s); tenta de novo na próxima execução.', thread.getFirstMessageSubject(), tentativas, CONFIG.MAX_TENTATIVAS);
    }
  });
}

/** Fase 1 — texto. Lança erro se o site não confirmar. */
function enviarTexto_(msg) {
  const payload = {
    message_id: messageId_(msg),
    from: msg.getFrom(),
    subject: msg.getSubject(),
    text: msg.getPlainBody(),
    html: msg.getBody(),
    received_at: msg.getDate().toISOString(),
    attachments: [],
  };
  return post_(CONFIG.WEBHOOK_URL, payload);
}

/** Fase 2 — cada foto numa requisição própria. Nunca lança: só registra no log. */
function enviarFotos_(msg) {
  let enviadas = 0;
  msg.getAttachments({ includeInlineImages: false }).forEach(function (att) {
    if (enviadas >= CONFIG.MAX_FOTOS) return;
    const mime = att.getContentType() || '';
    if (mime.indexOf('image/') !== 0) return;
    const bytes = att.getBytes();
    if (bytes.length === 0 || bytes.length > CONFIG.MAX_BYTES_FOTO) return;
    try {
      const r = post_(CONFIG.WEBHOOK_URL + '/attachment', {
        message_id: messageId_(msg),
        filename: att.getName(),
        mime: mime,
        contentBase64: Utilities.base64Encode(bytes),
      });
      enviadas++;
      Logger.log('  foto %s -> %s', att.getName(), JSON.stringify(r));
    } catch (e) {
      Logger.log('  foto %s FALHOU: %s', att.getName(), e && e.message ? e.message : e);
    }
  });
}

function messageId_(msg) {
  return msg.getHeader('Message-ID') || 'gmail-' + msg.getId();
}

function post_(url, payload) {
  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: { 'x-webhook-secret': CONFIG.WEBHOOK_SECRET },
    muteHttpExceptions: true,
  });
  const code = resp.getResponseCode();
  if (code !== 200 && code !== 201) {
    throw new Error('webhook respondeu ' + code + ': ' + resp.getContentText().slice(0, 300));
  }
  return JSON.parse(resp.getContentText());
}

function obterLabel_(nome) {
  return GmailApp.getUserLabelByName(nome) || GmailApp.createLabel(nome);
}
