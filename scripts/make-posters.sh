#!/usr/bin/env bash
#
# Timeline kliplerinden poster üretir (her klibin ilk karesi).
# Kart, video inmeden önce bunu gösterir; video sadece hover'da /
# viewport merkezine gelince yüklenir.
#
#   ./scripts/make-posters.sh          # 0. saniyeden, q:v 6
#   AT=0.4 ./scripts/make-posters.sh   # klip siyahtan açılıyorsa ileriden
#   Q=4 ./scripts/make-posters.sh      # daha yüksek kalite
#
# Not: bu ffmpeg build'inde webp encoder yok (libwebp/cwebp/sips hiçbiri).
# JPEG kullanılıyor — mevcut public/img/videos-posters/ de zaten .jpg.
#
set -euo pipefail

SRC="${SRC:-public/videos}"
OUT="${OUT:-public/img/timeline-posters}"
WIDTH="${WIDTH:-960}"   # kart ekranda ~452 CSS px; 2x ekran için 960
Q="${Q:-6}"             # ffmpeg mjpeg ölçeği: 2=en iyi, 31=en kötü
AT="${AT:-0}"           # frame 0 — kliplerde fade yok (YAVG ile doğrulandı)

command -v ffmpeg >/dev/null || { echo "ffmpeg bulunamadı"; exit 1; }
[ -d "$SRC" ] || { echo "kaynak klasör yok: $SRC"; exit 1; }
mkdir -p "$OUT"

total=0; n=0
for src in "$SRC"/*.mp4; do
  name=$(basename "$src" .mp4)
  dst="$OUT/$name.jpg"
  ffmpeg -v error -y -ss "$AT" -i "$src" -frames:v 1 \
    -vf "scale=${WIDTH}:-2:flags=lanczos" -q:v "$Q" "$dst"
  sz=$(stat -f%z "$dst"); total=$((total + sz)); n=$((n + 1))
done

printf "%d poster → %s  ·  toplam %d KB (ort. %d KB)\n" \
  "$n" "$OUT" "$((total/1024))" "$((total/n/1024))"
