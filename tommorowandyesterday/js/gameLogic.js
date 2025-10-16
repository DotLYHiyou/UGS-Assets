var scene = new THREE.Scene();
var tilesize = 64;
var movableFloor = false;
var spherePlayer = false;
var cameraHeight = -550;
var size = Math.min(window.innerWidth, window.innerHeight);
var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1800);

var renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("gamescreen"),
  antialias: true
});
renderer.setSize(size, size);
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);



//var material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
var material = new THREE.MeshPhongMaterial({
  color: 0x808080,
  emissive: 0x5C5C5C
});
var playerMaterial = new THREE.MeshPhongMaterial({
  color: 0x808080
});
var cylinderMaterial = new THREE.MeshPhongMaterial({
  color: 0x808080,
  emissive: 0x666666
});
//var floorMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, map: floortex });
var floorMaterial = new THREE.MeshPhongMaterial({
  color: 0x808080,
  emissive: 0x5C5C5C
});
var thingMaterial = new THREE.MeshPhongMaterial({
  color: 0x888888,
  emissive: 0x1F1F1F
});
camera.position.z = cameraHeight;
camera.rotateY(Math.PI);
camera.rotateZ(Math.PI);
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(0, .5, -1);

//scene.add(directionalLight);

requestAnimationFrame(render);
$(window).resize(onWindowResize);

function onWindowResize() {
  renderer.setPixelRatio(window.devicePixelRatio);
  var size = Math.min(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  if (typeof resizeHint == "function")
    resizeHint();
  if (typeof resizeMenu == "function")
    resizeMenu();
  camera.position.set(camera.position.x, camera.position.y, cameraHeight / Math.min(1, camera.aspect));
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.render(scene, camera);

}

window.addEventListener("orientationchange", onWindowResize);
$(window).resize();
var docCookies = {
  getItem: function(sKey) {
    if (!sKey || !this.hasItem(sKey)) {
      return null;
    }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },
  setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
      return;
    }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
  },
  removeItem: function(sKey, sPath) {
    if (!sKey || !this.hasItem(sKey)) {
      return;
    }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
  },
  hasItem: function(sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function() {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
      aKeys[nIdx] = unescape(aKeys[nIdx]);
    }
    return aKeys;
  }
};
var keyGeo;
(new THREE.JSONLoader).load("models/bigkey.json", function(g) {
  keyGeo = g;
  k('.key>makeMesh');
});
var lockGeo;
(new THREE.JSONLoader).load("models/lock.json", function(g) {
  lockGeo = g;
  k('.lock>makeMesh');
});
var delta = (new Date()).getTime();
var fps;
var nolag = true;

var size = 768;
var width = size;
var height = size;
var time = 0;
var key = [];
var keyLocked = [];
// var onLoad = false;
// var onStart = false;
var left = 37;
var up = 38;
var right = 39;
var down = 40;
var hist = [];
var level = [];
var hint = [];
var first = true;
var score = 0;
var startscore = 0;
var curlevel = -1;
var nolagc = 0;
var showfps = false;
var update = true;
var loading = true;
if (getUrlVars()['l']) {
  curlevel = parseInt(getUrlVars()['l']) - 2;
  hideMenu();
}
var clock = 1000;
var maxclock = 1000;
var colorI = 0;
var colorFalling = true;
var fade = 0;
var menu = true;
var sleeping = false;
var buttonon = [];
var buttonoff = [];
var timetravel = [];
var getkey = [];
var unlock = [];
var warpsnd = [];
var channels = 4;
var ending = "ogg";
var cookieLevel = -1;
if (docCookies.hasItem("level")) {
  cookieLevel = parseInt(docCookies.getItem("level"));
}
if (!(new Audio()).canPlayType('audio/ogg;')) {
  ending = "mp3"
}
for (var i = 0; i < channels; i++) {
  buttonon.push(new Audio("sounds/button." + ending));
  buttonoff.push(new Audio("sounds/buttonoff." + ending));
  timetravel.push(new Audio("sounds/timetravel2." + ending));
  getkey.push(new Audio("sounds/key2." + ending));
  unlock.push(new Audio("sounds/lock." + ending));
  warpsnd.push(new Audio("sounds/warp." + ending));
}
var bgmusic =
  new Audio("sounds/Perspectives." + ending);

var menulevel;
makeLevels();
var mergeGeo;
var mergeMesh;
var mergeThingGeo;
var mergeThingMesh;
var updateMerged = true;
//scene.add(mergeMesh);
var floorGeo,
  floorMesh,
  floorMeshes;
if (movableFloor) {
  floorMeshes = [];
  for (var x = 0; x < width; x += tilesize) {
    var col = []
    floorMeshes.push(col);
    for (var y = 0; y < height; y += tilesize) {
      floorGeo = new THREE.PlaneGeometry(tilesize, tilesize, 10, 10);
      floorGeo.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
      floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
      floorMesh.position.set(x - width / 2 + tilesize / 2, y - height / 2 + tilesize / 2, 0);
      scene.add(floorMesh);
      col.push(floorMesh);
    }
  }
} else {
  floorGeo = new THREE.PlaneGeometry(768, 768, 1, 1);
  floorGeo.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
  floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
  floorMesh.position.set(0, 0, 0);
  scene.add(floorMesh);
}
var ceilMesh;
(function() {
  var ceilMeshGeo = new THREE.Geometry();
  var ceilGeo = new THREE.PlaneGeometry(768 * 2, 768 * 2, 1, 1); //new THREE.CubeGeometry(64, 64, 40);
  ceilGeo.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI).multiply(new THREE.Matrix4().makeTranslation(0, 0, 64)));

  var m = new THREE.Mesh(ceilGeo, material);
  m.position.set(-768 - width / 2, -768 + height / 2, 0);
  mergeGeoMesh(ceilMeshGeo, m);
  var m = new THREE.Mesh(ceilGeo, material);
  m.position.set(768 - width / 2, -768 - height / 2, 0);
  mergeGeoMesh(ceilMeshGeo, m);
  var m = new THREE.Mesh(ceilGeo, material);
  m.position.set(768 + width / 2, 768 - height / 2, 0);
  mergeGeoMesh(ceilMeshGeo, m);
  var m = new THREE.Mesh(ceilGeo, material);
  m.position.set(-768 + width / 2, 768 + height / 2, 0);
  mergeGeoMesh(ceilMeshGeo, m);
  ceilMesh = new THREE.Mesh(ceilMeshGeo, material);
})();

function mergeGeoMesh(geo, mesh) {
  mesh.updateMatrix();
  geo.merge(mesh.geometry, mesh.matrix)
}
scene.add(ceilMesh);
// var startTextG = new THREE.TextGeometry("New Game", {
//     size: 64,
//     height: 3
// });
// var startText = new THREE.Mesh(startTextG, thingMaterial);
// startText.position.set(64 * 1 - width / 2, 64 * 2.5 - height / 2, -62.5);
// scene.add(startText);

// startText.rotateY(Math.PI);
// startText.rotateZ(Math.PI);


// var loadTextG = new THREE.TextGeometry("Continue", {
//     size: 64,
//     height: 3
// });
// var loadText = new THREE.Mesh(loadTextG, new THREE.MeshLambertMaterial(thingMaterial));
// loadText.position.set(64 * 5.4 - width / 2, 64 * 10.5 - height / 2, -62.5);
// scene.add(loadText);

// loadText.rotateY(Math.PI);
// loadText.rotateZ(Math.PI);
var lastUpdate = new Date().getTime();
var updateDelta = 1;

function render() {
  var now = new Date().getTime();
  updateDelta = Math.max(1, now - lastUpdate);
  lastUpdate = now;
  k('>update');

  requestAnimationFrame(render);

  renderer.render(scene, camera);

}
var timespeed = 1;

