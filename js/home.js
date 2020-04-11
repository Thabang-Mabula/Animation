import { ModelDisplayer } from './modelLoader.js'

var modelDisplayArea = $('.model-area')
var modelFileName = 'character.glb'
var modelDisplayer = new ModelDisplayer(modelFileName, modelDisplayArea)

$(document).ready(async function () {
  await modelDisplayer.displayModelOnWebpage(modelFileName, modelDisplayArea)

  $('body').mousemove(function (event) {
    let mousePosition = { x: event.pageX, y: event.pageY }
    let triggerRegionPoints = modelDisplayer.getTriggerRegions()
    let activationRegion = modelDisplayer.getActivationRegion()
    let length = 4

    // Check first if the mouse is outside of the activationRegion
    // If so, play an animaiton to revert the character to its original position
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

  animate()
})

/**
 * Checks whether the mouse position is within the model's animation trigger regions
 * @param {Object} mousePosition Object containing the x and y coordinates of the mouse
 * @param {Object} triggerRegionKeyPoints Object containign the x and y coordinates of the trigger region's centre and top-most point
 * @returns {boolean} A boolean indicating whether the mouse is within the circular trigger region
 */
function isWithinTriggerRegion (mousePosition, triggerRegionKeyPoints) {
  let radius = euclidianDistance(triggerRegionKeyPoints.center, triggerRegionKeyPoints.top)
  let distanceFromMouseToCentre = euclidianDistance(triggerRegionKeyPoints.center, mousePosition)

  return distanceFromMouseToCentre <= radius
}

/**
 * Calcualtes the euclideanDistance between two points
 * @param {Object} p1 A two-dimentional point with an x and y coordinate
 * @param {Object} p2 A two-dimentional point with an x and y coordinate
 */
function euclidianDistance (p1, p2) {
  return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2))
}

/**
 * Start the main animation loop
 */
function animate () {
  requestAnimationFrame(animate)
  modelDisplayer.animate()
}
