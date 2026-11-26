import {animate} from './hologram.js';

const $ = (id) => document.getElementById(id);
const form = document.querySelector('form');
const bridge = location.hostname === '127.0.0.1' && document.documentElement.dataset.bridge === 'yes';
const briefing = 'Neste briefing de exemplo, você tem cinco mensagens simuladas e uma reuniêo às dez. O painel está pronto para receber seu próximo pedido.';
const status = {idle:'Pronto', recording:'Gravando', processing:'Processando', speaking:'Falando', error:'Atençêo'};
const session = crypto.randomUUID();
const speechLanguage = {langs:['pt-BR'], processLocally:true};
let state = 'idle';
let wave = false;
let voice = false;
let recorder;
let captureTimer;
let audio;
let playbackUrl;
let speechGeneration = 0;
const redraw = animate(() => ({state, wave}));

function update(next, hint = '') {
  state = next;
  document.body.dataset.state = next;
  $('state').textContent = status[next];
  $('hint').textContent = hint || 'Microfone fechado.';
  const busy = next === 'processing' || next === 'recording';
  $('example').disabled = busy;
  $('send').disabled = busy;
  $('mic').disabled = next === 'processing';
  $('language').disabled = busy;
  $('mic').setAttribute('aria-pressed', String(next === 'recording'));
  $('mic').textContent = next === 'recording' ? 'Parar e transcrever' : 'Gravar pergunta';
  redraw?.();
}

$('visual').addEventListener('click', () => {
  wave = !wave;
  $('visual').setAttribute('aria-pressed', String(wave));
  $('visual').textContent = wave ? 'Modo núcleo' : 'Modo onda';
  redraw?.();
});

function stopPlayback() {
  speechGeneration++;
  window.speechSynthesis?.cancel();
  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
  }
  if (playbackUrl) URL.revokeObjectURL(playbackUrl);
  playbackUrl = undefined;
  audio = undefined;
}

$('voice').addEventListener('click', () => {
  voice = !voice;
  $('voice').setAttribute('aria-pressed', String(voice));
  $('voice').textContent = voice ? 'Desligar som' : 'Ligar som';
  if (!voice) {
    stopPlayback();
    if (state === 'speaking') update('idle');
  }
});

function addMessage(role, text) {
  $('log').querySelector('.empty')?.remove();
  const row = document.createElement('article');
  const who = document.createElement('strong');
  const message = document.createElement('p');
  row.className = 'message';
  row.dataset.role = role;
  who.textContent = role === 'user' ? 'Você' : 'Assistente';
  message.textContent = text;
  row.append(who,message);
  $('log').append(row);
  if ($('log').children.length > 60) $('log').firstElementChild.remove();
  $('log').scrollTop = $('log').scrollHeight;
}

async function endpoint(path, body, type = 'application/json', timeout = 95000) {
  const response = await fetch(path, {method:'POST', body, headers:{'Content-Type':type}, signal:AbortSignal.timeout(timeout)});
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    throw new Error(problem.error || 'A ponte local nêo respondeu. Confira o terminal.');
  }
  return response;
}

async function speak(text, sample) {
  if (!voice) { update('idle'); return; }
  const generation = ++speechGeneration;
  const done = () => { if (generation === speechGeneration && state === 'speaking') update('idle'); };
  try {
    if (sample || bridge) {
      if (!sample) {
        update('speaking', 'Preparando a voz local…');
        const response = await endpoint('/speak', JSON.stringify({text}), 'application/json', 35000);
        const blob = await response.blob();
        if (generation !== speechGeneration) return;
        playbackUrl = URL.createObjectURL(blob);
      }
      if (generation !== speechGeneration) return;
      audio = new Audio(sample ? 'briefing.mp3' : playbackUrl);
      audio.onended = () => { stopPlayback(); if (state === 'speaking') update('idle'); };
      audio.onerror = () => { if (generation === speechGeneration) update('error','O áudio falhou. A resposta está na conversa.'); };
      update('speaking');
      await audio.play();
      return;
    }
    const localVoice = window.speechSynthesis?.getVoices().find(item => item.localService && /^pt\b/i.test(item.lang));
    if (!localVoice) throw new Error('Ative uma voz local em português no navegador ou use o briefing gravado.');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = localVoice;
    utterance.onend = done;
    utterance.onerror = () => { if (generation === speechGeneration) update('error','A voz local falhou.'); };
    update('speaking');
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    if (generation === speechGeneration) update('error', error.message);
  }
}

