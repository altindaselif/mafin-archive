#!/usr/bin/env bash
#
# Timeline kliplerini R2'ye timeline/ klasörü altına yükler.
# Yükleme bitince public/videos/ repodan silinebilir (checklist 1.2).
#
#   ./scripts/r2-upload-timeline.sh         # kuru çalıştırma
#   ./scripts/r2-upload-timeline.sh --go    # yükle
#
set -euo pipefail

SRC="${SRC:-public/videos}"
REMOTE="${REMOTE:-r2:mafin-videos}"
DEST="${DEST:-timeline}"
DRY="--dry-run"; PROGRESS=""; LABEL="KURU ÇALIŞTIRMA (hiçbir şey yüklenmiyor)"
[ "${1:-}" = "--go" ] && { DRY=""; PROGRESS="--progress"; LABEL="YÜKLENİYOR"; }

command -v rclone >/dev/null || { echo "rclone bulunamadı"; exit 1; }
[ -d "$SRC" ] || { echo "kaynak klasör yok: $SRC"; exit 1; }

n=$(ls -1 "$SRC"/*.mp4 2>/dev/null | wc -l | tr -d ' ')
echo "$LABEL  ·  $SRC ($n dosya, $(du -sh "$SRC" | cut -f1))  ->  $REMOTE/$DEST/"
echo

rclone copy "$SRC" "$REMOTE/$DEST/" --include "*.mp4" $PROGRESS $DRY \
  && [ -z "$DRY" ] || echo "  $n dosya yüklenecek (şu an hiçbiri gönderilmedi)"

if [ "${1:-}" = "--go" ]; then
  echo
  echo "=== doğrulama ==="
  up=$(rclone lsf "$REMOTE/$DEST/" 2>/dev/null | grep -c '\.mp4$' || true)
  echo "yerel: $n · R2'de: $up"
  [ "$n" = "$up" ] && echo "✓ hepsi yüklendi" || echo "✗ sayılar tutmuyor, kontrol et"
fi
