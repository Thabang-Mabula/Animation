class CursorObject {
  constructor () {
    this._model = {}
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
}

export { CursorObject }
