// Measures the distance between two lat,long positions
const distance = (from, to) => {
  // Computational optimization for no change.
  if (from.lat === to.lat && from.lng === to.lng) {
    return 0
  }
  const lat1R = (from.lat * Math.PI) / 180
  const lat2R = (to.lat * Math.PI) / 180
  const halfLatD = 0.5 * (lat2R - lat1R)
  const halfLngD = 0.5 * ((to.lng * Math.PI) / 180 - (from.lng * Math.PI) / 180)
  const v = Math.sin(halfLatD) ** 2 + (Math.sin(halfLngD) ** 2) * Math.cos(lat1R) * Math.cos(lat2R)
  const arc = 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v))
  return arc * 6371008.8  // Earth arithmetic mean radius, per en.wikipedia.org/wiki/Earth_radius
}

const customWayspotComponent = {
  schema: {
    id: {type: 'int', default: 1},
    name: {type: 'string'},
    title: {type: 'string'},
    imageUrl: {type: 'string'},
    projectWayspotColor: {type: 'string', default: '#94eaff'},
    anyWayspotColor: {type: 'string', default: '#ad50ff'},
    lat: {type: 'float', default: '22'},
    lng: {type: 'float', default: '120'},
  },
  init() {

    const scene = this.el.sceneEl
    const projectWayspotColor = new THREE.Color(this.data.projectWayspotColor).convertSRGBToLinear()
    const anyWayspotColor = new THREE.Color(this.data.anyWayspotColor).convertSRGBToLinear()
    const texLoader = new THREE.TextureLoader().load(this.data.imageUrl)
    const startArBtn = document.getElementById('start-btn')

    let isInside = false

    // each instance listens for the event to change colors
    scene.addEventListener('themeSwitched', (e) => {
      this.data.anyWayspotColor = e.detail.color
      startArBtn.style.backgroundColor = this.data.anyWayspotColor
      this.el.querySelector('.orb').setAttribute('color', this.data.anyWayspotColor)
      this.el.querySelector('.disc').getObject3D('mesh').getObjectByName('outer').material.color =
          new THREE.Color(this.data.anyWayspotColor).convertSRGBToLinear()
    })

    // create wayspot parent element
    this.wayspotHolder = document.createElement('a-entity')
    this.wayspotHolder.setAttribute('position', '0 1.5 0')
    const randomYRotation = Math.random() * 360
    this.wayspotHolder.setAttribute('shadow', 'receive: false')
    this.wayspotHolder.setAttribute('rotation', `0 ${randomYRotation} 0`)  // apply random rotation

    // create photo disc element
    const disc = document.createElement('a-entity')
    disc.addEventListener('model-loaded', () => {
      disc.getObject3D('mesh').getObjectByName('inner').material.map = texLoader
      disc.getObject3D('mesh').getObjectByName('outer').material.color =
      this.data.name ? projectWayspotColor : anyWayspotColor
    })
    disc.setAttribute('gltf-model', '#poi-model')
    disc.setAttribute('scale', '0.001 0.001 0.001')
    disc.setAttribute('xrextras-spin', 'speed: 12000')
    disc.object3D.visible = false
    disc.classList.add('disc')
    disc.id = this.data.title
    this.wayspotHolder.appendChild(disc)

    // create color orb element
    const orb = document.createElement('a-sphere')
    orb.classList.add('orb')
    orb.setAttribute('geometry', 'primitive: sphere')
    orb.setAttribute('material', {
      color: this.data.name
        ? this.data.projectWayspotColor : this.data.anyWayspotColor,
    })
    orb.setAttribute('scale', '0.2 0.2 0.2')
    this.wayspotHolder.appendChild(orb)

    this.el.appendChild(this.wayspotHolder)

    // emitting wayspot color sets matching Start AR button color
    this.el.emit('wayspotAdded', {color: this.data.anyWayspotColor})

    const transitionSpeed = 1000  // animation speed between orb and disc forms

    const enteredGeofence = (d) => {
      console.log('enteredGeofence='+JSON.stringify(this.data)+'d='+d)
      scene.emit('enteredGeofence', {...this.data, distance: d})
      disc.object3D.visible = true
      disc.classList.add('cantap')
      disc.setAttribute('animation__grow', {
        property: 'scale',
        from: '0.001 0.001 0.001',
        to: '0.5 0.5 0.5',
        dur: transitionSpeed,
        easing: 'easeInOutElastic',
      })

      orb.setAttribute('animation__shrink', {
        property: 'scale',
        from: '0.2 0.2 0.2',
        to: '0.001 0.001 0.001',
        dur: transitionSpeed,
        easing: 'easeInOutElastic',
      })
      setTimeout(() => {
        disc.removeAttribute('animation__grow')
        orb.removeAttribute('animation__shrink')
        orb.object3D.visible = false
      }, transitionSpeed + 200)
    }

    const exitedGeofence = (d) => {
      scene.emit('exitedGeofence', {...this.data, distance: d})
      orb.object3D.visible = true
      disc.classList.remove('cantap')
      disc.setAttribute('animation__shrink', {
        property: 'scale',
        from: '0.5 0.5 0.5',
        to: '0.001 0.001 0.001',
        dur: transitionSpeed,
        easing: 'easeInOutElastic',
      })

      orb.setAttribute('animation__grow', {
        property: 'scale',
        from: '0.001 0.001 0.001',
        to: '0.2 0.2 0.2',
        dur: transitionSpeed,
        easing: 'easeInOutElastic',
      })
      setTimeout(() => {
        disc.removeAttribute('animation__shrink')
        orb.removeAttribute('animation__grow')
        disc.object3D.visible = false
      }, transitionSpeed + 200)
    }

    disc.addEventListener('click', () => {
      this.el.sceneEl.emit('wayspotClicked', this.data)
    })

    this.el.parentEl.addEventListener('distance', ({detail}) => {
      // entered geofence
      if (detail.distance < 40) {
        if (!isInside) {
          enteredGeofence(detail.distance)
          isInside = true
        } else {
          this.el.sceneEl.emit('updatedDistance', {...this.data, distance: detail.distance})
        }
      }

      // exited geofence
      if (detail.distance > 40) {
        if (isInside) {
          exitedGeofence(detail.distance)
          isInside = false
        }
      }
    })
  },
  tick() {
    // console.log('tick')
    if (this.isInsideOuter) {
      console.log('isInsideOuter')
      const map = this.el.parentEl.parentEl.components['lightship-map']
      if (!map) {
        return
      }

      const {x: lat, y: lng} = map.data['lat-lng']
       console.log('x1='+x+', y1='+y)
      const mapPt = this.el.parentEl.components['lightship-map-point']
      if (!mapPt) {
        return
      }
      const {x: lat2, y: lng2} = mapPt.data['lat-lng']
      console.log('x2='+x+', y2='+y)
      // this.lat=x;
      // this.lng=y;
      this.d = distance({lat, lng}, {lat: lat2, lng: lng2})
    }else{
       const map = this.el.parentEl.parentEl.components['lightship-map']
      if (!map) {
        return
      }

      const {x3: x, y3: y} = map.data['lat-lng']
      //  console.log('x1='+JSON.stringify(map.data['lat-lng']))
      //  console.log('Latitude:'+ map.data['lat-lng'].x)
       this.data.lat=map.data['lat-lng'].x;
       this.data.lng=map.data['lat-lng'].y;
       
    }
  },
}

