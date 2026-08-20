#!/usr/bin/env bash
#
# Kökteki sahne dosyalarını scenes/ klasörüne taşır:
#   scene-ep5.mp4  ->  scenes/scene-ep5.mp4
#
# Hedef listeyi public/data/videos.json'dan okur — elle liste tutulmaz.
# rclone moveto sunucu tarafında taşır; dosyalar inip yüklenmez.
#
#   ./scripts/r2-move-scenes.sh         # kuru çalıştırma
#   ./scripts/r2-move-scenes.sh --go    # uygula
#
set -euo pipefail

REMOTE="${REMOTE:-r2:mafin-videos}"
DEST="${DEST:-scenes}"
DRY="--dry-run"; LABEL="KURU ÇALIŞTIRMA (hiçbir şey değişmiyor)"
[ "${1:-}" = "--go" ] && { DRY=""; LABEL="UYGULANIYOR"; }

command -v rclone >/dev/null || { echo "rclone bulunamadı"; exit 1; }
echo "$LABEL  ·  $REMOTE/  ->  $REMOTE/$DEST/"; echo

python3 - "$REMOTE" "$DEST" "$DRY" <<'PY'
import json, io, subprocess, sys

remote, dest, dry = sys.argv[1], sys.argv[2], sys.argv[3]
flags = [dry] if dry else []

data = json.load(io.open("public/data/videos.json", encoding="utf-8"))
names = [x["file"] for x in data if x.get("file")]

ok = fail = 0
for n in names:
    r = subprocess.run(
        ["rclone", "moveto", f"{remote}/{n}", f"{remote}/{dest}/{n}", *flags],
        capture_output=True, text=True,
    )
    if r.returncode == 0:
        print(f"  {n:>18}  ->  {dest}/{n}")
        ok += 1
    else:
        last = r.stderr.strip().splitlines()[-1] if r.stderr else "?"
        print(f"  HATA {n}: {last}")
        fail += 1

print(f"\n{ok} başarılı · {fail} hata · toplam {len(names)}")
PY
