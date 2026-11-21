"""Ponte local do Painel de Voz, sem dependências para o modo de demonstração."""
import argparse
import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from html import escape
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
import json
import os
from pathlib import Path
import re
import subprocess
from threading import Lock

ROOT = Path(__file__).resolve().parent
APP_FILES = {
    'panel.js': 'text/javascript; charset=utf-8',
    'hologram.js': 'text/javascript; charset=utf-8',
    'style.css': 'text/css; charset=utf-8',
    'briefing.mp3': 'audio/mpeg',
}
AUDIO_TYPES = {'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/x-wav'}
SESSION = re.compile(r'[0-9a-f-]{36}')


class Problem(Exception):
    def __init__(self, message, status=HTTPStatus.BAD_REQUEST):
        super().__init__(message)
        self.status = status


class Bridge:
    def __init__(self, args):
        self.args = args
        self.whisper = None
        self.lock = Lock()
        self.intelecto = None
        self.agent_worker = None
        if args.intelecto:
            from adapters.intelecto import create_agent
            self.agent_worker = ThreadPoolExecutor(max_workers=1, thread_name_prefix="intelecto")
            self.intelecto = self.agent_worker.submit(create_agent, args.intelecto, args.intelecto_model).result()
        self.label = (
            ('Intelecto v2 · ' + (args.intelecto_model or 'motor simulado')) if self.intelecto
            else 'Assistente conectado por adaptador' if args.adapter
            else 'Ponte local · respostas de demonstração'
        )

    def respond_with_intelecto(self, session, text):
        history = self.intelecto.historico
        if session not in history and len(history) >= 32:
            del history[next(iter(history))]
        return asyncio.run(asyncio.wait_for(self.intelecto.responder(session, text), 85))

    def chat(self, raw):
        data = json.loads(raw)
        text = data.get('text', '')
        session = data.get('session', '')
        if not isinstance(text, str) or not 0 < len(text.strip()) <= 4000:
            raise Problem('Escreva um pedido de até 4.000 caracteres.')
        if not isinstance(session, str) or not SESSION.fullmatch(session):
            raise Problem('A sessão do painel expirou. Recarregue a página.')
        if self.intelecto:
            return self.agent_worker.submit(self.respond_with_intelecto, session, text).result()
        if self.args.adapter:
            result = subprocess.run(self.args.adapter, input=raw, capture_output=True, timeout=85, check=True)
            reply = json.loads(result.stdout)['reply']
            if not isinstance(reply, str) or not reply.strip() or len(reply) > 12000:
                raise Problem('O adaptador deve devolver um texto de até 12.000 caracteres.', 502)
            return reply
        return 'A ponte local recebeu: ' + text

    def transcribe(self, raw):
        if not self.args.whisper_model:
            raise Problem('Inicie a ponte com --whisper-model para transcrever localmente.', 503)
        with self.lock:
            if self.whisper is None:
                from faster_whisper import WhisperModel
                self.whisper = WhisperModel(
                    self.args.whisper_model, device='cpu', compute_type='int8',
                    cpu_threads=4, local_files_only=True,
                )
            segments, _ = self.whisper.transcribe(BytesIO(raw), language='pt', vad_filter=True)
            return ' '.join(segment.text.strip() for segment in segments).strip()

    def speak(self, raw):
        data = json.loads(raw)
        text = data.get('text', '')
        if not isinstance(text, str) or not text.strip():
            raise Problem('Falta o texto a ser narrado.')
        if not self.args.piper_model:
            raise Problem('Inicie a ponte com --piper-model para ouvir as respostas.', 503)
        result = subprocess.run(
            ['piper', '--model', self.args.piper_model, '--output_file', '-'],
            input=text[:3000].encode() + b'\n', capture_output=True, timeout=30, check=True,
        )
        if result.stdout[:4] != b'RIFF':
            raise Problem('O Piper não devolveu áudio WAV.', 502)
        return result.stdout


