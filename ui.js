/* ============================================================================
   ECHOES OF EXPRESSION — SCREEN UI
   ----------------------------------------------------------------------------
   Everything the visitor sees that is not the camera feed: the start screen,
   the artist statement panel, the artwork index, and the debug tools.
   ========================================================================= */

(function () {
  'use strict';

  var LOG = window.Log;
  var loading = {};
  var currentId = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function $(sel) { return document.querySelector(sel); }

  function bearingLabel(from, to) {
    var dLon = (to.longitude - from.longitude) * Math.cos(from.latitude * Math.PI / 180);
    var dLat = (to.latitude - from.latitude);
    var deg = (Math.atan2(dLon, dLat) * 180 / Math.PI + 360) % 360;
    var names = ['north', 'northeast', 'east', 'southeast',
                 'south', 'southwest', 'west', 'northwest'];
    return names[Math.round(deg / 45) % 8];
  }

  function formatDistance(m) {
    if (!isFinite(m)) return '—';
    if (m < 1000) return Math.round(m) + ' m';
    return (m / 1000).toFixed(1) + ' km';
  }

  var UI = {

    /* ----------------------------------------------------------------------
       Setup
       -------------------------------------------------------------------- */
    init: function () {
      this.buildIndex();
      this.refreshStatus();

      $('#start-button').addEventListener('click', function () {
        $('#start-gate').classList.add('hidden');
        window.startExperience();
      });

      $('#panel-close').addEventListener('click', function () { UI.closeArtwork(); });
      $('#panel-scrim').addEventListener('click', function () { UI.closeArtwork(); });

      $('#index-button').addEventListener('click', function () { UI.toggleIndex(true); });
      $('#index-close').addEventListener('click', function () { UI.toggleIndex(false); });

      $('#nearest-chip').addEventListener('click', function () {
        if (window.State.nearest) UI.openArtwork(window.State.nearest.data.id);
      });

      $('#debug-button').addEventListener('click', function () {
        $('#debug-panel').classList.toggle('hidden');
        UI.refreshDebug();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { UI.closeArtwork(); UI.toggleIndex(false); }
      });

      setInterval(function () { UI.refreshDebug(); }, 1000);
    },

    /* ----------------------------------------------------------------------
       Artist statement panel — the pop-up called for in the brief
       -------------------------------------------------------------------- */
    openArtwork: function (id) {
      var rec = window.State.byId[id];
      if (!rec) return;
      var art = rec.data;
      currentId = id;

      var exhibit = window.EXHIBITION.exhibits[art.exhibit];
      var byline = [art.artist, art.year].filter(Boolean).join(' · ');

      var html = '';

      html += '<div class="panel-media">';
      if (art.preview) {
        html += '<img src="' + esc(window.assetUrl(art.preview)) + '" alt="' +
                esc(art.title) + '">';
      }
      html += '</div>';

      html += '<div class="panel-body">';
      html += '<span class="badge" style="--badge:' + esc(exhibit.color) + '">' +
              esc(exhibit.name) + '</span>';
      html += '<h2>' + esc(art.title) + '</h2>';

      if (byline) {
        html += '<p class="byline">' + esc(byline) + '</p>';
      } else {
        html += '<p class="byline muted">Artist to be credited</p>';
      }

      if (art.medium) html += '<p class="medium">' + esc(art.medium) + '</p>';

      if (art.course) {
        html += '<p class="course">' + esc(art.course).replace(/\n/g, '<br>') + '</p>';
      }

      if (art.statement) {
        // Blank lines are paragraph breaks. Several statements are written as
        // verse or dialogue, where running them together would lose the shape.
        art.statement.split(/\n\s*\n/).forEach(function (para) {
          if (para.trim()) html += '<p class="statement">' + esc(para.trim()) + '</p>';
        });
      } else {
        html += '<p class="statement muted">The artist statement for this work has ' +
                'not been added yet.</p>';
      }

      // Collaborative works credit everyone, grouped by class where the
      // exhibition labels do.
      if (art.contributorGroups && art.contributorGroups.length) {
        art.contributorGroups.forEach(function (group) {
          html += '<h3>' + esc(group.label) + '</h3>';
          html += '<p class="contributors">' + group.names.map(esc).join(' · ') + '</p>';
        });
      } else if (art.contributors && art.contributors.length) {
        html += '<h3>Contributors</h3>';
        html += '<p class="contributors">' + art.contributors.map(esc).join(' · ') + '</p>';
      }

      html += '<dl class="facts">';
      html += '<dt>Location</dt><dd>' + esc(art.area) + '</dd>';

      if (window.State.position) {
        var d = window.distanceBetween(window.State.position,
                                       { latitude: art.lat, longitude: art.lon });
        html += '<dt>Distance</dt><dd>' + formatDistance(d) + ' ' +
                esc(bearingLabel(window.State.position, { latitude: art.lat, longitude: art.lon })) +
                '</dd>';
      }
      html += '</dl>';

      // Keyed off what the startup check actually found, so a mistyped path
      // reads the same as a file that has not arrived yet.
      if (rec.missing) {
        html += '<p class="notice">This work is not installed yet — its place on ' +
                'the route is reserved.</p>';
      }

      // Opening the panel is a user gesture, so this is the moment sound is
      // allowed to start on iOS.
      if (art.type === 'video' && rec.video) {
        html += '<button class="action" id="panel-sound">Play with sound</button>';
      }

      html += '</div>';

      $('#panel-content').innerHTML = html;
      $('#artwork-panel').classList.remove('hidden');
      $('#panel-scrim').classList.remove('hidden');

      var soundBtn = $('#panel-sound');
      if (soundBtn) {
        soundBtn.addEventListener('click', function () {
          rec.video.muted = false;
          rec.video.play();
          soundBtn.textContent = 'Playing';
          soundBtn.disabled = true;
        });
      }

      LOG.info('Opened: ' + art.title);
    },

    closeArtwork: function () {
      currentId = null;
      $('#artwork-panel').classList.add('hidden');
      $('#panel-scrim').classList.add('hidden');
    },

    /* ----------------------------------------------------------------------
       Artwork index — lets visitors find works they have not reached yet
       -------------------------------------------------------------------- */
    buildIndex: function () {
      var groups = {};
      window.EXHIBITION.artworks.forEach(function (art) {
        (groups[art.exhibit] = groups[art.exhibit] || []).push(art);
      });

      var html = '';
      Object.keys(groups).forEach(function (key) {
        var exhibit = window.EXHIBITION.exhibits[key];
        html += '<h3 style="--badge:' + esc(exhibit.color) + '">' + esc(exhibit.name) + '</h3>';
        html += '<ul class="index-list">';
        groups[key].forEach(function (art) {
          html += '<li data-id="' + esc(art.id) + '">';
          html += '<img src="' + esc(window.assetUrl(art.preview)) + '" alt="">';
          html += '<span class="index-text"><strong>' + esc(art.title) + '</strong>';
          html += '<em>' + esc(art.artist || art.area) + '</em></span>';
          html += '<span class="index-dist" data-dist="' + esc(art.id) + '"></span>';
          html += '</li>';
        });
        html += '</ul>';
      });

      var list = $('#index-content');
      list.innerHTML = html;
      list.addEventListener('click', function (e) {
        var li = e.target.closest('li[data-id]');
        if (!li) return;
        UI.toggleIndex(false);
        UI.openArtwork(li.dataset.id);
      });
    },

    toggleIndex: function (show) {
      $('#index-sheet').classList.toggle('hidden', !show);
      if (show) this.refreshIndexDistances();
    },

    refreshIndexDistances: function () {
      if (!window.State.position) return;
      document.querySelectorAll('[data-dist]').forEach(function (node) {
        var rec = window.State.byId[node.dataset.dist];
        if (rec) node.textContent = formatDistance(rec.distance);
      });
    },

    /* ----------------------------------------------------------------------
       Status line and nearest-work chip
       -------------------------------------------------------------------- */
    refreshStatus: function () {
      var S = window.State;
      var text, tone = 'ok';

      if (S.tracking === 'preview') {
        text = 'Preview mode — drag to look, WASD to walk'; tone = 'ok';
      } else if (S.tracking === 'gps-denied') {
        text = 'Location is off — turn it on to see the artworks'; tone = 'bad';
      } else if (!S.position) {
        text = 'Finding your location…'; tone = 'wait';
      } else if (!S.anchor) {
        text = 'Improving accuracy (±' + Math.round(S.position.accuracy) + ' m)…'; tone = 'wait';
      } else if (S.heading === null) {
        text = 'Point the phone around to find north…'; tone = 'wait';
      } else {
        text = 'Ready'; tone = 'ok';
      }

      var el = $('#status-line');
      el.textContent = text;
      el.dataset.tone = tone;
    },

    refreshNearest: function () {
      var rec = window.State.nearest;
      var chip = $('#nearest-chip');
      if (!rec) { chip.classList.add('hidden'); return; }

      chip.classList.remove('hidden');
      chip.querySelector('.chip-title').textContent = rec.data.title;
      chip.querySelector('.chip-dist').textContent =
        rec.distance < 15 ? 'You are here — look around'
                          : formatDistance(rec.distance) + ' ' +
                            bearingLabel(window.State.position,
                                         { latitude: rec.data.lat, longitude: rec.data.lon });
      this.refreshIndexDistances();
    },

    /* ----------------------------------------------------------------------
       Model loading indicator
       -------------------------------------------------------------------- */
    setLoading: function (id, title) {
      loading[id] = title;
      this.refreshLoading();
    },
    clearLoading: function (id) {
      delete loading[id];
      this.refreshLoading();
    },
    refreshLoading: function () {
      var names = Object.keys(loading).map(function (k) { return loading[k]; });
      var el = $('#loading-chip');
      if (!names.length) { el.classList.add('hidden'); return; }
      el.classList.remove('hidden');
      el.textContent = 'Loading ' + names.join(', ') + '…';
    },

    /* ----------------------------------------------------------------------
       Debug tools
       -------------------------------------------------------------------- */
    refreshDebug: function () {
      var panel = $('#debug-panel');
      if (panel.classList.contains('hidden')) return;

      var S = window.State;
      var html = '';

      html += '<div class="dbg-actions">';
      html += '<button onclick="location.reload()">Reload</button>';
      html += '<button onclick="window.recalibrateCompass()">Recalibrate north</button>';
      html += '<button onclick="window.teleportTo()">Teleport to route</button>';
      html += '<button onclick="window.copyLogs()">Copy logs</button>';
      html += '</div>';

      html += '<div class="dbg-row">Tracking: <b>' + esc(S.tracking) + '</b></div>';
      html += '<div class="dbg-row">Anchor: <b>' +
              (S.anchor ? S.anchor.latitude.toFixed(6) + ', ' + S.anchor.longitude.toFixed(6) : 'none') +
              '</b></div>';
      html += '<div class="dbg-row">Position: <b>' +
              (S.position ? S.position.latitude.toFixed(6) + ', ' + S.position.longitude.toFixed(6) +
               ' ±' + Math.round(S.position.accuracy) + 'm' : 'none') + '</b></div>';
      html += '<div class="dbg-row">World yaw: <b>' + S.worldYaw.toFixed(1) + '°</b>' +
              (S.heading === null ? ' (not locked)' : '') + '</div>';

      html += '<div class="dbg-row">Ground offset: <b>' + window.CONFIG.groundY.toFixed(1) + ' m</b> ' +
              '<button onclick="window.nudgeGround(-0.5)">−</button>' +
              '<button onclick="window.nudgeGround(0.5)">+</button></div>';

      if (S.missingAssets.length) {
        html += '<div class="dbg-warn"><b>' + S.missingAssets.length +
                ' artwork(s) without a file:</b><br>' +
                S.missingAssets.map(esc).join('<br>') + '</div>';
      }

      html += '<div class="dbg-head">Distances</div>';
      var recs = Object.keys(S.byId).map(function (k) { return S.byId[k]; })
                       .sort(function (a, b) { return a.distance - b.distance; });
      recs.forEach(function (r) {
        html += '<div class="dbg-row">' + esc(r.data.title) + ': ' +
                formatDistance(r.distance) + (r.loaded ? ' <b>· loaded</b>' : '') + '</div>';
      });

      html += '<div class="dbg-head">Log</div>';
      html += '<div class="dbg-log">' +
              window.systemLogs.slice(-40).reverse().map(function (l) {
                return '<div class="lvl-' + l.type + '">[' + l.time + '] ' + esc(l.msg) + '</div>';
              }).join('') + '</div>';

      $('#debug-content').innerHTML = html;
    },
  };

  window.nudgeGround = function (delta) {
    window.CONFIG.groundY += delta;
    var world = document.querySelector('#world');
    var p = world.getAttribute('position');
    world.setAttribute('position', { x: p.x, y: window.CONFIG.groundY, z: p.z });
  };

  window.UI = UI;
})();
