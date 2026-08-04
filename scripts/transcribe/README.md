# Transcripción con WhisperX

Script CLI que extrae el audio de un vídeo, lo transcribe con WhisperX (word timestamps) y genera:

- `{nombre}.json` — array de palabras con `start` / `end`
- `{nombre}.vtt` — subtítulos WebVTT por segmento

## Requisitos del sistema

1. **Python 3.10+**
2. **ffmpeg** en el `PATH` ([descarga](https://ffmpeg.org/download.html))

Comprueba:

```bash
python --version
ffmpeg -version
```

## Instalación

```bash
cd scripts/transcribe
python -m venv .venv

# Windows (Git Bash / PowerShell)
source .venv/Scripts/activate   # Git Bash
# .venv\Scripts\Activate.ps1   # PowerShell

# macOS / Linux
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

### GPU (opcional, más rápido)

Si tienes CUDA, instala PyTorch con CUDA **antes** o **después** de WhisperX según tu setup:

```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt
```

En CPU el script usa `compute_type=int8` automáticamente.

## Uso

```bash
python transcribe.py video.mp4
```

Genera junto al vídeo:

- `video.json`
- `video.vtt`

### Opciones

```bash
python transcribe.py video.mp4 --model small --language es
python transcribe.py video.mp4 --out-dir ../../src/assets/videos
python transcribe.py video.mp4 --device cpu --batch-size 4
```

| Flag | Default | Descripción |
|------|---------|-------------|
| `--model` | `small` | Tamaño del modelo Whisper (`tiny`, `base`, `small`, `medium`, `large-v2`…) |
| `--language` | `es` | Código de idioma |
| `--out-dir` | carpeta del vídeo | Destino de `.json` / `.vtt` |
| `--device` | auto | `cuda` o `cpu` |
| `--batch-size` | `8` | Batch de WhisperX (baja si hay OOM) |

## Formato de `video.json`

```json
[
  {
    "word": "Hola",
    "start": 0.52,
    "end": 0.83
  },
  {
    "word": "mundo",
    "start": 0.84,
    "end": 1.25
  }
]
```

## Notas

- No se usa diarización (no hace falta token de Hugging Face / pyannote).
- La primera ejecución descarga el modelo de Whisper y el modelo de alineación; puede tardar.
