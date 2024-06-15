class Block{
  constructor([x,y,z],[dx,dy,dz],tex,wrap,data){
    this.x = x;
    this.y = y;
    this.z = z;
    this.dx = dx;
    this.dy = dy;
    this.dz = dz;
    this.tex = tex;
    this.wrap = wrap;
    if(tex === "marker"){
      this.data = "markerplier";
    } else if (data != null) {
      this.data = data;
    } else {
      this.data = "";
    }

    //i make geo, mat and texture
    let geometry = new THREE.BoxGeometry(this.dx, this.dy, this.dz);
    let material = [];
    let texture;
    
    for(let f=0; f<6; f++){
      texture = new THREE.TextureLoader().load(`assets/images/${this.tex}.png`);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      if(f === 0 || f === 1){
        texture.repeat.set( (this.dz / this.wrap), (this.dy / this.wrap) );
      }
      if(f === 2 || f === 3){
        texture.repeat.set( (this.dx / this.wrap), (this.dz / this.wrap) );
      }
      if(f === 4 || f === 5){
        texture.repeat.set( (this.dx / this.wrap), (this.dy / this.wrap) );
      }
      
      material.push(new THREE.MeshStandardMaterial( { map: texture, side: THREE.DoubleSide, shadowSide:THREE.FrontSide} ));
    }

    //i make a mesh with the geo and mat
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.castShadow = true;
    this.cube.receiveShadow = true;
    
    this.cube.position.x = this.x;
    this.cube.position.y = this.y;
    this.cube.position.z = this.z;

    this.cube.userData = {
      index: blocks.length,
    }

    //i add the mesh to scene
    scene.add(this.cube);

    //texture material and geometry have stuff in memory still even tho they will be deleted by js
    //so i still have to dispose of them :skull:

    //aka this

    for(let m=0; m<6; m++){
      material[m].dispose();
    }
    texture.dispose();
    geometry.dispose();
    
  }

  update(property, value){
    let remake = false;
    switch(property){
      case "x":
        this.x += value;
        this.cube.position.x = value;
        break;
      case "y":
        this.y += value;
        this.cube.position.y = value;
        break;
      case "z":
        this.z += value;
        this.cube.position.z = value;
        break;
      case "dx":
        this.dx += value;
        remake = true;
        break;
      case "dy":
        this.dy += value;
        remake = true;
        break;
      case "dz":
        this.dz += value;
        remake = true;
        break;
      case "tex":
        this.tex += Math.sign(value);
        remake = true;
        break;
      case "wrap":
        this.wrap += value;
        remake = true;
        break;
    }
    if(this.wrap < 0.25){
      this.wrap = 0.25;
    }
    this.x = round(this.x,2);
    this.y = round(this.y,2);
    this.z = round(this.z,2);
    this.dx = round(this.dx,2);
    this.dy = round(this.dy,2);
    this.dz = round(this.dz,2);
    
    this.cube.position.x = this.x;
    this.cube.position.y = this.y;
    this.cube.position.z = this.z;

    if(remake){
      scene.remove(this.cube);
      
      let geometry = new THREE.BoxGeometry(this.dx, this.dy, this.dz);
      let material = [];
      let texture;
    
      for(let f=0; f<6; f++){
        texture = new THREE.TextureLoader().load(`assets/images/${this.tex}.png`);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        if(f === 0 || f === 1){
          texture.repeat.set( (this.dz / this.wrap), (this.dy / this.wrap) );
        }
        if(f === 2 || f === 3){
          texture.repeat.set( (this.dx / this.wrap), (this.dz / this.wrap) );
        }
        if(f === 4 || f === 5){
          texture.repeat.set( (this.dx / this.wrap), (this.dy / this.wrap) );
        }
      
        material.push(new THREE.MeshStandardMaterial( { map: texture } ));
      }

      this.cube = new THREE.Mesh(geometry, material);
      //this.cube.castShadow = true;
      //this.cube.receiveShadow = true;
      
      this.cube.position.x = this.x;
      this.cube.position.y = this.y;
      this.cube.position.z = this.z;
    
      scene.add(this.cube);
    }
  }

  remake(){
      scene.remove(this.cube);
      
      let geometry = new THREE.BoxGeometry(this.dx, this.dy, this.dz);
      let material = [];
      let texture;
    
      for(let f=0; f<6; f++){
        texture = new THREE.TextureLoader().load(`assets/images/${this.tex}.png`);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        if(f === 0 || f === 1){
          texture.repeat.set( (this.dz / this.wrap), (this.dy / this.wrap) );
        }
        if(f === 2 || f === 3){
          texture.repeat.set( (this.dx / this.wrap), (this.dz / this.wrap) );
        }
        if(f === 4 || f === 5){
          texture.repeat.set( (this.dx / this.wrap), (this.dy / this.wrap) );
        }
      
        material.push(new THREE.MeshStandardMaterial( { map: texture } ));
      }

      this.cube = new THREE.Mesh(geometry, material);
      //this.cube.castShadow = true;
      //this.cube.receiveShadow = true;
      
      this.cube.position.x = this.x;
      this.cube.position.y = this.y;
      this.cube.position.z = this.z;
    
      scene.add(this.cube);
  }

  remove(){
    scene.remove(this.cube);
    this.cube.geometry.dispose();
    if (this.cube.material instanceof THREE.Material) {
        this.cube.material.dispose();
    } else if (Array.isArray(this.cube.material)) {
        this.cube.material.forEach(material => material.dispose());
    }
    delete this.cube;
    blocks.splice(blocks.indexOf(this),1);
    player.block = {selected: -1, facing: false}
  }
  
}