#!/usr/bin/env bash
#
# Elle kırpılmış karakter avatarlarını tek tip hale getirir.
#
# Kırpımı Preview'da (ya da nerede istersen) yap, boyutu ve oranı önemli
# değil — bu script kareye tamamlayıp 256×256'ya getirir. Kare değilse
# ORTADAN kare alır, yani yüzü ortalamaya çalış, gerisini script halleder.
#
#   1. public/img/characters/ içindeki dosyanın üzerine kendi kırpımını yaz
#      (aynı adla: marta.jpg, fina.jpg, jaime.jpg …)
#   2. ./scripts/normalize-avatars.sh
#
# Zaten 256×256 olan dosyalara dokunmaz, tekrar tekrar çalıştırılabilir.
set -euo pipefail

DIR="${DIR:-public/img/characters}"
SIZE="${SIZE:-256}"

command -v ffmpeg >/dev/null || { echo "ffmpeg bulunamadı"; exit 1; }
[ -d "$DIR" ] || { echo "klasör yok: $DIR"; exit 1; }

changed=0
for f in "$DIR"/*.jpg; do
  wh=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$f")
  if [ "$wh" = "${SIZE}x${SIZE}" ]; then
    printf "  %-16s %-12s (zaten uygun)\n" "$(basename "$f")" "$wh"
    continue
  fi
  tmp="${f%.jpg}.tmp.jpg"
  ffmpeg -v error -y -i "$f" \
    -vf "crop='min(iw,ih)':'min(iw,ih)',scale=${SIZE}:${SIZE}:flags=lanczos" \
    -q:v 4 "$tmp"
  mv "$tmp" "$f"
  printf "  %-16s %-12s → %sx%s  (%s KB)\n" \
    "$(basename "$f")" "$wh" "$SIZE" "$SIZE" "$(( $(stat -f%z "$f") / 1024 ))"
  changed=$((changed + 1))
done

echo
echo "$changed dosya normalize edildi · toplam $(du -sh "$DIR" | cut -f1)"
