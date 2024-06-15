//navigator.clipboard.writeText("bruh");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.01, 80);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const skyboxLoader = new THREE.CubeTextureLoader();
skyboxLoader.setPath('assets/images/skybox/');

const skybox = skyboxLoader.load([
  'Front-min.png', 'Back-min.png',
  'Top-min.png', 'Bottom-min.png',
  'Left-min.png', 'Right-min.png'
]);

scene.background = skybox;

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0); // Set light position
scene.add(directionalLight);

// Add axes helper for debugging
const axesHelper = new THREE.AxesHelper(0.5);
axesHelper.renderOrder = 9999999;
axesHelper.material.depthTest = false;
axesHelper.visible = false;
scene.add(axesHelper);

var tempAxes = {
  x: 0,
  y: 0,
  z: 0,
  xs: 1,
  ys: 1,
  zs: 1
}

const lineAxes = 0.5;
const lineAxesWidth = 0.05;
const planeAxes = 0.15;

var clickAxes = {
  x: new THREE.Mesh(
    new THREE.PlaneGeometry(lineAxes, lineAxesWidth),
    new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      color: 0xcc0000,
      transparent: true,
      renderOrder: 9999999,
      opacity: 0.4
    })
  ),
  y: new THREE.Mesh(
    new THREE.PlaneGeometry(lineAxesWidth, lineAxes),
    new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      color: 0x00cc00,
      transparent: true,
      opacity: 0.4
    })
  ),
  z: new THREE.Mesh(
    new THREE.PlaneGeometry(lineAxes, lineAxesWidth),
    new THREE.MeshBasicMaterial({
      side: THREE.FrontSide,
      color: 0x0000cc,
      transparent: true,
      opacity: 0.4
    })
  ),
  xz: new THREE.Mesh(
    new THREE.PlaneGeometry(planeAxes, planeAxes),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0xcc00cc,
      transparent: true,
      opacity: 0.4
    })
  ),
  yz: new THREE.Mesh(
    new THREE.PlaneGeometry(planeAxes, planeAxes),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0x00cccc,
      transparent: true,
      opacity: 0.4
    })
  ),
  yx: new THREE.Mesh(
    new THREE.PlaneGeometry(planeAxes, planeAxes),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: 0xcccc00,
      transparent: true,
      opacity: 0.4
    })
  ),
};

clickAxes.x.visible = false;
clickAxes.y.visible = false;
clickAxes.z.visible = false;
clickAxes.xz.visible = false;
clickAxes.yz.visible = false;
clickAxes.yx.visible = false;

clickAxes.x.material.depthTest = false;
clickAxes.y.material.depthTest = false;
clickAxes.z.material.depthTest = false;
clickAxes.xz.material.depthTest = false;
clickAxes.yz.material.depthTest = false;
clickAxes.yx.material.depthTest = false;

clickAxes.xz.rotation.set(Math.PI / 2, 0, 0);
clickAxes.yz.rotation.set(0, Math.PI / 2, 0);
clickAxes.yx.rotation.set(0, 0, Math.PI / 2);

scene.add(clickAxes.x);
scene.add(clickAxes.y);
scene.add(clickAxes.z);
scene.add(clickAxes.xz);
scene.add(clickAxes.yz);
scene.add(clickAxes.yx);

// Add grid helper for debugging
const gridHelper = new THREE.GridHelper(100, 100);
gridHelper.position.set(.5, -.5, .5);
scene.add(gridHelper);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
sunLight.position.set(30, 100, 16);
//sunLight.castShadow = true;
scene.add(sunLight);
scene.add(sunLight.target);
sunLight.target.position.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

var placementPreview = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.8 }));
scene.add(placementPreview);

var placementPlane = new THREE.Mesh(new THREE.PlaneGeometry(80.5, 80.5), new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  color: 0xcccccc, // Adjust color as needed
  transparent: true,
  opacity: 0.4 // Adjust opacity as needed (0 = fully transparent, 1 = fully opaque)
}));

placementPlane.visible = false;

scene.add(placementPlane);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

var blocks = [];
let fileInput;

var camspeed = 0.0061;
var snap = 1;
var hudMenu = 1;

/*
Menus

1 - Main
2 - texture menu
*/

