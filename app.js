// Custom A-Frame component to handle video playback on click
AFRAME.registerComponent('play-on-click', {
  init: function () {
    this.onClick = this.onClick.bind(this);
  },
  play: function () {
    window.addEventListener('click', this.onClick);
  },
  pause: function () {
    window.removeEventListener('click', this.onClick);
  },
  onClick: function (evt) {
    var video = document.querySelector(this.el.getAttribute('src'));
    if (video) { 
      video.play(); 
    }
  }
});

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
        if (ui) ui.innerHTML += "<br>Compass Aligned";
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
    modelId: {type: 'string', default: ''}, // The ID of the model in assets OR a direct URL
    activationDist: {type: 'number', default: 50} // Distance in meters to trigger load
  },
  init: function () {
    this.isLoaded = false;
    this.updatePosition = this.updatePosition.bind(this);
    
    const isMobile = AFRAME.utils.device.isMobile();
    if (!isMobile) {
      this.initialPos = { coords: { latitude: 37.336111, longitude: -121.885083 } };
      this.updatePosition();
    } else {
      this.watchId = navigator.geolocation.watchPosition(pos => {
        this.initialPos = pos;
        this.updatePosition();
        const ui = document.getElementById('gps-status');
        if (ui) ui.innerHTML = `Lat: ${pos.coords.latitude.toFixed(5)} <br> Lon: ${pos.coords.longitude.toFixed(5)}`;
      }, err => {
        console.error("GPS Error:", err);
      }, {enableHighAccuracy: true});
    }
  },
  remove: function() {
    if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
  },
  updatePosition: function () {
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
      this.el.setAttribute('gltf-model', this.data.modelId);
      this.isLoaded = true;
      
      this.el.addEventListener('model-loaded', () => {
        if (this.placeholder) {
          this.el.removeChild(this.placeholder);
          this.placeholder = null;
        }
      }, {once: true});
    } else if (distance > this.data.activationDist + 10 && this.isLoaded) {
      this.el.removeAttribute('gltf-model');
      this.isLoaded = false;
    }
  }
});
