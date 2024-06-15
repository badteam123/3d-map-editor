const texMenu = {
  open: false,
  tab: 0,
  selection: 1,
  selectionName: "grass",
  dampen: 1,
  lerp: 0
};

const manualMenu = {
  open: false,
  pos: [0, 0]
};

function displayHud() {
  texMenu.lerp = lerp(texMenu.lerp, texMenu.selection, Math.min(deltaTime * 0.02, 1));

  clear();
  textLeading(16);
  let clr;

  // HUD Background
  clr = color(80);
  clr.setAlpha(180);
  fill(clr);
  noStroke();
  rect(0, window.innerHeight - 100, window.innerWidth, 100);

  // Editor Section
  fill(255);
  rect(0, window.innerHeight - 100, 290, 100);

  // Block Section
  fill(222, 171, 142);
  rect(window.innerWidth - 290, window.innerHeight - 100, 290, 100);

  // Text Color
  if (environment <= 1) {
    fill(0);
    stroke(0);
  } else {
    fill(255);
    stroke(255);
  }

  // Text Labels
  noStroke();

  textSize(16);
  textAlign(LEFT, BOTTOM);
  text("L-Mouse    Place\nM-Mouse    Select\nR-Mouse    Rotate\n\ni    Import map\np    Export map\n\nq    Textures\nc    P-Plane\nf    Manual Edit\ng    Align to grid (if brokey)\n\ne    Delete\n\n1    Place mode\n2    Move mode\n3    Size mode\n4    View mode", 8, window.innerHeight - 180);

  // Editor/Block Titles
  textSize(24);
  text("Editor Properties", 2, window.innerHeight - 100);
  textAlign(RIGHT, BOTTOM);
  text("Block Properties", window.innerWidth - 2, window.innerHeight - 100);
  textAlign(LEFT, BASELINE);

  // Player Position
  textSize(16);
  fill(0);
  text(`X: ${round(player.x, 3)}\nY: ${round(player.y, 3)}\nZ: ${round(player.z, 3)}`, 5, window.innerHeight - 80);

  // Camera Speed and Grid Snap
  text(`Speed: ${round(camspeed * 1000, 1)}\nGrid Snap: ${round(snap, 2)}u`, 5, window.innerHeight - 25);

  // Camera Zoom Controls
  textSize(12);
  textAlign(CENTER);
  text("Z-", 151, window.innerHeight - 85);
  text("Z+", 152, window.innerHeight - 5);
  text("X-", 107, window.innerHeight - 45);
  text("X+", 195, window.innerHeight - 45);
  text("Y+", 251, window.innerHeight - 85);
  text("Y-", 252, window.innerHeight - 5);

  // Block Properties
  textSize(32);
  textAlign(CENTER, CENTER);
  if (player.block.selected === -1) {
    text("No Block Selected", window.innerWidth - 290, window.innerHeight - 100, 290, 100);
  } else {
    // Block Details
    textSize(16);
    textLeading(15.9);
    textAlign(LEFT, BASELINE);
    text(`X: ${round(blocks[player.block.selected].x, 3)}\nY: ${round(blocks[player.block.selected].y, 3)}\nZ: ${round(blocks[player.block.selected].z, 3)}\nX Size: ${round(blocks[player.block.selected].dx, 3)}\nY Size: ${round(blocks[player.block.selected].dy, 3)}\nZ Size: ${round(blocks[player.block.selected].dz, 3)}`, window.innerWidth - 285, window.innerHeight - 85);

    // Texture and Data
    textAlign(RIGHT, TOP);
    textLeading(18);
    text(`Tex: ${blocks[player.block.selected].tex}\nWrap: ${blocks[player.block.selected].wrap}\nData: ${JSON.stringify(blocks[player.block.selected].data)}`, window.innerWidth - 5, window.innerHeight - 95);
  }

  // Camera Rotation Controls
  stroke(0);
  strokeWeight(1);
  line(120, window.innerHeight - 50, 180, window.innerHeight - 50);
  line(150, window.innerHeight - 80, 150, window.innerHeight - 20);
  circle(150, window.innerHeight - 50, 8);
  strokeWeight(2);
  line(150, window.innerHeight - 50, 150 + (-Math.sin(player.r) * 30), window.innerHeight - 50 + (-Math.cos(player.r) * 30));
  strokeWeight(1);
  circle(250, window.innerHeight - 50, 8);
  line(250, window.innerHeight - 50, 280, window.innerHeight - 50);
  line(250, window.innerHeight - 80, 250, window.innerHeight - 20);
  strokeWeight(2);
  line(250, window.innerHeight - 50, 250 + (Math.cos(player.t) * 30), window.innerHeight - 50 - (Math.sin(player.t) * 30));

  // Removed Commented-Out Code

  // Texture Menu
  textAlign(LEFT, CENTER);
  textSize(16);

  if (texMenu.open) {
    texMenu.dampen = lerp(texMenu.dampen, 0, 0.01 * deltaTime);
  } else {
    texMenu.dampen = lerp(texMenu.dampen, 1, 0.01 * deltaTime);
  }

  if (texMenu.dampen < 0.98) {
    translate(-(texMenu.dampen) * 320, 0);
    noStroke();
    clr = color(50, 50, 50, 200);
    fill(clr);
    rect(0, 0, 300, window.innerHeight);
    translate(0, ((height / 2) - 300));

    clr = color(50, 50, 50, 200);
    let i = 0;
    for (let img in images) {
      translate(0, -texMenu.lerp * 50);
      fill(clr);
      if (texMenu.selection == i) {
        fill(80, 150, 80);
      }
      rect(5, 5 + i * 50, 290, 40);
      fill(255);
      text(images[img].name, 15, 25 + i * 50);
      image(images[img].img, 250, 10 + i * 50, 30, 30);
      translate(0, texMenu.lerp * 50);
      i++;
    }
    translate(texMenu.dampen * 320, -((height / 2) - 300));
  }

  // Manual Edit Menu
  if (manualMenu.open) {
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(0);
    stroke(0);
    strokeWeight(2);
    if (player.block.selected != -1) {
      translate(manualMenu.pos[0], manualMenu.pos[1]);

      circle(0, 0, 10);

      fill(255);
      // X, Y, Z Edit Buttons
      rect(-140, -80, 80, 40);
      rect(-40, -90, 80, 40);
      rect(60, -80, 80, 40);

      // DX, DY, DZ Edit Buttons
      rect(-140, 80, 80, -40);
      rect(-40, 90, 80, -40);
      rect(60, 80, 80, -40);
      
      // Texture and Tags Buttons
      rect(70, -20, 80, 40);
      rect(-150, -20, 80, 40);

      fill(0);
      textSize(14);
      noStroke();
      // Button Labels
      text("X", -140, -80, 80, 40);
      text("Y", -40, -90, 80, 40);
      text("Z", 60, -80, 80, 40);

      text("DX", -140, 40, 80, 40);
      text("DY", -40, 50, 80, 40);
      text("DZ", 60, 40, 80, 40);

      text("Texture", 70, -20, 80, 40);
      text("Data", -150, -20, 80, 40);

      translate(-manualMenu.pos[0], -manualMenu.pos[1]);

      stroke(0);
      line(manualMenu.pos[0], manualMenu.pos[1], mouseX, mouseY);
    } else {
      noStroke();
      text("No Selection :(", manualMenu.pos[0], manualMenu.pos[1]);
    }
  }
  textAlign(CENTER, CENTER);
  textSize(30);
  switch(player.mode){
    case "Place":
      text("🧊",30,30);
      break;
    case "Move":
      text("🫱",30,30);
      break;
    case "Scale":
      text("🗚",30,30);
      break;
    case "View":
      text("👁️",30,30);
      break;
  }
}