import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  Color,
  AmbientLight,
  PointLight,
  Vector3,
  Box3
} from './three.module.js'

import { Model } from './modelClass.js'

// Global reference to the loaded model so that other functions can manipulate it
var modelObj = new Model()

/**
 * Configures user interaction and manipualtion of the view of the scene
 * @param {THREE.PerspectiveCamera} camera The main camera of the renderer
 * @param {THREE.PointLight} pointLight The main point light used to create shadow 3D effect when viewing model
 */
let enableOrbitalControls = (camera, pointLight) => {
  var controls = new THREE.OrbitControls(camera, document.querySelector('body'))
  controls.enableZoom = true
  controls.addEventListener('change', () => {
    pointLight.position.copy(camera.position)
  })

  return controls
}

/**
 * Re-adjusts the camera and render size automatically whenever the browser window size is adjusted
 * @param {THREE.PerspectiveCamera} camera The main camera of the renderer
 * @param {THREE.WebGLRenderer} renderer The main webGL renderer
 */
let enableResizeAdjust = (camera, renderer) => {
  window.addEventListener('resize', () => {
    let width = window.innerWidth
    let height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  })
}

/**
   * Retrieves a specified .glb or .gltf file and renders it to the screen
   * @param {string} filename The name of the file with the extension (e.g. '3DModel.glb')
   * @param {THREE.PerspectiveCamera} camera The main camera of the renderer
   */
let getModel = async (filename, camera) => {
  var loader = new THREE.GLTF2Loader()

  loader.load('./models/' + filename, gltf => {
    let model = gltf.scene
    model.scale.set(2, 2, 2)

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3()).length()
    const center = box.getCenter(new THREE.Vector3())

    model.position.x += (model.position.x - center.x)
    model.position.y += (model.position.y - center.y)
    model.position.z += (model.position.z - center.z)

    camera.near = size / 100
    camera.far = size * 100
    camera.updateProjectionMatrix()

    return Promise.resolve(model)
    // return model
  }, undefined, function (error) {
    console.error(error)
  })
}

/**
 * Creates and returns a pre-configured perspective camera
 * @returns {THREE.PerspectiveCamera}
 */
let createCamera = () => {
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(100, 100, 100)
  camera.lookAt(new Vector3(0, 0, 0))
  return camera
}

/**
 * Creates and returns a pre-configured webGL renderer
 * @returns {THREE.WebGLRenderer}
 */
let createRenderer = () => {
  let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  return renderer
}

/**
 * Function used to configure a webpage to display a specified 3D Model
 * @param {string} filename The name of the file with the extension (e.g. '3DModel.glb')
 */
let displayModelOnWebpage = (filename, displayDOMElement) => {
  return new Promise((resolve, reject) => {
    $(document).ready(async function () {
      const scene = new Scene()

      const camera = createCamera()
      const renderer = createRenderer()
      enableResizeAdjust(camera, renderer)
      displayDOMElement.append(renderer.domElement)

      // Add ambient lighting
      var ambientLight = new AmbientLight(0xffffff, 0.2)
      scene.add(ambientLight)

      // Add point light
      var pointLight = new PointLight(0xababab, 1)
      pointLight.position.set(1000, 1000, 0)
      scene.add(pointLight)

      // Add the model
      var loader = new THREE.GLTFLoader()

      let loaderPromise = new Promise((resolve, reject) => {
        loader.load('./models/' + filename, gltf => {
          let model = gltf.scene
          // model.scale.set(1, 1, 2)

          const box = new THREE.Box3().setFromObject(model)
          const size = box.getSize(new THREE.Vector3()).length()
          const center = box.getCenter(new THREE.Vector3())

          model.position.x += (model.position.x - center.x)
          model.position.y += (model.position.y - center.y)
          model.position.z += (model.position.z - center.z)

          camera.near = size / 100
          camera.far = size * 100
          camera.updateProjectionMatrix()

          model.lookAt(camera.position)

          scene.add(model)
          resolve(gltf)
        }, undefined, function (error) {
          console.error(error)
          reject(error)
        })
      })

      var mixer
      loaderPromise.then((model) => {
        let mixer = new THREE.AnimationMixer(model.scene)
        // var action = mixer.clipAction(model.animations[0])
        // action.setLoop(THREE.LoopOnce)
        // action.play()
        animate()
        resolve(model, mixer)
      }).catch((err) => {
        console.error(err)
        reject(err)
      })

      var clock = new THREE.Clock()

      function animate () {
        requestAnimationFrame(animate)
        // modelObj.updateModel(scene, camera)
        renderer.render(scene, camera)
        let delta = 0.75 * clock.getDelta()
        mixer.update(delta)
      }
    })
  })
}

function playAnimation (model, mixer, index) {
  mixer = new THREE.AnimationMixer(model.scene)
  var action = mixer.clipAction(model.animations[index])
  action.setLoop(THREE.LoopOnce)
  action.play()
}

