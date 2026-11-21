"""Exemplo de adaptador local: transforma um arquivo de agenda em briefing."""
import json
from pathlib import Path
import sys


def briefing(agenda: dict) -> str:
    lines = [f"Bom dia. Sua agenda tem {len(agenda['compromissos'])} compromisso(s)."]
    for compromisso in agenda['compromissos']:
        lines.append(f"{compromisso['hora']} — {compromisso['titulo']}.")
    return '\n'.join(lines)


if __name__ == '__main__':
    request = json.load(sys.stdin)
    if 'briefing' in request['text'].casefold() or 'agenda' in request['text'].casefold():
        data = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
        reply = briefing(data)
    else:
        reply = 'Este adaptador lê a agenda do arquivo local. Experimente pedir um briefing.'
    print(json.dumps({'reply': reply}, ensure_ascii=False))