function Block(e) {
  k.merge(this, e);
  //THREE.GeometryUtils.merge()

  /*for (var i = 0; i < geometry.vertices.length; i++) {
   geometry.vertices[i].x += this.x - width / 2;
   geometry.vertices[i].y += this.y - height / 2;
   geometry.vertices[i].z += -700;
   }
   if (!blockGeo) {
   blockGeo = geometry;
   }
   else {
   THREE.GeometryUtils.merge(blockGeo, geometry);
   }*/
};
Block.prototype.makeMesh = function() {
  var geometry;
  var m;
  var z = 0;
  if (this.channel == -1) {
    geometry = new THREE.PlaneGeometry(64, 64); //new THREE.CubeGeometry(64, 64, 40);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI).multiply(new THREE.Matrix4().makeTranslation(0, 0, 64)));
    var left = true;
    var right = true;
    var up = true;
    var down = true;
    var me = this;
    k('.block.channel=' + -1, function(b) {
      if (me != b) {
        if (b.x + b.w == me.x && me.y == b.y) {
          left = false;
        }
        if (me.x + me.w == b.x && me.y == b.y) {
          right = false;
        }
        if (b.y + b.h == me.y && me.x == b.x) {
          down = false;
        }
        if (me.y + me.h == b.y && me.x == b.x) {
          up = false;
        }
      }
    });
    if (left) {
      var g = new THREE.PlaneGeometry(64, 64);
      var mat = new THREE.Matrix4().makeRotationY(-Math.PI / 2);
      g.applyMatrix(mat.multiply(new THREE.Matrix4().makeTranslation(-32, 0, 32)));
      geometry.merge(g);
    }

    if (right) {
      var g = new THREE.PlaneGeometry(64, 64);
      var mat = new THREE.Matrix4().makeRotationY(Math.PI / 2);
      g.applyMatrix(mat.multiply(new THREE.Matrix4().makeTranslation(32, 0, 32)));
      geometry.merge(g);
    }
    if (down) {
      var g = new THREE.PlaneGeometry(64, 64);
      var mat = new THREE.Matrix4().makeRotationX(Math.PI / 2);
      g.applyMatrix(mat.multiply(new THREE.Matrix4().makeTranslation(0, -32, 32)));
      geometry.merge(g);
    }
    if (up) {
      var g = new THREE.PlaneGeometry(64, 64);
      var mat = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      g.applyMatrix(mat.multiply(new THREE.Matrix4().makeTranslation(0, 32, 32)));
      geometry.merge(g);
    }

    m = new THREE.Mesh(geometry, material);
  } else {
    m = makePillarMesh(this);
    z = -30;
    this.z = z;
    this.minz = z;
    addPillarBase(this);
  }

  m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, z);

  if (this.channel == -1) {
    mergeGeoMesh(mergeGeo, m);
  } else {
    scene.add(m);
  }
  this.mesh = m;

};

function makePillarMesh(me) {
  var color = getColor(k('.button.channel=' + me.channel)[0].colorIndex | 0);
  var m = new THREE.Mesh(
    new THREE.CylinderGeometry(24, 24, 60, 25),
    new THREE.MeshPhongMaterial({
      color: color * 0xFF / 0xFF,
      emissive: color * 0x88 / 0xFF
    })
  );
  m.rotateX(Math.PI / 2);
  return m;
}

function addPillarBase(me) {
  var g2 = new THREE.CylinderGeometry(30, 27, 10, 25);
  var m2 = new THREE.Mesh(g2, thingMaterial);
  m2.position.set(me.x - width / 2 + 32, me.y - height / 2 + 32, -10);
  m2.rotateX(Math.PI / 2);
  scene.add(m2);
  if (!me.meshes)
    me.meshes = {}
  me.meshes.base = m2;
  return m2;
}
Block.prototype.x = 0;
Block.prototype.y = 0;
Block.prototype.z = 0;
Block.prototype.minz = 0;
Block.prototype.w = tilesize;
Block.prototype.h = tilesize;
Block.prototype.solid = true;
Block.prototype.tog = true;
Block.prototype.block = true;
Block.prototype.update = function() {
  var speed = 15 * updateDelta / 33;
  if (this.mesh && this.channel != -1) {
    //this.mesh.visible = this.solid;
    if (this.solid) {
      if (this.z > this.minz) {
        this.z -= speed;
      } else {
        this.z = this.minz;
      }
    } else {
      if (this.z < this.minz + 40) {
        this.z += speed;
      } else {
        this.z = this.minz + 40;
      }
    }
    this.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.z);
  }

};

function Tele(e) {
  k.merge(this, e);
};
Tele.prototype.x = 0;
Tele.prototype.y = 0;
Tele.prototype.w = tilesize;
Tele.prototype.channel = -1;
Tele.prototype.h = tilesize;
Tele.prototype.tele = true;
Tele.prototype.solid = false;
Tele.prototype.destx = -1;
Tele.prototype.desty = 0;

Tele.prototype.makeMesh = function() {
  var geometry;
  var m;
  geometry = new THREE.CubeGeometry(64, 5, 5);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -29.5, 0));
  for (var i = 0; i < 3; i++) {
    var g = new THREE.CubeGeometry(64 - i * 5 * 2 * 2, 5, 5);
    g.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10 * i - 29.5, 0));
    geometry.merge(g);


    var g = new THREE.CubeGeometry(64 - i * 5 * 2 * 2, 5, 5);
    g.applyMatrix(new THREE.Matrix4().makeTranslation(0, -10 * i + 29.5, 0));
    geometry.merge(g);



    var g = new THREE.CubeGeometry(5, 64 - i * 5 * 2 * 2, 5);
    g.applyMatrix(new THREE.Matrix4().makeTranslation(10 * i - 29.5, 0, 0));
    geometry.merge(g);


    var g = new THREE.CubeGeometry(5, 64 - i * 5 * 2 * 2, 5);
    g.applyMatrix(new THREE.Matrix4().makeTranslation(-10 * i + 29.5, 0, 0));
    geometry.merge(g);
  }

  i = 2;
  var g = new THREE.CubeGeometry(64 - i * 5 * 2 * 2, 5, 5);
  g.applyMatrix(new THREE.Matrix4().makeTranslation(this.destx - this.x, 10 * i - 29.5 + this.desty - this.y, 0));
  geometry.merge(g);


  var g = new THREE.CubeGeometry(64 - i * 5 * 2 * 2, 5, 5);
  g.applyMatrix(new THREE.Matrix4().makeTranslation(this.destx - this.x, -10 * i + 29.5 + this.desty - this.y, 0));
  geometry.merge(g);


  var g = new THREE.CubeGeometry(5, 64 - i * 5 * 2 * 2, 5);
  g.applyMatrix(new THREE.Matrix4().makeTranslation(10 * i - 29.5 + this.destx - this.x, this.desty - this.y, 0));
  geometry.merge(g);


  var g = new THREE.CubeGeometry(5, 64 - i * 5 * 2 * 2, 5);
  g.applyMatrix(new THREE.Matrix4().makeTranslation(-10 * i + 29.5 + this.destx - this.x, this.desty - this.y, 0));



  geometry.merge(g);
  m = new THREE.Mesh(geometry, thingMaterial);
  m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -2.5);
  //m.rotateZ(Math.PI / 4);
  scene.add(m);
  //    geometry.merge(g);
  this.mesh = m;
};
Tele.prototype.draw = function() {
  if (sleeping)
    return;

  ctx.lineWidth = 4;
  ctx.strokeStyle = black;
  ctx.strokeRect(this.x, this.y, this.w, this.h);
  ctx.lineWidth = 3;
  var count = 10;
  for (var i = 1; i < count / 2; i++) {
    ctx.strokeRect(this.x + i * this.w / count, this.y + i * this.h / count, this.w - 2 * i * this.w / count, this.h - 2 * i * this.h / count);
  }
  i = 4;
  ctx.strokeRect(this.destx + i * this.w / count, this.desty + i * this.h / count, this.w - 2 * i * this.w / count, this.h - 2 * i * this.h / count);

};