var camMode = false;
var environment = 1;
var lighting = 0;
var blocks = [];
var images = {};
var gameTimer = 0; // just goes up over time, used for sine functions

var mouse = {
  l: false,
  r: false,
  m: true
}

var player = {
  x: 0,
  y: 0,
  z: 0,
  r: 0,
  t: 0,
  block: { selected: -1, facing: false },
  mode: "Place",
  axes: {selected: "none", button: "none"}
};

var selectCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x222222 }));
selectCube.visible = false;
selectCube.transparent = true;

var lolImage;
var imageList = ["marker","grass", "stone", "orange", "gray", "log", "brick", "smoothstone"] // remember to add it here

function preload() {

  // any images are added to the build menu automatically for conviencence. Frankly, I don't know why you wouldn't want that besides for like the star or smthn

  // loop through each image file
  for (let i = 0; i < imageList.length; i++) {
    // load the image and add it to the images array (i think it might be brokey)
    let imagePath = 'assets/images/' + imageList[i] + '.png';
    let img = loadImage(imagePath);
    console.log(imagePath);
    images[imageList[i]] = { name: imageList[i], img: img };
  }
}

function setup() {
  var cnv = createCanvas(window.innerWidth, window.innerHeight);
  fileInput = createFileInput(loadMap);
  fileInput.hide();
  cnv.position(0, 0);
  pixelDensity(1);
  noSmooth();
  frameRate(9999999);
}

