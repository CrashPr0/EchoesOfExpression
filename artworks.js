/* ============================================================================
   ECHOES OF EXPRESSION — EXHIBITION DATA
   ============================================================================

   This is the ONLY file you need to edit to change exhibition content.
   Nothing here is code — it is just a list of artworks.

   ---------------------------------------------------------------------------
   TO ADD AN ARTIST STATEMENT
   ---------------------------------------------------------------------------
   Find the artwork below and fill in the empty quotes:

       artist:    'Jane Doe',
       year:      '2025',
       medium:    'Digital sculpture',
       statement: 'A few sentences about the work...',

   Anything left empty is simply hidden in the pop-up panel — it will not
   break. Statements come from the Google Slides decks for each exhibit.

   ---------------------------------------------------------------------------
   TO ADD A MISSING 3D MODEL OR VIDEO
   ---------------------------------------------------------------------------
   Entries marked  // awaiting file  are fully wired but the file is not in the
   repo yet. Put it at exactly the path shown and it starts working — no code
   change needed. `scripts/install-assets.sh` does this for you, including
   converting the Cameo .MOV to MP4.

   The app checks every asset on startup, lists whatever is absent in the Debug
   panel, and shows "not installed yet" in that work's pop-up, so nothing looks
   broken while you wait on a file.

   ---------------------------------------------------------------------------
   PLACEMENT FIELDS (all optional)
   ---------------------------------------------------------------------------
     scale       1 = model's own size. 0.5 = half size, 2 = double.
     fitSize     Target size in metres for the model's largest dimension.
                 Use instead of `scale` when a file was exported in the wrong
                 units. Overrides `scale`.
     yaw         Rotation in degrees around the vertical axis.
     elevation   Metres above ground. Use for works that should float.
     offset      [x, z] metres, for works that share one GPS coordinate.
                 +x is east, +z is south.
     radius      Metres away at which the model starts downloading (default 60).
     groundAlign Set to false to keep the model at the height it was authored
                 at. On by default, which drops each model onto the ground.

   Coordinates below are transcribed from
   "AR Art Exhibition Map Layout - Immersion 2026".
   ========================================================================= */

