console.log("APP: Script execution started.");

// Custom A-Frame component to handle video playback on click
AFRAME.registerComponent('play-on-click', {
  init: function () {
    console.log("APP: play-on-click component initializing...");
    try {
      this.onClick = this.onClick.bind(this);
      console.log("APP: play-on-click component ready.");
    } catch (e) {
      console.error("APP: play-on-click init error:", e);
    }
  },
  play: function () {
    console.log("APP: play-on-click active.");
    window.addEventListener('click', this.onClick);
  },
  pause: function () {
    console.log("APP: play-on-click paused.");
    window.removeEventListener('click', this.onClick);
  },
  onClick: function (evt) {
    console.log("APP: Screen clicked, checking for video...");
    try {
      const src = this.el.getAttribute('src');
      console.log("APP: Video src is:", src);
      const video = src.startsWith('#') ? document.querySelector(src) : null;
      if (video) { 
        console.log("APP: Attempting to play video element.");
        video.play().then(() => {
          console.log("APP: Video playback started successfully.");
        }).catch(e => {
          console.error("APP: Video Playback Denied (Autoplay policy?):", e);
        });
      } else {
        console.warn("APP: Video element NOT FOUND for src:", src);
      }
    } catch (e) {
      console.error("APP: play-on-click click error:", e);
    }
  }
});

// Use global debug state
console.log("APP: Setting up global debugData...");
window.debugData = window.debugData || {};
const debugData = window.debugData;
window.xrState = window.xrState || "Initializing...";

// Teleport to Exhibition (For testing off-site)
window.teleportToExhibition = () => {
  console.log("APP: MANUAL TELEPORT triggered.");
  const simPos = { 
    coords: { 
      latitude: 37.336111, 
      longitude: -121.885083, 
      accuracy: 5 
    } 
  };
  const entities = document.querySelectorAll('[gps-new-place]');
  console.log(`APP: Teleporting ${entities.length} entities...`);
  entities.forEach(el => {
    const comp = el.components['gps-new-place'];
    if (comp) {
      comp.initialPos = simPos;
      comp.updatePosition();
    }
  });
  window.xrState = "Teleported (Simulated)";
  console.log("APP: Teleport complete.");
};

// Force Dismiss Loading
window.dismissLoading = () => {
  console.log("APP: MANUAL DISMISS LOADING triggered.");
  try {
    const style = document.createElement('style');
    style.innerHTML = `
      .xrextras-show { display: none !important; } 
      #loading-screen { display: none !important; } 
      .xrextras-loading-visible { display: none !important; }
      #loadingContainer { display: none !important; }
    `;
    document.head.appendChild(style);
    window.xrState = "Dismissed (Manual)";
    console.log("APP: Force dismiss CSS injected.");
  } catch (e) {
    console.error("APP: Error during manual dismiss:", e);
  }
};

window.updateDebugUI = () => {
  try {
    const content = document.getElementById('debug-content');
    const panel = document.getElementById('debug-panel');
    if (!content || !panel || panel.style.display === 'none') return;
    
    let html = `<div style="margin-bottom:10px; border-bottom:1px solid #444; padding-bottom:5px;">`;
    html += `<strong>State:</strong> ${window.xrState}<br>`;
    html += `<button onclick="teleportToExhibition()" style="width:100%; margin:4px 0; padding:6px; background:#007bff; color:white; border:none; border-radius:4px; font-weight:bold;">TELEPORT TO SJSU</button><br>`;
    html += `<button onclick="dismissLoading()" style="width:100%; margin:4px 0; padding:6px; background:#f00; color:white; border:none; border-radius:4px; font-weight:bold;">FORCE DISMISS LOADING</button>`;
    html += `</div>`;
    
    html += '<strong>Distances:</strong><br>';
    const keys = Object.keys(debugData);
    if (keys.length === 0) html += '<i>No entities tracked yet...</i><br>';
    
    keys.forEach(id => {
      const entry = debugData[id];
      const color = entry.distance <= entry.activation ? '#00ff00' : '#ff0000';
      html += `<div class="debug-row">
        ${entry.name}: <span style="color:${color}">${entry.distance.toFixed(1)}m</span> (${entry.isLoaded ? 'LOADED' : 'WAIT'})
      </div>`;
    });

    html += '<br><strong>Logs:</strong><br>';
    const logs = window.systemLogs || [];
    if (logs.length === 0) html += '<i>No logs captured...</i>';
    
    logs.slice().reverse().forEach(log => {
      const color = log.type === 'error' ? '#ff4444' : (log.type === 'warn' ? '#ffaa00' : '#00ff00');
      html += `<div class="debug-row" style="color:${color}; font-size: 10px; border-bottom:1px solid #222;">
        [${log.time}] ${log.msg}
      </div>`;
    });
    
    content.innerHTML = html;
  } catch (e) {
    // Can't use regular log here or we might loop
    console.warn("APP: UI Update error", e);
  }
};

setInterval(window.updateDebugUI, 1000);

// Align 8th Wall SLAM world with North using device compass
AFRAME.registerComponent('gps-north-align', {
  init: function () {
    console.log("APP: gps-north-align initializing...");
    this.hasAligned = false;
    this.handler = (e) => {
      let heading = e.webkitCompassHeading || (360 - e.alpha);
      if (heading !== undefined && !this.hasAligned) {
        console.log(`APP: Compass signal received. Heading: ${heading.toFixed(1)}`);
        this.el.setAttribute('rotation', `0 ${-heading} 0`);
        this.hasAligned = true;
        const ui = document.getElementById('gps-status');
        if (ui) ui.innerHTML += "<br>Compass Aligned: " + heading.toFixed(1) + "°";
        window.xrState = "North Aligned";
      }
    };

    window.addEventListener('deviceorientationabsolute', this.handler, true);
    window.addEventListener('deviceorientation', this.handler, true);
  }
});

