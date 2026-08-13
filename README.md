# Echoes of Expression — AR Exhibition

A location-based augmented reality exhibition for Immersion 2026, running across
the SJSU campus, the MLK Library and San José City Hall. Visitors walk the route
on their phone; artworks appear at their real coordinates, and tapping one opens
the artist's statement.

Built on A-Frame with the Niantic Spatial XR engine (the distributed build — no
app key needed).

---

## Running it

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Two things to know:

- **Phones need HTTPS.** Camera, compass and GPS are all blocked on plain
  `http://` from anything other than `localhost`. For on-site testing use a
  tunnel (`ngrok http 8080`) or deploy to any static host.
- **Desktop preview:** open `http://localhost:8080/?preview` to walk the whole
  route with no camera and no GPS. Drag to look, WASD to move. This is the
  fastest way to check placement and statements.

---

## Where things live

| File | What it is |
| --- | --- |
| `artworks.js` | **All exhibition content.** The only file you need for statements, coordinates and placement. |
| `app.js` | Tracking, placement, streaming, interaction. |
| `ui.js` | Start screen, artist statement panel, artwork index, debug tools. |
| `index.html` | Page shell and scene. |
| `style.css` | All styling. |
| `Expression/` | 3D models and video. |
| `Expression/previews/` | Preview thumbnails, extracted from the exhibition brief. |

---

## Adding artist statements

This is the main thing still outstanding. Open `artworks.js`, find the work, and
fill in the quotes:

```js
{
  id:      'eoe_abstract_bird',
  title:   'Abstract Bird',
  ...
  artist:    'Jane Doe',
  year:      '2025',
  medium:    'Animation',
  statement: 'A few sentences about the work.',
},
```

Empty fields are hidden in the panel rather than showing blank labels, so it is
safe to fill these in gradually. The statements live in the Google Slides decks
for each exhibit.

Four artists are already credited from the brief: Nicole Rudolph-Vallerga
(*Cameo* video), Hannah Yee (*Illuminated Piano*), Emily Chaing (the untitled
final video), and Anna Huynh (*Engine*).

For **Text as Image**, the brief notes that every work in the mini show shares
one description and differs only by artist. Put the shared text in `statement`
and list the names in `contributors`.

---

## Artworks with no file yet

Six works are fully wired — coordinates, preview image, panel, the lot — but
their files are not in the repo. They all live in the Immersion Drive folder.

**To install them:** download these six into `~/Downloads`, then run

```bash
./scripts/install-assets.sh
```

| Work | File in Drive |
| --- | --- |
| Cameo (video) | [VIDEO Cameo (2025) Nicole Rudolph-Vallerga.MOV](https://drive.google.com/file/d/1wO57OIx92cpLIVRDIcEbzhQuT_o2VpI5/view) — 64.6 MB |
| Illuminated Piano | [Illuminated_Piano - Hannah Yee.mp4](https://drive.google.com/file/d/1sCdTMMI1AYPEViW-n_qH5KvIrwgSncoM/view) — 7.6 MB |
| Untitled (Emily Chaing) | [final_video - Emily Chaing.mp4](https://drive.google.com/file/d/1JqQskzuVXTpwnLay6xj6FRlc9TviyFN-/view) — 8.3 MB |
| Tower Hall, Part 1 | [official_wwa_tower_hall_pt1.glb](https://drive.google.com/file/d/1PgaAmXtVqAAZp8PZxIilDn5a8yHNiUxK/view) — 42 MB |
| Victory Statue, Part 2 | [official_wwa_vic_stat_pt2.glb](https://drive.google.com/file/d/1ShMUbnWvL5TzGBNQgXttRskToVKMIeft/view) — 2.6 MB |
| Monster | [eoe_monster_animation.glb](https://drive.google.com/file/d/1Sg85b2yAZnWpQzy06d3RfmgRb1yJ_6mG/view) — 3.8 MB |

The script converts the `.MOV` to H.264 MP4 with `faststart` — QuickTime
containers do not play in Chrome or on Android — and moves everything into
`Expression/` under the names `artworks.js` already expects. No code edit
needed. It is safe to re-run and will not overwrite anything.

Until a file arrives, that work shows "not installed yet" in its pop-up and is
listed in the Debug panel. Nothing looks broken.

Note also that the brief splits **Text as Image** into a left and a right
placement either side of S 5th St. Only one combined file exists, so it is
placed once. If the split files turn up, duplicate the entry and give each an
`offset` of `[-3, 0]` and `[3, 0]`.

---

## Placement

Every artwork accepts optional placement fields, all documented at the top of
`artworks.js`: `scale`, `fitSize`, `yaw`, `elevation`, `offset`, `radius` and
`groundAlign`.

Two of these were needed to make the current set usable:

- **`fitSize`** on *Text as Image*. That file is authored in units that make it
  2203 m wide. It is fitted to 60 m — a row along the block, each work roughly
  1.4 m. **This number is a guess and deserves your eye.**
- **`offset`** on the six Commotion panels. Each is about 12.7 m wide but three
  of them share a single coordinate, so they are spread 14 m apart. Adjust if
  you want them tighter or in a different orientation.

Models are dropped onto the ground automatically, because several have their
origin part way up the piece and would otherwise sit three to eight metres
underground. Set `groundAlign: false` on a work to keep its authored height.

---

## On-site tips

The Debug button opens a panel with the anchor position, GPS accuracy, compass
lock, live distances to every work, and which files are missing.

- **Everything is rotated the wrong way.** Tap *Recalibrate north* and sweep the
  phone in a figure eight. Phone compasses drift badly near large metal
  structures, and City Hall is a bad neighbourhood for them.
- **Artworks float or sink.** Use the *Ground offset* +/− buttons to shift the
  whole exhibition vertically, then copy the value into `CONFIG.groundY` in
  `app.js`.
- **Nothing appears.** Check the distance list. Models load within 60 m
  (80 m for the library map) and are released beyond 140 m — tune with `radius`
  and `CONFIG.unloadRadius`.

---

## A note on data

The full asset set is about 360 MB, with a 63 MB library map, a 56 MB Cameo model
and an 83 MB video. Models are streamed as you approach and released as you
leave, so no single visit downloads everything — but this is still a heavy
experience on cellular. Compressing the largest models (Draco for geometry, KTX2
for textures) would be the single biggest improvement available; three files in
the set are already Draco-compressed and load fine.
