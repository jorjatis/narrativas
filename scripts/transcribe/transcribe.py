#!/usr/bin/env python3
"""Extract audio from a video, transcribe with WhisperX, and write .vtt + .json."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe a video with WhisperX word timestamps."
    )
    parser.add_argument("video", type=Path, help="Path to an MP4 (or other) video file")
    parser.add_argument(
        "--model",
        default="small",
        help="WhisperX model size (default: small)",
    )
    parser.add_argument(
        "--language",
        default="es",
        help="Language code for transcription (default: es)",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Output directory (default: same folder as the video)",
    )
    parser.add_argument(
        "--device",
        default=None,
        help="Force device: cuda or cpu (default: auto)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=8,
        help="WhisperX batch size (default: 8)",
    )
    return parser.parse_args()


def resolve_device(forced: str | None) -> tuple[str, str]:
    if forced:
        device = forced.lower()
        compute_type = "float16" if device == "cuda" else "int8"
        return device, compute_type

    try:
        import torch

        if torch.cuda.is_available():
            return "cuda", "float16"
    except Exception:
        pass

    return "cpu", "int8"


def extract_audio(video: Path, wav_path: Path) -> None:
    if not shutil.which("ffmpeg"):
        raise RuntimeError(
            "ffmpeg no está en el PATH. Instálalo y vuelve a intentarlo."
        )

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(video),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        str(wav_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg falló:\n{result.stderr}")


def format_vtt_timestamp(seconds: float) -> str:
    if seconds < 0:
        seconds = 0.0
    millis = int(round(seconds * 1000))
    hours, rem = divmod(millis, 3_600_000)
    minutes, rem = divmod(rem, 60_000)
    secs, ms = divmod(rem, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{ms:03d}"


def words_from_result(aligned: dict) -> list[dict]:
    words: list[dict] = []
    for segment in aligned.get("segments") or []:
        for item in segment.get("words") or []:
            text = (item.get("word") or "").strip()
            start = item.get("start")
            end = item.get("end")
            if not text or start is None or end is None:
                continue
            words.append(
                {
                    "word": text,
                    "start": round(float(start), 2),
                    "end": round(float(end), 2),
                }
            )
    return words


def build_vtt(aligned: dict) -> str:
    lines = ["WEBVTT", ""]
    index = 1
    for segment in aligned.get("segments") or []:
        text = (segment.get("text") or "").strip()
        start = segment.get("start")
        end = segment.get("end")
        if not text or start is None or end is None:
            continue
        lines.append(str(index))
        lines.append(
            f"{format_vtt_timestamp(float(start))} --> {format_vtt_timestamp(float(end))}"
        )
        lines.append(text)
        lines.append("")
        index += 1
    return "\n".join(lines).rstrip() + "\n"


def transcribe(video: Path, args: argparse.Namespace) -> None:
    if not video.is_file():
        raise FileNotFoundError(f"No se encontró el vídeo: {video}")

    out_dir = args.out_dir or video.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = video.stem
    json_path = out_dir / f"{stem}.json"
    vtt_path = out_dir / f"{stem}.vtt"

    device, compute_type = resolve_device(args.device)
    print(f"[transcribe] dispositivo={device} compute_type={compute_type} model={args.model}")

    import whisperx

    with tempfile.TemporaryDirectory(prefix="whisperx_") as tmp:
        wav_path = Path(tmp) / f"{stem}.wav"
        print(f"[transcribe] extrayendo audio -> {wav_path.name}")
        extract_audio(video, wav_path)

        print("[transcribe] cargando modelo…")
        model = whisperx.load_model(
            args.model,
            device,
            compute_type=compute_type,
            language=args.language,
        )

        print("[transcribe] transcribiendo…")
        audio = whisperx.load_audio(str(wav_path))
        result = model.transcribe(
            audio,
            batch_size=args.batch_size,
            language=args.language,
        )

        language = result.get("language") or args.language
        print(f"[transcribe] alineando palabras (lang={language})…")
        align_model, metadata = whisperx.load_align_model(
            language_code=language,
            device=device,
        )
        aligned = whisperx.align(
            result["segments"],
            align_model,
            metadata,
            audio,
            device,
            return_char_alignments=False,
        )

    words = words_from_result(aligned)
    if not words:
        raise RuntimeError("WhisperX no devolvió word timestamps.")

    json_path.write_text(
        json.dumps(words, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    vtt_path.write_text(build_vtt(aligned), encoding="utf-8")

    print(f"[transcribe] escrito {json_path} ({len(words)} palabras)")
    print(f"[transcribe] escrito {vtt_path}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

    args = parse_args()
    try:
        transcribe(args.video.resolve(), args)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
