const themeBuilderComponent = {
  init() {
    console.log('themeBuilderComponent')
    // custom theme materials
    const landMat = document.getElementById('land-mat')
    const buildingMat = document.getElementById('building-mat')
    const parkMat = document.getElementById('park-mat')
    const parkingMat = document.getElementById('parking-mat')
    const roadMat = document.getElementById('road-mat')
    const transitMat = document.getElementById('transit-mat')
    const sandMat = document.getElementById('sand-mat')
    const waterMat = document.getElementById('water-mat')

    // UI
    const colorInput = document.getElementById('color-input')
    const colorLabel = document.getElementById('color-label')
    const featureShow = document.getElementById('feature-show')
    const nextFeature = document.getElementById('next-feature-btn')
    const prevFeature = document.getElementById('prev-feature-btn')
    const featureUpdate = document.getElementById('feature-update')
    const featureTitle = document.getElementById('feature-title')
    const startArBtn = document.getElementById('start-btn')
    const codeBtn = document.getElementById('code-btn')
    const shareBtn = document.getElementById('share-btn')

    // scene elements
    const scene = this.el.sceneEl
    const outerSky = document.getElementById('outer-sky')

    // url parameter values
    const featArr = [landMat, buildingMat, parkMat, parkingMat,
      roadMat, transitMat, sandMat, waterMat, 'sky', 'fog', 'wayspot', 0, 0, 0, 0, 0, 0]

    // feature types
    const features = ['land', 'building', 'park', 'parking', 'road',
      'transit', 'sand', 'water', 'sky', 'fog', 'wayspot']
    let curFeature = 0
    let selectedFeature
    let featureString

    // controls which feature is currently customizable (i.e. land, building, etc)
    const switchFeature = (feature) => {
      this.selectedFeature = feature
      featureString = feature
      // conditional UI if selected feature also has non-color parameters (i.e. road width, etc)
      switch (feature) {
        case 'building':
        case 'road':
        case 'transit':
        case 'water':
        case 'sky':
        case 'fog':
          featureUpdate.style.display = 'block'
          featureShow.style.opacity = 1
          if (feature === 'fog') {
            featureUpdate.max = 0.1
            featureUpdate.step = 0.001
            featureShow.style.opacity = 0
          } else if (feature === 'sky') {
            featureUpdate.max = 2
            featureUpdate.step = 0.1
            featureShow.style.opacity = 0
          } else {
            featureUpdate.max = 20
            featureUpdate.step = 1
            featureShow.style.opacity = 1
          }
          break
        case 'wayspot':
          featureUpdate.style.display = 'none'
          featureShow.style.opacity = 0
          break
        default:
          featureUpdate.style.display = 'none'
          featureShow.style.opacity = 1
      }
      this.selectedFeature = document.getElementById(`${feature}-mat`)

      // update color and parameter UI to match currently configured values
      switch (feature) {
        case 'road':
          colorInput.value = this.selectedFeature.components.material.data.color
          featureUpdate.value = this.el.components['lightship-map'].data[`${featureString}-m-meters`]
          break
        case 'sky':
          colorInput.value = outerSky.components.material.data.topColor
          featureUpdate.value = outerSky.components.material.data.exponent
          break
        case 'fog':
          colorInput.value = scene.components.fog.data.color
          featureUpdate.value = scene.components.fog.data.density
          break
        case 'wayspot':
          colorInput.value = document.querySelector('.orb').components.material.data.color
          break
        default:
          colorInput.value = this.selectedFeature.components.material.data.color
          featureUpdate.value = this.el.components['lightship-map'].data[`${featureString}-meters`]
      }

      featureShow.checked = this.el.components['lightship-map'].data[`${featureString}-material`]
      colorLabel.textContent = colorInput.value  // update hex code to current color
      featureTitle.innerText = feature  // update feature title to selected feature
    }

    switchFeature(features[0]) // runs on page load
    scene.addEventListener('wayspotAdded', (e) => {
      // sets "Start AR" button color based on wayspot color when page loads
      startArBtn.style.backgroundColor = e.detail.color
    })

    // change colors based on user input
    const updateColor = (event) => {
      switch (featureString) {
        case 'wayspot':
          this.el.emit('themeSwitched', {color: event.target.value})
          startArBtn.style.backgroundColor = event.target.value
          break
        case 'sky':
          // sky updates
          outerSky.setAttribute('material', `topColor: ${event.target.value}`)
          break
        case 'fog':
          // fog updates
          scene.setAttribute('fog', `color: ${event.target.value}`)
          outerSky.setAttribute('material', `bottomColor: ${event.target.value}`)
          break
        default:
          this.selectedFeature.setAttribute('material', `color: ${event.target.value}`)
      }
      colorLabel.textContent = event.target.value
    }

    // import theme styling from URL parameters if available
    const setThemeFromParams = (params) => {
      const values = params.split(',')
      for (let i = 0; i < featArr.length; i++) {
        if (i <= 7) {
        // feature colors
          featArr[i].setAttribute('material', `color: ${values[i]}`)
          colorInput.value = this.selectedFeature.components.material.data.color
          colorLabel.textContent = values[i]
        }

        if (i === 8) {
        // sky color
          outerSky.setAttribute('material', `topColor: ${values[i]}`)
          colorInput.value = this.selectedFeature.components.material.data.color
          colorLabel.textContent = values[i]
        }

        if (i === 9) {
        // fog color
          scene.setAttribute('fog', `color: ${values[i]}`)
          outerSky.setAttribute('material', `bottomColor: ${values[i]}`)
          colorInput.value = this.selectedFeature.components.material.data.color
          colorLabel.textContent = values[i]
        }

        if (i === 10) {
        // wayspot color
          this.el.emit('themeSwitched', {color: values[i]})
          colorInput.value = this.selectedFeature.components.material.data.color
          colorLabel.textContent = values[i]
        }

        if (i === 11) {
        // building meters
          this.el.setAttribute('building-meters', `${values[i]}`)
        }

        if (i === 12) {
        // road width
          this.el.setAttribute('road-s-meters', `${values[i]}`)
          this.el.setAttribute('road-m-meters', `${values[i]}`)
          this.el.setAttribute('road-l-meters', `${values[i]}`)
          this.el.setAttribute('road-xl-meters', `${values[i]}`)
        }

        if (i === 13) {
        // transit width
          this.el.setAttribute('transit-meters', `${values[i]}`)
        }

        if (i === 14) {
        // water width
          this.el.setAttribute('water-meters', `${values[i]}`)
        }

        if (i === 15) {
        // sky exponent
          outerSky.setAttribute('material', `exponent: ${values[i]}`)
        }

        if (i === 16) {
        // fog density
          scene.setAttribute('fog', `density: ${values[i]}`)
        }
      }
    }

    // get URL parameters
    const params = new URLSearchParams(document.location.search.substring(1)).get('theme')
    if (params !== null) {
      // if there are URL parameters, wait to set theme until after load
      scene.addEventListener('loading-dismissed', () => {
        setThemeFromParams(params)
      })
    }

    // toggle to show or hide feature
    const hideFeature = (event) => {
      if (!featureShow.checked) {
        this.el.setAttribute(`${featureString}-material`, '')
      } else {
        this.el.setAttribute(`${featureString}-material`, `#${featureString}-mat`)
      }
    }

    // change feature parameters based on user input
    const updateFeature = (event) => {
      switch (featureString) {
        case 'road':
          // road width updates
          this.el.setAttribute(`${featureString}-s-meters`, `${event.target.value}`)
          this.el.setAttribute(`${featureString}-m-meters`, `${event.target.value}`)
          this.el.setAttribute(`${featureString}-l-meters`, `${event.target.value}`)
          this.el.setAttribute(`${featureString}-xl-meters`, `${event.target.value}`)
          break
        case 'sky':
          // sky gradient exponent updates
          outerSky.setAttribute('material', `exponent: ${event.target.value}`)
          break
        case 'fog':
          // fog density updates
          scene.setAttribute('fog', `density: ${event.target.value}`)
          break
        default:
          // transit, water, building updates
          this.el.setAttribute(`${featureString}-meters`, `${event.target.value}`)
      }
    }

    // cycles to the next feature
    nextFeature.addEventListener('click', () => {
      curFeature === features.length - 1 ? curFeature = 0 : curFeature++
      switchFeature(features[curFeature % features.length])
    })

    // cycles to the previous feature
    prevFeature.addEventListener('click', () => {
      curFeature > 0 ? curFeature-- : curFeature = features.length - 1
      switchFeature(features[curFeature % features.length])
    })

    // color and feature parameter input listeners
    colorInput.addEventListener('input', updateColor, false)
    featureUpdate.addEventListener('change', updateFeature, false)
    featureShow.addEventListener('change', hideFeature, false)

    // copy code' and 'copy link' functionality
    const copyToClipboard = (e) => {
      const el = document.createElement('textarea')
      const curBtn = e.currentTarget.content
      const lightshipMapPrimitive = this.el.components['lightship-map']

      if (curBtn === 'code') { // if user clicked </> button
        el.value =
`<!-- PASTE INSIDE <A-SCENE> TAG -->
fog="color:${scene.components.fog.data.color};type:exponential;density:${scene.components.fog.data.density};"

<!-- PASTE JUST AFTER OPENING <A-SCENE> TAG -->
<a-entity id="land-mat" material="color:${landMat.components.material.data.color}"></a-entity>
<a-entity id="building-mat" material="color:${buildingMat.components.material.data.color};opacity:0.9;"></a-entity>
<a-entity id="park-mat" material="color:${parkMat.components.material.data.color}"></a-entity>
<a-entity id="parking-mat" material="color:${parkingMat.components.material.data.color}"></a-entity>
<a-entity id="road-mat" material="color:${roadMat.components.material.data.color}"></a-entity>
<a-entity id="transit-mat" material="color:${transitMat.components.material.data.color}"></a-entity>
<a-entity id="sand-mat" material="color:${sandMat.components.material.data.color}"></a-entity>
<a-entity id="water-mat" material="color:${waterMat.components.material.data.color}"></a-entity>

<!-- PASTE INSIDE <A-SKY ID="OUTER-SKY"> TAG -->
material="shader: lightship-map-sky-gradient; bottomColor:${outerSky.components.material.data.bottomColor}; 
topColor:${outerSky.components.material.data.topColor}; exponent: ${outerSky.components.material.data.exponent}"

<!-- PASTE INSIDE <LIGHTSHIP-MAP> TAG -->
building-meters="${lightshipMapPrimitive.data['building-meters']}"
road-s-meters="${lightshipMapPrimitive.data['road-s-meters']}"
road-m-meters="${lightshipMapPrimitive.data['road-m-meters']}"
road-l-meters="${lightshipMapPrimitive.data['road-l-meters']}"
road-xl-meters="${lightshipMapPrimitive.data['road-xl-meters']}"
transit-meters="${lightshipMapPrimitive.data['transit-meters']}"
water-meters="${lightshipMapPrimitive.data['water-meters']}"

land-material="#land-mat"
building-material="#building-mat"
park-material="#park-mat"
parking-material="#parking-mat"
road-material="#road-mat"
transit-material="#transit-mat"
sand-material="#sand-mat"
water-material="#water-mat"

<!-- SET ANYWAYSPOTCOLOR to ${document.querySelector('.orb').components.material.data.color}
     IN CUSTOM-WAYSPOT COMPONENT -->
`

        // show checkmark on click
        codeBtn.children[0].src = require('.././assets/theme-assets/check.svg')
        setTimeout(() => {
          codeBtn.children[0].src = require('.././assets/theme-assets/code.svg')
        }, 1500)
      }

      // if user clicked the 🔗 icon
      if (curBtn === 'share') {
        let url = 'https://8thwall.8thwall.app/maps-builder/?theme='

        for (let i = 0; i < featArr.length; i++) {
          if (i <= 7) {
          // feature colors
            url += `%23${featArr[i].components.material.data.color.slice(1)}`
          }

          if (i === 8) {
          // sky color
            url += `%23${outerSky.components.material.data.topColor.slice(1)}`
          }

          if (i === 9) {
          // fog color
            url += `%23${scene.components.fog.data.color.slice(1)}`
          }

          if (i === 10) {
          // wayspot color
            url += `%23${document.querySelector('.orb').components.material.data.color.slice(1)}`
          }

          if (i === 11) {
          // building meters
            url += `${lightshipMapPrimitive.data['building-meters']}`
          }

          if (i === 12) {
          // road width
            url += `${lightshipMapPrimitive.data['road-s-meters']}`
          }

          if (i === 13) {
          // transit width
            url += `${lightshipMapPrimitive.data['transit-meters']}`
          }

          if (i === 14) {
          // water width
            url += `${lightshipMapPrimitive.data['water-meters']}`
          }

          if (i === 15) {
          // sky exponent
            url += `${outerSky.components.material.data.exponent}`
          }

          if (i === 16) {
          // fog density
            url += `${scene.components.fog.data.density}`
          }

          if (i !== featArr.length - 1) {
          // remove last comma in array
            url += ','
          }
        }

        el.value = url

        // show checkmark on click
        shareBtn.children[0].src = require('.././assets/theme-assets/check.svg')
        setTimeout(() => {
          shareBtn.children[0].src = require('.././assets/theme-assets/link.svg')
        }, 1500)
      }

      document.body.appendChild(el)

      Object.assign(el.style, {
        zIndex: '-99999',
        position: 'absolute',
      })

      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        el.contentEditable = true
        el.readOnly = false
        const s = window.getSelection()
        s.removeAllRanges()

        const range = document.createRange()
        range.selectNodeContents(el)
        s.addRange(range)

        el.setSelectionRange(0, 999999)
      } else {
        el.select()
      }

      document.execCommand('copy')
      document.body.removeChild(el)
    }

    codeBtn.addEventListener('click', copyToClipboard)
    codeBtn.content = 'code'

    shareBtn.addEventListener('click', copyToClipboard)
    shareBtn.content = 'share'
  },
}

