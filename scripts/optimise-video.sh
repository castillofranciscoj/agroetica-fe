#!/usr/bin/env bash
#
# optimise-video.sh
# Convert a high-res clip into streaming-friendly WebM + MP4 + poster JPEG.
#
# Usage:
#   ./scripts/optimise-video.sh path/to/raw-file.mp4  output-basename
#
# Example:
#   ./scripts/optimise-video.sh public/img/7456697-uhd_3840_2160_30fps.mp4 about-hero-720p
#
# Outputs:
#   public/img/<basename>.mp4
#   public/img/<basename>.webm
#   public/img/<basename>-poster.jpg
# ---------------------------------------------------------------------------

set -euo pipefail

RAW_FILE=${1:-}
BASENAME=${2:-}

if [[ -z "$RAW_FILE" || -z "$BASENAME" ]]; then
  echo "❌  Usage: $0 <raw-file> <basename>"
  exit 1
fi

if [[ ! -f "$RAW_FILE" ]]; then
  echo "❌  File not found: $RAW_FILE"
  exit 1
fi

OUT_DIR=$(dirname "$RAW_FILE")

echo "🔄  Converting $RAW_FILE ➜ $OUT_DIR/${BASENAME}.{mp4,webm,jpg}"

# ---------- 1) MP4 (H-264) ----------
ffmpeg -i "$RAW_FILE"                    \
       -vf "scale=1280:-2"               \
       -r 25                             \
       -c:v libx264 -profile:v high      \
       -movflags +faststart              \
       -crf 23 -preset veryfast          \
       -an                               \
       "$OUT_DIR/${BASENAME}.mp4"

# ---------- 2) WebM (VP9) ------------
ffmpeg -i "$RAW_FILE"                    \
       -vf "scale=1280:-2"               \
       -r 25                             \
       -c:v libvpx-vp9 -b:v 0            \
       -crf 33 -threads 4                \
       -an                               \
       "$OUT_DIR/${BASENAME}.webm"

# ---------- 3) Poster JPEG -----------
ffmpeg -i "$RAW_FILE" -vf "scale=1280:-2,thumbnail" -frames:v 1 \
       "$OUT_DIR/${BASENAME}-poster.jpg"

echo "✅  Done!"