// Custom GPS placement component for 8th Wall with Lazy Loading
AFRAME.registerComponent('gps-new-place', {
  schema: {
    latitude: {type: 'number'},
    longitude: {type: 'number'},
    modelId: {type: 'string', default: ''}, 
    activationDist: {type: 'number', default: 50} 
  },
  init: function () {
    this.entityName = this.el.getAttribute('data-name') || 'Unnamed Entity';
    console.log(`APP: gps-new-place init for [${this.entityName}]`);
    try {
      this.isLoaded = false;
      this.updatePosition = this.updatePosition.bind(this);
      
      this.el.addEventListener('model-error', (e) => {
        console.error(`APP: GLTF Error [${this.entityName}]:`, e.detail.src);
      });

      this.el.addEventListener('model-loaded', () => {
        console.log(`APP: GLTF Loaded SUCCESS [${this.entityName}]`);
      });

      if (this.el.sceneEl.renderStarted) {
        this.begin();
      } else {
        this.el.sceneEl.addEventListener('renderstart', () => this.begin());
      }
    } catch (e) {
      console.error(`APP: gps-new-place init error [${this.entityName}]:`, e);
    }
  },
  begin: function() {
    console.log(`APP: gps-new-place begin for [${this.entityName}]`);
    try {
      const isMobile = AFRAME.utils.device.isMobile();
      if (!isMobile) {
        console.log(`APP: Non-mobile detected, using SJSU mock coordinates for [${this.entityName}]`);
        this.initialPos = { coords: { latitude: 37.336111, longitude: -121.885083, accuracy: 0 } };
        this.updatePosition();
      } else {
        console.log(`APP: Starting GPS watch for [${this.entityName}]`);
        this.watchId = navigator.geolocation.watchPosition(pos => {
          if (window.xrState !== "Teleported (Simulated)") {
            this.initialPos = pos;
            this.updatePosition();
          }
          const ui = document.getElementById('gps-status');
          if (ui) ui.innerHTML = `Lat: ${pos.coords.latitude.toFixed(5)} <br> Lon: ${pos.coords.longitude.toFixed(5)} <br> Acc: ${pos.coords.accuracy.toFixed(1)}m`;
        }, err => {
          console.error(`APP: GEOLOCATION ERROR [${this.entityName}]:`, err.message);
          const ui = document.getElementById('gps-status');
          if (ui) ui.innerHTML = `<span style="color:red">GPS ERROR: ${err.message}</span>`;
        }, {enableHighAccuracy: true});
      }
    } catch (e) {
      console.error(`APP: Error in begin() for [${this.entityName}]:`, e);
    }
  },
  remove: function() {
    console.log(`APP: Removing gps-new-place for [${this.entityName}]`);
    if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
    delete debugData[this.entityName];
  },
  updatePosition: function () {
    try {
      if (!this.initialPos) return;
      
      const userLat = this.initialPos.coords.latitude;
      const userLon = this.initialPos.coords.longitude;
      const targetLat = this.data.latitude;
      const targetLon = this.data.longitude;
      
      const R = 6371e3; 
      const dLat = (targetLat - userLat) * Math.PI / 180;
      const dLon = (targetLon - userLon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      const y = Math.sin(dLon) * Math.cos(targetLat * Math.PI / 180);
      const x = Math.cos(userLat * Math.PI / 180) * Math.sin(targetLat * Math.PI / 180) -
                Math.sin(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.cos(dLon);
      const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      
      const xPos = distance * Math.sin(bearing * Math.PI / 180);
      const zPos = -distance * Math.cos(bearing * Math.PI / 180);
      
      this.el.setAttribute('position', `${xPos} 0 ${zPos}`);

      // Update debug log
      debugData[this.entityName] = {
        name: this.entityName,
        distance: distance,
        activation: this.data.activationDist,
        isLoaded: this.isLoaded
      };

      if (!this.placeholder && this.data.modelId) {
        console.log(`APP: Adding green placeholder for [${this.entityName}]`);
        this.placeholder = document.createElement('a-box');
        this.placeholder.setAttribute('color', '#00ff00');
        this.placeholder.setAttribute('opacity', '0.5');
        this.placeholder.setAttribute('scale', '2 2 2');
        this.placeholder.setAttribute('material', 'emissive: #00ff00; emissiveIntensity: 0.5');
        this.placeholder.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 3000; easing: linear; loop: true');
        this.el.appendChild(this.placeholder);
      }

      if (distance <= this.data.activationDist && !this.isLoaded && this.data.modelId) {
        const modelSource = this.data.modelId;
        console.log(`APP: Distance threshold met (${distance.toFixed(1)}m). Loading model: ${modelSource}`);
        this.el.setAttribute('gltf-model', modelSource);
        this.isLoaded = true;
        
        this.el.addEventListener('model-loaded', () => {
          if (this.placeholder) {
            console.log(`APP: Removing placeholder for [${this.entityName}]`);
            this.el.removeChild(this.placeholder);
            this.placeholder = null;
          }
        }, {once: true});

        this.el.addEventListener('model-error', (e) => {
          console.error(`APP: GLTF Load Error (${this.entityName}):`, modelSource);
          this.isLoaded = false;
        }, {once: true});
      } else if (distance > this.data.activationDist + 10 && this.isLoaded) {
        console.log(`APP: Distance exceeded (${distance.toFixed(1)}m). Unloading [${this.entityName}]`);
        this.el.removeAttribute('gltf-model');
        this.isLoaded = false;
      }
    } catch (e) {
      console.error(`APP: updatePosition error [${this.entityName}]:`, e);
    }
  }
});

console.log("APP: Script execution finished (Hooks registered).");