const mapLoadingScreenComponent = {
  init() {
    const scene = this.el.sceneEl
    const gradient = document.getElementById('gradient')
    const poweredby = document.getElementById('poweredby')

    const dismissLoadScreen = () => {
      setTimeout(() => {
        poweredby.classList.add('fade-out')
        gradient.classList.add('fade-out')
        this.el.emit('loading-dismissed')
      }, 1500)

      setTimeout(() => {
        poweredby.style.display = 'none'
        gradient.style.display = 'none'
      }, 2000)
    }

    const getPosition = function (options) {
      return new Promise(((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options)
      }))
    }

    getPosition()
      .then((position) => {
        scene.hasLoaded ? dismissLoadScreen() : scene.addEventListener('loaded', dismissLoadScreen)
      })
      .catch((err) => {
        console.error(err.message)
      })
  },
}

const mapDebugControlsComponent = {
  schema: {
    distance: {default: 0.0001},
  },
  init() {
    this.char = this.el.children[0]

    const handleKeyDown = (e) => {
      console.log('handleKeyDown')
      this.el.setAttribute('enable-gps', false)
      this.latlng = this.el.getAttribute('lat-lng')
      this.locArr = this.latlng.split(' ')

      if (e.key === 'ArrowUp' || e.key === 'w') {
        this.fwd = true
      }

      if (e.key === 'ArrowDown' || e.key === 's') {
        this.back = true
      }

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.left = true
      }

      if (e.key === 'ArrowRight' || e.key === 'd') {
        this.right = true
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        this.fwd = false
      }

      if (e.key === 'ArrowDown' || e.key === 's') {
        this.back = false
      }

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.left = false
      }

      if (e.key === 'ArrowRight' || e.key === 'd') {
        this.right = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  },
  tick() {
    // diagonal controls
    if (this.fwd && this.left) {  // NW
      const plusLat = parseFloat(this.locArr[0]) + this.data.distance
      const plusLng = parseFloat(this.locArr[1]) + this.data.distance
      this.el.setAttribute('lat-lng', `${plusLat} ${plusLng}`)
      if (this.char !== undefined) {
        this.char.setAttribute('rotation', '0 120 0')
      }
    }

    if (this.fwd && this.right) {  // NE
      const minusLat = parseFloat(this.locArr[0]) - this.data.distance
      const plusLng = parseFloat(this.locArr[1]) + this.data.distance
      this.el.setAttribute('lat-lng', `${minusLat} ${plusLng}`)
      if (this.char !== undefined) {
        this.char.setAttribute('rotation', '0 45 0')
      }
    }

    if (this.back && this.left) {  // SW
      const plusLat = parseFloat(this.locArr[0]) + this.data.distance
      const minusLng = parseFloat(this.locArr[1]) - this.data.distance
      this.el.setAttribute('lat-lng', `${plusLat} ${minusLng}`)
      if (this.char !== undefined) {
        this.char.setAttribute('rotation', '0 -120 0')
      }
    }

    if (this.back && this.right) {  // SE
      const minusLat = parseFloat(this.locArr[0]) - this.data.distance
      const minusLng = parseFloat(this.locArr[1]) - this.data.distance
      this.el.setAttribute('lat-lng', `${minusLat} ${minusLng}`)
      if (this.char !== undefined) {
        this.char.setAttribute('rotation', '0 -45 0')
      }
    }

    // cardinal controls
    if (this.fwd && !this.left && !this.right) {  // N
      const plusLng = parseFloat(this.locArr[1]) + this.data.distance
      this.el.setAttribute('lat-lng', `${this.locArr[0]} ${plusLng}`)
      if (this.char !== undefined) {
        this.char.setAttribute('rotation', '0 90 0')
      }
    }

    if (this.back && !this.left && !this.right) {  // S
      const minusLng = parseFloat(this.locArr[1]) - this.data.distance
      this.el.setAttribute('lat-lng', `${this.locArr[0]} ${minusLng}`)
      if (this.char !== undefined) {
        this.char.setAttribute('rotation', '0 -90 0')
      }
    }

    if (this.left && !this.fwd && !this.back) {  // E
      const plusLat = parseFloat(this.locArr[0]) + this.data.distance
      this.el.setAttribute('lat-lng', `${plusLat} ${this.locArr[1]}`)
      if (this.char !== undefined) {
        this.char.setAttribute('rotation', '0 180 0')
      }
    }

    if (this.right && !this.fwd && !this.back) {  // W
      const minusLat = parseFloat(this.locArr[0]) - this.data.distance
      this.el.setAttribute('lat-lng', `${minusLat} ${this.locArr[1]}`)
      if (this.char !== undefined) {
        this.char.setAttribute('rotation', '0 0 0')
      }
    }
  },
}
const testComponent = {

 init: function () {
   
    var box = document.querySelector('a-box[custom-test]');
    

    this.colorIndex = 0;
    this.colors = ['red', 'green', 'blue', 'yellow', 'purple'];
    this.changeColor = this.changeColor.bind(this);

    console.log('Color-changer component initialized');
    box.addEventListener('click', (event) => {
      console.log('Click event fired');
      this.changeColor();
    });
  },
  changeColor: function () {
    console.log('Changing color');
    const color = this.colors[this.colorIndex];
    this.el.setAttribute('material', 'color', color);
    this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    console.log('New color:', color);
  }
}

export {themeBuilderComponent, mapLoadingScreenComponent, mapDebugControlsComponent, testComponent}
