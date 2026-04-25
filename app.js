// Custom A-Frame component to handle video playback on click
AFRAME.registerComponent('play-on-click', {
  init: function () {
    try {
      this.onClick = this.onClick.bind(this);
    } catch (e) {
      console.error("play-on-click init error:", e);
    }
  },
  play: function () {
    window.addEventListener('click', this.onClick);
  },
  pause: function () {
    window.removeEventListener('click', this.onClick);
  },
  onClick: function (evt) {
    try {
      const src = this.el.getAttribute('src');
      const video = src.startsWith('#') ? document.querySelector(src) : null;
      if (video) { 
        video.play().catch(e => console.error("Video Playback Denied:", e));
        console.log("Playing video:", src);
      } else {
        console.warn("Video element not found for src:", src);
      }
    } catch (e) {
      console.error("play-on-click click error:", e);
    }
  }
});

// Use global debug state
window.debugData = window.debugData || {};
const debugData = window.debugData;

function updateDebugUI() {
  const content = document.getElementById('debug-content');
  if (!content || document.getElementById('debug-panel').style.display === 'none') return;
  
  let html = '<strong>Distance Tracker</strong><br>';
  Object.keys(debugData).forEach(id => {
    const entry = debugData[id];
    const color = entry.distance <= entry.activation ? '#00ff00' : '#ff0000';
    html += `<div class="debug-row">
      ${entry.name}: <span style="color:${color}">${entry.distance.toFixed(1)}m</span> (${entry.isLoaded ? 'Loaded' : 'Wait'})
    </div>`;
  });

  html += '<br><strong>System Logs</strong><br>';
  // Use global systemLogs from window
  const logs = window.systemLogs || [];
  logs.slice().reverse().forEach(log => {
    const color = log.type === 'error' ? '#ff4444' : (log.type === 'warn' ? '#ffaa00' : '#00ff00');
    html += `<div class="debug-row" style="color:${color}; font-size: 10px;">
      [${log.time}] ${log.msg}
    </div>`;
  });
  
  content.innerHTML = html;
}

setInterval(updateDebugUI, 1000);

// Align 8th Wall SLAM world with North using device compass
AFRAME.registerComponent('gps-north-align', {
  init: function () {
    this.hasAligned = false;
    this.handler = (e) => {
      let heading = e.webkitCompassHeading || (360 - e.alpha);
      if (heading !== undefined && !this.hasAligned) {
        this.el.setAttribute('rotation', `0 ${-heading} 0`);
        this.hasAligned = true;
        console.log("World aligned to North:", heading);
        const ui = document.getElementById('gps-status');
        if (ui) ui.innerHTML += "<br>Compass Aligned: " + heading.toFixed(1) + "°";
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
    try {
      this.isLoaded = false;
      this.updatePosition = this.updatePosition.bind(this);
      this.entityName = this.el.getAttribute('data-name') || 'Unnamed Entity';
      
      this.el.addEventListener('model-error', (e) => {
        console.error(`GLTF Load Error [${this.entityName}]:`, e.detail.src);
      });

      if (this.el.sceneEl.renderStarted) {
        this.begin();
      } else {
        this.el.sceneEl.addEventListener('renderstart', () => this.begin());
      }
    } catch (e) {
      console.error(`gps-new-place init error [${this.entityName}]:`, e);
    }
  },
  begin: function() {
    try {
      const isMobile = AFRAME.utils.device.isMobile();
      if (!isMobile) {
        this.initialPos = { coords: { latitude: 37.336111, longitude: -121.885083, accuracy: 0 } };
        this.updatePosition();
      } else {
        this.watchId = navigator.geolocation.watchPosition(pos => {
          this.initialPos = pos;
          this.updatePosition();
          const ui = document.getElementById('gps-status');
          if (ui) ui.innerHTML = `Lat: ${pos.coords.latitude.toFixed(5)} <br> Lon: ${pos.coords.longitude.toFixed(5)} <br> Acc: ${pos.coords.accuracy.toFixed(1)}m`;
        }, err => {
          console.error("GEOLOCATION ERROR:", err.message);
          const ui = document.getElementById('gps-status');
          if (ui) ui.innerHTML = `<span style="color:red">GPS ERROR: ${err.message}</span>`;
        }, {enableHighAccuracy: true});
      }
    } catch (e) {
      console.error("Error starting geolocation:", e);
    }
  },
  remove: function() {
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
        this.placeholder = document.createElement('a-box');
        this.placeholder.setAttribute('color', '#00ff00');
        this.placeholder.setAttribute('opacity', '0.5');
        this.placeholder.setAttribute('scale', '2 2 2');
        this.placeholder.setAttribute('material', 'emissive: #00ff00; emissiveIntensity: 0.5');
        this.placeholder.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 3000; easing: linear; loop: true');
        this.el.appendChild(this.placeholder);
      }

      if (distance <= this.data.activationDist && !this.isLoaded && this.data.modelId) {
        // Logic for direct paths vs IDs
        const modelSource = this.data.modelId;
        this.el.setAttribute('gltf-model', modelSource);
        this.isLoaded = true;
        
        this.el.addEventListener('model-loaded', () => {
          if (this.placeholder) {
            this.el.removeChild(this.placeholder);
            this.placeholder = null;
          }
        }, {once: true});

        this.el.addEventListener('model-error', (e) => {
          console.error(`GLTF Load Error (${this.entityName}):`, modelSource);
          this.isLoaded = false;
        }, {once: true});
      } else if (distance > this.data.activationDist + 10 && this.isLoaded) {
        this.el.removeAttribute('gltf-model');
        this.isLoaded = false;
      }
    } catch (e) {
      console.error(`updatePosition error [${this.entityName}]:`, e);
    }
  }
});