function Lock(e) {
  k.merge(this, e);
};
Lock.prototype.x = 0;
Lock.prototype.y = 0;
Lock.prototype.z = 0;
Lock.prototype.minz = 0;
Lock.prototype.w = tilesize;
Lock.prototype.channel = -1;
Lock.prototype.h = tilesize;
Lock.prototype.tog = true;
Lock.prototype.solid = true;
Lock.prototype.lock = true;
Lock.prototype.open = false;
Lock.prototype.time = 0;
Lock.prototype.opened = -1;
Lock.prototype.makeMesh = function() {
  if (this.mesh)
    removeMeshes(this);
  // var geometry;
  // var materials = [material, thingMaterial];

  // var m;
  // var h = 25;
  // if (this.channel == -1) {
  //     geometry = new THREE.CubeGeometry(64, 64, h*2);

  // }
  // else {
  //     h = 30;
  //     geometry = new THREE.CylinderGeometry(28, 28, 60, 20);
  //     geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  //     this.z = -h;
  //     this.minz = -h;
  // }
  // for (var j = 0; j < geometry.faces.length; j++) {
  //     geometry.faces[j].materialIndex = 0;
  // }

  // // if (lockGeo) {
  // //     var g = lockGeo.clone();

  // //     g.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  // //     g.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
  // //     g.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
  // //     g.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -h-1.5));
  // //     for (var j = 0; j < g.faces.length; j++) {
  // //         g.faces[j].materialIndex = 1;
  // //     }

  // //     geometry.merge(g);

  // // }

  // m = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
  // //m.rotateX(Math.PI / 2);
  // //m.geometry.computeFaceNormals();
  // //m.geometry.computeVertexNormals();

  // m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -h);
  var m;

  var lock = new THREE.Mesh(lockGeo, thingMaterial);
  if (this.channel == -1) {
    m = new THREE.Mesh(new THREE.CubeGeometry(64, 64, 50), material);

    lock.rotateX(Math.PI / 2);
    lock.rotateZ(Math.PI);
    lock.rotateY(Math.PI);
    lock.position.set(0, 0, -26.5);
  } else {
    m = makePillarMesh(this);
    addPillarBase(this);
    this.z = -30;
    this.minz = -30;
    lock.rotateY(Math.PI);
    lock.position.set(0, -31.5, 0);
  }
  m.add(lock);
  m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -25);
  scene.add(m);
  this.mesh = m;
};
Lock.prototype.update = function() {
  if (this.mesh) {
    if (this.channel == -1) {
      this.mesh.visible = !(this.open || !this.solid);

    } else {
      var speed = 15 * updateDelta / 33;
      this.mesh.visible = !this.open;
      if (this.meshes)
        this.meshes.base.visible = !this.open;
      if (this.solid) {
        if (this.z > this.minz) {
          this.z -= speed;
        } else {
          this.z = this.minz;
        }
      } else {
        if (this.z < this.minz + 40) {
          this.z += speed;
        } else {
          this.z = this.minz + 40;
        }
      }
      this.mesh.position.set(this.mesh.position.x, this.mesh.position.y, this.z);

    }

  }

};
Lock.prototype.step = function() {
  this.time += timespeed;
  if (this.time < 0) {
    this.open = false;
    this.time = 0;
  }
};
Lock.prototype.draw = function() {
  this.time += timespeed;
  if (this.time < 0) {
    this.open = false;
    this.time = 0;
  }
  if (!this.solid || this.open)
    return;

  ctx.lineWidth = 4;
  ctx.strokeStyle = black;
  if (this.channel != -1) {
    ctx.roundRect(this.x, this.y, this.w, this.h, 16);
    ctx.stroke();
  } else {
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
  //ctx.roundRect(this.x,this.y,this.w,this.h,this.w/4);
  //ctx.stroke();
  ctx.beginPath();
  ctx.arc(this.x + this.w / 2, this.y + this.h / 3, 10, .7 * Math.PI, 2.3 * Math.PI, false);

  ctx.lineTo(this.x + 2 * this.w / 3, this.y + 3 * this.h / 4);
  ctx.lineTo(this.x + this.w / 3, this.y + 3 * this.h / 4);
  ctx.closePath();
  ctx.stroke();
};

function Key(e) {
  k.merge(this, e);
}
Key.prototype.x = 0;
Key.prototype.y = 0;
Key.prototype.w = tilesize;
Key.prototype.h = tilesize;
Key.prototype.key = true;
Key.prototype.here = true;
Key.prototype.taken = -1;
Key.prototype.time = 0;
Key.prototype.makeMesh = function() {

  if (!keyGeo)
    return;
  if (this.mesh) {
    scene.remove(this.mesh);
  }
  var m;
  var geometry = keyGeo.clone();
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
  geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
  m = new THREE.Mesh(geometry, thingMaterial);


  /*		        var g = new THREE.PlaneGeometry(64, 64);
   var mat = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
   g.applyMatrix(mat.multiply(new THREE.Matrix4().makeTranslation(0, 32, 32)));
  geometry.merge(g);
   */

  m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -2.5);
  scene.add(m);
  this.mesh = m;
};
Key.prototype.update = function() {
  if (this.mesh)
    this.mesh.visible = this.here;
};
Key.prototype.step = function() {
  if (this.key) {
    this.time += timespeed;
  }
}
Key.prototype.draw = function() {
  if (this.key) {
    this.time += timespeed;
  }
  if (!this.here)
    return;
  ctx.lineWidth = 4;
  ctx.strokeStyle = black;
  ctx.beginPath();
  ctx.arc(4 + this.x + 15, -2 + this.y + this.h - 20, 10, 0, Math.PI * 2, true)
  ctx.moveTo(4 + this.x + 21, -2 + this.y + this.h - 26);
  ctx.lineTo(4 + this.x - 15 + this.w, -2 + this.y + 20);
  ctx.lineTo(4 + this.x - 9 + this.w, -2 + this.y + 30);
  ctx.moveTo(4 + this.x + this.w / 2 + 7, -2 + this.y + this.w / 2 - 7);
  ctx.lineTo(4 + this.x + this.w / 2 + 6 + 7, -2 + this.y + this.w / 2 + 3);
  ctx.stroke();
};

function Coin(e) {
  k.merge(this, e);
}
Coin.prototype.x = 0;
Coin.prototype.y = 0;
Coin.prototype.type = "c";
Coin.prototype.w = tilesize;
Coin.prototype.h = tilesize;
Coin.prototype.coin = true;
Coin.prototype.here = true;
Coin.prototype.taken = -1;
Coin.prototype.draw = function() {
  this.time += timespeed;

  if (!this.here)
    return;
  ctx.lineWidth = 4;
  ctx.strokeStyle = black;
  ctx.fillStyle = black;
  ctx.beginPath();
  ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w / 3, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.font = "Bold Italic 24pt Arial";
  ctx.fillText("$", this.x + this.w / 2 - 10, this.y + this.h / 2 + 11);
};

function Plus(e) {
  k.merge(this, e);
}
Plus.prototype.x = 0;
Plus.prototype.y = 0;
Plus.prototype.type = "pl";
Plus.prototype.w = tilesize;
Plus.prototype.h = tilesize;
Plus.prototype.plus = true;
Plus.prototype.channel = -1;

Plus.prototype.makeMesh = function() {
  var geometry;
  var m;
  geometry = new THREE.CubeGeometry(64, 10, 5);

  var g = new THREE.CubeGeometry(10, 64, 5);
  var mat = new THREE.Matrix4().makeRotationY(-Math.PI / 2);

  geometry.merge(g);

  m = new THREE.Mesh(geometry, thingMaterial);
  m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -2.5);

  //scene.add(m);
  mergeGeoMesh(mergeThingGeo, m);
  this.mesh = m;
};
Plus.prototype.draw = function() {
  ctx.lineWidth = 4;
  ctx.strokeStyle = black;
  ctx.beginPath();
  ctx.moveTo(this.x + this.w / 2, this.y);
  ctx.lineTo(this.x + this.w / 2, this.y + this.h);
  ctx.moveTo(this.x, this.y + this.h / 2);
  ctx.lineTo(this.x + this.w, this.y + this.h / 2);
  ctx.stroke();
};
var timeMat = new THREE.MeshPhongMaterial({
  color: 0x555555
});

function TimeMachine(e) {
  k.merge(this, e);
}

TimeMachine.prototype.x = 0;
TimeMachine.prototype.y = 0;
TimeMachine.prototype.w = tilesize;
TimeMachine.prototype.h = tilesize;
TimeMachine.prototype.solid = false;
TimeMachine.prototype.tm = true;
TimeMachine.prototype.v2 = false;
TimeMachine.prototype.used = false;
TimeMachine.prototype.on = false;
TimeMachine.prototype.planted = true;
TimeMachine.prototype.state = false;
TimeMachine.prototype.TimeMachine = true;

