#!/usr/bin/env bash
#
# Kesilmiş bir klibi timeline formatına çevirir. R2'deki 54 klibin
# hepsi bu ayarlarla yapılmış (x264 SEI'sinden doğrulandı):
# H.264 High, 1280×720, 25 fps, yuv420p, crf 28, preset slow, sessiz.
#
#   ./scripts/encode-timeline.sh ~/Desktop/Filmim.mp4 185
#     → ~/Desktop/timeline-ep185.mp4
#
#   CRF=26 ./scripts/encode-timeline.sh ...   # daha yüksek kalite
#
# Sonra: make-posters.sh ile poster, r2-upload-timeline.sh ile yükleme.
#
set -euo pipefail

CRF="${CRF:-28}"

[ $# -eq 2 ] || { echo "kullanım: $0 <girdi.mp4> <bölüm no>"; exit 1; }
src="$1"; ep="$2"
[ -f "$src" ] || { echo "dosya yok: $src"; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg bulunamadı"; exit 1; }

dst="$(dirname "$src")/timeline-ep${ep}.mp4"
[ -e "$dst" ] && { echo "zaten var: $dst"; exit 1; }

# min(720,ih): büyük kaynağı 720p'ye indirir, küçüğü büyütmez.
# yuv420p: iPhone HDR (10-bit) kaynak High 10'a düşüp tarayıcıda oynamasın.
ffmpeg -v error -stats -i "$src" -an \
  -vf "scale=-2:'min(720,ih)',fps=25" \
  -c:v libx264 -crf "$CRF" -preset slow -profile:v high -pix_fmt yuv420p \
  -movflags +faststart "$dst"

in=$(stat -f%z "$src"); out=$(stat -f%z "$dst")
printf "%s  ·  %d KB → %d KB\n" "$dst" "$((in/1024))" "$((out/1024))"
