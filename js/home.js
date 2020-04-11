import { ModelDisplayer } from './modelLoader.js'

var modelDisplayArea = $('.model-area')
var modelFileName = 'character.glb'
var modelDisplayer = new ModelDisplayer(modelFileName, modelDisplayArea)

// displayModelOnWebpage(modelFileName, modelDisplayArea)
//   .then((model, mixer) => {
//     playAnimation(model, mixer, 0)
//   }).catch((err) => {
//     console.error(err)
//   })
$(document).ready(async function () {
  await modelDisplayer.displayModelOnWebpage(modelFileName, modelDisplayArea)
  // modelDisplayer.displayDeactivateCircle()
  // modelDisplayer.displayMotionRegions()
  // modelDisplayer.playAnimation(0)
  // console.log(modelDisplayer.displayMotionRegions())

  $('body').mousemove(function (event) {
    let mousePosition = { x: event.pageX, y: event.pageY }
    let triggerRegionPoints = modelDisplayer.getTriggerRegions()
    let activationRegion = modelDisplayer.getActivationRegion()
    let length = 4

    if (!isWithinTriggerRegion(mousePosition, activationRegion)) {
      modelDisplayer.revertToOriginalPosition()
    } else {
      for (let i = 0; i < length; i++) {
        if (isWithinTriggerRegion(mousePosition, triggerRegionPoints[i])) {
          modelDisplayer.playAnimation(i)
        }
      }
    }
  })

  $('#revert').click(() => {
    modelDisplayer.revertToOriginalPosition()
  })

  function animate () {
    requestAnimationFrame(animate)
    modelDisplayer.animate()
  }

  animate()
})

function isWithinTriggerRegion (mousePosition, triggerRegionKeyPoints) {
  let radius = euclidianDistance(triggerRegionKeyPoints.center, triggerRegionKeyPoints.top)
  let distanceFromMouseToCentre = euclidianDistance(triggerRegionKeyPoints.center, mousePosition)

  return distanceFromMouseToCentre <= radius
}

function euclidianDistance (p1, p2) {
  return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))
}