TimeMachine.prototype.makeMesh = function() {
  var geometry;
  var m;
  if (this.v2) {

    geometry = new THREE.CubeGeometry(64 * (Math.sqrt(2) / 2), 64 * (Math.sqrt(2) / 2), 64);
    m = new THREE.Mesh(geometry, thingMaterial);

    m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -32);

  } else {
    geometry = new THREE.CubeGeometry(64, 64, 64);
    m = new THREE.Mesh(geometry, thingMaterial);
    m.rotateX(Math.PI / 2);
    m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -32);

  }
  scene.add(m);
  this.mesh = m;
};
TimeMachine.prototype.update = function() {
  if (this.mesh) {

    if (this.on) {
      this.mesh.material = timeMat;
      this.mesh.position.z = -32;
    } else {
      this.mesh.material = thingMaterial;
      this.mesh.position.z = 10;
    }
    if (this.v2) {
      this.mesh.rotateZ(.001 * updateDelta);
    }
    this.mesh.visible = this.planted;
  }
}
TimeMachine.prototype.draw = function() {
  ctx.lineWidth = 4;
  ctx.fillStyle = black;
  ctx.strokeStyle = black;
  if (!this.on) {
    //ctx.fillStyle = "rgb(128,128,128)";
    /*ctx.roundRect(this.x,this.y,this.w,this.h,10);
     ctx.fill();
     ctx.stroke();*/
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.globalAlpha = .5;
    ctx.fillRect(this.x + 5, this.y + 5, this.w - 10, this.h - 10);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
};

function Exit(e) {
  k.merge(this, e);
}
Exit.prototype.x = 0;
Exit.prototype.y = 0;
Exit.prototype.w = tilesize;
Exit.prototype.h = tilesize;
Exit.prototype.solid = false;
Exit.prototype.exit = true;
Exit.prototype.makeMesh = function() {
  var geometry;
  var m;
  geometry = new THREE.CubeGeometry((1 / Math.sqrt(3)) * 64, (1 / Math.sqrt(3)) * 64, (1 / Math.sqrt(3)) * 64);
  m = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    emissive: 0x7A7A7A
  }));

  m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -32);

  scene.add(m);
  this.mesh = m;

  var light = new THREE.PointLight(0xffFFFF, .4, 230);
  light.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -128);
  scene.add(light);
  this.meshes = {
    light: light
  };

  // var light = new THREE.PointLight(0xffFFFF, 1, 230);
  // light.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -128);
  // scene.add(light);
  // this.light = light;
};
Exit.prototype.update = function() { // TODO time since last update
  if (!this.mesh)
    return;
  this.mesh.rotateX(0.02 * updateDelta / 33);
  this.mesh.rotateY(0.013 * updateDelta / 33);
  this.mesh.rotateZ(0.032 * updateDelta / 33);
};
Exit.prototype.draw = function() {
  ctx.lineWidth = 4;
  ctx.fillStyle = white;
  ctx.strokeStyle = black;
  ctx.beginPath();
  ctx.moveTo(this.x + this.w / 2, this.y + 2);
  ctx.lineTo(this.x, this.y + this.h);
  ctx.lineTo(this.x + this.w, this.y + this.h);
  //ctx.lineTo(this.x+this.w/2,this.y);
  //ctx.fill();
  ctx.closePath();
  ctx.stroke();
};

function Button(e) {
  this.colorIndex = k('.button').length;
  k.merge(this, e);
}
Button.prototype.x = 0;
Button.prototype.y = 0;
Button.prototype.w = tilesize;
Button.prototype.h = tilesize;
Button.prototype.solid = false;
Button.prototype.button = true;
Button.prototype.channel = 0;
Button.prototype.on = false;
Button.prototype.makeMesh = function() {
  var geometry;
  var m;
  geometry = new THREE.CubeGeometry(tilesize * Math.sqrt(2) / 2, tilesize * Math.sqrt(2) / 2, 5);
  //		        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  //		        geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 4));
  //geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -5));

  m = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
    color: getColor(this.colorIndex),
    emissive: getColor(this.colorIndex) * 0x99 / 0xFF
  }));
  m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -7.5);
  //m.rotateZ(Math.PI / 4);
  scene.add(m);
  this.mesh = m;

  geometry = new THREE.CylinderGeometry(32 * Math.sqrt(2), 27 * Math.sqrt(2), 5, 4);
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 4));

  var base = new THREE.Mesh(geometry, thingMaterial);
  base.position.set(m.position.x, m.position.y, -2.5);

  mergeGeoMesh(mergeThingGeo, base);
  //    scene.add(base);
  //    this.meshes = {};
  //    this.meshes.base = base;
};

Button.prototype.makeOldXMesh = function() {
  var geometry;
  var m;
  geometry = new THREE.CubeGeometry(64, 10, 5);

  var g = new THREE.CubeGeometry(10, 64, 5);
  var mat = new THREE.Matrix4().makeRotationY(-Math.PI / 2);

  geometry.merge(g);

  m = new THREE.Mesh(geometry, thingMaterial);
  m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -2.5);
  m.rotateZ(Math.PI / 4);
  scene.add(m);
  this.mesh = m;
};
Button.prototype.update = function() {
  if (this.mesh) {
    this.mesh.position.z = this.on ? -3 : -7.5;
  }
};
Button.prototype.step = function() {
  var me = this;
  k('.tog.channel=' + me.channel, function(c) {
    c.solid = true;
  });
  var o = false;
  k('.player', function(b) {
    if ((!me.on && b.x == me.x && b.y == me.y) ||
      (me.on && collides(me, b))) {
      if (!me.on && !sleeping) {
        playSound(buttonon);
      }
      o = true;
      me.on = true;
      k('.tog.channel=' + me.channel, function(c) {
        c['solid'] = false;
      });
    }
  });
  if (!o) {
    if (this.on && !sleeping) {
      playSound(buttonoff);
      this.on = false;
    }
  }
  k('.tog!open.solid.channel=' + me.channel, function(b) {
    k('.player', function(c) {
      if (collides(b, c)) {
        k(new Blood({
          x: c.x,
          y: c.y,
          w: c.w,
          h: c.h,
          reset: c.primer
        }));
        c.animating = true;
        c.w = 0;
        c.h = 0;
        if (!c.primer) {
          removeMeshes(c);
          k.remove(c);
        }
      }
    });
  });
}

function getColor(index) {
  var c = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFFFFF];
  return c[index % c.length];
}

function Blood(e) {
  k.merge(this, e);
};
Blood.prototype.x = 0;
Blood.prototype.y = 0;
Blood.prototype.reset = false;
Blood.prototype.w = tilesize;
Blood.prototype.h = tilesize;
Blood.prototype.solid = false;
Blood.prototype.blood = true;
Blood.prototype.frame = 0;
var bloodAmount = 15;
Blood.prototype.makeMesh = function() {
  this.meshes = {};
  var m,
    geometry;
  this.material = new THREE.MeshPhongMaterial({
    color: 0xFF0000,
    emissive: 0x550000,
    transparent: true,
    opacity: 1
  });

  for (var i = 0; i < bloodAmount; i++) {
    var radius = i * Math.PI * 2 / bloodAmount;
    geometry = new THREE.CubeGeometry(12, 12, 12);
    this.meshes[i] = m = new THREE.Mesh(geometry, this.material);
    m.position.set(this.x - width / 2 + 32 + Math.cos(radius) * 3, this.y - height / 2 + 32 + Math.sin(radius) * 3, -32);
    scene.add(m);
  }

};
Blood.prototype.update = function() {
  if (this.meshes) {
    for (var i = 0; i < bloodAmount; i++) {
      if (!this.meshes[i])
        continue;
      var radius = i * Math.PI * 2 / bloodAmount;
      this.meshes[i].position.x += Math.cos(radius) * 2 * updateDelta / 33;
      this.meshes[i].position.y += Math.sin(radius) * 2 * updateDelta / 33;
    }
    this.material.opacity -= .04 * updateDelta / 33;
    if (this.material.opacity < 0) {
      removeMeshes(this);
      k.remove(this);
      if (this.reset) {
        loadLevel(true);
      }
    }
  }
};

Blood.prototype.draw = function() {
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.beginPath();
  for (var i = 0; i < Math.PI * 2; i += Math.PI / 10) {
    ctx.moveTo(this.x + this.w / 2 + Math.cos(i) * this.w / 4 * this.frame / 10,
      this.y + this.w / 2 + Math.sin(i) * this.h / 4 * this.frame / 10);
    ctx.lineTo(this.x + this.w / 2 + Math.cos(i) * this.w / 2 * this.frame / 10,
      this.y + this.w / 2 + Math.sin(i) * this.h / 2 * this.frame / 10);
  }
  ctx.globalAlpha = (15 - this.frame) / 15;
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (this.frame < 15) {
    this.frame++;
  } else {
    removeMeshes(this);
    k.remove(this);
    if (this.reset) {
      loadLevel(true);
    }
  }
};


function Title(e) {
  k.merge(this, e);

};
Title.prototype = {
  x: 64,
  y: 64 * 10,
  solid: false,
  title: true,
  makeMesh: function() {
    var startTextG = new THREE.TextGeometry(this.text, {
      size: 16,
      height: 3,
      font: helv
    });
    var startText = new THREE.Mesh(startTextG, new THREE.MeshPhongMaterial({
      color: 0x00FF00,
      emissive: 0x006600,
      opacity: .2
    }));


    startText.position.set(this.x - width / 2 + 5, this.y - height / 2 + 64 + 16 + 3, -66.5);
    startText.rotateY(Math.PI);
    startText.rotateZ(Math.PI);
    //m.rotateZ(Math.PI / 4);
    //    scene.add(m);
    mergeGeoMesh(mergeThingGeo, startText);
    this.mesh = startText;
  }
};
var hexPlayer = false;
var PlayerSize = Math.sqrt(2) * tilesize / 2;

