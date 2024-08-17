// Copyright (c) 2022 8th Wall, Inc.
//
// app.js is the main entry point for your 8th Wall app. Code here will execute after head.html
// is loaded, and before body.html is loaded.

import './main.css'

import {
  customWayspotComponent,   // wayspot visuals & behavior component
  customWayspotPrimitive,   // wayspot visuals & behavior primitive
  focusedWayspotComponent,  // logic handling which wayspot is selected
  loadWayspots,
} from './components/custom-wayspot'

import {detectMeshComponent} from './components/detect-mesh'

import {
  themeBuilderComponent,      // theme builder visuals & behavior
  mapDebugControlsComponent,  // move around the map with WASD controls
  mapLoadingScreenComponent,  // load screen that dismisses after map loads
  testComponent,
} from './components/theme-builder'

AFRAME.registerComponent('custom-test', testComponent)

AFRAME.registerComponent('custom-wayspot', customWayspotComponent)
AFRAME.registerPrimitive('custom-wayspot', customWayspotPrimitive)
AFRAME.registerComponent('focused-wayspot', focusedWayspotComponent)
// AFRAME.registerComponent('load-Wayspots', loadWayspots)

AFRAME.registerComponent('detect-mesh', detectMeshComponent)

AFRAME.registerComponent('theme-builder', themeBuilderComponent)
AFRAME.registerComponent('map-debug-controls', mapDebugControlsComponent)
AFRAME.registerComponent('map-loading-screen', mapLoadingScreenComponent)

// Load scene using URL params
// sample URL: https://workspace.8thwall.app/vps-beta/?scene=detect-mesh
const params = new URLSearchParams(document.location.search.substring(1))
const s = params.get('scene') ? params.get('scene') : 'theme-builder'
console.log("url=" + s)
document.body.insertAdjacentHTML('beforeend', require(`./scenes/${s}.html`))

// Load scene manually
// document.body.insertAdjacentHTML('beforeend', require('./scenes/detect-mesh.html'))

const swapBody = (newHtml) => {
  const scene = document.body.querySelector('a-scene')
  scene.parentElement.removeChild(scene)
  document.body.insertAdjacentHTML('beforeend', newHtml)
}

window.addEventListener('startar', ({detail}) => {
  swapBody(require('./scenes/detect-mesh.html'))
  window._startAR = detail
})

window.addEventListener('stopar', () => {
  swapBody(require('./scenes/theme-builder.html'))
})

// Check Location Permissions at beginning of session
const errorCallback = (error) => {
  if (error.code === error.PERMISSION_DENIED) {
    alert('LOCATION PERMISSIONS DENIED. PLEASE ALLOW AND TRY AGAIN.')
  }
}
navigator.geolocation.getCurrentPosition((pos) => {}, errorCallback)
