#!/usr/bin/env bash
#
# R2'deki tam sahne dosyalarını yeni isimlendirmeye geçirir:
#   ep-5.mp4  ->  scene-ep5.mp4
#
# Hedef adları public/data/videos.json'dan okur — yani kod ile bucket
# her zaman aynı listeden türer, elle liste tutulmaz.
#
# R2'de "yeniden adlandırma" diye bir işlem yok; rclone moveto sunucu
# tarafında kopyalayıp eskisini siler (dosyalar indirilip yüklenmez).
#
#   ./scripts/r2-rename-scenes.sh         # kuru çalıştırma, hiçbir şey değişmez
#   ./scripts/r2-rename-scenes.sh --go    # gerçekten uygula
#
set -euo pipefail

REMOTE="${REMOTE:-r2:mafin-videos}"
DRY="--dry-run"
LABEL="KURU ÇALIŞTIRMA (hiçbir şey değişmiyor)"
if [ "${1:-}" = "--go" ]; then
  DRY=""
  LABEL="UYGULANIYOR"
fi

command -v rclone >/dev/null || { echo "rclone bulunamadı"; exit 1; }

echo "$LABEL  ·  hedef: $REMOTE"
echo

python3 - "$REMOTE" "$DRY" <<'PY'
import json, io, subprocess, sys, re

remote, dry = sys.argv[1], sys.argv[2]
flags = [dry] if dry else []

data = json.load(io.open("public/data/videos.json", encoding="utf-8"))
pairs = []
for x in data:
    new = x.get("file")
    if not new:
        continue
    m = re.fullmatch(r"scene-ep(\d+)\.mp4", new)
    if not m:
        print(f"  ATLANDI (beklenmeyen ad): {new}")
        continue
    pairs.append((f"ep-{m.group(1)}.mp4", new))

ok = fail = 0
for old, new in pairs:
    r = subprocess.run(
        ["rclone", "moveto", f"{remote}/{old}", f"{remote}/{new}", *flags],
        capture_output=True, text=True,
    )
    if r.returncode == 0:
        print(f"  {old:>16}  ->  {new}")
        ok += 1
    else:
        print(f"  HATA {old}: {r.stderr.strip().splitlines()[-1] if r.stderr else '?'}")
        fail += 1

print(f"\n{ok} başarılı · {fail} hata · toplam {len(pairs)}")
PY