function Player(e) {
  k.merge(this, e);
  this.makeMesh();
  if (this.primer) {
    var light = new THREE.PointLight(0xffFFFF, .6, 0);
    light.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -128);
    scene.add(light);
    this.light = light;
  }
};
k.merge(Player.prototype, {
  player: true,
  x: 0,
  y: 0,
  dir: up,
  speed: 8,
  time: -1,
  w: tilesize,
  h: tilesize,
  solid: true,
  a: 1,
  ox: 0,
  oy: 0,
  sleeping: false,
  zindex: 0,
  zmesh: false,
  hasKey: false,
  blue: 0,
  makeMesh: function() {

    var geometry,
      m;
    if (spherePlayer) {
      geometry = new THREE.SphereGeometry(30, 40, 40);
      m = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        emissive: 0x141414
      }));
    } else {
      if (hexPlayer) {
        geometry = new THREE.SphereGeometry(PlayerSize / 2, 4, 4);
      } else {
        geometry = new THREE.CubeGeometry(PlayerSize, PlayerSize, PlayerSize, 10, 10, 10);
      }
      m = new THREE.Mesh(geometry, playerMaterial);
    }
    m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -32);
    scene.add(m);
    this.meshes = {};
    this.mesh = m;
  },
  update: function() { // TODO time since last update
    //update
    if (this.mesh) {
      if (spherePlayer) {
        this.mesh.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -32);
      } else {
        var os = 1 / 10;
        var xo = this.x / tilesize - Math.floor(this.x / tilesize) + Math.sin(this.ox) * os;
        var yo = this.y / tilesize - Math.floor(this.y / tilesize) + Math.sin(this.oy) * os;
        this.ox *= .85;
        this.oy *= .85;

        this.mesh.rotation.set(yo * Math.PI / 2, -xo * Math.PI / 2, 0);
        if (xo > yo) {
          var ratio = Math.sqrt(2 - Math.pow(Math.cos(2 * xo * Math.PI / 2), 2));
        } else {
          var ratio = Math.sqrt(2 - Math.pow(Math.cos(2 * yo * Math.PI / 2), 2));
        }
        this.mesh.position.set(this.x - width / 2 + 32 + Math.sin(this.ox) * tilesize * os, this.y - height / 2 + 32 + Math.sin(this.oy) * tilesize * os, -PlayerSize * ratio / 2);
      }
      if (this.w == 0 || this.h == 0) {
        this.mesh.visible = false;
      } else {
        this.mesh.visible = true;
      }
      var d = (this.w + this.h) / 2;
      this.mesh.scale.set(this.w / tilesize, this.h / tilesize, d / tilesize);
      if (this.light)
        this.light.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, this.light.position.z);
      if (this.primer && !menu) {
        var x = (this.x - width / 2 + 32);
        var y = (this.y - height / 2 + 32);
        x = x / 5;
        y = y / 5;
        var speed = .2 * updateDelta / 33;
        speed = Math.max(speed, 1);
        camera.position.set(camera.position.x + (x - camera.position.x) * speed, camera.position.y + (y - camera.position.y) * speed, camera.position.z);
        //                                    camera.lookAt(this.mesh.position);
      }
    }
    if (!this.meshes.key && this.hasKey)
      this.makeKeyMesh();
    if (!this.meshes.z && this.sleeping)
      this.makeZMesh();
    if (!this.meshes.tm && this.hasTm)
      this.makeTmMesh();

    if (this.meshes.key) {
      this.meshes.key.visible = this.hasKey;
      this.meshes.key.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, this.meshes.key.position.z);
      this.meshes.key.rotateX(0.05 * updateDelta / 33);
      this.meshes.key.rotateY(0.075 * updateDelta / 33);
      this.meshes.key.rotateZ(0.0625 * updateDelta / 33);
    }
    if (this.meshes.tm) {
      this.meshes.tm.visible = this.hasTm;
      this.meshes.tm.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, this.meshes.tm.position.z);
      this.meshes.tm.rotateX(0.05 * updateDelta / 33);
      this.meshes.tm.rotateY(0.075 * updateDelta / 33);
      this.meshes.tm.rotateZ(0.0625 * updateDelta / 33);
    }
    if (this.meshes.z) {
      this.meshes.z.visible = this.sleeping;
      this.meshes.z.position.set(this.x - width / 2 + 16, this.y - height / 2 + 48, this.meshes.z.position.z);
      //this.meshes.z.rotateX(0.05 * updateDelta / 33);
      //this.meshes.z.rotateY(0.075 * updateDelta / 33);
      //this.meshes.z.rotateZ(0.0625 * updateDelta / 33);
    }
    if (typeof updateHint == "function" && this.primer)
      updateHint(curlevel >= 0 && this.x == playerStart.x && this.y == playerStart.y && hint[curlevel].length)

  },
  here: true,
  primer: false,
  animating: false,
  moving: false,
  falling: false,
  growing: false,
  leaving: 0,
  keyMesh: false,
  makeKeyMesh: function() {

    if (!keyGeo)
      return;
    if (this.meshes.key)
      scene.remove(this.meshes.key);

    var m;
    var geometry = keyGeo.clone();
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
    geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));
    m = new THREE.Mesh(geometry, thingMaterial);


    /*		        var g = new THREE.PlaneGeometry(64, 64);
     var mat = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
     g.applyMatrix(mat.multiply(new THREE.Matrix4().makeTranslation(0, 32, 32)));
     THREE.GeometryUtils.merge(geometry, g);
     */

    m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -96);
    scene.add(m);
    this.meshes.key = m;
    m.visible = this.hasKey;
  },
  hasTm: false,
  makeTmMesh: function() {

    if (this.meshes.tm)
      scene.remove(this.meshes.tm);

    var m;
    var geometry = new THREE.CubeGeometry(32, 32, 32);
    m = new THREE.Mesh(geometry, timeMat);


    m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -96);
    scene.add(m);
    this.meshes.tm = m;
    m.visible = this.hasTm;
  },
  makeZMesh: function() {

    if (this.meshes.z)
      scene.remove(this.meshes.z);

    var m;
    var geometry = new THREE.TextGeometry("Zz", {
      size: 32,
      height: 5,
      font: helv
    });
    m = new THREE.Mesh(geometry, timeMat);


    m.position.set(this.x - width / 2 + 32, this.y - height / 2 + 32, -96);
    m.rotateX(Math.PI);
    scene.add(m);
    this.meshes.z = m;
    m.visible = this.sleeping;
  },
  move: function() {
    if (this.growing) {
      if (this.w < tilesize) {
        this.w += 6;
        //this.x -= 3;
        this.h += 6;
        //this.y -= 3;
      } else {
        this.growing = false;
        this.animating = false;
        switch (this.dir) {
          case up:
            this.dir = down;
            break;
          case down:
            this.dir = up;
            break;
          case right:
            this.dir = left;
            break;
          case left:
            this.dir = right;
            break;
        }
        this.leaving = 2;
        this.startmove(this.dir);
      }
      return;
    }
    if (this.time > -1) {
      var me = this;
      k.merge(this, hist[this.time]);
      if (hist[this.time].dropMachine) {
        if (this.hasTm)
          this.dropTm();
      }
      if (hist[this.time].usedMachine) {
        var nearMachine = false;
        k('.tm.on!v2', function(b) {
          if (collides(me, b)) {
            nearMachine = true;
          }
        });
        if (!nearMachine && this.w > 0 && this.h > 0) {
          this.die();
          return;
        }
      } else if (!hist[this.time].dropMachine) {
        k('.tm.on!v2', function(b) {
          if (collides(me, b) && me.x == b.x && me.y == b.y) {
            me.w = 0;
          }
        });
      }
      this.time += timespeed;
      if (!this.hasKey && !this.hasTm) {
        k('.key.here', function(b) {
          if (collides(me, b)) {
            me.hasKey = true;
            if (!sleeping) {
              playSound(getkey);
            }
            b.here = false;
          }
        });
      }
      if (!this.hasKey && !this.hasTm) {
        k('.tm.v2.planted.on', function(b) {
          if (collides(me, b)) {
            me.hasTm = true;
            me.heldTm = b;
            me.heldDir = this.dir;
            b.planted = false;
          }
        });
      }
      k('.coin.here', function(b) {
        if (collides(me, b)) {
          score++;
          b.here = false;
        }
      });
      if (this.hasKey) {
        k('.lock.solid!open', function(b) {
          if (collides(me, b)) {
            b.open = true;

            if (!sleeping) {
              playSound(unlock);
            }
            me.hasKey = false;
          }
        });
      }
      k('.solid!open', function(b) {
        if (collides(me, b)) {
          /*me.time = -1;
          me.animating = true;
          me.blue = .1;
          me.x = Math.round(me.x / tilesize) * tilesize;
          me.y = Math.round(me.y / tilesize) * tilesize;
          */
          if (b.player) {
            if (b.time > me.time || b.time < 0) {
              b.die();
            }
          } else {
            me.die();
          }
        }
      });
      k('.plus', function(b) {
        if (b.channel > -1) {
          if (me.x == b.x && me.y == b.y) {
            k('.tm.channel=' + b.channel, function(c) {
              if (!c.on) {
                c.solid = false;
                c.on = true;
                playSound(timetravel);
                c.state = makeState();
              }
            });
          }
        }
      });

      if (this.w <= 0) {

        removeMeshes(this);
        k.remove(this);
      }
      return;
    }
    if (this.falling) {
      if (this.w > 0) {
        this.w -= 6;
        //this.x += 3;
        this.h -= 6;
        //this.y += 3;
        colorFalling = false;
      } else {
        fadeOut("#000");
        var ttime;
        var state = this.mytm.state;
        if (this.mytm.warpTo) {
          k.merge(this, this.mytm.warpTo);
        }
        ttime = state.time;
        score = state.score;
        colorFalling = true;
        this.falling = false;
        k(".player.primer=false", function(b) {
          b.x = -1000;
          b.y = -1000;

          removeMeshes(b);
          k.remove(b);
        });
        var i = 0;
        k(".key", function(b) {
          removeMeshes(b);
          k.remove(b);
        });
        for (i = 0; i < state.keys.length; i++) {
          k(new Key(state.keys[i]));
        }
        i = 0;
        k(".coin", function(b) {
          b.here = state.coins[i];
          i++;
        });
        i = 0;
        k(".lock", function(b) {
          b.open = state.locks[i];
          i++;
        });
        k(".tm", function(b) {
          removeMeshes(b);
          k.remove(b);
        });
        for (var i = 0; i < state.tm.length; i++) {
          k(new TimeMachine(state.tm[i]));
        }

        player.growing = true;
        first = false;
        for (var i in state.players) {
          k(new Player(state.players[i]));
        }
        bgmusic.currentTime = state.musicTime;
      }
      return;
    }
    if (this.w <= 0) {
      return;
    }
    var me = this;
    if (!this.hasKey && !this.hasTm) {
      k('.key.here', function(b) {
        if (collides(me, b)) {
          me.hasKey = true;
          if (first) {
            b.taken = b.time;
          }
          if (!sleeping) {
            playSound(getkey);
          }
          b.here = false;
        }
      });
    }
    if (Math.floor(this.x / tilesize) != Math.floor(this.x) / tilesize || Math.floor(this.y / tilesize) != Math.floor(this.y) / tilesize) {
      this.moving = true;
      var temp;
      switch (this.dir) {
        case up:
          temp = Math.floor(this.y / tilesize);
          this.y -= tilesize / this.speed;
          if (temp != Math.floor(this.y / tilesize)) {
            this.y = Math.round(this.y / tilesize) * tilesize;
          }
          if (this.x < 0) {
            this.x = 0;
          }
          break;
        case down:
          temp = Math.floor(this.y / tilesize);
          this.y += tilesize / this.speed;
          if (temp != Math.floor(this.y / tilesize)) {
            this.y = Math.round(this.y / tilesize) * tilesize;
          }

          if (this.y > size - tilesize) {
            this.y = size - tilesize;
          }
          break;

        case left:
          temp = Math.floor(this.x / tilesize);
          this.x -= tilesize / this.speed;
          if (temp != Math.floor(this.x / tilesize)) {
            this.x = Math.round(this.x / tilesize) * tilesize;
          }
          if (this.x < 0) {
            this.x = 0;
          }
          break;

        case right:
          temp = Math.floor(this.x / tilesize);
          this.x += tilesize / this.speed;
          if (temp != Math.floor(this.x / tilesize)) {
            this.x = Math.round(this.x / tilesize) * tilesize;
          }

          if (this.x > size - tilesize) {
            this.x = size - tilesize;
          }
          break;
      }
      k('.coin.here', function(b) {
        if (collides(me, b)) {
          score++;
          if (first) {
            b.taken = b.time;
          }
          b.here = false;
        }
      });
      if (this.hasKey) {
        k('.lock.solid!open', function(b) {
          if (collides(me, b)) {
            b.open = true;
            if (!sleeping) {
              playSound(unlock);
            }
            if (first) {
              b.opened = b.time;
            }
            me.hasKey = false;
          }
        });
      }
      k('.solid!open', function(b) {
        me.collide(b);
      });
      k('.exit', function(b) {
        if (collides(me, b)) {
          loadLevel();
        }
      });
      k('.tele', function(b) {
        if (b.destx > -1) {
          if (me.x == b.x && me.y == b.y) {
            me.x = b.destx;
            me.y = b.desty;
            playSound(warpsnd);
          }
        }
      });
      k('.plus', function(b) {
        if (b.channel > -1) {
          if (me.x == b.x && me.y == b.y) {
            k('.tm.channel=' + b.channel, function(c) {
              if (!c.on) {
                c.solid = false;
                playSound(timetravel);
                c.on = true;
                c.state = makeState();
              }
            });
          }
        }
      });
      if (this.leaving < 1) {
        k('.tm.planted!solid', function(b) {
          me.collide(b, true);
        });
      }
    } else {
      this.moving = false;
    }

  },
  die: function() {
    k(new Blood({
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      reset: this.primer
    }));
    if (this.hasKey) {
      k(new Key({
        x: Math.round(this.x / tilesize) * tilesize,
        y: Math.round(this.y / tilesize) * tilesize
      }));
    }
    removeMeshes(this);
    k.remove(this);
  },
  tm: false,
  timeTravel: function(b) {
    this.animating = true;
    this.falling = true;
    this.mytm = b;
    if (this.primer) {
      if (!sleeping) {
        playSound(timetravel);
      }
    }
  },
  dropTm: function() {
    var otherDir;
    var me = this;
    var rect;
    switch (this.dir) {
      case up:
        otherDir = down - left;
        break;
      case down:
        otherDir = up - left;
        break;
      case right:
        otherDir = left - left;
        break;
      case left:
        otherDir = right - left;
        break;
    }
    var breakBad = false;
    for (var i = 0; i < 4; i++, otherDir++, otherDir %= 4) {
      rect = {
        x: me.x,
        y: me.y,
        w: me.w,
        h: me.h
      };
      switch (otherDir) {
        case up - left:
          rect.y -= tilesize;
          break;
        case down - left:
          rect.y += tilesize;
          break;
        case right - left:
          rect.x += tilesize;
          break;
        case left - left:
          rect.x -= tilesize;
          break;
      }
      //Check to see if we can even place a time machine
      breakBad = false;
      if (this.primer)
        k('.solid!open', function(b) {
          if (!breakBad && collides(b, rect)) {
            breakBad = true;
            return;
          }
        });
      if (!breakBad)
        break;
    }
    if (breakBad)
      return;
    this.hasTm = false;

    this.x = Math.round(this.x / tilesize) * tilesize;
    this.y = Math.round(this.y / tilesize) * tilesize;
    var tm = this.heldTm;
    tm.warpTo = {
      x: tm.x,
      y: tm.y,
      dir: this.heldDir
    };
    tm.x = this.x;
    tm.y = this.y;
    tm.planted = true;
    tm.v2 = false;
    removeMeshes(tm);
    tm.makeMesh();
    var isInK = false;
    k('.tm', function(b) {
      if (b === tm) {
        isInK = true;
      }
    });
    if (!isInK)
      k(tm);

    this.dir = otherDir + left;
    if (this.primer)
      this.startmove(this.dir);
  },
  collide: function(b, tm) {
    if (collides(this, b)) {
      if (tm) {
        if (b.v2) {
          if (!this.hasTm && !this.hasKey) {
            this.hasTm = true;
            this.heldTm = b;
            this.heldDir = this.dir;
            b.planted = false;
          }
        } else {
          if (this.x == b.x && this.y == b.y) {
            this.timeTravel(b);
          }
        }
      } else {
        if (this.leaving > 0) {
          this.animating = true;
          this.w = 0;
          this.h = 0;
          this.die();
        }
        this.hit = true;
        switch (this.dir) {
          case up:
            this.y = b.y + b.h;
            break;
          case down:
            this.y = b.y - this.h;
            break;
          case left:
            this.x = b.x + b.w;
            break;
          case right:
            this.x = b.x - this.w;
            break;
        }
      }
    }


  },
  startmove: function(dir) {
    if (this.animating) {
      return;
    }
    player.dir = dir;
    this.moving = true;
    switch (dir) {
      case up:
        player.y -= tilesize / player.speed;
        if (this.y < 0) {
          this.y = 0;
        }
        break;
      case down:
        player.y += tilesize / player.speed;
        if (this.y > size - tilesize) {
          this.y = size - tilesize;
        }
        break;
      case left:
        player.x -= tilesize / player.speed;
        if (this.x < 0) {
          this.x = 0;
        }
        break;
      case right:
        player.x += tilesize / player.speed;
        if (this.x > size - tilesize) {
          this.x = size - tilesize;
        }
        break;
    }
    var me = this;
    if (this.leaving <= 1) {
      this.leaving = 0;
      k('.tm.planted!solid', function(b) {
        me.collide(b, true);
      });
    } else {
      this.leaving--;
    }
    if (this.hasKey) {
      k('.lock.solid!open', function(b) {
        if (collides(me, b)) {
          b.open = true;
          if (!sleeping) {
            playSound(unlock);
          }
          if (first) {
            b.opened = b.time;
          }
          me.hasKey = false;
        }
      });
    }
    k('.solid!open', function(b) {
      me.collide(b);
    });
    //it wasn't successful
    if ((this.x % tilesize == 0) && (this.y % tilesize == 0)) {
      this.pivot(dir);
    }
  },
  pivot: function(dir) {
    if (Math.abs(this.oy) + Math.abs(this.ox) > .05)
      return;
    switch (dir) {
      case up:
        this.oy = -Math.PI;
        break;
      case down:
        this.oy = Math.PI;
        break;
      case left:
        this.ox = -Math.PI;
        break;
      case right:
        this.ox = Math.PI;
        break;
    }
  }

});
var player = new Player({
  primer: true
});
k(player);
//init stuff
function initGame() {
  makeAllMeshes(true);
  if (curlevel == -1) {

    loadLevel(menuLevel);
    // startText.visible = true;
    // loadText.visible = true;
    menu = true;
    var p = k('.plus')[0];

    removeMeshes(p);
    k.remove(p);
  } else {
    loadLevel();
  }

  setInterval(step, 33);
}

