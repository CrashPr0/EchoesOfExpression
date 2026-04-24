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
      if (heading && !this.hasAligned) {
        // Rotate this entity (the world wrapper) to align with North
        // We use -heading because A-Frame rotation is clockwise
        this.el.setAttribute('rotation', `0 ${-heading} 0`);
        this.hasAligned = true;
        console.log("World aligned to North:", heading);
        
        const ui = document.getElementById('gps-status');
        if (ui) ui.innerHTML += "<br>Compass Aligned";
      }
    };

    // Request permissions for iOS if needed (usually handled by 8th Wall, but safe to add)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // This usually needs a user gesture, but 8th Wall's "Start" button provides one.
      window.addEventListener('click', () => {
        DeviceOrientationEvent.requestPermission().then(response => {
          if (response == 'granted') {
            window.addEventListener('deviceorientationabsolute', this.handler, true);
          }
        });
      }, {once: true});
    } else {
      window.addEventListener('deviceorientationabsolute', this.handler, true);
      window.addEventListener('deviceorientation', this.handler, true);
    }
  }
});

// Custom GPS placement component for 8th Wall
AFRAME.registerComponent('gps-new-place', {
  schema: {
    latitude: {type: 'number'},
    longitude: {type: 'number'}
  },
  init: function () {
    this.updatePosition = this.updatePosition.bind(this);
    
    // SJSU Simulation coordinates for Desktop
    const isMobile = AFRAME.utils.device.isMobile();
    if (!isMobile) {
      this.initialPos = {
        coords: {
          latitude: 37.336111,
          longitude: -121.885083
        }
      };
      this.updatePosition();
      const ui = document.getElementById('gps-status');
      if (ui) ui.innerHTML = "Simulating SJSU Location";
    } else {
      navigator.geolocation.getCurrentPosition(pos => {
        this.initialPos = pos;
        this.updatePosition();
        
        const ui = document.getElementById('gps-status');
        if (ui) ui.innerHTML = `Lat: ${pos.coords.latitude.toFixed(5)} <br> Lon: ${pos.coords.longitude.toFixed(5)}`;
      }, err => {
        console.error("GPS Error:", err);
      }, {enableHighAccuracy: true});
    }
  },
  updatePosition: function () {
    if (!this.initialPos) return;
    
    const userLat = this.initialPos.coords.latitude;
    const userLon = this.initialPos.coords.longitude;
    const targetLat = this.data.latitude;
    const targetLon = this.data.longitude;
    
    // Haversine formula to get distance
    const R = 6371e3; // meters
    const dLat = (targetLat - userLat) * Math.PI / 180;
    const dLon = (targetLon - userLon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Bearing
    const y = Math.sin(dLon) * Math.cos(targetLat * Math.PI / 180);
    const x = Math.cos(userLat * Math.PI / 180) * Math.sin(targetLat * Math.PI / 180) -
              Math.sin(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) * Math.cos(dLon);
    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    
    // Convert to X, Z coordinates (A-Frame uses -Z for North)
    // bearing 0 = North (+Z in our aligned world because of how we rotate the wrapper)
    // Actually, if we rotate the wrapper by 'heading', then North is now local -Z.
    const xPos = distance * Math.sin(bearing * Math.PI / 180);
    const zPos = -distance * Math.cos(bearing * Math.PI / 180);
    
    this.el.setAttribute('position', `${xPos} 0 ${zPos}`);
    console.log(`Placed entity at: ${xPos}, ${zPos} (Dist: ${distance}m)`);
  }
});
