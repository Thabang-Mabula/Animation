class CursorObject {
  constructor () {
    this._model = {}
  }

  loadCursorObjectToScene (filename, scene) {
    var loader = new THREE.GLTFLoader()
    return new Promise((resolve, reject) => {
      loader.load('../models/' + filename, gltf => {
        let model = gltf.scene
        model.scale.set(3, 3, 3)

        const box = new THREE.Box3().setFromObject(model)
        this._center = box.getCenter(new THREE.Vector3())

        model.position.x += (model.position.x - this._center.x)
        model.position.y += (model.position.y - this._center.y)
        model.position.z += (model.position.z - this._center.z)

        model.traverse(function (child) {
          if (child.isMesh) {
            child.material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0xfcba03) })
          }
        })

        this._model = model
        scene.add(this._model)
        resolve(gltf)
      }, undefined, function (error) {
        console.error(error)
        reject(error)
      })
    })
  }

  setCursorPosition (mousePos, camera, renderer) {
    const canvas = renderer.domElement
    let normalisedPoint = {}
    normalisedPoint.x = (mousePos.x - 0.5 * (canvas.width / window.devicePixelRatio)) / (0.5 * (canvas.width / window.devicePixelRatio))
    normalisedPoint.y = -(mousePos.y - 0.5 * (canvas.height / window.devicePixelRatio)) / (0.5 * (canvas.height / window.devicePixelRatio))
    camera.updateMatrixWorld()
    var vector = new THREE.Vector3(normalisedPoint.x, normalisedPoint.y, -1)
    vector.unproject(camera)
    var dir = vector.sub(camera.position).normalize()
    var distance = -camera.position.z / dir.z
    var pos = camera.position.clone().add(dir.multiplyScalar(distance))
    // let pos = new THREE.Vector3(normalisedPoint.x, normalisedPoint.y, 0.5).unproject(camera)
    this._model.position.x = pos.x
    this._model.position.y = pos.y
  }
}

export { CursorObject }