$(document).keydown(function(e) {
  key[e.which] = true;
  if (e.ctrlKey && e.which == 65) {
    $('#dev').fadeIn(500);
    $('#code').val("");
    e.preventDefault();
  }
  if (e.keyCode == 27 || e.keyCode == 77 || e.keyCode == 80) {
    //escape
    if (curlevel >= 0) {
      if ($('#menu').is(':visible'))
        hideMenu();
      else
        mainMenu(true);
    }
  }
});
$(document).keyup(function(e) {
  key[e.which] = false;
  keyLocked[e.which] = false;
  //restart on r
  if (e.which == 82) {
    if (!menu) {
      loadLevel(true);
      fadeOut("#777");
    }
  }
  //sleep on s
  if (e.which == 83) {
    sleep();
  }
  //enter time machine on enter
  if (e.which == 32 || e.which == 13) {
    dropTimeMachine();
  }
});

function dropTimeMachine() {
  if (player.hasTm) {
    hist[hist.length - 1].dropMachine = true;
    hist[hist.length - 1].heldDir = player.heldDir;
    player.dropTm();
  }
}

function sleep() {
  sleeping = true;

  hist[hist.length - 1].sleeping = true;
  for (var i = 0; i < 151; i++) {
    step();
  }
  hist[hist.length - 1].sleeping = false;
  fColor = "rgba(255,255,255,";
  fadeOut("#FFF");
  fade = 1;
  bgmusic.currentTime = (bgmusic.currentTime + 151 * 33 / 1000) % bgmusic.duration;
  sleeping = false;
}
$('#gamescreen').mousemove(function(e) {
  if (!menu) {
    return;
  }
  // onLoad = false;
  // onStart = false;
  // $('html').css("cursor", 'default');
  // if (typeof e.offsetX === "undefined" || typeof e.offsetY === "undefined") {
  //     var targetOffset = $(e.target).offset();
  //     e.offsetX = e.pageX - targetOffset.left;
  //     e.offsetY = e.pageY - targetOffset.top;
  // }
  // var gw = $('#gamescreen').width();
  // var gh = $('#gamescreen').height();
  // var gs = Math.min(gw,gh);
  // mousex = e.offsetX * size / gs;
  // mousey = e.offsetY * size / gs;
  // if (gw > gh){
  //     mousex += size*(gh - gw)/(2*gs);
  // }
  // else{
  //     mousey += size*(gw - gh)/(2*gs);

  // }
  // if (mousex > tilesize && mousex < tilesize * 5) {

  //     if (mousey > tilesize && mousey < tilesize * 3) {
  //         onStart = true;
  //         $('html').css("cursor", 'pointer');

  //     }
  // }
  // if (mousex > tilesize * 7 && mousex < tilesize * 11) {

  //     if (mousey > tilesize * 9 && mousey < tilesize * 11) {
  //         onLoad = true;
  //         $('html').css("cursor", 'pointer');
  //     }
  // }
});

