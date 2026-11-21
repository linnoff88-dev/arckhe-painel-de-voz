# Painel de Voz

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="48" />
  <p><strong>Arckhé AI</strong></p>
</div>


[![Painel de Voz](guia/assets/banner.jpg)](https://inematds.github.io/painel-de-voz/guia/)

**PortuguÃªs Â· [English](README.en.md) Â· [EspaÃ±ol](README.es.md)**

## O que Ã©

O Painel de Voz Ã© uma interface para quem usa ou quer montar um assistente pessoal como o Intelecto. Ele reÃºne microfone, texto que vocÃª pode corrigir, conversa e um nÃºcleo hologrÃ¡fico que mostra o estado do assistente. Na demonstraÃ§Ã£o, vocÃª ouve um briefing, um resumo falado com dados fictÃ­cios. Para conversar com seu prÃ³prio assistente, instale a ponte local, o programa que liga o painel ao assistente no seu computador. A ideia veio do Mark-LVII, de FatihMakes.

[Abrir painel](https://inematds.github.io/painel-de-voz/app/) Â· [Guia](https://inematds.github.io/painel-de-voz/guia/) Â· [AnÃ¡lise de plugins](docs/ANALISE-MARK-LVII.md)

> Leia o README deste projeto e descubra qual assistente eu jÃ¡ uso. Explique como ligar o Painel de Voz a ele e como testar a gravaÃ§Ã£o local. Mostre o que pretende alterar e aguarde minha aprovaÃ§Ã£o antes de mexer no meu sistema.

---

## InstalaÃ§Ã£o tÃ©cnica

### Experimente a demonstraÃ§Ã£o

A pÃ¡gina pÃºblica tem briefing fictÃ­cio narrado, holograma em Canvas e envio de texto em modo demonstrativo. Clique em **Ligar som** e, em seguida, em **Mostrar briefing de exemplo**. No site pÃºblico, **Gravar pergunta** verifica se o navegador reconhece portuguÃªs no dispositivo. Se ele oferecer o idioma, use **Baixar portuguÃªs para o microfone** e tente novamente. Permita o acesso ao microfone, fale e clique em **Parar e transcrever**. Se o recurso nÃ£o estiver disponÃ­vel, use a instalaÃ§Ã£o local ou digite. A ponte abaixo usa reconhecimento local prÃ³prio e permite revisar a transcriÃ§Ã£o antes de enviar.

### Ligue a ponte local

Use [Python 3.10 ou mais recente](https://www.python.org/downloads/), [Git](https://git-scm.com/install/) e um navegador atual. Abra um terminal (PowerShell no Windows, Terminal no macOS ou Linux), vÃ¡ atÃ© a pasta onde guarda seus projetos e cole o bloco abaixo. No Windows, troque `python3` por `py -3` se necessÃ¡rio.

```bash
git clone https://github.com/inematds/painel-de-voz.git
cd painel-de-voz
python3 bridge.py
```

Abra `http://127.0.0.1:8765/app/`. A faixa abaixo do tÃ­tulo deve dizer â€œPonte local Â· respostas de demonstraÃ§Ã£oâ€. Digite â€œOlÃ¡â€ e envie. Nesse modo a ponte devolve o texto recebido. Para ouvir e transcrever localmente, instale `faster-whisper` e `piper-tts` no seu ambiente Python e tenha um modelo multilÃ­ngue do faster-whisper e uma voz Piper em portuguÃªs no disco. Os comandos abaixo instalam os pacotes e baixam, uma vez, o modelo multilÃ­ngue `base` para transcriÃ§Ã£o e a voz brasileira Faber. Depois disso, a ponte lÃª os arquivos no disco. Pare a ponte anterior com Ctrl+C antes de iniciar a versÃ£o com voz.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install faster-whisper piper-tts
python -c "from faster_whisper.utils import download_model; download_model('base')"
python -m piper.download_voices pt_BR-faber-medium
python bridge.py --whisper-model base --piper-model pt_BR-faber-medium.onnx
```

Quem jÃ¡ tem o ambiente do inemavox com faster-whisper pode usar aquele Python e o modelo em cache, por exemplo `--whisper-model base`. No Windows, crie o ambiente com `py -3 -m venv .venv` e ative-o com `.venv\Scripts\Activate.ps1`. Linux foi o sistema de teste.

## O processo, do inÃ­cio ao fim

1. **Conecte o Intelecto v2**. Com a ponte parada, baixe o Intelecto v2 ao lado do projeto. Use a linha com os parÃ¢metros de voz se vocÃª baixou os modelos acima.

   ```bash
   git clone https://github.com/inematds/intelecto-v2.git ../intelecto-v2
   python3 bridge.py --intelecto ../intelecto-v2
   python3 bridge.py --intelecto ../intelecto-v2 --whisper-model base --piper-model pt_BR-faber-medium.onnx
   ```

   O comando usa o motor simulado do Intelecto. Para conversar com um modelo de IA, abra o Ollama, rode `ollama list` em outro terminal e copie um nome da coluna `NAME`. Pare a ponte com Ctrl+C e execute a mesma linha acrescentando `--intelecto-model NOME-DO-MODELO-LOCAL`, com o nome copiado no lugar do marcador. A conversa passa pelo Ollama em `127.0.0.1:11434`. O adaptador mantÃ©m estado prÃ³prio em `~/.painel-de-voz/intelecto` e abre a conversa com um registro vazio de ferramentas. A memÃ³ria direta do Intelecto pode guardar pedidos como â€œlembre queâ€¦â€.

2. **Experimente voz**. Abra o painel local, clique em **Gravar pergunta**, permita o microfone, fale e clique em **Parar e transcrever**. Revise e envie. Com o som ligado, o Piper lÃª a resposta em portuguÃªs. Grave comandos de atÃ© 30 segundos. A ponte toca atÃ© 3.000 caracteres por resposta.

3. **Conecte outro assistente**. A opÃ§Ã£o `--adapter` vem por Ãºltimo e recebe o executÃ¡vel e seus argumentos fixos. A cada turno, o processo recebe um JSON em stdin e devolve um JSON em stdout. Use stderr para diagnÃ³stico e trate `session` como identificador para reusar o histÃ³rico. A ponte impÃµe 85 segundos por turno.

   ```bash
   python3 bridge.py --adapter python3 adapters/briefing.py adapters/agenda-exemplo.json
   ```

   PeÃ§a â€œme dÃª o briefing da agendaâ€. Depois troque o horÃ¡rio em `adapters/agenda-exemplo.json` e repita. Esse Ã© um exemplo de plugin independente, com leitura de arquivo.

   | Entrada | SaÃ­da |
   |---|---|
   | `{"session":"uuid","text":"me dÃª o briefing"}` | `{"reply":"Bom dia. Sua agenda tem dois compromissos."}` |

O processo do adaptador roda com as permissÃµes de quem inicia a ponte. Configure apenas um executÃ¡vel que vocÃª jÃ¡ conhece. O painel pÃºblico nÃ£o encaminha Ã¡udio ao serviÃ§o local. A ponte aceita conexÃµes apenas em loopback e exige a origem local nos pedidos. O nÃºcleo e a onda representam estados da conversa. Os movimentos nÃ£o sÃ£o uma mediÃ§Ã£o da amplitude do Ã¡udio.

## Baseado em Mark-LVII

O [Mark-LVII de FatihMakes](https://github.com/FatihMakes/Mark-LVII) Ã© a fonte de inspiraÃ§Ã£o e anÃ¡lise. O painel foi implementado separadamente. O [estudo das peÃ§as isolÃ¡veis](docs/ANALISE-MARK-LVII.md) inclui briefing, rotinas, verificaÃ§Ã£o de citaÃ§Ãµes, tarefas que retomam, confirmaÃ§Ãµes e dicas para ligar novos adaptadores.

---

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="32" />
  <p><strong>Arckhé AI</strong></p>
</div>