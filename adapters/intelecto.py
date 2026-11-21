"""Canal de conversa do Intelecto v2 sem ferramentas, em estado separado."""
import os
from pathlib import Path
import sys


def create_agent(source: Path, model: str | None):
    source = source.resolve(strict=True)
    if not (source / 'intelecto' / 'agente' / 'loop.py').is_file():
        raise ValueError('Informe a raiz do código do Intelecto v2.')
    sys.path.insert(0, str(source))

    from intelecto.agente.loop import Agente
    from intelecto.config import Config, preparar_pastas
    from intelecto.ferramentas.base import Registro
    from intelecto.memoria.store import Memorias
    from intelecto.provedores.mock import Mock
    from intelecto.provedores.ollama import Ollama

    os.environ['INTELECTO_HOME'] = os.path.expanduser(
        os.environ.get('PAINEL_INTELECTO_HOME', '~/.painel-de-voz/intelecto'),
    )
    config = Config(provedor='ollama' if model else 'mock', modelo=model or 'mock', plugins=[])
    preparar_pastas(config)
    provider = Ollama(modelo=model, url='http://127.0.0.1:11434', temperatura=config.temperatura, tempo=80) if model else Mock()
    return Agente(config, provider, Memorias(config.banco), Registro())
