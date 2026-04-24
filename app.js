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

// A system to provide some UI feedback
AFRAME.registerComponent('gps-feedback', {
  init: function () {
    this.el.addEventListener('gps-camera-update-position', e => {
      const ui = document.getElementById('gps-status');
      if (ui) {
        ui.innerHTML = `Lat: ${e.detail.position.latitude.toFixed(5)} <br> Lon: ${e.detail.position.longitude.toFixed(5)}`;
      }
    });
  }
});

// Detects desktop vs mobile to enable simulation
AFRAME.registerComponent('smart-gps', {
  init: function () {
    const isMobile = AFRAME.utils.device.isMobile();
    
    if (!isMobile) {
      // Desktop: Enable simulation at the SJSU sidewalk
      this.el.setAttribute('gps-camera', 'simulateLatitude: 37.336111; simulateLongitude: -121.885083');
      console.log("Desktop detected: GPS Simulation activated.");
      
      const ui = document.getElementById('gps-status');
      if (ui) ui.innerHTML += " (Simulation Mode)";
    } else {
      // Mobile: Use real device GPS
      this.el.setAttribute('gps-camera', '');
      console.log("Mobile detected: Real GPS tracking activated.");
    }
  }
});