function draw() {

  if (deltaTime > 60) {
    deltaTime = 60;
  }

  gameTimer += deltaTime * 0.002;

  scene.remove(selectCube);
  if (player.block.selected != -1) {
    selectCube = new THREE.Mesh(new THREE.BoxGeometry(blocks[player.block.selected].dx + 0.01, blocks[player.block.selected].dy + 0.01, blocks[player.block.selected].dz + 0.01), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    selectCube.position.set(blocks[player.block.selected].x, blocks[player.block.selected].y, blocks[player.block.selected].z);
    scene.add(selectCube);
    selectCube.visible = true;
    selectCube.material.transparent = true;
    selectCube.material.opacity = (Math.sin(gameTimer) * 0.2) + 0.2;
  }

  if (keyIsDown(16)) {
    player.y -= deltaTime * camspeed;
  }
  if (keyIsDown(32)) {
    player.y += deltaTime * camspeed;
  }

  //W A S D
  if (keyIsDown(87)) {
    player.z -= Math.cos(player.r) * deltaTime * camspeed;
    player.x -= Math.sin(player.r) * deltaTime * camspeed;
  }
  if (keyIsDown(65)) {
    player.z -= Math.cos(player.r + (PI * 0.5)) * deltaTime * camspeed;
    player.x -= Math.sin(player.r + (PI * 0.5)) * deltaTime * camspeed;
  }
  if (keyIsDown(83)) {
    player.z -= Math.cos(player.r + (PI * 1)) * deltaTime * camspeed;
    player.x -= Math.sin(player.r + (PI * 1)) * deltaTime * camspeed;
  }
  if (keyIsDown(68)) {
    player.z -= Math.cos(player.r + (PI * 1.5)) * deltaTime * camspeed;
    player.x -= Math.sin(player.r + (PI * 1.5)) * deltaTime * camspeed;
  }

  camera.rotateX(-player.t);
  camera.rotateY(-player.r);

  let rotateCam = 0;
  let tiltCam = 0;
  if (mouse.r) {
    rotateCam = (round(-movedX, 4) * 0.003);
    tiltCam = (round(movedY, 4) * 0.003);
  }

  player.r += (rotateCam * deltaTime) / 8;
  player.t -= (tiltCam * deltaTime) / 8;

  if (player.t >= 1.45) {
    player.t = 1.45;
  } else if (player.t <= -1.45) {
    player.t = -1.45;
  }

  if (player.r > Math.PI) {
    player.r -= Math.PI * 2;
  } else if (player.r < -Math.PI) {
    player.r += Math.PI * 2;
  }
  camera.rotateY(player.r);
  camera.rotateX(player.t);

  let distToAxesHelper = dist(axesHelper.position.x, axesHelper.position.y, axesHelper.position.z, player.x, player.y, player.z);
  axesHelper.scale.set(distToAxesHelper * Math.sign(player.x - axesHelper.position.x), distToAxesHelper * Math.sign(player.y - axesHelper.position.y), distToAxesHelper * Math.sign(player.z - axesHelper.position.z));

  clickAxes.x.position.set(axesHelper.position.x + (((lineAxes/2) * distToAxesHelper) * Math.sign(player.x - axesHelper.position.x)), axesHelper.position.y, axesHelper.position.z);
  clickAxes.y.position.set(axesHelper.position.x, axesHelper.position.y + (((lineAxes/2) * distToAxesHelper) * Math.sign(player.y - axesHelper.position.y)), axesHelper.position.z);
  clickAxes.z.position.set(axesHelper.position.x, axesHelper.position.y, axesHelper.position.z + (((lineAxes/2) * distToAxesHelper) * Math.sign(player.z - axesHelper.position.z)));

  clickAxes.x.scale.set(distToAxesHelper, distToAxesHelper, distToAxesHelper);
  clickAxes.y.scale.set(distToAxesHelper, distToAxesHelper, distToAxesHelper);
  clickAxes.z.scale.set(distToAxesHelper, distToAxesHelper, distToAxesHelper);
  
  clickAxes.xz.scale.set(distToAxesHelper, distToAxesHelper, distToAxesHelper);
  clickAxes.yz.scale.set(distToAxesHelper, distToAxesHelper, distToAxesHelper);
  clickAxes.yx.scale.set(distToAxesHelper, distToAxesHelper, distToAxesHelper);

  clickAxes.xz.position.set(axesHelper.position.x + (((planeAxes/2) * distToAxesHelper) * Math.sign(player.x - axesHelper.position.x)), axesHelper.position.y, axesHelper.position.z + (((planeAxes/2) * distToAxesHelper) * Math.sign(player.z - axesHelper.position.z)));
  clickAxes.yz.position.set(axesHelper.position.x, axesHelper.position.y + (((planeAxes/2) * distToAxesHelper) * Math.sign(player.y - axesHelper.position.y)), axesHelper.position.z + (((planeAxes/2) * distToAxesHelper) * Math.sign(player.z - axesHelper.position.z)));
  clickAxes.yx.position.set(axesHelper.position.x + (((planeAxes/2) * distToAxesHelper) * Math.sign(player.x - axesHelper.position.x)), axesHelper.position.y + (((planeAxes/2) * distToAxesHelper) * Math.sign(player.y - axesHelper.position.y)), axesHelper.position.z);

  clickAxes.y.rotation.set(0, Math.atan2(axesHelper.position.x - player.x, axesHelper.position.z - player.z) + Math.PI, 0);
  clickAxes.x.rotation.set(Math.atan2(axesHelper.position.z - player.z, axesHelper.position.y - player.y)+(Math.PI/2), 0, 0);
  clickAxes.z.rotation.set(0, Math.PI/2, 0);
  clickAxes.z.rotateX(Math.atan2(axesHelper.position.x - player.x, axesHelper.position.y - player.y)+(Math.PI/2));

  if(player.axes.button === "left"){
    if(player.mode === "Move"){
      
      let planeRay = raycastPlane();
      if(planeRay.length > 0){
        switch(player.axes.selected){
          case "x":
            blocks[player.block.selected].x = Math.round((planeRay[0].point.x - tempAxes.x)*2)*0.5;
            break;
          case "y":
            blocks[player.block.selected].y = Math.round((planeRay[0].point.y - tempAxes.y)*2)*0.5;
            break;
          case "z":
            blocks[player.block.selected].z = Math.round((planeRay[0].point.z - tempAxes.z)*2)*0.5;
            break;
          case "xz":
            blocks[player.block.selected].x = Math.round((planeRay[0].point.x - tempAxes.x)*2)*0.5;
            blocks[player.block.selected].z = Math.round((planeRay[0].point.z - tempAxes.z)*2)*0.5;
            break;
          case "yz":
            blocks[player.block.selected].y = Math.round((planeRay[0].point.y - tempAxes.y)*2)*0.5;
            blocks[player.block.selected].z = Math.round((planeRay[0].point.z - tempAxes.z)*2)*0.5;
            break;
          case "yx":
            blocks[player.block.selected].y = Math.round((planeRay[0].point.y - tempAxes.y)*2)*0.5;
            blocks[player.block.selected].x = Math.round((planeRay[0].point.x - tempAxes.x)*2)*0.5;
            break;
        }
        blocks[player.block.selected].cube.position.set(blocks[player.block.selected].x, blocks[player.block.selected].y, blocks[player.block.selected].z);
      }
    
    } else if(player.mode === "Scale"){
      let remake = false;
      let other;
      let other2;
      let temp = {
        x: blocks[player.block.selected].x,
        y: blocks[player.block.selected].y,
        z: blocks[player.block.selected].z
      }
      let planeRay = raycastPlane();
      if(planeRay.length > 0){
        if(keyIsDown(18)){
          switch(player.axes.selected){
            case "x":
              blocks[player.block.selected].dx = Math.round(Math.abs(planeRay[0].point.x - tempAxes.x)*2);
              remake = true;
              break;
            case "y":
              blocks[player.block.selected].dy = Math.round(Math.abs(planeRay[0].point.y - tempAxes.y)*2);
              remake = true;
              break;
            case "z":
              blocks[player.block.selected].dz = Math.round(Math.abs(planeRay[0].point.z - tempAxes.z)*2);
              remake = true;
              break;
            case "xz":
              blocks[player.block.selected].dx = Math.round(Math.abs(planeRay[0].point.x - tempAxes.x)*2);
              blocks[player.block.selected].dz = Math.round(Math.abs(planeRay[0].point.z - tempAxes.z)*2);
              remake = true;
              break;
            case "yz":
              blocks[player.block.selected].dy = Math.round(Math.abs(planeRay[0].point.y - tempAxes.y)*2);
              blocks[player.block.selected].dz = Math.round(Math.abs(planeRay[0].point.z - tempAxes.z)*2);
              remake = true;
              break;
            case "yx":
              blocks[player.block.selected].dy = Math.round(Math.abs(planeRay[0].point.y - tempAxes.y)*2);
              blocks[player.block.selected].dx = Math.round(Math.abs(planeRay[0].point.x - tempAxes.x)*2);
              remake = true;
              break;
          }
        } else {
          switch(player.axes.selected){
            case "x":
              other = blocks[player.block.selected].x - ((blocks[player.block.selected].dx/2) * tempAxes.xs);
              other2 = Math.round(planeRay[0].point.x - tempAxes.x-0.5)+0.5;
              blocks[player.block.selected].x = other + (((other2-other) * tempAxes.xs)/2) * tempAxes.xs;
              blocks[player.block.selected].dx = Math.abs(other2-other);
              break;
            case "y":
              other = blocks[player.block.selected].y - ((blocks[player.block.selected].dy/2) * tempAxes.ys);
              other2 = Math.round(planeRay[0].point.y - tempAxes.y-0.5)+0.5;
              blocks[player.block.selected].y = other + (((other2-other) * tempAxes.ys)/2) * tempAxes.ys;
              blocks[player.block.selected].dy = Math.abs(other2-other);
              break;
            case "z":
              other = blocks[player.block.selected].z - ((blocks[player.block.selected].dz/2) * tempAxes.zs);
              other2 = Math.round(planeRay[0].point.z - tempAxes.y-0.5)+0.5;
              blocks[player.block.selected].z = other + (((other2-other) * tempAxes.zs)/2) * tempAxes.zs;
              blocks[player.block.selected].dz = Math.abs(other2-other);
              break;
            case "xz":
              other = blocks[player.block.selected].x - ((blocks[player.block.selected].dx/2) * tempAxes.xs);
              other2 = Math.round(planeRay[0].point.x - tempAxes.x-0.5)+0.5;
              blocks[player.block.selected].x = other + (((other2-other) * tempAxes.xs)/2) * tempAxes.xs;
              blocks[player.block.selected].dx = Math.abs(other2-other);

              other = blocks[player.block.selected].z - ((blocks[player.block.selected].dz/2) * tempAxes.zs);
              other2 = Math.round(planeRay[0].point.z - tempAxes.y-0.5)+0.5;
              blocks[player.block.selected].z = other + (((other2-other) * tempAxes.zs)/2) * tempAxes.zs;
              blocks[player.block.selected].dz = Math.abs(other2-other);
              break;
            case "yz":
              other = blocks[player.block.selected].y - ((blocks[player.block.selected].dy/2) * tempAxes.ys);
              other2 = Math.round(planeRay[0].point.y - tempAxes.y-0.5)+0.5;
              blocks[player.block.selected].y = other + (((other2-other) * tempAxes.ys)/2) * tempAxes.ys;
              blocks[player.block.selected].dy = Math.abs(other2-other);

              other = blocks[player.block.selected].z - ((blocks[player.block.selected].dz/2) * tempAxes.zs);
              other2 = Math.round(planeRay[0].point.z - tempAxes.y-0.5)+0.5;
              blocks[player.block.selected].z = other + (((other2-other) * tempAxes.zs)/2) * tempAxes.zs;
              blocks[player.block.selected].dz = Math.abs(other2-other);
              break;
            case "yx":
              other = blocks[player.block.selected].y - ((blocks[player.block.selected].dy/2) * tempAxes.ys);
              other2 = Math.round(planeRay[0].point.y - tempAxes.y-0.5)+0.5;
              blocks[player.block.selected].y = other + (((other2-other) * tempAxes.ys)/2) * tempAxes.ys;
              blocks[player.block.selected].dy = Math.abs(other2-other);

              other = blocks[player.block.selected].x - ((blocks[player.block.selected].dx/2) * tempAxes.xs);
              other2 = Math.round(planeRay[0].point.x - tempAxes.x-0.5)+0.5;
              blocks[player.block.selected].x = other + (((other2-other) * tempAxes.xs)/2) * tempAxes.xs;
              blocks[player.block.selected].dx = Math.abs(other2-other);
              break;
          }
        }
        //blocks[player.block.selected].cube.position.set(blocks[player.block.selected].x, blocks[player.block.selected].y, blocks[player.block.selected].z);
      }

      if(blocks[player.block.selected].x !== temp.x || blocks[player.block.selected].y !== temp.y || blocks[player.block.selected].z !== temp.z || remake){
        blocks[player.block.selected].remake();
      }
      
    }
  }

  camera.position.x = player.x;
  camera.position.y = player.y;
  camera.position.z = player.z;
  camera.aspect = window.innerWidth / window.innerHeight;

  //camera.far = 2000; shouldnt matter
  camera.updateProjectionMatrix();
  displayHud();
  raycast();
  try {
    axesHelper.position.set(blocks[player.block.selected].x, blocks[player.block.selected].y, blocks[player.block.selected].z);
  } catch (e) { }

}

function keyPressed() {
  switch (keyCode) {
    case 49:
      player.mode = "Place";
      placementPreview.visible = true;
      updateAxesVisibility();
      break;
    case 50:
      player.mode = "Move";
      placementPreview.visible = false;
      updateAxesVisibility();
      break;
    case 51:
      player.mode = "Scale";
      placementPreview.visible = false;
      updateAxesVisibility();
      break;
    case 52:
      player.mode = "View";
      placementPreview.visible = false;
      updateAxesVisibility();
      break;

    case 67://c - Placement Plane
      if(player.mode === "Place"){
        placementPlane.rotation.x = 0;
        placementPlane.rotation.y = 0;
        placementPlane.rotation.z = 0;
        let xpos = Math.abs(Math.sin(player.r) * Math.cos(player.t));
        let ypos = Math.abs(Math.sin(player.t));
        let zpos = Math.abs(Math.cos(player.r) * Math.cos(player.t));
        if (xpos >= ypos && xpos >= zpos) {
          placementPlane.rotation.y = Math.PI / 2;
        } else if (ypos >= xpos && ypos >= zpos) {
          placementPlane.rotation.x = Math.PI / 2;
        } else if (zpos >= ypos && zpos >= xpos) {
          //nothing, already aligned
        }
        placementPlane.position.x = placementPreview.position.x;
        placementPlane.position.y = placementPreview.position.y;
        placementPlane.position.z = placementPreview.position.z;
        placementPlane.visible = true;
      }
      break;

    case 69://e - Delete Block
      blocks[player.block.selected].remove();
      break;

    case 81://q - Texture Menu
      texMenu.open = !texMenu.open;
      break;

    case 86://v - Duplicate block
      if(player.block.selected != -1){
        blocks.push(new Block([blocks[player.block.selected].x, blocks[player.block.selected].y, blocks[player.block.selected].z], [blocks[player.block.selected].dx, blocks[player.block.selected].dy, blocks[player.block.selected].dz], blocks[player.block.selected].tex, blocks[player.block.selected].wrap, blocks[player.block.selected].data));
      }
      break;

    case 71://g - Align to grid
      if(player.block.selected != -1){
        blocks[player.block.selected].x = Math.round(blocks[player.block.selected].x*2)/2;
        blocks[player.block.selected].y = Math.round(blocks[player.block.selected].y*2)/2;
        blocks[player.block.selected].z = Math.round(blocks[player.block.selected].z*2)/2;
        blocks[player.block.selected].dx = Math.round(blocks[player.block.selected].dx);
        blocks[player.block.selected].dy = Math.round(blocks[player.block.selected].dy);
        blocks[player.block.selected].dz = Math.round(blocks[player.block.selected].dz);
        blocks[player.block.selected].remake();
      }
      break;
      
    case 73://i - import map
      fileInput.elt.click();
      break;
      
    case 80://p - export
      map = compile(blocks); // THIS WILL BREAK IT WITH ALL OUR PROGRAMS, BUT IS NECESSARY SO WE DONT DDOS EVERYONE WHO COMES ONTO WEBSITE. WORKING ON DECOMPILER
      saveJSON(map, "bad", true) // 'true' makes it compressed. a readable-r version would be 'false'
      break;

    case 70://f - Direct Edit Menu
      manualMenu.open = true;
      manualMenu.pos = [mouseX, mouseY];

  }
}

function keyReleased() {
  switch (keyCode) {
    case 67://c - placement plane
      if(player.mode === "Place"){
        placementPlane.visible = false;
      }
      break
    case 70: //f - manual value edit
      manualMenu.open = false;
      let tempPrompt;
      if (player.block.selected != -1) {
        let t1 = mouseX - manualMenu.pos[0];
        let t2 = mouseY - manualMenu.pos[1];
        if (t1 > -140 && t2 > -80 && t1 < -60 && t2 < -40) {
          tempPrompt = prompt("X coordinate", blocks[player.block.selected].x);
          if(tempPrompt != null){
            blocks[player.block.selected].x = parseInt(tempPrompt);
          }
        }
        if (t1 > -40 && t2 > -90 && t1 < 40 && t2 < -50) {
          tempPrompt = prompt("Y coordinate", blocks[player.block.selected].y);
          if(tempPrompt != null){
            blocks[player.block.selected].y = parseInt(tempPrompt);
          }
        }
        if (t1 > 60 && t2 > -80 && t1 < 140 && t2 < -40) {
          tempPrompt = prompt("Z coordinate", blocks[player.block.selected].z);
          if(tempPrompt != null){
            blocks[player.block.selected].z = parseInt(tempPrompt);
          }
        }

        if (t1 > -140 && t2 > 40 && t1 < -60 && t2 < 80) {
          tempPrompt = prompt("X size", blocks[player.block.selected].dx);
          if(tempPrompt != null){
            blocks[player.block.selected].dx = parseInt(tempPrompt);
          }
        }
        if (t1 > -40 && t2 > 50 && t1 < 40 && t2 < 90) {
          tempPrompt = prompt("Y size", blocks[player.block.selected].dy);
          if(tempPrompt != null){
            blocks[player.block.selected].dy = parseInt(tempPrompt);
          }
        }
        if (t1 > 60 && t2 > 40 && t1 < 140 && t2 < 80) {
          tempPrompt = prompt("Z size", blocks[player.block.selected].dz);
          if(tempPrompt != null){
            blocks[player.block.selected].dz = parseInt(tempPrompt);
          }
        }
        
        if (t1 > -150 && t2 > -20 && t1 < -70 && t2 < 20) {
          tempPrompt = prompt("Text data", blocks[player.block.selected].data);
          if(tempPrompt != null){
            blocks[player.block.selected].data = tempPrompt;
          }
        }
        if (t1 > 70 && t2 > -20 && t1 < 150 && t2 < 20) {
          tempPrompt = prompt("Texture\n" + imageList, blocks[player.block.selected].tex);
          if(tempPrompt != null){
            blocks[player.block.selected].tex = tempPrompt;
          }
        }

        blocks[player.block.selected].remake();
      }

  }
}

function placeBlock([x, y, z], [dx, dy, dz], tex, wrap) {
  //explanation of the
  if (!isBlockAt(x, y, z)) {
    blocks.push(new Block([x, y, z], [dx, dy, dz], texMenu.selectionName, wrap));
  }
}

function isBlockAt(x, y, z) {

  for (let i = 0; i < blocks.length; i++) {
    if (round(x) == blocks[i].x && round(y) == blocks[i].y && round(z) == blocks[i].z && round(dx) == blocks[i].dx && round(dy) == blocks[i].dy && round(dz) == blocks[i].dz) {
      return true;
    }
  }
  return false;

}

function windowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function mouseWheel(event) {
  if (!texMenu.open) {
    camspeed += (-event.delta) * 0.000003;
    if (camspeed < 0.0001) {
      camspeed = 0.0001;
    }
  } else {
    texMenu.selection += Math.sign(event.delta);
    texMenu.selectionName = Object.keys(images)[texMenu.selection];
  }
}

document.addEventListener("mousedown", function(event) {
  if (event.button === 0) { // Left mouse button
    mouse.l = true;
    if (placementPlane.visible) {
      placementPlane.startPos = { x: placementPreview.position.x, y: placementPreview.position.y, z: placementPreview.position.z };
    }
    if(clickAxes.x.visible === true){
      let axesRay = raycastAxes();
      if(axesRay.hit != "none"){
        placementPlane.position.set(axesHelper.position.x, axesHelper.position.y, axesHelper.position.z);
        placementPlane.rotation.set(0, 0, 0);

        if(player.mode === "Move"){
          tempAxes.x = axesRay[axesRay.hit][0].point.x - blocks[player.block.selected].x;
          tempAxes.y = axesRay[axesRay.hit][0].point.y - blocks[player.block.selected].y;
          tempAxes.z = axesRay[axesRay.hit][0].point.z - blocks[player.block.selected].z;
        } else if(player.mode === "Scale"){
          tempAxes.x = (Math.abs(axesRay[axesRay.hit][0].point.x - blocks[player.block.selected].x) - (blocks[player.block.selected].dx/2)) * Math.sign(axesHelper.scale.x);
          tempAxes.y = (Math.abs(axesRay[axesRay.hit][0].point.y - blocks[player.block.selected].y) - (blocks[player.block.selected].dy/2)) * Math.sign(axesHelper.scale.y);
          tempAxes.z = (Math.abs(axesRay[axesRay.hit][0].point.z - blocks[player.block.selected].z) - (blocks[player.block.selected].dz/2)) * Math.sign(axesHelper.scale.z);
          tempAxes.xs = Math.sign(axesHelper.scale.x);
          tempAxes.ys = Math.sign(axesHelper.scale.y);
          tempAxes.zs = Math.sign(axesHelper.scale.z);
        }
        
        switch(axesRay.hit){
          case "x":
            placementPlane.rotation.set(Math.atan2(axesHelper.position.z - player.z, axesHelper.position.y - player.y)+(Math.PI/2), 0, 0);
            break;
          case "y":
            placementPlane.rotation.set(0, Math.atan2(axesHelper.position.x - player.x, axesHelper.position.z - player.z) + Math.PI, 0);
            break;
          case "z":
            placementPlane.rotation.set(0, Math.PI/2, 0);
            placementPlane.rotateX(Math.atan2(axesHelper.position.x - player.x, axesHelper.position.y - player.y)+(Math.PI/2));
            break;
          case "xz":
            placementPlane.rotation.set(Math.PI/2, 0, 0);
            break;
          case "yz":
            placementPlane.rotation.set(0, Math.PI/2, 0);
            break;
        }
        
        placementPlane.visible = false;
        player.axes.button = "left";
        player.axes.selected = axesRay.hit;
      }
    }
  }
  if (event.button === 2) { // Right mouse button
    mouse.r = true;
  }
  if (event.button == 1) {
    mouse.m = true;
  }
});

document.addEventListener("mouseup", function(event) {
  if (event.button === 0) { // Left mouse button
    mouse.l = false;
    switch (player.mode) {
      case "Place":
        if (texMenu.selection >= 0) {
          if (placementPlane.visible) {
            placeBlock([Math.min(placementPreview.position.x, placementPlane.startPos.x) + (Math.abs(placementPreview.position.x - placementPlane.startPos.x)) / 2, Math.min(placementPreview.position.y, placementPlane.startPos.y) + (Math.abs(placementPreview.position.y - placementPlane.startPos.y)) / 2, Math.min(placementPreview.position.z, placementPlane.startPos.z) + (Math.abs(placementPreview.position.z - placementPlane.startPos.z)) / 2], [Math.abs(placementPreview.position.x - placementPlane.startPos.x) + 1, Math.abs(placementPreview.position.y - placementPlane.startPos.y) + 1, Math.abs(placementPreview.position.z - placementPlane.startPos.z) + 1], "grass", 1);
          } else {
            placeBlock([placementPreview.position.x, placementPreview.position.y, placementPreview.position.z], [1, 1, 1], "grass", 1);
          }
        }
        break;
      case "Move":
        if(player.axes.selected === "none"){
          player.block.selected = raycast();
          updateAxesVisibility();
        }
        break;
      case "Scale":
        if(player.axes.selected === "none"){
          player.block.selected = raycast();
          updateAxesVisibility();
        }
        break;
      case "View":
        if(player.axes.selected === "none"){
          player.block.selected = raycast();
          updateAxesVisibility();
        }
        break;
    }
    if(player.axes.button === "left"){
      player.axes.selected = "none";
      player.axes.button = "none";
      placementPlane.visible = false;
    }

  }
  if (event.button === 2) { // Right mouse button
    mouse.r = false;
  }
  if (event.button == 1) {
    if(player.axes.selected === "none"){
      player.block.selected = raycast();
      updateAxesVisibility();
    }
    if(player.axes.button === "middle"){
      player.axes.selected = "none";
    }
    mouse.m = false;
  }
});

function updateAxesVisibility() {
  if (player.block.selected != -1 && player.mode != "Place" && player.mode != "View") {
    //axesHelper.visible = true;
    clickAxes.x.visible = true;
    clickAxes.y.visible = true;
    clickAxes.z.visible = true;
    clickAxes.xz.visible = true;
    clickAxes.yz.visible = true;
    clickAxes.yx.visible = true;
  } else {
    //axesHelper.visible = false;
    clickAxes.x.visible = false;
    clickAxes.y.visible = false;
    clickAxes.z.visible = false;
    clickAxes.xz.visible = false;
    clickAxes.yz.visible = false;
    clickAxes.yx.visible = false;
  }
}

function compile(data) {
  let compiledData = {blocks:[],markers:[]};
  for (let i = 0; i < data.length; i++) {
    let block = JSON.parse(JSON.stringify(data[i]));
    let texTemp = block.tex;

    delete block.cube;

    if(texTemp != "marker"){
      block = [block.x, block.dx, block.y, block.dy, block.z, block.dz, block.tex, block.wrap,block.data];
    } else {
      block = [block.x, block.y, block.z, block.data];
    }

    delete block.x;
    delete block.y;
    delete block.z;
    delete block.dx;
    delete block.dy;
    delete block.dz;
    delete block.wrap;
    delete block.tex;
    if(texTemp != "marker"){
      compiledData.blocks.push(block);
    } else {
      compiledData.markers.push(block);
    }
    console.log(`Compiled ${i + 1}/${data.length}`);
  };

  return compiledData;
  //[[x,dx,y,dy,z,dz,wrap,first 2 letters of tex],[...],[...]]
}

function loadMap(file){
  for(let b=0; b<file.data.blocks.length; b++){
    blocks.push(new Block([file.data.blocks[b][0],file.data.blocks[b][2],file.data.blocks[b][4]],[file.data.blocks[b][1],file.data.blocks[b][3],file.data.blocks[b][5]],file.data.blocks[b][6], file.data.blocks[b][7],file.data.blocks[b][8]));
  }
  for(let m=0; m<file.data.markers.length; m++){
    blocks.push(new Block([file.data.markers[m][0],file.data.markers[m][1],file.data.markers[m][2]], [1, 1, 1], "marker", 1,file.data.markers[m][3]));
  }
}

// asks if they are sure they want to leave if there is more then one block
window.addEventListener('beforeunload', function(event) {
  if (blocks.length > 0) {
    event.returnValue = 'Unsaved changes will be lost!';
  }
});