class ModelDisplayer {
  constructor (modelFileName, displayDOMElement) {
    this._clock = new THREE.Clock()
    this._mixer = {}
    this._model = {}
    this._scene = new Scene()
    this._camera = createCamera()
    this._renderer = createRenderer()
    this._enableResizeAdjust()
    this._center = {}
  }

  playAnimation (index) {
    var action = this._mixer.clipAction(this._model.animations[index])
    action.setLoop(THREE.LoopOnce)
    action.play()
  }

  displayModelOnWebpage (filename, displayDOMElement) {
    return new Promise((resolve, reject) => {
      displayDOMElement.append(this._renderer.domElement)

      // Add ambient lighting
      var ambientLight = new AmbientLight(0xffffff, 0.2)
      this._scene.add(ambientLight)

      // Add point light
      var pointLight = new PointLight(0xababab, 1)
      pointLight.position.set(1000, 1000, 0)
      this._scene.add(pointLight)

      // Add the model

      this._loadModelOntoScene(filename).then((model) => {
        this._model = model
        this._mixer = new THREE.AnimationMixer(model.scene)
        resolve(model)
      }).catch((err) => {
        console.error(err)
        reject(err)
      })
    })
  }

  getCentre () {
    return this._center
  }

  displayMotionRegions () {
    const TRIGGER_POINT_RADIUS = 10
    var geometry = new THREE.CircleGeometry(TRIGGER_POINT_RADIUS, 32)
    var material = new THREE.MeshBasicMaterial({ color: 0x3236a8 })
    material.transparent = true
    material.opacity = 0.5
    var circle3 = new THREE.Mesh(geometry, material)
    circle3.position.x = this.getCentre().x - 50
    circle3.position.y = this.getCentre().y + 10
    this._scene.add(circle3)

    var circle1 = new THREE.Mesh(geometry, material)
    circle1.position.x = this.getCentre().x - 5
    circle1.position.y = this.getCentre().y + 50
    this._scene.add(circle1)

    var circle2 = new THREE.Mesh(geometry, material)
    circle2.position.x = this.getCentre().x + 30
    circle2.position.y = this.getCentre().y + 50
    this._scene.add(circle2)

    var circle4 = new THREE.Mesh(geometry, material)
    circle4.position.x = this.getCentre().x + 60
    circle4.position.y = this.getCentre().y + 40
    this._scene.add(circle4)

    let arrayOfTriggerPointCircles = [circle1, circle2, circle3, circle4]
    let arrayOf2DPoints = []
    arrayOfTriggerPointCircles.forEach((circle) => {
      let point = {
        center: this._get2DCoordinatesOf3DPoint(circle.position.x, circle.position.y, circle.position.z),
        top: this._get2DCoordinatesOf3DPoint(circle.position.x + TRIGGER_POINT_RADIUS / 2, circle.position.y, circle.position.z)
      }

      arrayOf2DPoints.push(point)
    })

    return arrayOf2DPoints
  }

  _get2DCoordinatesOf3DPoint (x, y, z) {
    const vector = new THREE.Vector3(x, y, z)
    const canvas = this._renderer.domElement

    this._camera.updateMatrixWorld()
    vector.project(this._camera)

    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio))
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio))

    return { x: vector.x, y: vector.y }
  }

  _loadModelOntoScene (filename) {
    var loader = new THREE.GLTFLoader()

    return new Promise((resolve, reject) => {
      loader.load('./models/' + filename, gltf => {
        let model = gltf.scene
        // model.scale.set(1, 1, 2)

        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3()).length()
        this._center = box.getCenter(new THREE.Vector3())

        model.position.x += (model.position.x - this._center.x)
        model.position.y += (model.position.y - this._center.y)
        model.position.z += (model.position.z - this._center.z)

        this._camera.near = size / 100
        this._camera.far = size * 100
        this._camera.updateProjectionMatrix()

        model.lookAt(this._camera.position)

        this._scene.add(model)
        resolve(gltf)
      }, undefined, function (error) {
        console.error(error)
        reject(error)
      })
    })
  }

  animate () {
    // requestAnimationFrame(this._animate)
    let delta = 0.75 * this._clock.getDelta()
    this._mixer.update(delta)
    this._renderer.render(this._scene, this._camera)
  }

  _enableResizeAdjust () {
    window.addEventListener('resize', () => {
      let width = window.innerWidth
      let height = window.innerHeight
      this._renderer.setSize(width, height)
      this._camera.aspect = width / height
      this._camera.updateProjectionMatrix()
    })
  }
}

// /**
//  * This code is merely put here as an example o how the "displayModelOnWebpage" function should be used.
//  * If this function is imported and used in another Javascript file, the line of code below must be deleted.
//  */
// displayModelOnWebpage('exported (2).glb')

/**
   * This function is exported to allow other client-side JavaScript files to import
   * the function and use it to configure the page for displaing a 3D Model (.glb or .gltf)
   */
export { displayModelOnWebpage, ModelDisplayer }