window.EXHIBITION = {

  meta: {
    title: 'Echoes of Expression',
    subtitle: 'Immersion 2026 · San José State University',
    // Used by the "Teleport" debug button and as the desktop preview origin.
    previewOrigin: { latitude: 37.336111, longitude: -121.885083 },
  },

  exhibits: {
    wwa: { name: 'Who We Are',           color: '#f2b134' },
    eoe: { name: 'Echoes of Expression', color: '#5ec2c8' },
  },

  artworks: [

    /* ======================================================================
       WHO WE ARE
       ====================================================================== */

    {
      id:      'wwa_tower_hall_pt1',
      title:   'Tower Hall, Part 1',
      exhibit: 'wwa',
      area:    'Tower Hall Lawn Area',
      lat:     37.335722,
      lon:     -121.883722,
      type:    'model',
      asset:   'Expression/official_wwa_tower_hall_pt1.glb',   // awaiting file
      preview: 'Expression/previews/wwa_tower_hall_pt1.png',
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'wwa_tower_hall_pt2',
      title:   'Tower Hall, Part 2',
      exhibit: 'wwa',
      area:    'Path to Victory',
      lat:     37.335528,
      lon:     -121.883889,
      type:    'model',
      asset:   'Expression/wwa_pt_02_tow_hall.glb',
      preview: 'Expression/previews/wwa_tower_hall_pt2.png',
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'wwa_tower_hall_pt3',
      title:   'Tower Hall, Part 3',
      exhibit: 'wwa',
      area:    'Tower Hall Lawn Area',
      lat:     37.335333,
      lon:     -121.883889,
      type:    'model',
      asset:   'Expression/wwa_pt_03_tow_hall_draco',   // Draco compressed
      preview: 'Expression/previews/wwa_tower_hall_pt3.png',
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'wwa_cameo',
      title:   'Cameo',
      exhibit: 'wwa',
      area:    'Victory Statue',
      lat:     37.335583,
      lon:     -121.882889,
      type:    'model',
      asset:   'Expression/wwa_cameo.glb',
      preview: 'Expression/previews/wwa_cameo.png',
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'wwa_cameo_video',
      title:   'Cameo',
      exhibit: 'wwa',
      area:    'Victory Statue',
      lat:     37.335611,
      lon:     -121.883194,
      type:    'video',
      asset:   'Expression/cameo_nicole_rudolph_vallerga.mp4', // awaiting file
      preview: 'Expression/previews/wwa_cameo_video.png',
      artist:    'Nicole Rudolph-Vallerga',
      year:      '2025',
      medium:    'Video',
      statement: '',
      elevation: 1.6,
      width:     3.2,
    },

    {
      id:      'wwa_vic_stat_pt1',
      title:   'Victory Statue, Part 1',
      exhibit: 'wwa',
      area:    'Victory Statue',
      lat:     37.335361,
      lon:     -121.882417,
      type:    'model',
      asset:   'Expression/wwa_pt_01_vict_stat.glb',
      preview: 'Expression/previews/wwa_vic_stat_pt1.png',
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'wwa_vic_stat_pt2',
      title:   'Victory Statue, Part 2',
      exhibit: 'wwa',
      area:    'Victory Statue',
      lat:     37.335694,
      lon:     -121.883000,
      type:    'model',
      asset:   'Expression/official_wwa_vic_stat_pt2.glb',     // awaiting file
      preview: 'Expression/previews/wwa_vic_stat_pt2.png',
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'wwa_endangered',
      title:   'Endangered Sound',
      exhibit: 'wwa',
      area:    'Path to Victory',
      lat:     37.335722,
      lon:     -121.882500,
      type:    'model',
      asset:   'Expression/wwa_endangered_draco',       // Draco compressed
      preview: 'Expression/previews/wwa_endangered.png',
      // Attributed from the source filenames in the Drive artwork folder
      // ("endangered sound - Quynh Ngo.aif"). Worth confirming.
      artist:    'Quynh Ngo',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'wwa_illuminated_piano',
      title:   'Illuminated Piano',
      exhibit: 'wwa',
      area:    'Tower Hall Lawn Area',
      lat:     37.335083,
      lon:     -121.884111,
      type:    'video',
      asset:   'Expression/illuminated_piano_hannah_yee.mp4',  // awaiting file
      preview: 'Expression/previews/wwa_illuminated_piano.png',
      artist:    'Hannah Yee',
      year:      '',
      medium:    'Video',
      statement: '',
      elevation: 1.6,
      width:     3.2,
    },

    {
      id:      'wwa_final_video',
      title:   'Untitled',
      exhibit: 'wwa',
      area:    'Tower Hall Lawn Area',
      lat:     37.335778,
      lon:     -121.883722,
      type:    'video',
      asset:   'Expression/final_video_emily_chaing.mp4',      // awaiting file
      preview: 'Expression/previews/wwa_final_video.png',
      artist:    'Emily Chaing',
      year:      '',
      medium:    'Video',
      statement: '',
      elevation: 1.6,
      width:     3.2,
    },

    /* ======================================================================
       ECHOES OF EXPRESSION
       ====================================================================== */

    {
      id:      'eoe_official_map',
      title:   'Echoes of Expression — Exhibition Map',
      exhibit: 'eoe',
      area:    'MLK Library Main Entrance — SJSU Side',
      lat:     37.335306,
      lon:     -121.884556,
      type:    'model',
      asset:   'Expression/immersion_eoe_official_library_map.glb',
      preview: 'Expression/previews/eoe_official_map.png',
      artist:    '',
      year:      '',
      medium:    '',
      statement: 'Start here. This map shows the full route of the exhibition.',
      radius:  80,                      // large file — begin loading early
    },

    {
      id:      'eoe_monster',
      title:   'Monster',
      exhibit: 'eoe',
      area:    'MLK Library Main Entrance — City Side',
      lat:     37.335778,
      lon:     -121.885500,
      type:    'model',
      asset:   'Expression/eoe_monster_animation.glb',         // awaiting file
      preview: 'Expression/previews/eoe_monster.png',
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    /* --- Commotion: Walkway to Library (three works, one coordinate) ------ */

    {
      id:      'eoe_commotion_pt1',
      title:   'Commotion, Part 1',
      exhibit: 'eoe',
      area:    'SJSU Sidewalk E San Fernando — Walkway to Library',
      lat:     37.336111,
      lon:     -121.885083,
      type:    'model',
      asset:   'Expression/immersion_eoe_commotion_pt_01.glb',
      preview: 'Expression/previews/eoe_commotion_pt1.png',
      offset:  [-14, 0],
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'eoe_commotion_pt2',
      title:   'Commotion, Part 2',
      exhibit: 'eoe',
      area:    'SJSU Sidewalk E San Fernando — Walkway to Library',
      lat:     37.336111,
      lon:     -121.885083,
      type:    'model',
      asset:   'Expression/immersion_eoe_commotion_pt_02.glb',
      preview: 'Expression/previews/eoe_commotion_pt2.png',
      offset:  [0, 0],
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'eoe_commotion_pt3',
      title:   'Commotion, Part 3',
      exhibit: 'eoe',
      area:    'SJSU Sidewalk E San Fernando — Walkway to Library',
      lat:     37.336111,
      lon:     -121.885083,
      type:    'model',
      asset:   'Expression/immersion_eoe_commotion_pt_03.glb',
      preview: 'Expression/previews/eoe_commotion_pt3.png',
      offset:  [14, 0],
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    /* --- Commotion: Film & Theatre (three works, one coordinate) ---------- */

    {
      id:      'eoe_commotion_pt4',
      title:   'Commotion, Part 4',
      exhibit: 'eoe',
      area:    'SJSU Sidewalk E San Fernando — Film & Theatre',
      lat:     37.336278,
      lon:     -121.884778,
      type:    'model',
      asset:   'Expression/immersion_eoe_commotion_pt_04.glb',
      preview: 'Expression/previews/eoe_commotion_pt4.png',
      offset:  [-14, 0],
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'eoe_commotion_pt5',
      title:   'Commotion, Part 5',
      exhibit: 'eoe',
      area:    'SJSU Sidewalk E San Fernando — Film & Theatre',
      lat:     37.336278,
      lon:     -121.884778,
      type:    'model',
      asset:   'Expression/immersion_eoe_commotion_pt_05.glb',
      preview: 'Expression/previews/eoe_commotion_pt5.png',
      offset:  [0, 0],
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'eoe_commotion_pt6',
      title:   'Commotion, Part 6',
      exhibit: 'eoe',
      area:    'SJSU Sidewalk E San Fernando — Film & Theatre',
      lat:     37.336278,
      lon:     -121.884778,
      type:    'model',
      asset:   'Expression/immersion_eoe_commotion_pt_06.glb',
      preview: 'Expression/previews/eoe_commotion_pt6.png',
      offset:  [14, 0],
      artist:    '',
      year:      '',
      medium:    '',
      statement: '',
    },

    {
      id:      'eoe_tv_animation',
      title:   'TV',
      exhibit: 'eoe',
      area:    'Corner of 5th & E San Fernando',
      lat:     37.336500,
      lon:     -121.884972,
      type:    'model',
      asset:   'Expression/immersion_eoe_TV_animation.glb',
      preview: 'Expression/previews/eoe_tv_animation.png',
      artist:    '',
      year:      '',
      medium:    'Animation',
      statement: '',
    },

    /* --- Text as Image ---------------------------------------------------
       The brief lists this as two placements either side of S 5th St
       (Text_as_image_pt_01_left.glb / Text_as_image_pt_02_right.glb).
       Only one combined file exists in the repo, so it is placed once here.
       If the split files arrive, duplicate this entry, give each its own
       asset, and set offset to [-3, 0] and [3, 0].

       Per the brief: every work in this mini show shares one description;
       only the artist name differs. List the artists in `contributors`.
       ------------------------------------------------------------------- */
    {
      id:      'eoe_text_as_image',
      title:   'Text as Image',
      exhibit: 'eoe',
      area:    'S 5th St',
      lat:     37.336849,
      lon:     -121.885216,
      type:    'model',
      asset:   'Expression/text_as_image_draco',        // Draco compressed
      preview: 'Expression/previews/eoe_text_as_image_left.png',
      artist:    '',
      year:      '',
      medium:    'Collaborative mini exhibition',
      statement: '',
      // This file is authored in units that make it 2203 m wide, so it is
      // fitted to a size instead of trusting its own scale. 60 m puts the row
      // of works along the block at roughly 1.4 m each. Adjust to taste.
      fitSize:   60,
      contributors: [
        // 'Artist Name',
      ],
    },

    {
      id:      'eoe_abstract_bird',
      title:   'Abstract Bird',
      exhibit: 'eoe',
      area:    'City Hall 5th St Entrance & Courtyard Seating',
      lat:     37.337694,
      lon:     -121.885472,
      type:    'model',
      asset:   'Expression/immersion_eoe_abstract_bird_animation.glb',
      preview: 'Expression/previews/eoe_abstract_bird.png',
      artist:    '',
      year:      '',
      medium:    'Animation',
      statement: '',
    },

    {
      id:      'eoe_spongemeboi',
      title:   'Spongemeboi',
      exhibit: 'eoe',
      area:    'South Entrance City Hall',
      lat:     37.337472,
      lon:     -121.885667,
      type:    'model',
      asset:   'Expression/immersion_eoe_spongemeboi_animation.glb',
      preview: 'Expression/previews/eoe_spongemeboi.png',
      artist:    '',
      year:      '',
      medium:    'Animation',
      statement: '',
    },

    {
      id:      'eoe_engine_promo',
      title:   'Engine',
      exhibit: 'eoe',
      area:    'City Hall Plaza Center',
      lat:     37.337667,
      lon:     -121.886417,
      type:    'video',
      asset:   'Expression/Individual artwork/Engine Video/Engine AR Promo.mp4',
      preview: 'Expression/previews/eoe_engine_promo.png',
      artist:    'Anna Huynh',
      year:      '',
      medium:    'Video',
      statement: '',
      elevation: 2.2,
      width:     4.8,
    },

  ],
};
