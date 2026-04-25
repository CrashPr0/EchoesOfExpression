console.log("APP: Script started.");

// Ensure XR8 is handled correctly with A-Frame
const onxrloaded = () => {
  console.log("APP: XR8 Loaded and ready.");
  // Add any custom pipeline modules here if needed
};

window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded);

AFRAME.registerComponent('play-on-click', {
  init: function () {
    this.onClick = () => {
      const video = document.querySelector(this.el.getAttribute('src'));
      if (video) video.play().catch(e => console.error("APP: Play fail", e));
    };
  },
  play: function () { window.addEventListener('click', this.onClick); },
  pause: function () { window.removeEventListener('click', this.onClick); }
});

window.debugData = window.debugData || {};
const debugData = window.debugData;

// Manual Re-request
window.requestAllPermissions = () => {
  console.log("APP: Requesting camera access...");
  // Instead of manual XR8.run, we use the standard browser API which often triggers 8th Wall's prompt
  navigator.mediaDevices.getUserMedia({video: true})
    .then(() => {
      console.log("APP: Camera access granted.");
      window.xrState = "Camera Access Granted. Refreshing...";
      setTimeout(() => location.reload(), 1000);
    })
    .catch(err => {
      console.error("APP: Camera access denied", err);
      window.xrState = "Camera Denied: " + err.message;
    });
};

window.fixGyro = () => {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(r => { 
      window.xrState = "Gyro: " + r;
      console.log("APP: Gyro permission: " + r);
    }).catch(console.error);
  } else {
    window.xrState = "Gyro: Already active or not supported";
    console.log("APP: Gyro permission not required or unsupported");
  }
};

window.teleportToExhibition = () => {
  const p = { coords: { latitude: 37.336111, longitude: -121.885083, accuracy: 5 } };
  document.querySelectorAll('[gps-new-place]').forEach(el => {
    const c = el.components['gps-new-place'];
    if (c) { c.initialPos = p; c.updatePosition(); }
  });
  window.xrState = "Teleported";
};

window.dismissLoading = () => {
  const style = document.createElement('style');
  style.innerHTML = '.xrextras-show, #loading-screen, .xrextras-loading-visible, #loadingContainer, .xrextras-loading, .almost-there-visible { display: none !important; visibility: hidden !important; opacity: 0 !important; }';
  document.head.appendChild(style);
  window.xrState = "Overlays Hidden";
};

window.updateDebugUI = () => {
  const content = document.getElementById('debug-content');
  if (!content || document.getElementById('debug-panel').style.display === 'none') return;
  
  let html = `<div style="border-bottom:1px solid #444; padding-bottom:5px; margin-bottom:5px;">`;
  html += `State: ${window.xrState}<br>`;
  html += `<button onclick="requestAllPermissions()" style="width:100%; background:#28a745; color:white; border:none; margin:2px 0; padding:5px; font-weight:bold;">1. REQUEST PERMISSIONS</button>`;
  html += `<button onclick="fixGyro()" style="width:100%; background:#ffc107; color:black; border:none; margin:2px 0; padding:5px; font-weight:bold;">2. FIX GYRO</button>`;
  html += `<button onclick="teleportToExhibition()" style="width:100%; background:#007bff; color:white; border:none; margin:2px 0; padding:5px; font-weight:bold;">3. TELEPORT</button>`;
  html += `<button onclick="dismissLoading()" style="width:100%; background:#dc3545; color:white; border:none; margin:2px 0; padding:5px; font-weight:bold;">4. FORCE DISMISS</button>`;
  html += `</div>`;
  
  html += `<strong>Distances:</strong><br>`;
  Object.keys(debugData).forEach(k => {
    const e = debugData[k];
    html += `${e.name}: ${e.distance.toFixed(1)}m<br>`;
  });
  content.innerHTML = html;
};
setInterval(window.updateDebugUI, 1000);

AFRAME.registerComponent('gps-north-align', {
  init: function () {
    this.handler = (e) => {
      let h = e.webkitCompassHeading || (360 - e.alpha);
      if (h !== undefined && !this.aligned) {
        this.el.setAttribute('rotation', `0 ${-h} 0`);
        this.aligned = true;
      }
    };
    window.addEventListener('deviceorientationabsolute', this.handler, true);
  }
});

AFRAME.registerComponent('gps-new-place', {
  schema: { latitude: {type:'number'}, longitude: {type:'number'}, modelId: {type:'string', default:''}, activationDist: {type:'number', default:50} },
  init: function () {
    this.name = this.el.getAttribute('data-name') || 'Entity';
    this.updatePosition = this.updatePosition.bind(this);
    if (this.el.sceneEl.renderStarted) this.begin(); else this.el.sceneEl.addEventListener('renderstart', () => this.begin());
  },
  begin: function() {
    if (!AFRAME.utils.device.isMobile()) {
      this.initialPos = { coords: { latitude: 37.336111, longitude: -121.885083 } };
      this.updatePosition();
    } else {
      navigator.geolocation.watchPosition(p => {
        if (window.xrState !== "Teleported") { this.initialPos = p; this.updatePosition(); }
      }, e => console.error("GPS ERR", e.message), {enableHighAccuracy:true});
    }
  },
  updatePosition: function() {
    if (!this.initialPos) return;
    const R=6371e3, dLat=(this.data.latitude-this.initialPos.coords.latitude)*Math.PI/180, dLon=(this.data.longitude-this.initialPos.coords.longitude)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(this.initialPos.coords.latitude*Math.PI/180)*Math.cos(this.data.latitude*Math.PI/180)*Math.sin(dLon/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const y = Math.sin(dLon)*Math.cos(this.data.latitude*Math.PI/180), x = Math.cos(this.initialPos.coords.latitude*Math.PI/180)*Math.sin(this.data.latitude*Math.PI/180)-Math.sin(this.initialPos.coords.latitude*Math.PI/180)*Math.cos(this.data.latitude*Math.PI/180)*Math.cos(dLon);
    const bear = (Math.atan2(y,x)*180/Math.PI+360)%360;
    this.el.setAttribute('position', `${dist*Math.sin(bear*Math.PI/180)} 0 ${-dist*Math.cos(bear*Math.PI/180)}`);
    debugData[this.name] = { name:this.name, distance:dist };
    if (!this.loaded && dist <= this.data.activationDist && this.data.modelId) {
      this.el.setAttribute('gltf-model', this.data.modelId);
      this.loaded = true;
    }
  }
});

console.log("APP: Loaded.");