const customWayspotPrimitive = {
  defaultComponents: {
    'custom-wayspot': {},
  },
  mappings: {
    'name': 'custom-wayspot.name',
    'title': 'custom-wayspot.title',
    'image-url': 'custom-wayspot.imageUrl',
    'project-wayspot-color': 'custom-wayspot.projectWayspotColor',
    'any-wayspot-color': 'custom-wayspot.anyWayspotColor',
    'lat': 'custom-wayspot.lat',
    'lng': 'custom-wayspot.lng',
    'id': 'custom-wayspot.id',
  },
}

const focusedWayspotComponent = {
  init() {
    console.log('focusedWayspotComponent')
    this.activeWayspot = null
    this.uiSection = document.getElementById('ui-section')
    this.wayspotDistance = document.getElementById('wayspot-distance')
    this.wayspotTitle = document.getElementById('wayspot-title')
    this.startBtn = document.getElementById('start-btn')

    this.startBtn.addEventListener('click', () => this.swapScene())

    this.wayspotInfo = {}

    this.el.sceneEl.addEventListener('enteredGeofence', ({detail}) => {
      this.wayspotInfo[detail.title] = {...detail}

      if (!this.activeWayspot) {
        this.activeWayspot = detail.title
        this.updateActive()
      }
    })

    this.el.sceneEl.addEventListener('updatedDistance', ({detail}) => {
      this.wayspotInfo[detail.title] = {...detail}

      if (detail.title !== this.activeWayspot) {
        return
      }

      this.updateActive()

      if (detail.distance < 20) {
        // entered inner geofence
        this.startBtn.removeAttribute('disabled')
      }
    })

    this.el.sceneEl.addEventListener('wayspotClicked', ({detail}) => {
    
      console.log('wayspotClicked'+JSON.stringify(detail))
       
      this.activeWayspot = detail.title
      this.updateActive()
    })

    this.el.sceneEl.addEventListener('exitedGeofence', ({detail}) => {
      delete this.wayspotInfo[detail.title]

      if (this.activeWayspot === detail.title) {
        const remainingWayspots = Object.values(this.wayspotInfo)
        if (!remainingWayspots.length) {
          this.activeWayspot = null
          this.updateActive()
        } else {
          remainingWayspots.sort((a, b) => a.distance - b.distance)
          this.activeWayspot = remainingWayspots[0].title
          this.updateActive()
        }
      }
    })
  },
  updateActive() {
    console.log('updateActive')
    if (this.activeWayspot === null) {
      this.uiSection.classList.remove('slide-up')
      this.uiSection.classList.add('slide-down')
      return
    }
    this.uiSection.classList.remove('slide-down')
    this.uiSection.classList.add('slide-up')

    const current = this.wayspotInfo[this.activeWayspot]

    if (current.distance < 30) {
      this.startBtn.removeAttribute('disabled')
    } else {
      this.startBtn.setAttribute('disabled', '')
    }
    this.wayspotDistance.textContent = `${current.distance.toFixed(0)}m`
    this.wayspotTitle.textContent =
            current.title.length >= 43
              ? `${current.title.slice(0, 43)}...`
              : current.title
  },
  swapScene() {
   console.log('swapScene')
    const startAr = new CustomEvent('startar', {detail: this.wayspotInfo[this.activeWayspot]})
    this.activeWayspot = null    
    window.dispatchEvent(startAr)
  },
}

// const loadWayspots = async () => {
// console.log('loadWayspots')
// }



export {
  customWayspotComponent,
  customWayspotPrimitive,
  focusedWayspotComponent,
  // loadWayspots,
}