$('#gamescreen').click(function(e) {
  // if (onStart) {
  //     loadLevel();
  //     $('html').css("cursor", 'default');
  //     onStart = false;
  //     onLoad = false;
  //     return;
  // }
  // if (onLoad) {
  //     curlevel = cookieLevel;
  //     loadLevel();
  //     $('html').css("cursor", 'default');
  //     onStart = false;
  //     onLoad = false;
  // }
});

function tintLevel(h) {
  if (typeof h === "undefined") {
    h = Math.random();
  }
  floorMaterial.color.setHSL(h + .07, 1, .5);
  floorMaterial.emissive.setHSL(h + .07, .3, .42);
  playerMaterial.color.setHSL(h, 1, .5);
  playerMaterial.emissive.setHSL(h, 1, .2);
  material.color.setHSL(h, 1, .5);
  material.emissive.setHSL(h, .3, .42);
}
var playerStart = {
  x: 0,
  y: 0
};

function getKey(i) {
  return !keyLocked[i] && (key[i]);
}
var lastLoad;

function loadLevel(reset) {
  if (!sleeping && !loading) {
    playSound(timetravel);
    for (var i = 37; i < 41; i++) {
      if (key[i])
        keyLocked[i] = true;
    }
  }
  // startText.visible = false;
  // loadText.visible = false;
  fade = 1;
  update = true;
  fColor = "rgba(0,0,0,";
  if (!loading) {
    fadeOut("#000");
  } else {
    //        setTimeout(function(){
    fadeOut('#FFF')
    //        },1500);
  }
  menu = false;
  player.hasKey = false;
  player.hasTm = false;
  player.x = 0;
  player.y = 0;
  player.animating = false;
  player.w = tilesize;
  player.h = tilesize;

  k('.player.primer=false', function(b) {

    removeMeshes(b);
    k.remove(b);
  });
  if (!k('.primer').length) {
    k(player);
    if (!player.mesh) {
      player.makeMesh();
    }
  }
  time = 0;
  hist = [];
  if (!reset) {
    if (cookieLevel < curlevel) {
      cookieLevel = curlevel;
      docCookies.setItem("level", curlevel, Infinity);
      track(curlevel, ((new Date()).getTime() - lastLoad) / 1000);
    }
    if (curlevel >= level.length - 1) {
      cookieLevel = curlevel;
      docCookies.setItem("level", curlevel, Infinity);
      curlevel = -1;
      loadLevel(menuLevel);
      menu = true;
      return;
    }

    updateMerged = true;
    curlevel++;
    lastLoad = (new Date()).getTime();
    startscore = score;
  } else {
    score = startscore;
  }
  if (typeof reset == "object") {
    o = reset;
    level[curlevel] = o;
    updateMerged = true;
    document.title = 'T&Y 3D';
  } else {
    o = level[curlevel];
    document.title = 'Level ' + (curlevel + 1) + ' - T&Y 3D';
    $('#innerhint').html(hint[curlevel]);
    if (typeof resizeHint == "function")
      resizeHint();
  }
  k('!primer!static', function(b) {

    removeMeshes(b);
    k.remove(b);
  });
  first = true;
  if (!o.color) {
    //        tintLevel(Math.random());
  } else {
    tintLevel(o.color);
  }
  var hasTM = false;
  var hasStandardTM = false;
  for (var i in o) {
    switch (o[i].type) {
      case "b":
        k(new Block({
          x: o[i].x,
          y: o[i].y,
          channel: o[i].channel
        }));
        break;
      case "u":
        k(new Button({
          x: o[i].x,
          y: o[i].y,
          channel: o[i].channel
        }));
        break;
      case "tm":
        hasTM = true;
        var on = false;
        if (o[i].channel < 0 || !o[i].channel) {
          on = true;
          hasStandardTM = true;
        }
        k(new TimeMachine({
          x: o[i].x,
          y: o[i].y,
          on: on,
          solid: !on,
          channel: o[i].channel,
          v2: !!o[i].v2
        }));
        break;
      case "e":
        k(new Exit({
          x: o[i].x,
          y: o[i].y
        }));
        break;
      case "k":
        k(new Key({
          x: o[i].x,
          y: o[i].y
        }));
        break;
      case "l":
        k(new Lock({
          x: o[i].x,
          y: o[i].y,
          channel: o[i].channel
        }));
        break;
      case "p":

        player.x = o[i].x;
        player.y = o[i].y;
        break;
      case "te":
        k(new Tele({
          x: o[i].x,
          y: o[i].y,
          destx: o[i].destx,
          desty: o[i].desty
        }));
        break;
      case "pl":
        k(new Plus({
          x: o[i].x,
          y: o[i].y,
          channel: o[i].channel
        }));
        break;
      case "c":
        k(new Coin({
          x: o[i].x,
          y: o[i].y
        }));
        break;
    }
  }
  if (curlevel >= 0) {
    k(new Title({
      text: "Level: " + (curlevel + 1)
    }));
    $('#mainmenu').fadeOut();
  } else {
    mainMenu();
  }
  playerStart.x = player.x;
  playerStart.y = player.y;
  if (hasStandardTM || !hasTM) {
    k(new Plus({
      x: player.x,
      y: player.y,
      w: player.w,
      h: player.h,
      channel: -100
    }));
  }
  k('.tm.on', function(b) {
    b.state = makeState();
  });

}

