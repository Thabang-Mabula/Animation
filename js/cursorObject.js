class CursorObject {
  constructor () {
    this._model = {}
    this._clock = new THREE.Clock()
    this._mixer = {}
    this._currentAction = {}
  }

  loadCursorObjectToScene (filename, scene) {
    var loader = new THREE.GLTFLoader()
    return new Promise((resolve, reject) => {
      loader.load('../models/' + filename, gltf => {
        let model = gltf.scene
        model.scale.set(1, 1, 1)

        const box = new THREE.Box3().setFromObject(model)
        this._center = box.getCenter(new THREE.Vector3())

        model.position.x += (model.position.x - this._center.x)
        model.position.y += (model.position.y - this._center.y)
        model.position.z += (model.position.z - this._center.z)

        // let plane = new THREE.Plane(new THREE.Vector3(-1, -1, -1), 100)
        // model.rotateOnAxis(plane, -Math.PI / 3)
        // model.rotateY(Math.PI / 1.5)
        // model.rotateZ(Math.PI / 4)
        // model.rotateX(-Math.PI / 3)
        // model.rotation.z += Math.PI / 2
        // model.rotation.z += Math.PI / 2

        this._model = model
        scene.add(this._model)
        this._mixer = new THREE.AnimationMixer(this._model)
        this._animations = gltf.animations

        // model.traverse(function (child) {
        //   if (child.isMesh) {
        //     child.material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0xfcba03), morphTargets: true })
        //   }
        // })
        resolve(gltf)
      }, undefined, function (error) {
        console.error(error)
        reject(error)
      })
    })
  }

  setCursorPosition (mousePos, camera, renderer) {
    const canvas = renderer.domElement
    let normalisedPoint = new THREE.Vector2()
    normalisedPoint.x = (mousePos.x / window.innerWidth) * 2 - 1
    normalisedPoint.y = -(mousePos.y / window.innerHeight) * 2 + 1
    camera.updateMatrixWorld()
    let raycaster = new THREE.Raycaster()
    let intersectPoint = new THREE.Vector3()
    raycaster.setFromCamera(normalisedPoint, camera)
    let plane = new THREE.Plane(new THREE.Vector3(-1, -1, -1), 100)
    raycaster.ray.intersectPlane(plane, intersectPoint)
    this._model.position.copy(intersectPoint.multiplyScalar(2))
  }

  playClickAnimation () {
    if (this._isActionPlayable()) {
      const INDEX_OF_CLICK_ANIMATION = 1

      let clip = this._animations[INDEX_OF_CLICK_ANIMATION]
      this._currentAction = this._mixer.clipAction(clip)
      this._currentAction.setLoop(THREE.LoopPingPong)
      // this._currentAction.clampWhenFinished = true
      this._currentAction.paused = false
      this._currentAction.enabled = true
      this._currentAction.timeScale = 1
      this._currentAction.play()
    }
  }

  playScrollAnimation () {
    if (this._isActionPlayable()) {
      const INDEX_OF_SCROLL_ANIMATION = 3
      let clip = this._animations[INDEX_OF_SCROLL_ANIMATION]
      this._currentAction = this._mixer.clipAction(clip)
      this._currentAction.setLoop(THREE.LoopPingPong)
      // this._currentAction.clampWhenFinished = true
      this._currentAction.paused = false
      this._currentAction.enabled = true
      this._currentAction.timeScale = 1
      this._currentAction.play()
    }
  }
  _isActionPlayable () {
    let shouldPlay = true
    return shouldPlay
  }

  animate () {
    let delta = this._clock.getDelta()
    this._mixer.update(delta)
  }
}

export { CursorObject }
