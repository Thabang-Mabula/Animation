import { displayModelOnWebpage, ModelDisplayer } from './modelLoader.js'

var modelDisplayArea = $('.model-area')
var modelFileName = 'character.glb'

// displayModelOnWebpage(modelFileName, modelDisplayArea)
//   .then((model, mixer) => {
//     playAnimation(model, mixer, 0)
//   }).catch((err) => {
//     console.error(err)
//   })
$(document).ready(async function () {
  let modelDisplayer = new ModelDisplayer(modelFileName, modelDisplayArea)
  await modelDisplayer.displayModelOnWebpage(modelFileName, modelDisplayArea)

  modelDisplayer.playAnimation(0)
  console.log(modelDisplayer.displayMotionRegions())
  function animate () {
    requestAnimationFrame(animate)
    modelDisplayer.animate()
  }

  animate()
})

$('body').mousemove(function (event) {
  console.log('Mouse moved')
})
