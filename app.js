/* ============================================================================
   ECHOES OF EXPRESSION — AR RUNTIME
   ----------------------------------------------------------------------------
   Content lives in artworks.js. This file places it in the world and handles
   tracking, loading and interaction. UI overlays live in ui.js.
   ========================================================================= */

(function () {
  'use strict';

  var LOG = window.Log;

  /* --------------------------------------------------------------------------
     Tunables
     ------------------------------------------------------------------------ */
  var CONFIG = {
    defaultRadius:    60,   // metres: how close before a model downloads
    unloadRadius:     140,  // metres: how far before it is released from memory
    reanchorDistance: 20,   // metres of GPS travel before re-anchoring the world
    goodAccuracy:     25,   // metres: accuracy we consider trustworthy
    anchorTimeout:    12000,// ms to wait for a good fix before using whatever we have
    compassSamples:   12,   // readings averaged before locking north
    groundY:          0,    // vertical offset of the whole exhibition, in metres
  };
  window.CONFIG = CONFIG;

  var EARTH_M_PER_DEG = 111320;

  /* --------------------------------------------------------------------------
     Preview mode — open the page with ?preview to walk the exhibition on a
     desktop browser with no camera and no GPS. The XR engine is switched off
     and replaced with ordinary mouse-look and WASD controls.
     ------------------------------------------------------------------------ */
  var PREVIEW = new URLSearchParams(location.search).has('preview');

  if (PREVIEW) {
    document.addEventListener('DOMContentLoaded', function () {
      var scene = document.querySelector('a-scene');
      var cam   = document.querySelector('#camera');

      ['xrweb', 'xrextras-almost-there', 'xrextras-loading', 'xrextras-runtime-error']
        .forEach(function (c) { scene.removeAttribute(c); });

      scene.setAttribute('background', 'color: #17202a');
      cam.setAttribute('look-controls', 'enabled: true; pointerLockEnabled: false');
      cam.setAttribute('wasd-controls', 'enabled: true; acceleration: 120');
      cam.setAttribute('position', '0 1.6 0');

      var grid = document.createElement('a-entity');
      grid.setAttribute('geometry', 'primitive: plane; width: 400; height: 400');
      grid.setAttribute('material', 'color: #0d1319; side: double');
      grid.setAttribute('rotation', '-90 0 0');
      grid.setAttribute('position', '0 -0.01 0');
      scene.appendChild(grid);
    }, { once: true });
  }

  /* --------------------------------------------------------------------------
     Shared state
     ------------------------------------------------------------------------ */
  var State = {
    anchor:      null,   // {latitude, longitude} — world origin, set once
    position:    null,   // latest GPS reading
    heading:     null,   // locked compass heading, degrees
    worldYaw:    0,      // rotation applied to the world container
    tracking:    'starting',
    started:     false,
    byId:        {},     // id -> {data, el, distance, loaded}
    nearest:     null,
    missingAssets: [],
  };
  window.State = State;

  /* --------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */

  // Encode a path for use as a URL without mangling the slashes.
  function assetUrl(p) {
    return p.split('/').map(encodeURIComponent).join('/');
  }
  window.assetUrl = assetUrl;

  // Local east/north offset in metres from `from` to `to`.
  function enu(from, to) {
    var latRad = from.latitude * Math.PI / 180;
    return {
      east:  (to.longitude - from.longitude) * EARTH_M_PER_DEG * Math.cos(latRad),
      north: (to.latitude  - from.latitude)  * EARTH_M_PER_DEG,
    };
  }

  function distanceBetween(a, b) {
    var d = enu(a, b);
    return Math.sqrt(d.east * d.east + d.north * d.north);
  }
  window.distanceBetween = distanceBetween;

  /* ==========================================================================
     COMPONENT: clip-player
     Plays the animation clips baked into a glTF file. 13 of the 16 models in
     this exhibition contain one, and nothing was playing them before.
     ========================================================================== */
  AFRAME.registerComponent('clip-player', {
    init: function () {
      var self = this;
      this.mixer = null;
      this.el.addEventListener('model-loaded', function (e) {
        var model = e.detail.model;
        if (!model || !model.animations || !model.animations.length) return;
        self.mixer = new THREE.AnimationMixer(model);
        model.animations.forEach(function (clip) {
          self.mixer.clipAction(clip).reset().setLoop(THREE.LoopRepeat).play();
        });
        LOG.info('Playing ' + model.animations.length + ' clip(s) on ' + self.el.dataset.title);
      });
    },
    tick: function (time, delta) {
      if (this.mixer && delta) this.mixer.update(delta / 1000);
    },
    remove: function () {
      if (this.mixer) { this.mixer.stopAllAction(); this.mixer = null; }
    },
  });

  /* ==========================================================================
     COMPONENT: model-placement
     --------------------------------------------------------------------------
     Runs once a model has loaded and does three things:

       1. Scales it, if the artwork asks to be fitted to a size in metres.
          These files were authored in mixed units — one of them arrives
          2.2 km wide — so a target size is more reliable than a raw factor.

       2. Drops it onto the ground, so nothing is left buried. Several models
          have their origin part way up the piece and would otherwise sit
          three to eight metres underground.

       3. Builds an invisible collider from the bounding box, so a tap has a
          generous target and the raycaster never has to walk the real mesh —
          the Commotion pieces carry 400 sub-meshes each.

     Set `groundAlign: false` on an artwork to keep the author's own height.
     ========================================================================== */
  AFRAME.registerComponent('model-placement', {
    init: function () {
      var self = this;
      this.el.addEventListener('model-loaded', function () { self.place(); });
    },

    // Bounding box of the model measured in the entity's own frame, so the
    // entity's position and yaw do not skew the result.
    localBox: function (mesh) {
      var box = new THREE.Box3();
      var inv = new THREE.Matrix4().copy(mesh.parent.matrixWorld).invert();
      var tmp = new THREE.Matrix4();

      mesh.updateWorldMatrix(true, true);
      mesh.traverse(function (node) {
        if (!node.isMesh || !node.geometry) return;
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        if (!node.geometry.boundingBox) return;
        var b = node.geometry.boundingBox.clone();
        b.applyMatrix4(tmp.multiplyMatrices(inv, node.matrixWorld));
        box.union(b);
      });
      return box;
    },

    place: function () {
      var mesh = this.el.getObject3D('mesh');
      if (!mesh) return;

      var art = State.byId[this.el.dataset.artworkId].data;

      // Measure at scale 1 so repeated loads give the same answer.
      mesh.scale.set(1, 1, 1);
      mesh.position.set(0, 0, 0);
      mesh.updateMatrixWorld(true);

      var box = this.localBox(mesh);
      if (box.isEmpty()) { LOG.warn('No geometry in ' + art.title); return; }

      var size = box.getSize(new THREE.Vector3());

      var scale = art.scale || 1;
      if (art.fitSize) {
        var largest = Math.max(size.x, size.y, size.z);
        if (largest > 0) scale = art.fitSize / largest;
      }
      mesh.scale.setScalar(scale);

      if (art.groundAlign !== false) mesh.position.y = -box.min.y * scale;
      mesh.updateMatrixWorld(true);

      LOG.info(art.title + ': ' +
               size.x.toFixed(1) + '×' + size.y.toFixed(1) + '×' + size.z.toFixed(1) + ' m' +
               (scale !== 1 ? ' scaled ×' + scale.toPrecision(3) : ''));

      this.buildCollider(box, scale, mesh.position.y);
    },

    buildCollider: function (box, scale, lift) {
      var size = box.getSize(new THREE.Vector3()).multiplyScalar(scale);
      var mid  = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);

      // Pad it so near-misses still register, but keep the target sane on the
      // very large pieces.
      var pad = Math.min(2, Math.max(0.4, size.length() * 0.05));

      var collider = this.collider || document.createElement('a-box');
      collider.setAttribute('width',  Math.max(0.6, size.x) + pad);
      collider.setAttribute('height', Math.max(0.6, size.y) + pad);
      collider.setAttribute('depth',  Math.max(0.6, size.z) + pad);
      collider.setAttribute('position', mid.x + ' ' + (mid.y + lift) + ' ' + mid.z);
      collider.setAttribute('material',
        'opacity: 0; transparent: true; depthWrite: false; side: double');
      collider.classList.add('artwork-hit');
      collider.dataset.artworkId = this.el.dataset.artworkId;

      if (!this.collider) {
        this.collider = collider;
        this.el.appendChild(collider);
      }
    },

    remove: function () {
      if (this.collider) { this.collider.remove(); this.collider = null; }
    },
  });

  /* ==========================================================================
     COMPONENT: billboard
     Keeps videos turned toward the viewer, rotating about the vertical axis
     only so they never tip over.
     ========================================================================== */
  AFRAME.registerComponent('billboard', {
    tick: function () {
      var cam = this.el.sceneEl.camera;
      if (!cam) return;
      var target = new THREE.Vector3();
      cam.getWorldPosition(target);
      var me = new THREE.Vector3();
      this.el.object3D.getWorldPosition(me);
      target.y = me.y;
      this.el.object3D.lookAt(target);
    },
  });

  /* ==========================================================================
     COMPONENT: tap-select
     Turns a screen tap into an artwork selection. Written by hand rather than
     using A-Frame's cursor because `rayOrigin: mouse` reads stale coordinates
     on touch devices.
     ========================================================================== */
  AFRAME.registerComponent('tap-select', {
    init: function () {
      var self = this;
      this.raycaster = new THREE.Raycaster();
      this.raycaster.far = 150;
      this.start = null;

      var canvas = this.el.canvas || document;

      this.onDown = function (e) {
        var t = e.changedTouches ? e.changedTouches[0] : e;
        self.start = { x: t.clientX, y: t.clientY, time: Date.now() };
      };

      this.onUp = function (e) {
        if (!self.start) return;
        var t = e.changedTouches ? e.changedTouches[0] : e;
        var moved = Math.hypot(t.clientX - self.start.x, t.clientY - self.start.y);
        var held  = Date.now() - self.start.time;
        self.start = null;
        // Ignore drags and long presses — only a clean tap selects.
        if (moved > 24 || held > 700) return;
        self.pick(t.clientX, t.clientY);
      };

      this.el.addEventListener('loaded', function () {
        canvas = self.el.canvas || document;
        canvas.addEventListener('touchstart', self.onDown, { passive: true });
        canvas.addEventListener('touchend',   self.onUp,   { passive: true });
        canvas.addEventListener('mousedown',  self.onDown);
        canvas.addEventListener('mouseup',    self.onUp);
      });
    },

    pick: function (clientX, clientY) {
      var cam = this.el.camera;
      if (!cam) return;

      var rect = this.el.canvas.getBoundingClientRect();
      var ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(ndc, cam);

      var targets = [];
      document.querySelectorAll('.artwork-hit').forEach(function (el) {
        if (el.object3D) targets.push(el.object3D);
      });

      var hits = this.raycaster.intersectObjects(targets, true);
      if (!hits.length) return;

      // Walk up to whichever entity carries the artwork id.
      var node = hits[0].object;
      while (node && !(node.el && node.el.dataset.artworkId)) node = node.parent;
      if (node && node.el) window.UI.openArtwork(node.el.dataset.artworkId);
    },
  });

  /* ==========================================================================
     WORLD PLACEMENT
     --------------------------------------------------------------------------
     Every artwork is a child of one container. Artwork positions are set once,
     as east/north offsets from the anchor. Keeping the world rigid and moving
     only the container lets 8th Wall's SLAM tracking do the work it is good at,
     instead of dragging each model around on every GPS tick.
     ========================================================================== */

  var world, sceneEl;

  function buildScene() {
    sceneEl = document.querySelector('a-scene');
    world   = document.querySelector('#world');

    window.EXHIBITION.artworks.forEach(function (art) {
      var el = document.createElement('a-entity');
      el.dataset.artworkId = art.id;
      el.dataset.title     = art.title;
      el.setAttribute('visible', false);
      world.appendChild(el);

      State.byId[art.id] = {
        data:     art,
        el:       el,
        distance: Infinity,
        loaded:   false,
      };
    });

    LOG.info('Placed ' + window.EXHIBITION.artworks.length + ' artwork slots.');
  }

  // Fix each artwork's position relative to the anchor. Runs once.
  function layoutWorld() {
    Object.keys(State.byId).forEach(function (id) {
      var rec = State.byId[id];
      var art = rec.data;
      var d   = enu(State.anchor, { latitude: art.lat, longitude: art.lon });
      var off = art.offset || [0, 0];

      rec.local = {
        x: d.east  + off[0],
        y: (art.elevation || 0),
        z: -d.north + off[1],
      };
      rec.el.setAttribute('position', rec.local.x + ' ' + rec.local.y + ' ' + rec.local.z);
    });
  }

  // Slide the container so the user's GPS position lines up with where the
  // camera actually is. Corrects SLAM drift as people walk the route.
  function reanchor() {
    if (!State.anchor || !State.position || !world) return;

    var cam = sceneEl && sceneEl.camera;
    if (!cam) return;

    var camPos = new THREE.Vector3();
    cam.getWorldPosition(camPos);

    var d = enu(State.anchor, State.position);
    var yawRad = State.worldYaw * Math.PI / 180;

    // Where the user sits inside the container, rotated into world space.
    var lx = d.east, lz = -d.north;
    var wx = lx * Math.cos(yawRad) + lz * Math.sin(yawRad);
    var wz = -lx * Math.sin(yawRad) + lz * Math.cos(yawRad);

    world.setAttribute('position', {
      x: camPos.x - wx,
      y: CONFIG.groundY,
      z: camPos.z - wz,
    });

    State.anchorPosition = { latitude: State.position.latitude, longitude: State.position.longitude };
  }

  /* --------------------------------------------------------------------------
     Streaming: load models as you approach, release them as you leave.
     With 63 MB and 56 MB models in this set, holding them all is not an option.
     ------------------------------------------------------------------------ */
  function updateStreaming() {
    if (!State.position) return;

    var nearest = null;

    Object.keys(State.byId).forEach(function (id) {
      var rec = State.byId[id];
      var art = rec.data;
      rec.distance = distanceBetween(State.position, { latitude: art.lat, longitude: art.lon });

      if (!nearest || rec.distance < nearest.distance) nearest = rec;

      var radius = art.radius || CONFIG.defaultRadius;

      if (!rec.loaded && rec.distance <= radius && art.asset && !rec.missing) {
        loadArtwork(rec);
      } else if (rec.loaded && rec.distance > CONFIG.unloadRadius) {
        unloadArtwork(rec);
      }
    });

    State.nearest = nearest;
    window.UI.refreshNearest();
  }

  function loadArtwork(rec) {
    var art = rec.data;
    rec.loaded = true;
    rec.el.setAttribute('visible', true);

    if (art.type === 'video') {
      var video = document.createElement('video');
      video.setAttribute('src', assetUrl(art.asset));
      video.setAttribute('loop', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('crossorigin', 'anonymous');
      video.setAttribute('preload', 'auto');
      video.muted = true;                 // required for unattended playback
      video.id = 'video_' + art.id;
      document.querySelector('#video-assets').appendChild(video);

      var w = art.width || 3.2;
      rec.el.setAttribute('geometry', 'primitive: plane; width: ' + w + '; height: ' + (w * 9 / 16));
      rec.el.setAttribute('material', 'src: #' + video.id + '; shader: flat; side: double');
      rec.el.setAttribute('billboard', '');
      rec.el.classList.add('artwork-hit');
      rec.video = video;
      video.play().catch(function () { /* waits for a tap; expected on iOS */ });
      LOG.info('Loaded video: ' + art.title);
    } else {
      rec.el.setAttribute('gltf-model', 'url(' + assetUrl(art.asset) + ')');
      rec.el.setAttribute('clip-player', '');
      rec.el.setAttribute('model-placement', '');
      if (art.yaw) rec.el.setAttribute('rotation', '0 ' + art.yaw + ' 0');

      window.UI.setLoading(art.id, art.title);
      rec.el.addEventListener('model-loaded', function () {
        window.UI.clearLoading(art.id);
        LOG.info('Loaded model: ' + art.title);
      }, { once: true });
      rec.el.addEventListener('model-error', function () {
        window.UI.clearLoading(art.id);
        LOG.error('FAILED to load: ' + art.title + ' (' + art.asset + ')');
      }, { once: true });
    }
  }

  function unloadArtwork(rec) {
    rec.loaded = false;
    rec.el.setAttribute('visible', false);
    if (rec.data.type === 'video') {
      if (rec.video) { rec.video.pause(); rec.video.remove(); rec.video = null; }
      rec.el.removeAttribute('geometry');
      rec.el.removeAttribute('material');
      rec.el.classList.remove('artwork-hit');
    } else {
      rec.el.removeAttribute('gltf-model');
      rec.el.removeAttribute('clip-player');
      rec.el.removeAttribute('model-placement');
    }
    LOG.info('Released: ' + rec.data.title);
  }
  window.loadArtwork = loadArtwork;

  /* --------------------------------------------------------------------------
     Compass
     --------------------------------------------------------------------------
     The XR engine starts with an arbitrary yaw — whichever way the phone
     happened to be pointing. Rotating the container by
     (compass heading + camera yaw) puts the exhibition's north on true north.
     Readings are averaged before locking because a phone compass is noisy.
     ------------------------------------------------------------------------ */
  var compassSamples = [];

  function onOrientation(e) {
    var heading;
    if (typeof e.webkitCompassHeading === 'number') {
      heading = e.webkitCompassHeading;              // iOS, already true north
    } else if (e.absolute && typeof e.alpha === 'number') {
      heading = 360 - e.alpha;                       // Android
    } else {
      return;
    }
    if (isNaN(heading)) return;

    var cam = sceneEl && sceneEl.camera;
    if (!cam) return;
    var camYaw = THREE.MathUtils.radToDeg(
      new THREE.Euler().setFromQuaternion(cam.getWorldQuaternion(new THREE.Quaternion()), 'YXZ').y
    );

    compassSamples.push((heading + camYaw + 360) % 360);
    if (compassSamples.length < CONFIG.compassSamples) return;

    // Average as unit vectors so readings either side of 0° don't cancel out.
    var sx = 0, sy = 0;
    compassSamples.forEach(function (a) {
      sx += Math.cos(a * Math.PI / 180);
      sy += Math.sin(a * Math.PI / 180);
    });
    var avg = (Math.atan2(sy, sx) * 180 / Math.PI + 360) % 360;

    State.heading  = heading;
    State.worldYaw = avg;
    if (world) world.setAttribute('rotation', '0 ' + avg.toFixed(1) + ' 0');
    reanchor();

    window.removeEventListener('deviceorientationabsolute', onOrientation, true);
    window.removeEventListener('deviceorientation', onOrientation, true);
    compassSamples = [];
    LOG.info('North locked. World yaw ' + avg.toFixed(1) + '°');
    window.UI.refreshStatus();
  }

  function startCompass() {
    compassSamples = [];
    window.addEventListener('deviceorientationabsolute', onOrientation, true);
    window.addEventListener('deviceorientation', onOrientation, true);
  }
  window.recalibrateCompass = function () {
    LOG.info('Recalibrating compass — sweep the phone in a figure eight.');
    startCompass();
  };

  /* --------------------------------------------------------------------------
     Geolocation
     ------------------------------------------------------------------------ */
  var anchorDeadline = 0;

  function onPosition(pos) {
    State.position = {
      latitude:  pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy:  pos.coords.accuracy,
    };

    if (!State.anchor) {
      var goodEnough = pos.coords.accuracy <= CONFIG.goodAccuracy;
      var outOfTime  = Date.now() > anchorDeadline;
      if (!goodEnough && !outOfTime) {
        window.UI.refreshStatus();
        return;
      }
      State.anchor = { latitude: State.position.latitude, longitude: State.position.longitude };
      layoutWorld();
      reanchor();
      LOG.info('Anchored at ' + State.anchor.latitude.toFixed(6) + ', ' +
               State.anchor.longitude.toFixed(6) + ' (±' + Math.round(pos.coords.accuracy) + 'm)');
    } else if (State.anchorPosition &&
               distanceBetween(State.anchorPosition, State.position) > CONFIG.reanchorDistance &&
               pos.coords.accuracy <= CONFIG.goodAccuracy) {
      reanchor();
      LOG.info('Re-anchored after ' + CONFIG.reanchorDistance + 'm of travel.');
    }

    updateStreaming();
    window.UI.refreshStatus();
  }

  function onPositionError(err) {
    LOG.error('GPS error: ' + err.message);
    State.tracking = 'gps-denied';
    window.UI.refreshStatus();
  }

  function startGeolocation() {
    if (!navigator.geolocation) {
      LOG.error('This browser has no geolocation support.');
      return;
    }
    anchorDeadline = Date.now() + CONFIG.anchorTimeout;
    navigator.geolocation.watchPosition(onPosition, onPositionError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000,
    });
  }

  /* --------------------------------------------------------------------------
     Preview mode — drops you at the exhibition without being in San José.
     ------------------------------------------------------------------------ */
  window.teleportTo = function (lat, lon) {
    var target = (lat !== undefined)
      ? { latitude: lat, longitude: lon, accuracy: 1 }
      : { latitude: window.EXHIBITION.meta.previewOrigin.latitude,
          longitude: window.EXHIBITION.meta.previewOrigin.longitude,
          accuracy: 1 };

    State.position = target;
    if (!State.anchor) {
      State.anchor = { latitude: target.latitude, longitude: target.longitude };
      layoutWorld();
    }
    reanchor();
    updateStreaming();
    window.UI.refreshStatus();
    LOG.info('Teleported to ' + target.latitude.toFixed(6) + ', ' + target.longitude.toFixed(6));
  };

  /* --------------------------------------------------------------------------
     Asset preflight — report anything referenced but not present, up front.
     ------------------------------------------------------------------------ */
  function preflight() {
    // Two works share the title "Cameo", so name each by id as well.
    function label(a) { return a.title + ' [' + a.id + ']'; }

    function markMissing(a, why) {
      State.byId[a.id].missing = true;
      State.missingAssets.push(label(a) + ' → ' + why);
    }

    var checks = window.EXHIBITION.artworks
      .filter(function (a) { return a.asset; })
      .map(function (a) {
        return fetch(assetUrl(a.asset), { method: 'HEAD' })
          .then(function (r) { if (!r.ok) markMissing(a, a.asset); })
          .catch(function () { markMissing(a, a.asset); });
      });

    window.EXHIBITION.artworks
      .filter(function (a) { return !a.asset; })
      .forEach(function (a) { markMissing(a, 'no file yet'); });

    Promise.all(checks).then(function () {
      if (State.missingAssets.length) {
        LOG.warn(State.missingAssets.length + ' artwork(s) have no usable file:');
        State.missingAssets.forEach(function (m) { LOG.warn('  · ' + m); });
      } else {
        LOG.info('All artwork files present.');
      }
      window.UI.refreshStatus();
    });
  }

  /* --------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  window.startExperience = function () {
    if (State.started) return;
    State.started = true;

    // Preview mode has no camera and no GPS worth asking for.
    if (PREVIEW) {
      State.tracking = 'preview';
      window.teleportTo();
      LOG.info('Preview mode — drag to look, WASD to walk.');
      return;
    }

    var requests = [];

    // iOS 13+ gates motion and compass behind an explicit permission request
    // that must originate from a user gesture — hence the start button.
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      requests.push(
        DeviceOrientationEvent.requestPermission()
          .then(function (r) { LOG.info('Motion permission: ' + r); })
          .catch(function (e) { LOG.warn('Motion permission failed: ' + e.message); })
      );
    }

    Promise.all(requests).then(function () {
      startCompass();
      startGeolocation();
    });

    LOG.info('Experience started.');
  };

  function init() {
    buildScene();
    preflight();
    window.UI.init();

    sceneEl.addEventListener('realityready', function () {
      State.tracking = 'ready';
      LOG.info('Reality ready.');
      window.UI.refreshStatus();
    });
    sceneEl.addEventListener('xrtrackingstatus', function (e) {
      State.tracking = e.detail.status;
      window.UI.refreshStatus();
    });

    if (!PREVIEW && !AFRAME.utils.device.isMobile()) {
      LOG.info('Desktop browser — add ?preview to the URL to walk the route without a camera.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