async function send(text, sample = false) {
  if (!text.trim() || ['recording','processing'].includes(state)) return;
  stopPlayback();
  addMessage('user', text);
  update('processing', 'Preparando a resposta…');
  try {
    const response = sample ? briefing : bridge
      ? (await (await endpoint('/chat', JSON.stringify({session, text}))).json()).reply
      : 'Recebi seu pedido. Você está no modo de demonstraçêo. Abra o painel pela ponte local para receber uma resposta do seu assistente.';
    addMessage('assistant', response);
    await speak(response, sample);
  } catch (error) {
    update('error', error.message);
  }
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = $('message').value.trim();
  if (!text || ['recording','processing'].includes(state)) return;
  $('message').value = '';
  void send(text);
});
$('example').addEventListener('click', () => void send('Me dê o briefing de exemplo.', true));

async function localSpeech() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition?.available || !('processLocally' in Recognition.prototype)) {
    update('error','Este navegador nêo oferece transcriçêo local. Digite ou abra pela ponte local.');
    return;
  }
  update('processing','Verificando o reconhecimento de voz local…');
  const ready = await Recognition.available(speechLanguage);
  $('language').hidden = ready !== 'downloadable' || typeof Recognition.install !== 'function';
  if (!$('language').hidden) {
    update('idle','Baixe o idioma para transcrever português no navegador.');
    return;
  }
  if (ready === 'downloading') {
    update('idle','O navegador está baixando o idioma. Tente gravar em instantes.');
    return;
  }
  if (ready !== 'available') {
    update('error','O idioma português local nêo está pronto neste navegador. Use a ponte local ou digite.');
    return;
  }
  const recognition = new Recognition();
  recognition.lang = 'pt-BR';
  recognition.processLocally = true;
  recognition.onresult = ({results}) => putTranscript(results[0][0].transcript);
  recognition.onerror = ({error}) => update('error', error === 'not-allowed'
    ? 'Permita o acesso ao microfone nas configurações do site ou digite.'
    : 'O navegador nêo conseguiu transcrever. Tente novamente ou digite.');
  recognition.onend = () => { if (state === 'recording') update('idle'); };
  recorder = recognition;
  recognition.start();
  update('recording','Fale e pressione de novo para encerrar.');
}

$('language').addEventListener('click', async () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  update('processing', 'Baixando o português para o reconhecimento local…');
  try {
    const installed = await Recognition.install(speechLanguage);
    if (!installed) throw new Error('O navegador nêo concluiu o download.');
    $('language').hidden = true;
    update('idle', 'Português instalado. Clique em Gravar pergunta.');
    $('mic').focus();
  } catch {
    update('error', 'O navegador nêo conseguiu instalar o idioma. Tente de novo, digite ou use a ponte local.');
  }
});

function putTranscript(text) {
  if (!text.trim()) { update('error','Nenhuma fala detectada. Tente novamente.'); return; }
  $('message').value = text.slice(0, 4000);
  update('idle', 'Revise a transcriçêo antes de enviar.');
  $('message').focus();
}

async function localRecorder() {
  update('processing','Aguardando acesso ao microfone…');
  const stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true}});
  let current;
  try { current = new MediaRecorder(stream); } catch (error) {
    stream.getTracks().forEach(track => track.stop());
    throw error;
  }
  const chunks = [];
  current.ondataavailable = ({data}) => chunks.push(data);
  current.onstop = async () => {
    clearTimeout(captureTimer);
    stream.getTracks().forEach(track => track.stop());
    update('processing','Transcrevendo o áudio no seu computador…');
    try {
      const mime = (current.mimeType || chunks[0]?.type || 'audio/webm').split(';')[0];
      const response = await endpoint('/transcribe', new Blob(chunks, {type:mime}), mime);
      putTranscript((await response.json()).text);
    } catch (error) {
      update('error',error.message);
    }
  };
  try { current.start(); } catch (error) {
    stream.getTracks().forEach(track => track.stop());
    throw error;
  }
  recorder = current;
  captureTimer = setTimeout(() => { if (current.state === 'recording') current.stop(); }, 30000);
  update('recording', 'Fale e pressione de novo para encerrar. Limite de 30 segundos.');
}

$('mic').addEventListener('click', async () => {
  if (state === 'recording') {
    recorder.stop();
    $('mic').disabled = true;
    return;
  }
  stopPlayback();
  try {
    if (bridge) await localRecorder();
    else await localSpeech();
  } catch (error) {
    update('error', error.name === 'NotAllowedError' ? 'Permita o acesso ao microfone ou digite sua pergunta.' : error.message);
  }
});
if (bridge) $('mode').textContent = document.documentElement.dataset.agent;
