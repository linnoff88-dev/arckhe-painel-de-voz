# Voice Panel

[![Voice Panel](guia/assets/banner-en.jpg)](https://linnoff88-dev.github.io/arckhe-/guia/en/)

**[Português](README.md) · English · [Español](README.es.md)**

## What it is

Voice Panel is an interface for people who use or want to build a personal assistant like Intelecto. It brings together a microphone, editable text, conversation, and a holographic core that shows the assistant's state. In the demo, you can hear a briefing, a spoken summary with fictional data. To talk to your own assistant, install the local bridge, the program that connects the panel to the assistant on your computer. The idea came from Mark-LVII by FatihMakes.

[Open panel](https://linnoff88-dev.github.io/arckhe-/app/) · [Guide](https://linnoff88-dev.github.io/arckhe-/guia/en/) · [Plugin analysis](docs/ANALISE-MARK-LVII.md)

> Read this project's README and find out which assistant I already use. Explain how to connect Voice Panel to it and how to test local recording. Show what you plan to change and wait for my approval before modifying my system.

---

## Technical installation

### Try the demo

The public page has a fictional narrated briefing, a Canvas hologram, and text submission in demo mode. Click **Ligar som** and then **Mostrar briefing de exemplo**. On the public site, **Gravar pergunta** checks whether the browser recognizes Portuguese on the device. If it offers the language, use **Baixar português para o microfone** and try again. Allow microphone access, speak, and click **Parar e transcrever**. If the feature is unavailable, use the local installation or type. The bridge below uses its own local recognition and lets you review the transcription before sending it.

### Connect the local bridge

Use [Python 3.10 or later](https://www.python.org/downloads/), [Git](https://git-scm.com/install/), and a current browser. Open a terminal (PowerShell on Windows, Terminal on macOS or Linux), go to the folder where you keep your projects, and paste the block below. On Windows, replace `python3` with `py -3` if needed.

```bash
git clone https://github.com/linnoff88-dev/painel-de-voz.git
cd painel-de-voz
python3 bridge.py
```

Open `http://127.0.0.1:8765/app/`. The bar below the title should say “Local bridge · demo responses”. Type “Olá” and send it. In this mode, the bridge returns the text it received. To listen and transcribe locally, install `faster-whisper` and `piper-tts` in your Python environment and have a multilingual faster-whisper model and a Portuguese Piper voice on disk. The commands below install the packages and download the multilingual `base` model for transcription and the Brazilian Faber voice once. After that, the bridge reads the files from disk. Stop the previous bridge with Ctrl+C before starting the voice-enabled version.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install faster-whisper piper-tts
python -c "from faster_whisper.utils import download_model; download_model('base')"
python -m piper.download_voices pt_BR-faber-medium
python bridge.py --whisper-model base --piper-model pt_BR-faber-medium.onnx
```

If you already have the ARCKHÉvox environment with faster-whisper, you can use that Python and the cached model, for example `--whisper-model base`. On Windows, create the environment with `py -3 -m venv .venv` and activate it with `.venv\Scripts\Activate.ps1`. Linux was used for testing.

## The process from start to finish

1. **Connect Intelecto v2**. With the bridge stopped, download Intelecto v2 next to the project. Use the line with the voice parameters if you downloaded the models above.

   ```bash
   git clone https://github.com/linnoff88-dev/intelecto-v2.git ../intelecto-v2
   python3 bridge.py --intelecto ../intelecto-v2
   python3 bridge.py --intelecto ../intelecto-v2 --whisper-model base --piper-model pt_BR-faber-medium.onnx
   ```

   The command uses Intelecto's simulated engine. To talk to an AI model, open Ollama, run `ollama list` in another terminal, and copy a name from the `NAME` column. Stop the bridge with Ctrl+C and run the same line, adding `--intelecto-model LOCAL-MODEL-NAME` with the copied name in place of the placeholder. The conversation goes through Ollama at `127.0.0.1:11434`. The adapter keeps its own state in `~/.painel-de-voz/intelecto` and opens the conversation with an empty tool registry. Intelecto's direct memory can store requests such as “remember that…”.

2. **Try voice**. Open the local panel, click **Gravar pergunta**, allow microphone access, speak, and click **Parar e transcrever**. Review and send. With sound on, Piper reads the response in Portuguese. Record commands up to 30 seconds long. The bridge plays up to 3,000 characters per response.

3. **Connect another assistant**. The `--adapter` option goes last and takes the executable and its fixed arguments. Each turn, the process receives JSON on stdin and returns JSON on stdout. Use stderr for diagnostics and treat `session` as an identifier for reusing the history. The bridge enforces an 85-second limit per turn.

   ```bash
   python3 bridge.py --adapter python3 adapters/briefing.py adapters/agenda-exemplo.json
   ```

   Ask “give me the agenda briefing.” Then change the time in `adapters/agenda-exemplo.json` and repeat. This is an example of an independent plugin that reads a file.

   | Input | Output |
   |---|---|
   | `{"session":"uuid","text":"me dê o briefing"}` | `{"reply":"Bom dia. Sua agenda tem dois compromissos."}` |

The adapter process runs with the permissions of the person who starts the bridge. Configure only an executable you already know. The public panel does not forward audio to the local service. The bridge accepts connections only on loopback and requires the local origin in requests. The core and wave represent conversation states. Their movements do not measure audio amplitude.

## Based on Mark-LVII

[Mark-LVII by FatihMakes](https://github.com/FatihMakes/Mark-LVII) is the source of inspiration and analysis. The panel was implemented separately. The [study of separable components](docs/ANALISE-MARK-LVII.md) covers briefings, routines, citation checking, resumable tasks, confirmations, and tips for connecting new adapters.