function step() {
  time += timespeed;

  k('.primer>move');
  var temp = k('.player!primer');
  for (var i = temp.length - 1; i >= 0; i--) {
    temp[i].move();
  }
  if (!player.moving) {
    if (!menu) {
      var moved = false;
      for (var i = 37; i < 41; i++) {
        if (getKey(i) && i != player.dir) {
          player.startmove(i);
          moved = true;
          break;
        }
      }
      if (!moved) {
        if (getKey(player.dir)) {
          player.startmove(player.dir);
        }
      }
    } else {
      if (player.hit) {
        player.dir = Math.floor(Math.random() * 4) + 37;
      }
      player.hit = false;
      player.startmove(player.dir);

    }
  }
  hist.push({
    x: player.x,
    y: player.y,
    w: player.w,
    h: player.h
  });
  if (Math.abs(player.ox) + Math.abs(player.oy) > .05) {
    hist[hist.length - 1].ox = player.ox;
    hist[hist.length - 1].oy = player.oy;
  }
  if (player.falling) {
    hist[hist.length - 1].usedMachine = true;
  }

  k('>step');

  if (movableFloor) {
    if (floorMeshes[player.x / tilesize]) {
      if (floorMeshes[Math.round(player.x / tilesize)][Math.round(player.y / tilesize)]) {
        floorMeshes[Math.round(player.x / tilesize)][Math.round(player.y / tilesize)].position.z += 15;
        player.mesh.position.z = floorMeshes[Math.round(player.x / tilesize)][Math.round(player.y / tilesize)].position.z - 32;
      }
    }
    for (var x = 0; x < floorMeshes.length; x++) {
      var col = floorMeshes[x];
      for (var y = 0; y < col.length; y++) {
        var mesh = col[y];
        if (Math.abs(mesh.position.z) < .1) {
          mesh.position.z = 0;
        } else {
          mesh.position.z *= .7;
        }
      }
    }
  }
  makeAllMeshes(false);

  /*if (touchable) {
   touchx = (touchx * 5 + lastx) / 6;
   touchy = (touchy * 5 + lasty) / 6;
   }*/
}

function makeAllMeshes(start) {

  if (start || updateMerged) {
    if (mergeMesh) {
      scene.remove(mergeMesh);
    }
    mergeGeo = new THREE.Geometry();
    mergeMesh = new THREE.Mesh(mergeGeo, material);
    if (mergeThingMesh) {
      scene.remove(mergeThingMesh);
    }
    mergeThingGeo = new THREE.Geometry();
    mergeThingMesh = new THREE.Mesh(mergeThingGeo, thingMaterial);
  }
  if (!start)
    k("!mesh!meshes>makeMesh");
  if (start || updateMerged) {
    //THREE.GeometryUtils.merge(mergeGeo,ceilMesh);
    scene.add(mergeMesh);
    scene.add(mergeThingMesh);
    if (!start)
      updateMerged = false;
  }
}

function collides(a, b) {
  if (a != b) {
    if (a.x < b.x + b.w && a.x + a.w > b.x) {
      if (a.y < b.y + b.h && a.y + a.h > b.y) {
        return true;
      }
    }
  }
  return false;
}

function hideDev() {
  $('#dev').fadeOut(500);
}

function loadCode() {
  level = [];
  level.push(JSON.parse($('#code').val()));
  curlevel = -1;
  loadLevel();
  hideDev();
}

function getUrlVars() {
  var map = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    map[key] = value;
  });
  return map;
}

function makeState() {
  var s = {};
  s.time = time;

  s.keys = [];
  k('.key', function(key) {
    s.keys.push({
      here: key.here,
      x: key.x,
      y: key.y
    })
  });
  s.coins = k('.coin<here');
  s.locks = k('.lock<open');
  s.players = [];
  s.score = score;
  s.tm = k('.tm', function(b) {
    if (!b.state && b.on) {
      b.state = s;
    }
    return {
      on: b.on,
      planted: b.planted,
      v2: b.v2,
      state: b.state,
      solid: b.solid,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      channel: b.channel
    };
  });
  k('.player', function(b) {
    var p = {};
    p.x = b.x;
    p.y = b.y;
    p.hasKey = b.hasKey;
    p.time = b.time;
    p.hasTm = b.hasTm;
    p.heldTm = b.heldTm;
    p.heldDir = b.heldDir;
    if (b.primer) {
      p.time = time;
    }
    p.animating = b.animating;
    s.players.push(p);
  });

  s.musicTime = bgmusic.currentTime
  return s;
}

function playSound(sound) {
  if (localStorage.TAYsoundoff)
    return;
  for (var i in sound) {
    if (sound[i].paused || sound[i].ended) {
      sound[i].volume = .35;
      sound[i].play();
      break;
    }
  }
}

function removeMeshes(a) {
  if (a.mesh) {
    scene.remove(a.mesh);
    a.mesh = null;
  }
  if (a.meshes) {
    for (var i in a.meshes) {
      scene.remove(a.meshes[i]);
    }
    a.meshes = {};
  }
}
$('#fade').click(function(e) {
  $('#gamescreen').trigger(e);
});
$('#fade').mousemove(function(e) {
  $('#gamescreen').trigger(e);
});

function fadeOut(color) {
  if (!color) {
    color = "#000";
  }
  $('#fade').finish()
    .css("backgroundColor", color)
    .show()
    .fadeOut(750);
  finishLoad();
}

function finishLoad() {
  loading = false;
  bgmusic.volume = .4;
  if (!localStorage.TAYmusicoff)
    bgmusic.play();
  bgmusic.loop = true;
  bgmusic.onCanPlayThrough = function() {
    bgmusic.play();
  };
  $('#loadingbar').hide();
  $('#loadinglogo').hide();
  $('#gamescreen').show();
}

function track(level, time) {
  $.ajax({
    url: "http://www.firecaster.com/tracking/track.php",
    method: "POST",
    data: {
      level: level,
      time: time,
      game: 1
    }
  }).done(function() {
    console.log("Sent results:", level, "time:", time);
  })
}
/**
 * Shake to restart
 */
// if (typeof window.DeviceMotionEvent != 'undefined') {
//     // Shake sensitivity (a lower number is more)
//     var sensitivity = 20;

//     // Position variables
//     var x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;

//     // Listen to motion events and update the position
//     window.addEventListener('devicemotion', function (e) {
//         x1 = e.accelerationIncludingGravity.x;
//         y1 = e.accelerationIncludingGravity.y;
//         z1 = e.accelerationIncludingGravity.z;
//     }, false);

//     // Periodically check the position and fire
//     // if the change is greater than the sensitivity
//     setInterval(function () {
//         var change = Math.abs(x1-x2+y1-y2+z1-z2);

//         if (change > sensitivity) {
//             if (!menu){
//                 loadLevel(true);
//             }

//         }

//         // Update new position
//         x2 = x1;
//         y2 = y1;
//         z2 = z1;
//     }, 150);
// }
/**
 * Auto load levels
 */
window.addEventListener('storage', function(e) {
  if (e.key === "tayEditingLevel") {
    curlevel = 1;
    hint[curlevel] = "";
    loadLevel(JSON.parse(e.newValue));
    hideMenu();
    $('#fade').hide();
  }
});;

// (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()