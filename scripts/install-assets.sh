#!/usr/bin/env bash
#
# Installs the six artworks that are wired up but whose files are not in the
# repo yet. Download them from the Immersion Drive folder into ~/Downloads,
# then run this from the repo root:
#
#     ./scripts/install-assets.sh
#
# It converts the Cameo .MOV to web-playable MP4 and moves everything into
# Expression/ under the names artworks.js already expects. Safe to re-run —
# anything already installed is skipped, and nothing is overwritten.
#
set -uo pipefail

SRC="${1:-$HOME/Downloads}"
DEST="Expression"

if [ ! -f "artworks.js" ]; then
  echo "Run this from the repo root (the folder containing artworks.js)." >&2
  exit 1
fi

installed=0
skipped=0
absent=()

# Copy a file into place unless it is already there.
place() {
  local src="$1" dest="$2"
  if [ -f "$dest" ]; then
    echo "  already installed: $(basename "$dest")"
    skipped=$((skipped + 1))
    return
  fi
  if [ ! -f "$src" ]; then
    absent+=("$(basename "$src")")
    return
  fi
  cp "$src" "$dest"
  echo "  installed: $(basename "$dest")"
  installed=$((installed + 1))
}

echo "Looking in: $SRC"
echo

# --- 3D models: copied as-is -------------------------------------------------
place "$SRC/official_wwa_tower_hall_pt1.glb" "$DEST/official_wwa_tower_hall_pt1.glb"
place "$SRC/official_wwa_vic_stat_pt2.glb"   "$DEST/official_wwa_vic_stat_pt2.glb"
place "$SRC/eoe_monster_animation.glb"       "$DEST/eoe_monster_animation.glb"

# --- Videos already in MP4: copied as-is -------------------------------------
place "$SRC/Illuminated_Piano - Hannah Yee.mp4" "$DEST/illuminated_piano_hannah_yee.mp4"
place "$SRC/final_video - Emily Chaing.mp4"     "$DEST/final_video_emily_chaing.mp4"

# --- The .MOV: needs converting ----------------------------------------------
# QuickTime containers do not play in Chrome or Android. H.264 + AAC in an MP4
# with the index moved to the front (faststart) plays everywhere and starts
# without downloading the whole file first.
MOV="$SRC/VIDEO Cameo (2025) Nicole Rudolph-Vallerga.MOV"
CAMEO="$DEST/cameo_nicole_rudolph_vallerga.mp4"

if [ -f "$CAMEO" ]; then
  echo "  already installed: $(basename "$CAMEO")"
  skipped=$((skipped + 1))
elif [ -f "$MOV" ]; then
  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "  ffmpeg not found — install it with: brew install ffmpeg" >&2
  else
    echo "  converting $(basename "$MOV") → $(basename "$CAMEO") ..."
    if ffmpeg -nostdin -loglevel error -y -i "$MOV" \
        -vf "scale='min(1280,iw)':-2" \
        -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 23 -preset medium \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        "$CAMEO"; then
      echo "  installed: $(basename "$CAMEO") ($(du -h "$CAMEO" | cut -f1))"
      installed=$((installed + 1))
    else
      echo "  conversion FAILED" >&2
      rm -f "$CAMEO"
    fi
  fi
else
  absent+=("$(basename "$MOV")")
fi

echo
echo "Installed $installed, already present $skipped."

if [ ${#absent[@]} -gt 0 ]; then
  echo
  echo "Still not found in $SRC:"
  for f in "${absent[@]}"; do echo "  · $f"; done
  echo
  echo "Download them from the Immersion Drive folder, then run this again."
fi
