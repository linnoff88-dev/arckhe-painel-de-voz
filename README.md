ï»¿# Painel de Voz

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="48" />
  <p><strong>Arckhé AI</strong></p>
</div>


[![Painel de Voz](guia/assets/banner.jpg)](https://linnoff88-dev.github.io/arckhe-/guia/)

**PortuguêÂªs êÂ· [English](README.en.md) êÂ· [EspaêÂ±ol](README.es.md)**

## O que êÂ©

O Painel de Voz êÂ© uma interface para quem usa ou quer montar um assistente pessoal como o Intelecto. Ele reêÂºne microfone, texto que vocêÂª pode corrigir, conversa e um nêÂºcleo hologrêÂ¡fico que mostra o estado do assistente. Na demonstraêÂ§êÂ£o, vocêÂª ouve um briefing, um resumo falado com dados fictêÂ­cios. Para conversar com seu prêÂ³prio assistente, instale a ponte local, o programa que liga o painel ao assistente no seu computador. A ideia veio do Mark-LVII, de FatihMakes.

[Abrir painel](https://linnoff88-dev.github.io/arckhe-/app/) êÂ· [Guia](https://linnoff88-dev.github.io/arckhe-/guia/) êÂ· [AnêÂ¡lise de plugins](docs/ANALISE-MARK-LVII.md)

> Leia o README deste projeto e descubra qual assistente eu jêÂ¡ uso. Explique como ligar o Painel de Voz a ele e como testar a gravaêÂ§êÂ£o local. Mostre o que pretende alterar e aguarde minha aprovaêÂ§êÂ£o antes de mexer no meu sistema.

---

## InstalaêÂ§êÂ£o têÂ©cnica

### Experimente a demonstraêÂ§êÂ£o

A pêÂ¡gina pêÂºblica tem briefing fictêÂ­cio narrado, holograma em Canvas e envio de texto em modo demonstrativo. Clique em **Ligar som** e, em seguida, em **Mostrar briefing de exemplo**. No site pêÂºblico, **Gravar pergunta** verifica se o navegador reconhece portuguêÂªs no dispositivo. Se ele oferecer o idioma, use **Baixar portuguêÂªs para o microfone** e tente novamente. Permita o acesso ao microfone, fale e clique em **Parar e transcrever**. Se o recurso nêÂ£o estiver disponêÂ­vel, use a instalaêÂ§êÂ£o local ou digite. A ponte abaixo usa reconhecimento local prêÂ³prio e permite revisar a transcriêÂ§êÂ£o antes de enviar.

### Ligue a ponte local

Use [Python 3.10 ou mais recente](https://www.python.org/downloads/), [Git](https://git-scm.com/install/) e um navegador atual. Abra um terminal (PowerShell no Windows, Terminal no macOS ou Linux), vêÂ¡ atêÂ© a pasta onde guarda seus projetos e cole o bloco abaixo. No Windows, troque `python3` por `py -3` se necessêÂ¡rio.

```bash
git clone https://github.com/linnoff88-dev/painel-de-voz.git
cd painel-de-voz
python3 bridge.py
```

Abra `http://127.0.0.1:8765/app/`. A faixa abaixo do têÂ­tulo deve dizer ê¢â¬ÅPonte local êÂ· respostas de demonstraêÂ§êÂ£oê¢â¬Â. Digite ê¢â¬ÅOlêÂ¡ê¢â¬Â e envie. Nesse modo a ponte devolve o texto recebido. Para ouvir e transcrever localmente, instale `faster-whisper` e `piper-tts` no seu ambiente Python e tenha um modelo multilêÂ­ngue do faster-whisper e uma voz Piper em portuguêÂªs no disco. Os comandos abaixo instalam os pacotes e baixam, uma vez, o modelo multilêÂ­ngue `base` para transcriêÂ§êÂ£o e a voz brasileira Faber. Depois disso, a ponte lêÂª os arquivos no disco. Pare a ponte anterior com Ctrl+C antes de iniciar a versêÂ£o com voz.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install faster-whisper piper-tts
python -c "from faster_whisper.utils import download_model; download_model('base')"
python -m piper.download_voices pt_BR-faber-medium
python bridge.py --whisper-model base --piper-model pt_BR-faber-medium.onnx
```

Quem jêÂ¡ tem o ambiente do ARCKHÉvox com faster-whisper pode usar aquele Python e o modelo em cache, por exemplo `--whisper-model base`. No Windows, crie o ambiente com `py -3 -m venv .venv` e ative-o com `.venv\Scripts\Activate.ps1`. Linux foi o sistema de teste.

## O processo, do inêÂ­cio ao fim

1. **Conecte o Intelecto v2**. Com a ponte parada, baixe o Intelecto v2 ao lado do projeto. Use a linha com os parêÂ¢metros de voz se vocêÂª baixou os modelos acima.

   ```bash
   git clone https://github.com/linnoff88-dev/intelecto-v2.git ../intelecto-v2
   python3 bridge.py --intelecto ../intelecto-v2
   python3 bridge.py --intelecto ../intelecto-v2 --whisper-model base --piper-model pt_BR-faber-medium.onnx
   ```

   O comando usa o motor simulado do Intelecto. Para conversar com um modelo de IA, abra o Ollama, rode `ollama list` em outro terminal e copie um nome da coluna `NAME`. Pare a ponte com Ctrl+C e execute a mesma linha acrescentando `--intelecto-model NOME-DO-MODELO-LOCAL`, com o nome copiado no lugar do marcador. A conversa passa pelo Ollama em `127.0.0.1:11434`. O adaptador mantêÂ©m estado prêÂ³prio em `~/.painel-de-voz/intelecto` e abre a conversa com um registro vazio de ferramentas. A memêÂ³ria direta do Intelecto pode guardar pedidos como ê¢â¬Ålembre queê¢â¬Â¦ê¢â¬Â.

2. **Experimente voz**. Abra o painel local, clique em **Gravar pergunta**, permita o microfone, fale e clique em **Parar e transcrever**. Revise e envie. Com o som ligado, o Piper lêÂª a resposta em portuguêÂªs. Grave comandos de atêÂ© 30 segundos. A ponte toca atêÂ© 3.000 caracteres por resposta.

3. **Conecte outro assistente**. A opêÂ§êÂ£o `--adapter` vem por êÂºltimo e recebe o executêÂ¡vel e seus argumentos fixos. A cada turno, o processo recebe um JSON em stdin e devolve um JSON em stdout. Use stderr para diagnêÂ³stico e trate `session` como identificador para reusar o histêÂ³rico. A ponte impêÂµe 85 segundos por turno.

   ```bash
   python3 bridge.py --adapter python3 adapters/briefing.py adapters/agenda-exemplo.json
   ```

   PeêÂ§a ê¢â¬Åme dêÂª o briefing da agendaê¢â¬Â. Depois troque o horêÂ¡rio em `adapters/agenda-exemplo.json` e repita. Esse êÂ© um exemplo de plugin independente, com leitura de arquivo.

   | Entrada | SaêÂ­da |
   |---|---|
   | `{"session":"uuid","text":"me dêÂª o briefing"}` | `{"reply":"Bom dia. Sua agenda tem dois compromissos."}` |

O processo do adaptador roda com as permissêÂµes de quem inicia a ponte. Configure apenas um executêÂ¡vel que vocêÂª jêÂ¡ conhece. O painel pêÂºblico nêÂ£o encaminha êÂ¡udio ao serviêÂ§o local. A ponte aceita conexêÂµes apenas em loopback e exige a origem local nos pedidos. O nêÂºcleo e a onda representam estados da conversa. Os movimentos nêÂ£o sêÂ£o uma mediêÂ§êÂ£o da amplitude do êÂ¡udio.

## Baseado em Mark-LVII

O [Mark-LVII de FatihMakes](https://github.com/FatihMakes/Mark-LVII) êÂ© a fonte de inspiraêÂ§êÂ£o e anêÂ¡lise. O painel foi implementado separadamente. O [estudo das peêÂ§as isolêÂ¡veis](docs/ANALISE-MARK-LVII.md) inclui briefing, rotinas, verificaêÂ§êÂ£o de citaêÂ§êÂµes, tarefas que retomam, confirmaêÂ§êÂµes e dicas para ligar novos adaptadores.

---

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="32" />
  <p><strong>Arckhé AI</strong></p>
</div>