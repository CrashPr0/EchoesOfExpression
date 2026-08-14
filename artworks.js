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
     elevation   Metres above ground. For models, how far to float the piece.
                 For videos, the height of the screen's bottom edge.
     width       Videos only: screen width in metres. The height follows from
                 the video's own aspect ratio, so portrait clips stay portrait.
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
      // ("endangered sound - Quynh Ngo.aif"). NOT yet confirmed: the statement
      // cards list both a Diem Quynh Ngo (Wandering Monster) and a Quynh Vu, so
      // check which student this is before it goes on a wall.
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
      title:   'Wandering Monster',
      exhibit: 'eoe',
      area:    'MLK Library Main Entrance — City Side',
      lat:     37.335778,
      lon:     -121.885500,
      type:    'model',
      asset:   'Expression/eoe_monster_animation.glb',         // awaiting file
      preview: 'Expression/previews/eoe_monster.png',
      artist:    'Diem Quynh Ngo',
      year:      '2025',
      course:    'ART 74 — Introduction to Digital Media, Professor Xiao Wu',
      medium:    'Blender',
      // Blank lines become paragraph breaks in the panel. This one is written
      // as a dialogue, so the breaks carry meaning — leave them in.
      statement:
        'How long have you been lost for?\n\n' +
        'they ask, looking at the clueless, rusty monster, its skin turning all ' +
        'red after all the corrosion it endured, wondering how it would feel on ' +
        'human skin.\n\n' +
        'I don’t know... I didn’t realize... I thought it was just a short ' +
        'while.... How about you, how long have you been lost for? they asked, ' +
        'looking at us.\n\n' +
        'What do you mean? We’re human, and we’re not lost. We have our houses, ' +
        'our cars, our money to buy whatever we want! I didn’t ask if you’re ' +
        'lost or not, I asked how long you’ve been lost for.',
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
      artist:    'Ally Khoo',
      year:      '2025',
      course:    'ART 74 — Introduction to Digital Media, Professor Xiao Wu',
      medium:    'Blender, Adobe Photoshop and Glitch',
      statement: 'This TV becomes a living window, streaming the endless motion ' +
                 'of the ocean to blur the boundary between screen and sea. It ' +
                 'invites viewers to reflect on nature’s rhythms through a ' +
                 'synthetic lens, where digital waves echo real ones.',
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
      artist:    'Class of Art 175 and English 135',
      year:      '2025',
      course:    'ART 175 — Digital Printmaking, Professor Carla Fisher Schwartz\n' +
                 'ENGL 135 — Writing Nonfiction, Dr. Brook McClurg',
      medium:    'Risograph printing, 11″ × 17″',
      statement:
        'Text as Image is a collaborative project between Creative Writing and ' +
        'Digital Printmaking students at San José State University. Creative ' +
        'Writing students contributed short-form texts — ranging from single ' +
        'phrases to brief passages — which Digital Printmaking students then ' +
        'interpreted visually. Each artist selected two pieces of writing to ' +
        'translate into text-based prints using the Risograph printer, a ' +
        'printing technique often described as “digital screen printing”. This ' +
        'cross-disciplinary collaboration between the Departments of Art & Art ' +
        'History and English offered students a unique opportunity to explore ' +
        'how creative ideas shift and evolve across mediums.',
      // This file is authored in units that make it 2203 m wide, so it is
      // fitted to a size instead of trusting its own scale. 60 m puts the row
      // of works along the block at roughly 1.4 m each. Adjust to taste.
      fitSize:   60,
      contributorGroups: [
        {
          label: 'Art 175 — Digital Printmaking',
          names: [
            'Belle Alvarez', 'Shayla Dowling', 'Sravya Duvvuri', 'Galia Foglio',
            'Drinnie Francisco', 'Nick Guerra', 'Anna Huynh', 'Ashlyn Larrus',
            'Minh Le', 'Trevor Lindow', 'Jasmine Mirzamani', 'Emma Morales',
            'Frida Muro Rodriguez', 'Khoa Nguyen', 'Nguyen Nguyen',
            'Parker Olvera', 'Madelaina Rodrigues', 'Beckett Van Leer',
            'Seleyna Velasquez', 'Quynh Vu', 'Sean Yagi',
          ],
        },
        {
          label: 'English 135 — Writing Nonfiction',
          names: [
            'Itzel Acevedo-Adame', 'Owen Sallander', 'Matthew Quiambao',
            'Mckenna Lewis', 'Yasmeen Farid', 'Isabel Gonzalez', 'Fatima Mejia',
            'Tara Baisley-Gomes', 'Bridget Vanden Broeder', 'Gianna Cardenas',
            'May Segovia Arce', 'Abby Christy', 'Marilyn Hilton',
            'Courtney Caldwell', 'Chrissy Molfino', 'Liam Leslie',
            'Peggy Pollard', 'Noelle Gibbs', 'Noor Malik', 'Natalka Fydyshyn',
          ],
        },
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
      artist:    'Ronald Cao',
      year:      '2025',
      course:    'ART 74 — Introduction to Digital Media, Professor Xiao Wu',
      medium:    'Blender',
      statement: 'This geometric, abstract bird captures the essence of freedom ' +
                 'and movement through angular forms and flowing folds of blue ' +
                 'and white. The sharp lines and soft curves converge to create ' +
                 'a dynamic representation of flight, blending precision with ' +
                 'fluidity in a visual celebration of nature’s grace.',
    },

    {
      id:      'eoe_spongemeboi',
      title:   'Sponge-Me-BOI',
      exhibit: 'eoe',
      area:    'South Entrance City Hall',
      lat:     37.337472,
      lon:     -121.885667,
      type:    'model',
      asset:   'Expression/immersion_eoe_spongemeboi_animation.glb',
      preview: 'Expression/previews/eoe_spongemeboi.png',
      artist:    'Phuong-Trang Maria Vu',
      year:      '2025',
      course:    'Personal work',
      medium:    '3D render (Blender)',
      statement: 'Just a dumb, unfinished Spongebob model I made for practice. ' +
                 'Mainly here to share the beautiful chaos of figuring out ' +
                 'Blender one confused click at a time.',
    },

    {
      id:      'eoe_engine_promo',
      title:   'Eng1n3 AR Promo',
      exhibit: 'eoe',
      area:    'City Hall Plaza Center',
      lat:     37.337667,
      lon:     -121.886417,
      type:    'video',
      asset:   'Expression/Individual artwork/Engine Video/Engine AR Promo.mp4',
      preview: 'Expression/previews/eoe_engine_promo.png',
      artist:    'Anna Huynh',
      year:      '2024',
      course:    'DSGD 131 — Motion Graphics, Professor Yoon Chung Han',
      medium:    'Adobe Aero, Adobe After Effects, heat transfer vinyl on black hoodies',
      statement: 'Eng1n3 is an experimental clothing brand that aims to simulate ' +
                 'moving designs on real clothes. Showcasing the designs through ' +
                 'the motion graphic and bringing the designs to life with AR and ' +
                 'projection mapping technology, these methods will bring the ' +
                 'brand the closest it can to real moving clothes.',
      elevation: 2.2,
      width:     4.8,
    },

  ],
};
