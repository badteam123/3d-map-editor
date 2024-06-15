const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let a = 0;

function raycast() {

  pointer.x = (mouseX / window.innerWidth) * 2 - 1;
  pointer.y = - (mouseY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // Get intersections
  let intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length === 0) {
    return -1;
  }
  try {
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object === placementPreview || intersects[i].object === gridHelper || intersects[i].object === axesHelper) {
        intersects.shift();
      }
      let intersectionPoint = intersects[i].point;
      if (intersects[i].object == placementPlane && placementPlane.visible) {
        placementPreview.position.x = Math.round(intersectionPoint.x);
        placementPreview.position.y = Math.round(intersectionPoint.y);
        placementPreview.position.z = Math.round(intersectionPoint.z);
        return;
      }
      for (let b = 0; b < blocks.length; b++) {
        if (blocks[b].cube === intersects[i].object) {

          const backwardOffset = 0.8; // distance to move back
          const newPosition = {
            x: Math.round(intersectionPoint.x + intersects[i].face.normal.x * backwardOffset),
            y: Math.round(intersectionPoint.y + intersects[i].face.normal.y * backwardOffset),
            z: Math.round(intersectionPoint.z + intersects[i].face.normal.z * backwardOffset)
          };
  
          placementPreview.position.x = Math.round(newPosition.x);
          placementPreview.position.y = Math.round(newPosition.y);
          placementPreview.position.z = Math.round(newPosition.z);
          placementPreview.material.opacity = (((sin(a) + 1) * .5) * 0.5) + 0.3;
          placementPreview.renderOrder = 9999999;
          a += .01 * deltaTime / 5;

          return b;
        }
      }
    }
  } catch (e) {

  }
  return -1;
}

//##################################################
//##################################################
//##################################################
//##################################################

function raycastAxes() {

  pointer.x = (mouseX / window.innerWidth) * 2 - 1;
  pointer.y = - (mouseY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // Get intersections
  let intersectAxes = {
    x: raycaster.intersectObject(clickAxes.x, true),
    y: raycaster.intersectObject(clickAxes.y, true),
    z: raycaster.intersectObject(clickAxes.z, true),
    xz: raycaster.intersectObject(clickAxes.xz, true),
    yz: raycaster.intersectObject(clickAxes.yz, true),
    yx: raycaster.intersectObject(clickAxes.yx, true),
    hit: "none",
  }

  let closest = ["none", Number.POSITIVE_INFINITY];
  if(intersectAxes.x.length > 0){
    if(intersectAxes.x[0].distance < closest[1]){
      closest = ["x", intersectAxes.x[0].distance];
    }
  }
  if(intersectAxes.y.length > 0){
    if(intersectAxes.y[0].distance < closest[1]){
      closest = ["y", intersectAxes.y[0].distance];
    }
  }
  if(intersectAxes.z.length > 0){
    if(intersectAxes.z[0].distance < closest[1]){
      closest = ["z", intersectAxes.z[0].distance];
    }
  }
  intersectAxes.hit = closest[0];
  if(intersectAxes.xz.length > 0){
    intersectAxes.hit = "xz";
  }
  if(intersectAxes.yz.length > 0){
    intersectAxes.hit = "yz";
  }
  if(intersectAxes.yx.length > 0){
    intersectAxes.hit = "yx";
  }
  
  return intersectAxes;
  
}

function raycastPlane() {

  pointer.x = (mouseX / window.innerWidth) * 2 - 1;
  pointer.y = - (mouseY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  let intersect = raycaster.intersectObject(placementPlane, true);
  return intersect;

}