/* ==========================================================
   Remove Nome — Chat Atendente
   Inclua em qualquer página com UMA linha, antes de </body>:
   <script src="chat.js"></script>
   ========================================================== */
(function () {
  var API_CHAT = 'https://script.google.com/macros/s/AKfycbyzYN-Uovd-PhTifhX4upOgJDbQ-l2E_vKrf7nCgaueEsVtVVOFZZQcBadNUdaUShoP/exec';
  var WHATS = 'https://wa.me/5512981239357';

  // Memória entre páginas: a conversa continua se a pessoa navegar pelo site
  var mem = {};
  try { mem = JSON.parse(sessionStorage.getItem('rnChat') || '{}'); } catch (e) { mem = {}; }

  var nome = mem.nome || '';
  var sessao = mem.sessao || ('S' + Date.now() + Math.floor(Math.random() * 1000));
  var historico = mem.historico || [];

  function salvarMemoria() {
    try {
      sessionStorage.setItem('rnChat', JSON.stringify({
        nome: nome,
        sessao: sessao,
        historico: historico.slice(-12)
      }));
    } catch (e) {}
  }
  var aberto = false;
  var aguardando = false;

  // Detecta em qual página o visitante está, pra Rê conduzir de acordo
  var pagina = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var modoHumano = false;
  var ultimaLinha = 0;
  var timerPolling = null;

  var css = ''
    + '#rnChatBtn{position:fixed;bottom:20px;right:20px;height:56px;padding:0 20px 0 16px;border-radius:30px;background:#F5C200;color:#0a1a5c;border:none;box-shadow:0 6px 22px rgba(245,194,0,.45);cursor:pointer;z-index:9998;font-size:14.5px;font-weight:800;display:flex;align-items:center;gap:9px;font-family:inherit;animation:rnPulse 2.6s ease-in-out infinite}'
    + '#rnChatBtn:hover{background:#e0b400}'
    + '#rnChatBtn .av{width:34px;height:34px;border-radius:50%;background:#0a1a5c;color:#F5C200;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;flex-shrink:0}'
    + '@keyframes rnPulse{0%,100%{box-shadow:0 6px 22px rgba(245,194,0,.45)}50%{box-shadow:0 6px 30px rgba(245,194,0,.75)}}'
    + '@media(max-width:420px){#rnChatBtn{font-size:13.5px;padding:0 16px 0 13px;height:52px}}'
    + '#rnChatBtn:hover{background:#0f2a7a}'
    + '#rnChatBox{position:fixed;bottom:20px;right:20px;width:min(370px,calc(100vw - 32px));height:min(560px,calc(100vh - 100px));background:#fff;border-radius:18px;box-shadow:0 12px 44px rgba(10,26,92,.28);z-index:9999;display:none;flex-direction:column;overflow:hidden;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif}'
    + '#rnChatBox.on{display:flex}'
    + '#rnChatHead{background:linear-gradient(160deg,#0a1a5c,#1a3faa);color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}'
    + '#rnChatHead .t{font-size:14px;font-weight:800;line-height:1.3}'
    + '#rnChatHead .s{font-size:11px;opacity:.8;margin-top:1px}'
    + '#rnChatHead button{background:rgba(255,255,255,.16);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0}'
    + '#rnChatMsgs{flex:1;overflow-y:auto;padding:16px;background:#f7f7fa;display:flex;flex-direction:column;gap:10px}'
    + '.rnMsg{max-width:82%;padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.55;word-wrap:break-word;white-space:pre-wrap}'
    + '.rnMsg.bot{background:#fff;color:#1a1a2e;align-self:flex-start;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(10,26,92,.08)}'
    + '.rnMsg.user{background:#1a3faa;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}'
    + '.rnMsg a{color:inherit;text-decoration:underline;font-weight:700}'
    + '.rnMsg.bot a{color:#1a3faa}'
    + '.rnTyping{align-self:flex-start;background:#fff;padding:11px 15px;border-radius:14px;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(10,26,92,.08)}'
    + '.rnTyping span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#aab;margin-right:3px;animation:rnBlink 1.3s infinite}'
    + '.rnTyping span:nth-child(2){animation-delay:.2s}.rnTyping span:nth-child(3){animation-delay:.4s;margin-right:0}'
    + '@keyframes rnBlink{0%,60%,100%{opacity:.25}30%{opacity:1}}'
    + '#rnChatFoot{padding:11px;background:#fff;border-top:1px solid #e8e8ef;flex-shrink:0}'
    + '#rnChatForm{display:flex;gap:7px}'
    + '#rnChatInput{flex:1;padding:11px 13px;border:1.5px solid #d6d7e2;border-radius:10px;font-size:14px;font-family:inherit;outline:none;min-width:0}'
    + '#rnChatInput:focus{border-color:#1a3faa}'
    + '#rnChatSend{background:#1a3faa;color:#fff;border:none;width:42px;border-radius:10px;cursor:pointer;font-size:15px;flex-shrink:0}'
    + '#rnChatAnexo{background:#eef1fb;color:#1a3faa;border:none;width:42px;border-radius:10px;cursor:pointer;font-size:15px;flex-shrink:0}'
    + '#rnChatFile{display:none}'
    + '#rnChatSend:disabled{background:#c3c4d2}'
    + '#rnChatHumano{display:block;text-align:center;font-size:11px;color:#777788;margin-top:8px;background:none;border:none;cursor:pointer;width:100%;font-family:inherit;text-decoration:underline}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id = 'rnChatBtn';
  btn.innerHTML = '<span class="av">Rê</span> Fale com a Rê';
  btn.setAttribute('aria-label', 'Abrir chat de atendimento');

  var box = document.createElement('div');
  box.id = 'rnChatBox';
  box.innerHTML = ''
    + '<div id="rnChatHead">'
    + '  <div style="display:flex;align-items:center;gap:10px">'
    + '    <div style="width:38px;height:38px;border-radius:50%;background:#F5C200;color:#0a1a5c;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;flex-shrink:0">Rê</div>'
    + '    <div><div class="t">Rê · Assistente virtual</div><div class="s">Remove Nome · online agora</div></div>'
    + '  </div>'
    + '  <button id="rnChatClose" aria-label="Fechar">&#10005;</button>'
    + '</div>'
    + '<div id="rnChatMsgs"></div>'
    + '<div id="rnChatFoot">'
    + '  <form id="rnChatForm" autocomplete="off">'
    + '    <button id="rnChatAnexo" type="button" title="Enviar arquivo"><i class="fa-solid fa-paperclip"></i></button>'
    + '    <input id="rnChatFile" type="file" accept="image/*,.pdf">'
    + '    <input id="rnChatInput" type="text" placeholder="Digite aqui..." maxlength="500">'
    + '    <button id="rnChatSend" type="submit" aria-label="Enviar">&#10148;</button>'
    + '  </form>'
    + '  <button id="rnChatHumano" type="button">Prefiro falar com uma pessoa</button>'
    + '</div>';

  document.body.appendChild(btn);
  document.body.appendChild(box);

  var msgs = box.querySelector('#rnChatMsgs');
  var form = box.querySelector('#rnChatForm');
  var input = box.querySelector('#rnChatInput');
  var send = box.querySelector('#rnChatSend');

  function escapar(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function comLinks(t) {
    return escapar(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  // Som próprio, gerado no navegador — sem arquivo externo, sem som de marca de terceiros
  var audioCtx = null;
  function tocar(tipo) {
    try {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();

      var notas = tipo === 'abrir' ? [[520, 0], [700, 0.08]] : [[660, 0], [880, 0.1]];

      notas.forEach(function (n) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = n[0];
        var t = audioCtx.currentTime + n[1];
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch (e) {}
  }

  function addMsg(texto, tipo) {
    var d = document.createElement('div');
    d.className = 'rnMsg ' + tipo;
    d.innerHTML = tipo === 'bot' ? comLinks(texto) : escapar(texto);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function digitando(on) {
    var ex = msgs.querySelector('.rnTyping');
    if (on) {
      if (ex) return;
      var d = document.createElement('div');
      d.className = 'rnTyping';
      d.innerHTML = '<span></span><span></span><span></span>';
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    } else if (ex) {
      ex.remove();
    }
  }

  function iniciarPolling() {
    if (timerPolling) return;
    timerPolling = setInterval(function () {
      fetch(API_CHAT, {
        method: 'POST',
        body: JSON.stringify({ acao: 'verificar', sessao: sessao, desdeLinha: ultimaLinha })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.ok) return;
          if (d.ultimaLinha) ultimaLinha = d.ultimaLinha;
          modoHumano = (d.modo === 'HUMANO');

          (d.mensagens || []).forEach(function (m) {
            addMsg(m, 'bot');
            historico.push({ role: 'assistant', content: m });
            tocar('msg');
          });
          if ((d.mensagens || []).length) salvarMemoria();
        })
        .catch(function () {});
    }, 4000);
  }

  function abrir() {
    aberto = true;
    box.classList.add('on');
    btn.style.display = 'none';
    tocar('abrir');
    iniciarPolling();

    if (!msgs.children.length) {
      if (historico.length) {
        // Já conversou antes (outra página) — retoma de onde parou
        historico.forEach(function (h) {
          addMsg(h.content, h.role === 'user' ? 'user' : 'bot');
        });
        addMsg('Oi de novo' + (nome ? ', ' + nome : '') + '! Continuo aqui se quiser seguir de onde paramos.', 'bot');
      } else {
        addMsg('Oi! Eu sou a Rê, assistente virtual da Remove Nome. Pra começar, como posso te chamar?', 'bot');
      }
    }
    setTimeout(function () { input.focus(); }, 200);
  }

  function fechar() {
    aberto = false;
    box.classList.remove('on');
    btn.style.display = 'flex';
  }

  btn.addEventListener('click', abrir);
  box.querySelector('#rnChatClose').addEventListener('click', fechar);

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (aguardando) return;

    var texto = input.value.trim();
    if (!texto) return;

    input.value = '';
    addMsg(texto, 'user');

    // Primeira mensagem = nome da pessoa
    if (!nome) {
      nome = texto.split(' ')[0];
      addMsg('Prazer, ' + nome + '! Me conta: você já tem alguma restrição no nome, ou quer descobrir sua situação?', 'bot');
      historico.push({ role: 'user', content: 'Meu nome é ' + texto });
      historico.push({ role: 'assistant', content: 'Prazer, ' + nome + '! Me conta: você já tem alguma restrição no nome, ou quer descobrir sua situação?' });
      salvarMemoria();
      return;
    }

    aguardando = true;
    send.disabled = true;
    digitando(true);

    fetch(API_CHAT, {
      method: 'POST',
      body: JSON.stringify({ nome: nome, mensagem: texto, historico: historico, sessao: sessao, pagina: pagina })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        digitando(false);
        aguardando = false;
        send.disabled = false;

        if (d.ok && d.resposta) {
          addMsg(d.resposta, 'bot');
          tocar('msg');
          historico.push({ role: 'user', content: texto });
          historico.push({ role: 'assistant', content: d.resposta });
          salvarMemoria();
        } else {
          addMsg(d.erro || 'Tive um problema aqui. Fale com a gente pelo WhatsApp: ' + WHATS, 'bot');
        }
      })
      .catch(function () {
        digitando(false);
        aguardando = false;
        send.disabled = false;
        addMsg('Não consegui conectar agora. Fale com a gente pelo WhatsApp: ' + WHATS, 'bot');
      });
  });

  var btnAnexo = box.querySelector('#rnChatAnexo');
  var inputFile = box.querySelector('#rnChatFile');

  btnAnexo.addEventListener('click', function () { inputFile.click(); });

  inputFile.addEventListener('change', function () {
    var arq = inputFile.files[0];
    if (!arq) return;

    if (arq.size > 5 * 1024 * 1024) {
      addMsg('Esse arquivo é grande demais (máximo 5 MB). Tenta um menor?', 'bot');
      inputFile.value = '';
      return;
    }

    addMsg('📎 ' + arq.name, 'user');
    digitando(true);

    var reader = new FileReader();
    reader.onload = function () {
      var base64 = String(reader.result).split(',')[1];
      fetch(API_CHAT, {
        method: 'POST',
        body: JSON.stringify({
          acao: 'enviar_arquivo',
          sessao: sessao,
          nome: nome || 'Visitante',
          nomeArquivo: arq.name,
          tipoArquivo: arq.type,
          base64: base64,
          deQuem: 'cliente'
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          digitando(false);
          if (d.ok) {
            addMsg('Recebi seu arquivo! Já está com a nossa equipe.', 'bot');
            historico.push({ role: 'user', content: 'Enviei o arquivo: ' + arq.name });
            historico.push({ role: 'assistant', content: 'Recebi seu arquivo! Já está com a nossa equipe.' });
            salvarMemoria();
            tocar('msg');
          } else {
            addMsg('Não consegui receber o arquivo agora. Tenta de novo?', 'bot');
          }
        })
        .catch(function () {
          digitando(false);
          addMsg('Não consegui receber o arquivo agora. Tenta de novo?', 'bot');
        });
      inputFile.value = '';
    };
    reader.readAsDataURL(arq);
  });

  box.querySelector('#rnChatHumano').addEventListener('click', function () {
    fetch(API_CHAT, {
      method: 'POST',
      body: JSON.stringify({ acao: 'pedir_humano', nome: nome || 'Não informado', sessao: sessao, historico: historico })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.dentroHorario) {
          addMsg('Certo! Já chamei alguém da equipe aqui. Fica nesta janela que em instantes uma pessoa assume nossa conversa.', 'bot');
        } else {
          addMsg('Nosso atendimento com pessoas funciona de segunda a sábado, das 8h às 20h. Já deixei seu contato registrado e assim que abrirmos alguém te responde por aqui. Se preferir, pode me perguntar que eu sigo te ajudando agora.', 'bot');
        }
        tocar('msg');
        iniciarPolling();
      })
      .catch(function () {
        addMsg('Não consegui avisar a equipe agora. Você pode tentar pelo WhatsApp: ' + WHATS, 'bot');
      });
  });
})();
