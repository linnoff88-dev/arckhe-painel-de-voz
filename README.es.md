# Panel de Voz

[![Panel de Voz](guia/assets/banner.es.jpg)](https://linnoff88-dev.github.io/arckhe-/guia/es/)

**[Português](README.md) · [English](README.en.md) · Español**

## Qué es

El Panel de Voz es una interfaz para quienes usan o quieren crear un asistente personal como Intelecto. Reúne el micrófono, texto que puedes corregir, conversación y un núcleo holográfico que muestra el estado del asistente. En la demostración, escuchas un briefing, un resumen hablado con datos ficticios. Para conversar con tu propio asistente, instala el puente local, el programa que conecta el panel con el asistente de tu computadora. La idea surgió de Mark-LVII, de FatihMakes.

[Abrir panel](https://linnoff88-dev.github.io/arckhe-/app/) · [Guía](https://linnoff88-dev.github.io/arckhe-/guia/es/) · [Análisis de plugins](docs/ANALISE-MARK-LVII.md)

> Lee el README de este proyecto y averigua qué asistente uso ya. Explica cómo conectar el Panel de Voz con él y cómo probar la grabación local. Muéstrame qué piensas cambiar y espera mi aprobación antes de modificar mi sistema.

---

## Instalación técnica

### Prueba la demostración

La página pública tiene un briefing ficticio narrado, un holograma en Canvas y envío de texto en modo de demostración. Haz clic en **Ligar som** y, a continuación, en **Mostrar briefing de exemplo**. En el sitio público, **Gravar pergunta** comprueba si el navegador reconoce portugués en el dispositivo. Si ofrece el idioma, usa **Baixar português para o microfone** e inténtalo de nuevo. Permite el acceso al micrófono, habla y haz clic en **Parar e transcrever**. Si la función no está disponible, usa la instalación local o escribe. El puente de abajo usa su propio reconocimiento local y permite revisar la transcripción antes de enviarla.

### Conecta el puente local

Usa [Python 3.10 o posterior](https://www.python.org/downloads/), [Git](https://git-scm.com/install/) y un navegador actualizado. Abre una terminal (PowerShell en Windows, Terminal en macOS o Linux), ve a la carpeta donde guardas tus proyectos y pega el bloque de abajo. En Windows, cambia `python3` por `py -3` si es necesario.

```bash
git clone https://github.com/linnoff88-dev/painel-de-voz.git
cd painel-de-voz
python3 bridge.py
```

Abre `http://127.0.0.1:8765/app/`. La franja debajo del título debe decir “Puente local · respuestas de demostración”. Escribe “Hola” y envíalo. En este modo, el puente devuelve el texto recibido. Para escuchar y transcribir localmente, instala `faster-whisper` y `piper-tts` en tu entorno de Python y ten en el disco un modelo multilingüe de faster-whisper y una voz de Piper en portugués. Los comandos de abajo instalan los paquetes y descargan, una sola vez, el modelo multilingüe `base` para la transcripción y la voz brasileña Faber. Después de eso, el puente lee los archivos del disco. Detén el puente anterior con Ctrl+C antes de iniciar la versión con voz.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install faster-whisper piper-tts
python -c "from faster_whisper.utils import download_model; download_model('base')"
python -m piper.download_voices pt_BR-faber-medium
python bridge.py --whisper-model base --piper-model pt_BR-faber-medium.onnx
```

Si ya tienes el entorno de ARCKHÉvox con faster-whisper, puedes usar ese Python y el modelo en caché, por ejemplo `--whisper-model base`. En Windows, crea el entorno con `py -3 -m venv .venv` y actívalo con `.venv\Scripts\Activate.ps1`. Linux fue el sistema de prueba.

## El proceso, de principio a fin

1. **Conecta Intelecto v2**. Con el puente detenido, descarga Intelecto v2 junto al proyecto. Usa la línea con los parámetros de voz si descargaste los modelos anteriores.

   ```bash
   git clone https://github.com/linnoff88-dev/intelecto-v2.git ../intelecto-v2
   python3 bridge.py --intelecto ../intelecto-v2
   python3 bridge.py --intelecto ../intelecto-v2 --whisper-model base --piper-model pt_BR-faber-medium.onnx
   ```

   El comando usa el motor simulado de Intelecto. Para conversar con un modelo de IA, abre Ollama, ejecuta `ollama list` en otra terminal y copia un nombre de la columna `NAME`. Detén el puente con Ctrl+C y ejecuta la misma línea añadiendo `--intelecto-model NOMBRE-DEL-MODELO-LOCAL`, con el nombre copiado en lugar del marcador. La conversación pasa por Ollama en `127.0.0.1:11434`. El adaptador mantiene su propio estado en `~/.painel-de-voz/intelecto` y abre la conversación con un registro vacío de herramientas. La memoria directa de Intelecto puede guardar solicitudes como “recuerda que…”.

2. **Prueba la voz**. Abre el panel local, haz clic en **Gravar pergunta**, permite el uso del micrófono, habla y haz clic en **Parar e transcrever**. Revisa y envía. Con el sonido activado, Piper lee la respuesta en portugués. Graba comandos de hasta 30 segundos. El puente reproduce hasta 3.000 caracteres por respuesta.

3. **Conecta otro asistente**. La opción `--adapter` va al final y recibe el ejecutable y sus argumentos fijos. En cada turno, el proceso recibe un JSON por stdin y devuelve un JSON por stdout. Usa stderr para el diagnóstico y trata `session` como identificador para reutilizar el historial. El puente impone un límite de 85 segundos por turno.

   ```bash
   python3 bridge.py --adapter python3 adapters/briefing.py adapters/agenda-exemplo.json
   ```

   Pide “dame el briefing de la agenda”. Luego cambia la hora en `adapters/agenda-exemplo.json` y repite. Este es un ejemplo de plugin independiente que lee un archivo.

   | Entrada | Salida |
   |---|---|
   | `{"session":"uuid","text":"me dê o briefing"}` | `{"reply":"Bom dia. Sua agenda tem dois compromissos."}` |

El proceso del adaptador se ejecuta con los permisos de quien inicia el puente. Configura solo un ejecutable que ya conozcas. El panel público no envía audio al servicio local. El puente solo acepta conexiones de loopback y exige el origen local en las solicitudes. El núcleo y la onda representan estados de la conversación. Los movimientos no miden la amplitud del audio.

## Basado en Mark-LVII

[Mark-LVII de FatihMakes](https://github.com/FatihMakes/Mark-LVII) es la fuente de inspiración y análisis. El panel se implementó por separado. El [estudio de los componentes aislables](docs/ANALISE-MARK-LVII.md) incluye briefing, rutinas, verificación de citas, tareas reanudables, confirmaciones y consejos para conectar nuevos adaptadores.