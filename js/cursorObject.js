class CursorObject {
  constructor () {
    this.model = {}
  }

  loadCursorObjectToScene (filename, scene) {
    var loader = new THREE.GLTFLoader()
    return new Promise((resolve, reject) => {
      loader.load('../models/' + filename, gltf => {
        let model = gltf.scene

        const box = new THREE.Box3().setFromObject(model)
        this._center = box.getCenter(new THREE.Vector3())

        model.position.x += (model.position.x - this._center.x)
        model.position.y += (model.position.y - this._center.y)
        model.position.z += (model.position.z - this._center.z)

        model.traverse(function (child) {
          if (child.isMesh) {
            // switch the material here - you'll need to take the settings from the
            // original material, or create your own new settings, something like:
            const oldMat = child.material

            child.material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0xfcba03) })
          }
        })

        scene.add(model)
        resolve(gltf)
      }, undefined, function (error) {
        console.error(error)
        reject(error)
      })
    })
  }
}

export { CursorObject }
