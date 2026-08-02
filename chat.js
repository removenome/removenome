/* ==========================================================
   Remove Nome — Chat Atendente
   Inclua em qualquer página com UMA linha, antes de </body>:
   <script src="chat.js"></script>
   ========================================================== */
(function () {
  var API_CHAT = 'https://script.google.com/macros/s/AKfycbyzYN-Uovd-PhTifhX4upOgJDbQ-l2E_vKrf7nCgaueEsVtVVOFZZQcBadNUdaUShoP/exec';
  var WHATS = 'https://wa.me/5512981239357';

  var nome = '';
  var sessao = 'S' + Date.now() + Math.floor(Math.random() * 1000);
  var historico = [];
  var aberto = false;
  var aguardando = false;

  var css = ''
    + '#rnChatBtn{position:fixed;bottom:20px;right:20px;width:58px;height:58px;border-radius:50%;background:#1a3faa;color:#fff;border:none;box-shadow:0 6px 20px rgba(10,26,92,.35);cursor:pointer;z-index:9998;font-size:23px;display:flex;align-items:center;justify-content:center;font-family:inherit}'
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
    + '#rnChatSend:disabled{background:#c3c4d2}'
    + '#rnChatHumano{display:block;text-align:center;font-size:11px;color:#777788;margin-top:8px;background:none;border:none;cursor:pointer;width:100%;font-family:inherit;text-decoration:underline}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id = 'rnChatBtn';
  btn.innerHTML = '&#128172;';
  btn.setAttribute('aria-label', 'Abrir chat de atendimento');

  var box = document.createElement('div');
  box.id = 'rnChatBox';
  box.innerHTML = ''
    + '<div id="rnChatHead">'
    + '  <div><div class="t">Atendimento Remove Nome</div><div class="s">Tire suas dúvidas agora</div></div>'
    + '  <button id="rnChatClose" aria-label="Fechar">&#10005;</button>'
    + '</div>'
    + '<div id="rnChatMsgs"></div>'
    + '<div id="rnChatFoot">'
    + '  <form id="rnChatForm" autocomplete="off">'
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

  function abrir() {
    aberto = true;
    box.classList.add('on');
    btn.style.display = 'none';
    if (!msgs.children.length) {
      addMsg('Olá! Seja bem-vindo à Remove Nome. Pra começar, como posso te chamar?', 'bot');
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
      return;
    }

    aguardando = true;
    send.disabled = true;
    digitando(true);

    fetch(API_CHAT, {
      method: 'POST',
      body: JSON.stringify({ nome: nome, mensagem: texto, historico: historico, sessao: sessao })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        digitando(false);
        aguardando = false;
        send.disabled = false;

        if (d.ok && d.resposta) {
          addMsg(d.resposta, 'bot');
          historico.push({ role: 'user', content: texto });
          historico.push({ role: 'assistant', content: d.resposta });
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

  box.querySelector('#rnChatHumano').addEventListener('click', function () {
    addMsg('Sem problema! Já avisei nossa equipe. Você pode continuar pelo WhatsApp agora: ' + WHATS, 'bot');

    fetch(API_CHAT, {
      method: 'POST',
      body: JSON.stringify({ acao: 'pedir_humano', nome: nome || 'Não informado', sessao: sessao, historico: historico })
    }).catch(function () {});

    setTimeout(function () { window.open(WHATS, '_blank'); }, 900);
  });
})();