class Handler(BaseHTTPRequestHandler):
    def __init__(self, bridge, *args, **kwargs):
        self.bridge = bridge
        super().__init__(*args, **kwargs)

    def setup(self):
        super().setup()
        self.connection.settimeout(35)

    @property
    def host(self):
        return f'127.0.0.1:{self.server.server_port}'

    def log_message(self, format, *args):
        # Pedidos, nomes de sessão e áudio ficam fora do log HTTP.
        pass

    def send_content(self, status, content, mime):
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Security-Policy', "default-src 'self'; media-src 'self' blob:; frame-ancestors 'none'")
        self.end_headers()
        self.wfile.write(content)

    def send_json(self, payload, status=HTTPStatus.OK):
        self.send_content(status, json.dumps(payload, ensure_ascii=False).encode(), 'application/json; charset=utf-8')

    def do_GET(self):
        if self.headers.get('Host') != self.host:
            self.send_json({'error': 'Abra o endereço local exibido no terminal.'}, 403)
        elif self.path in ('/', '/app', '/guia', '/guia/'):
            if self.path.startswith('/guia'):
                self.send_response(302)
                self.send_header('Location', 'https://inematds.github.io/painel-de-voz/guia/')
            else:
                self.send_response(302)
                self.send_header('Location', '/app/')
            self.end_headers()
        elif self.path in ('/app/', '/app/index.html'):
            page = (APP / 'index.html').read_text().replace(
                '<html lang="pt-BR">', f'<html lang="pt-BR" data-bridge="yes" data-agent="{escape(self.bridge.label)}">',
            )
            self.send_content(200, page.encode(), 'text/html; charset=utf-8')
        elif self.path.startswith('/app/') and self.path[5:] in APP_FILES:
            name = self.path[5:]
            self.send_content(200, (APP / name).read_bytes(), APP_FILES[name])
        else:
            self.send_json({'error': 'Página não encontrada.'}, 404)

    def do_POST(self):
        try:
            status, data, mime = self.handle_post()
        except Problem as error:
            self.send_json({'error': str(error)}, error.status)
            return
        except (ValueError, TypeError, AttributeError, UnicodeError):
            self.send_json({'error': 'O formato recebido pelo painel não é válido.'}, 400)
            return
        except Exception as error:
            print(f'Falha em {self.path}: {type(error).__name__}', flush=True)
            self.send_json({'error': 'A operação local falhou. Confira o modelo e o adaptador no terminal.'}, 502)
            return
        self.send_content(status, data, mime)

    def handle_post(self):
        if self.headers.get('Host') != self.host or self.headers.get('Origin') != 'http://' + self.host:
            raise Problem('Só o painel aberto neste endereço pode usar a ponte.', 403)
        path = self.path
        if path not in ('/chat', '/transcribe', '/speak'):
            raise Problem('Operação desconhecida.', 404)
        allowed = AUDIO_TYPES if path == '/transcribe' else {'application/json'}
        if self.headers.get_content_type() not in allowed:
            raise Problem('Formato de mídia não aceito.', 415)
        length = int(self.headers.get('Content-Length', '0'))
        if not 0 < length <= (2_000_000 if path == '/transcribe' else 65_536):
            raise Problem('O pedido está vazio ou é grande demais.', 413)
        raw = self.rfile.read(length)
        if path == '/speak':
            return 200, self.bridge.speak(raw), 'audio/wav'
        data = {'text': self.bridge.transcribe(raw)} if path == '/transcribe' else {'reply': self.bridge.chat(raw)}
        return 200, json.dumps(data, ensure_ascii=False).encode(), 'application/json; charset=utf-8'


APP = ROOT / 'app'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--whisper-model', help='Modelo faster-whisper disponível em cache ou no disco.')
    parser.add_argument('--piper-model', help='Arquivo .onnx de uma voz local do Piper.')
    parser.add_argument('--intelecto-model', help='Modelo previamente instalado no Ollama local.')
    engines = parser.add_mutually_exclusive_group()
    engines.add_argument('--intelecto', type=Path, help='Pasta com o código do Intelecto v2.')
    engines.add_argument('--adapter', nargs=argparse.REMAINDER, help='Comando do adaptador local. Deve vir por último.')
    args = parser.parse_args()
    if args.intelecto_model and not args.intelecto:
        parser.error('--intelecto-model requer --intelecto')
    if args.piper_model:
        args.piper_model = os.path.abspath(os.path.expanduser(args.piper_model))
    bridge = Bridge(args)
    with ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, bridge)) as server:
        print(f'{bridge.label}\nhttp://127.0.0.1:{server.server_port}/app/', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            if bridge.agent_worker:
                bridge.agent_worker.shutdown(cancel_futures=True)


if __name__ == '__main__':
    main()
