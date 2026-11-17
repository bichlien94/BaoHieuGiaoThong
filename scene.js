import * as THREE from 'three';
import { CAR_STYLES, DESTINATIONS, SIGNS_DATA } from './data.js';

// Geometry và vật liệu dùng chung trong mỗi cảnh; thu hồi khi đổi màn.
class Parts {
  constructor() { this.geometries = new Map(); this.materials = new Map(); this.textures = new Set(); }
  geometry(kind, args) {
    const key = kind + args.join(',');
    if (!this.geometries.has(key)) this.geometries.set(key, new THREE[kind](...args));
    return this.geometries.get(key);
  }
  material(color) {
    if (!this.materials.has(color)) this.materials.set(color,
      new THREE.MeshStandardMaterial({ color, roughness: .85, flatShading: true }));
    return this.materials.get(color);
  }
  mesh(parent, kind, args, color, position, scale = [1, 1, 1]) {
    const mesh = new THREE.Mesh(this.geometry(kind, args), this.material(color));
    mesh.position.set(...position); mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  box(parent, color, position, scale) { return this.mesh(parent, 'BoxGeometry', [1, 1, 1], color, position, scale); }
  ball(parent, color, position, scale) { return this.mesh(parent, 'SphereGeometry', [1, 8, 6], color, position, scale); }
  cylinder(parent, color, position, top, bottom, height, sides = 8) {
    return this.mesh(parent, 'CylinderGeometry', [top, bottom, height, sides], color, position);
  }
  dispose() {
    this.geometries.forEach(value => value.dispose());
    this.materials.forEach(value => value.dispose());
    this.textures.forEach(value => value.dispose());
  }
}

function carModel(parts, id) {
  const root = new THREE.Group();
  const p = parts; const style = CAR_STYLES[id];
  const bus = id === 'school_bus';
  const length = bus ? 3.9 : 3;
  p.box(root, '#263e50', [0, .48, 0], [1.75, .25, length]);
  p.box(root, style.color, [0, .91, 0], [1.85, .72, length]);
  p.box(root, style.color, [0, bus ? 1.7 : 1.5, bus ? -.08 : .1], [1.6, bus ? 1.35 : .75, bus ? 3.45 : 1.75]);
  p.box(root, bus ? '#ffdc8d' : style.color, [0, bus ? 2.42 : 1.92, .08], [1.7, .17, bus ? 3.5 : 1.9]);
  const glass = '#acdff0';
  const windowY = bus ? 1.85 : 1.55;
  const back = bus ? 1.66 : 1.01;
  p.box(root, glass, [0, windowY, back], [1.34, .51, .035]);
  p.box(root, glass, [0, windowY, bus ? -1.82 : -.8], [1.34, .51, .035]);
  for (const side of [-1, 1]) {
    for (let i = 0; i < (bus ? 4 : 2); i++) {
      p.box(root, glass, [side * .813, windowY, bus ? -1.35 + i * .85 : -.36 + i * .82], [.025, .49, bus ? .66 : .65]);
    }
    p.box(root, '#e6f4ed', [side * 1.02, 1.32, -.6], [.23, .18, .24]);
    p.box(root, '#fff5bf', [side * .63, .95, -length / 2 - .02], [.36, .22, .07]);
    p.box(root, '#ff5a5f', [side * .66, .97, length / 2 + .02], [.35, .23, .07]);
  }
  p.box(root, '#f0f5ee', [0, .55, length / 2 + .05], [1.8, .18, .16]);
  p.box(root, '#fff8dd', [0, .79, length / 2 + .05], [.55, .2, .035]);
  const wheels = [];
  for (const side of [-1, 1]) for (const z of [-length * .32, length * .32]) {
    const pivot = new THREE.Group(); pivot.position.set(side * .94, .46, z); root.add(pivot);
    const tire = p.cylinder(pivot, '#253346', [0, 0, 0], .43, .43, .32, 12); tire.rotation.z = Math.PI / 2;
    const hub = p.cylinder(pivot, '#e7ece2', [side * .18, 0, 0], .23, .23, .035, 8); hub.rotation.z = Math.PI / 2;
    p.box(pivot, '#8a9fad', [side * .205, 0, 0], [.04, .07, .36]);
    wheels.push(pivot);
  }
  if (id === 'yellow_taxi') {
    p.box(root, '#fff7d5', [0, 2.12, .08], [.75, .3, .4]);
    for (let i = 0; i < 5; i++) p.box(root, i % 2 ? '#263e50' : '#fff7d5', [-.68 + i * .34, .93, 1.51], [.3, .15, .04]);
  } else if (id === 'police_car') {
    p.box(root, '#eaf4f6', [0, .93, 0], [1.87, .25, 2.98]);
    p.box(root, '#273f52', [0, 2.07, .05], [1.1, .13, .4]);
    p.box(root, '#ff5a5f', [-.32, 2.2, .05], [.42, .22, .35]);
    p.box(root, '#7dd3fc', [.32, 2.2, .05], [.42, .22, .35]);
  } else if (bus) {
    p.box(root, '#344b50', [0, .96, 1.98], [1.65, .15, .04]);
    p.box(root, '#fff8e3', [0, 2.23, 1.69], [1.2, .18, .04]);
  }
  root.userData.wheels = wheels;
  return root;
}

function tree(p, parent, x, z, pine = false, size = 1) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.scale.setScalar(size); parent.add(group);
  p.cylinder(group, '#a67249', [0, .8, 0], .13, .22, 1.6);
  if (pine) {
    p.mesh(group, 'ConeGeometry', [1.05, 2.2, 7], '#429a63', [0, 2, 0]);
    p.mesh(group, 'ConeGeometry', [.8, 1.8, 7], '#73bf74', [0, 2.8, 0]);
  } else {
    p.ball(group, '#55ad66', [0, 2.1, 0], [1.2, 1.2, 1.15]);
    p.ball(group, '#83ce78', [-.5, 2.6, .15], [.9, .9, .85]);
    p.ball(group, '#6bc276', [.65, 2.2, .1], [.8, .9, .8]);
  }
  return group;
}

function house(p, parent, color, x = 0, z = 0) {
  const group = new THREE.Group(); group.position.set(x, 0, z); parent.add(group);
  p.box(group, '#faf4de', [0, .2, 0], [4.3, .4, 3.9]);
  p.box(group, color, [0, 1.65, 0], [3.7, 2.9, 3.3]);
  const roof = p.mesh(group, 'ConeGeometry', [3.1, 1.7, 4], '#e57b58', [0, 3.9, 0]); roof.rotation.y = Math.PI / 4;
  p.box(group, '#91644c', [0, 1, 1.67], [.78, 1.6, .08]);
  for (const x of [-1.13, 1.13]) {
    p.box(group, '#fff4d4', [x, 1.9, 1.7], [.75, .93, .09]);
    p.box(group, '#e3b86b', [x, 1.9, 1.76], [.065, .93, .04]);
  }
  return group;
}

function lights(scene, shadows = false) {
  scene.add(new THREE.HemisphereLight('#e8f9ff', '#b7b788', 2.1));
  const sun = new THREE.DirectionalLight('#fff0d2', 2.8);
  sun.position.set(-12, 22, 14); sun.castShadow = shadows;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 16, bottom: -20, near: .5, far: 70 });
  sun.shadow.normalBias = .04; sun.shadow.bias = -.0003;
  scene.add(sun);
}

function signModel(p, id) {
  const group = new THREE.Group();
  p.cylinder(group, '#bac9c8', [0, 1.35, 0], .075, .09, 2.7);
  p.cylinder(group, '#6b828a', [0, .09, 0], .28, .35, .18);
  if (id === 'traffic_light') {
    p.box(group, '#273d4b', [0, 3.2, 0], [.86, 2.05, .4]);
    ['#ff675d', '#ffda53', '#62d48b'].forEach((color, i) => {
      const lamp = p.cylinder(group, color, [0, 3.82 - i * .62, .24], .23, .23, .08, 16);
      lamp.rotation.x = Math.PI / 2;
      p.box(group, '#1c3343', [0, 4.11 - i * .62, .28], [.6, .09, .36]);
    });
    return group;
  }
  const triangular = id === 'children' || id === 'construction';
  if (id === 'no_entry') {
    const backing = p.cylinder(group, '#c2cdd1', [0, 3.05, 0], .94, .94, .16, 32);
    backing.rotation.x = Math.PI / 2;
  } else if (triangular) {
    const geometry = p.geometry('CylinderGeometry', [1.14, 1.14, .16, 3]);
    const backing = new THREE.Mesh(geometry, p.material('#cad3d2'));
    backing.rotation.x = -Math.PI / 2; backing.position.set(0, 3.05, 0); group.add(backing);
  } else p.box(group, '#c2cdd1', [0, 3.05, 0], [1.98, 1.98, .16]);
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  p.textures.add(texture);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  p.materials.set('sign-' + id, material);
  const face = new THREE.Mesh(p.geometry('PlaneGeometry', [2.12, 2.12]), material);
  face.position.set(0, 3.05, .1); group.add(face);
  const image = new Image();
  image.onload = () => { canvas.getContext('2d').drawImage(image, 0, 0, 256, 256); texture.needsUpdate = true; };
  image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SIGNS_DATA[id].svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
  return group;
}

function destinationModel(p, id) {
  const root = new THREE.Group();
  p.box(root, '#e7e5ce', [0, .08, 0], [3.6, .16, 3.1]);
  if (id === 'park') {
    p.box(root, '#96c879', [0, .2, 0], [3.4, .2, 2.9]);
    tree(p, root, -1.15, -.6, false, .55);
    tree(p, root, 1.15, -.7, true, .5);
    p.cylinder(root, '#c8e3d6', [0, .35, .45], .75, .8, .18, 12);
    p.cylinder(root, '#7acde1', [0, .46, .45], .64, .64, .06, 12);
    p.cylinder(root, '#eff6de', [0, .74, .45], .08, .14, .55);
    p.ball(root, '#b5e7eb', [0, 1.04, .45], [.26, .18, .26]);
    for (const x of [-1.4, 1.4]) p.box(root, '#e6a366', [x, .55, 1.15], [.55, .15, .35]);
    for (const x of [-1.1, 1.1]) p.box(root, '#f6d598', [x, .95, 1.42], [.16, 1.8, .18]);
    p.box(root, '#edac79', [0, 1.86, 1.42], [2.5, .3, .22]);
    return root;
  }
  const colors = { library: '#e7b387', hospital: '#e7f0dc', school: '#f4d28f' };
  p.box(root, colors[id], [0, 1.25, 0], [3.1, 2.35, 2.4]);
  const roofColor = id === 'hospital' ? '#79bbae' : id === 'school' ? '#ee9071' : '#81a9bc';
  const roof = p.mesh(root, 'ConeGeometry', [2.5, 1, 4], roofColor, [0, 2.9, 0]); roof.rotation.y = Math.PI / 4;
  for (const x of [-1.02, 1.02]) for (const y of [.95, 1.85]) {
    p.box(root, '#fff9d9', [x, y, 1.22], [.52, .56, .06]);
    p.box(root, '#bfac81', [x, y, 1.27], [.04, .56, .025]);
  }
  p.box(root, '#60929e', [0, .72, 1.23], [.7, 1.1, .08]);
  p.box(root, '#efe9cf', [0, .2, 1.52], [1.3, .18, .5]);
  if (id === 'hospital') {
    p.box(root, '#fffcf0', [0, 2.12, 1.25], [.76, .76, .07]);
    p.box(root, '#ec8379', [0, 2.12, 1.3], [.5, .16, .05]);
    p.box(root, '#ec8379', [0, 2.12, 1.3], [.16, .5, .05]);
  } else if (id === 'library') {
    for (const x of [-.66, .66]) p.cylinder(root, '#fff2cc', [x, 1.05, 1.43], .1, .12, 1.55);
    p.box(root, '#4c7c8d', [0, 2.1, 1.3], [1.35, .5, .08]);
    for (let i = 0; i < 5; i++) p.box(root, ['#f8c976', '#a1d3c1', '#f2a18d'][i % 3], [-.4 + i * .2, 2.1, 1.36], [.13, .3, .05]);
  } else {
    p.box(root, '#f9eac6', [0, 2.72, .1], [.8, .9, .8]);
    const clock = p.cylinder(root, '#fff9e3', [0, 2.82, .53], .25, .25, .05, 16); clock.rotation.x = Math.PI / 2;
    p.box(root, '#4c7378', [0, 2.9, .57], [.035, .18, .03]);
    p.box(root, '#4c7378', [.065, 2.82, .57], [.15, .035, .03]);
    p.cylinder(root, '#b7986e', [1.35, 3.26, .15], .025, .025, 1.5);
    p.box(root, '#f3a68b', [1.64, 3.72, .15], [.57, .36, .035]);
  }
  return root;
}

export class SceneManager {
  constructor(game, onLost) {
    this.game = game;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor('#bfeafb', 0);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.lost = event => { event.preventDefault(); onLost(); };
    this.renderer.domElement.addEventListener('webglcontextlost', this.lost);
    this.parts = new Parts(); this.scenes = [];
    this.vector = new THREE.Vector3(); this.ray = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.cityClick = event => this.pickCity(event);
    document.getElementById('city-canvas').addEventListener('click', this.cityClick);
    this.junctionClick = event => this.pickRoute(event);
    document.getElementById('junction-canvas').addEventListener('click', this.junctionClick);
    this.mode = '';
  }

  clear() {
    this.scenes.forEach(scene => scene.traverse(node => {
      if (node.isInstancedMesh || node.isLight) node.dispose?.();
    }));
    this.parts.dispose(); this.parts = new Parts(); this.scenes = [];
    this.renderer.renderLists.dispose();
    this.renderer.domElement.remove();
    document.getElementById('route-labels').replaceChildren();
    this.previews = []; this.buildings = []; this.routes = []; this.segments = []; this.batches = [];
    this.city = null; this.junction = null; this.car = null; this.signs = null;
    this.finish = null; this.mapCar = null; this.chosenRoute = null;
  }

  setMode(mode) {
    if (mode === this.mode) return;
    this.clear(); this.mode = mode;
    if (mode === 'drive') this.buildDrive();
    if (mode === 'start') this.buildGallery();
    if (mode === 'junction') this.buildJunction?.();
    this.resize();
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio, 2);
    if (this.renderer.getPixelRatio() !== ratio) this.renderer.setPixelRatio(ratio);
    if (this.mode === 'start' || this.mode === 'junction') {
      const canvases = this.mode === 'start' ? [...document.querySelectorAll('.car-preview'), document.getElementById('city-canvas')] : [document.getElementById('junction-canvas')];
      const sizes = canvases.map(canvas => canvas.getBoundingClientRect());
      this.renderer.setSize(Math.max(1, ...sizes.map(rect => rect.width)), Math.max(1, ...sizes.map(rect => rect.height)), false);
      this.galleryLast = 0;
      return;
    }
    if (this.mode !== 'drive') return;
    const host = document.getElementById('scene-drive-host');
    const width = host.clientWidth || 960; const height = host.clientHeight || 620;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    const portrait = width < height;
    this.camera.fov = portrait ? 78 : 52;
    this.baseCameraZ = portrait ? 16 : 12;
    this.camera.position.set(0, portrait ? 7 : 6.2, this.baseCameraZ);
    this.camera.lookAt(0, .7, -7);
    this.camera.updateProjectionMatrix();
  }

  buildDrive() {
    const scene = new THREE.Scene(); this.scene = scene; this.scenes.push(scene);
    scene.fog = new THREE.Fog('#d0eee9', 38, 120);
    lights(scene, true);
    const p = this.parts;
    this.camera = new THREE.PerspectiveCamera(52, 1, .1, 180);
    this.camera.position.set(0, 5.4, 10);
    this.camera.lookAt(0, 1, -12);
    p.box(scene, '#88cb78', [0, -.22, -42], [240, .4, 220]);
    // Hình cầu lớn lộn mặt tạo bầu trời chuyển sắc, không cần ảnh.
    const skyGeo = p.geometry('SphereGeometry', [150, 16, 12]);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vPosition; void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec3 vPosition; void main(){float t=smoothstep(-10.0,100.0,vPosition.y);gl_FragColor=vec4(mix(vec3(0.86,0.97,0.96),vec3(0.38,0.76,0.96),t),1.0);}'
    });
    p.materials.set('sky', skyMat); scene.add(new THREE.Mesh(skyGeo, skyMat));
    p.ball(scene, '#ffdc67', [23, 16, -85], [5, 5, 5]);
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      const cloud = new THREE.Group(); cloud.position.set(-45 + i * 23, 20 + i % 2 * 6, -65 - i % 3 * 15); scene.add(cloud);
      for (let j = 0; j < 3; j++) p.ball(cloud, '#fffaf0', [(j - 1) * 2.5, j === 1 ? 1 : 0, 0], [3.2, 1.7, 1.8]);
      this.clouds.push(cloud);
    }
    this.segments = [];
    const colors = ['#f3b297', '#f1d680', '#a7c9e9', '#ccb3e5', '#e7a8bb', '#93c9b2'];
    for (let i = 0; i < 8; i++) {
      const segment = new THREE.Group(); scene.add(segment);
      p.box(segment, '#475668', [0, 0, 0], [9, .12, 16]);
      for (const side of [-1, 1]) {
        p.box(segment, '#e4e4d7', [side * 5.3, .12, 0], [1.3, .3, 16]);
        for (let j = 0; j < 8; j++) p.box(segment, j % 2 ? '#faf7e9' : '#f48b7b', [side * 4.57, .14, -7 + j * 2], [.24, .32, 2]);
        p.box(segment, '#fff8d7', [side * 4.12, .072, 0], [.1, .02, 16]);
        tree(p, segment, side * (6.7 + i % 2 * .5), -3, i % 2 === 0, .85 + i % 3 * .1);
        const building = house(p, segment, colors[(i + (side > 0 ? 2 : 0)) % colors.length], side * 10.8, -5);
        building.rotation.y = side * -.2;
        p.ball(segment, '#5fa86b', [side * 6.5, .45, 3.5], [.8, .5, 1.3]);
        for (let f = 0; f < 3; f++) p.ball(segment, f % 2 ? '#ffda65' : '#f7a6b6', [side * (6.3 + f * .25), .8, 3 + f * .5], [.16, .16, .16]);
      }
      for (let j = 0; j < 3; j++) p.box(segment, '#ffdb69', [0, .078, -6 + j * 5.33], [.14, .025, 2.7]);
      this.segments.push(segment);
    }
    // Gộp tất cả cây, nhà, cửa sổ và lề đường thành các lô InstancedMesh.
    this.batchSegments();
    this.car = carModel(p, this.game.selectedCarId); this.car.position.z = 2.2; scene.add(this.car);
    this.signs = {};
    Object.keys(SIGNS_DATA).forEach(id => {
      const sign = signModel(p, id); scene.add(sign); sign.visible = false; this.signs[id] = sign;
    });
    this.finish = new THREE.Group(); scene.add(this.finish);
    for (const side of [-1, 1]) p.box(this.finish, '#fff6d8', [side * 4.2, 2.6, 0], [.5, 5.2, .6]);
    p.box(this.finish, '#ffda65', [0, 5.2, 0], [9, .9, .7]);
    for (let i = 0; i < 12; i++) p.box(this.finish, i % 2 ? '#344b50' : '#fff6d8', [-3.85 + i * .7, 5.2, .38], [.65, .56, .04]);
    document.getElementById('scene-drive-host').append(this.renderer.domElement);
    this.resize();
  }

  buildGallery() {
    const p = this.parts;
    this.previews = [];
    document.querySelectorAll('.car-card').forEach(card => {
      const scene = new THREE.Scene(); lights(scene);
      const camera = new THREE.PerspectiveCamera(29, 1, .1, 35);
      camera.position.set(5, 3.5, 6); camera.lookAt(0, 1, 0);
      const model = carModel(p, card.dataset.car); scene.add(model);
      p.cylinder(scene, '#dbe3d0', [0, .04, 0], 2.1, 2.2, .12, 32);
      this.scenes.push(scene);
      this.previews.push({ scene, camera, model, id: card.dataset.car, canvas: card.querySelector('canvas') });
    });
    const scene = new THREE.Scene(); lights(scene, true); this.scenes.push(scene);
    const camera = new THREE.OrthographicCamera(-10, 10, 8, -8, .1, 80);
    camera.position.set(5, 16, 21); camera.lookAt(0, 0, 0);
    this.city = { scene, camera, canvas: document.getElementById('city-canvas') };
    p.box(scene, '#9bc9a0', [0, -.55, 0], [15.4, 1, 12.5]);
    p.box(scene, '#d2dfc1', [0, -.05, 0], [15.5, .12, 12.6]);
    p.box(scene, '#a9bbad', [0, .045, 0], [1.4, .08, 12.5]);
    p.box(scene, '#a9bbad', [0, .045, 0], [15.5, .08, 1.2]);
    for (let i = -5; i <= 5; i += 2) {
      p.box(scene, '#fff4cc', [0, .094, i], [.08, .01, .8]);
      p.box(scene, '#fff4cc', [i, .094, 0], [.8, .01, .08]);
    }
    this.buildings = [];
    const positions = [[-3.7, -3], [3.7, -3], [-3.7, 3], [3.7, 3]];
    Object.keys(DESTINATIONS).forEach((id, i) => {
      const [x, z] = positions[i]; const model = destinationModel(p, id); model.position.set(x, 0, z); scene.add(model);
      const halo = p.cylinder(scene, '#fff0a0', [x, .06, z], 2.35, 2.35, .06, 32);
      halo.visible = id === this.game.selectedDestId;
      this.buildings.push({ id, model, halo, label: document.querySelector(`[data-dest="${id}"]`), point: new THREE.Vector3(x, .2, z + 1.8) });
    });
    for (let i = 0; i < 6; i++) tree(p, scene, i % 2 ? 6.3 : -6.3, -4.5 + Math.floor(i / 2) * 4.4, i % 2 === 0, .45);
    this.bounceId = ''; this.bounceAt = 0;
    document.getElementById('render-mode').textContent = 'Bé đã sẵn sàng khám phá chưa?';
  }

  // Một WebGL canvas vẽ nhiều cảnh rồi chép vào các canvas 2D nhỏ.
  drawPreview({ canvas, scene, camera }) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > innerHeight) return;
    const width = Math.floor(rect.width); const height = Math.floor(rect.height);
    const ratio = this.renderer.getPixelRatio();
    const w = Math.floor(width * ratio); const h = Math.floor(height * ratio);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    this.renderer.setViewport(0, 0, width, height);
    this.renderer.setScissor(0, 0, width, height); this.renderer.setScissorTest(true);
    const aspect = width / height;
    if (camera.isPerspectiveCamera) camera.aspect = aspect;
    else {
      const halfWidth = this.mode === 'junction' ? Math.max(10, 4.7 * aspect) : Math.max(9, 6.2 * aspect);
      camera.left = -halfWidth; camera.right = halfWidth;
      camera.top = halfWidth / aspect; camera.bottom = -camera.top;
    }
    camera.updateProjectionMatrix(); this.renderer.render(scene, camera);
    const ctx = canvas.getContext('2d'); ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(this.renderer.domElement, 0, this.renderer.domElement.height - h, w, h, 0, 0, w, h);
    this.renderer.setScissorTest(false);
  }

  project(point, camera, canvas, element) {
    this.vector.copy(point).project(camera);
    element.style.left = `${(this.vector.x + 1) * .5 * canvas.clientWidth}px`;
    element.style.top = `${(1 - this.vector.y) * .5 * canvas.clientHeight}px`;
  }

  renderGallery(now, reduced) {
    if (reduced && this.galleryLast) return;
    if (now - this.galleryLast < 1000 / 24) return;
    this.galleryLast = now;
    this.previews.forEach(preview => {
      preview.model.rotation.y = reduced ? -.25 : -.25 + Math.sin(now * .0004) * .45;
      preview.model.position.y = !reduced && this.bounceId === preview.id ? Math.max(0, Math.sin(Math.min(1, (now - this.bounceAt) / 600) * Math.PI)) * .4 : 0;
      this.drawPreview(preview);
    });
    this.buildings.forEach(building => {
      const active = building.id === this.game.selectedDestId;
      building.halo.visible = active;
      const bounce = !reduced && this.bounceId === building.id ? Math.max(0, Math.sin(Math.min(1, (now - this.bounceAt) / 650) * Math.PI)) * .4 : 0;
      building.model.position.y = bounce;
      building.model.scale.setScalar(active ? 1.04 : 1);
    });
    this.drawPreview(this.city);
    this.buildings.forEach(building => this.project(building.point, this.city.camera, this.city.canvas, building.label));
  }

  pickCity(event) {
    if (this.mode !== 'start') return;
    const { canvas, camera } = this.city; const rect = canvas.getBoundingClientRect();
    this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    this.ray.setFromCamera(this.pointer, camera);
    const hits = this.ray.intersectObjects(this.buildings.map(building => building.model), true);
    if (hits.length) {
      const building = this.buildings.find(building => { let node = hits[0].object; while (node) { if (node === building.model) return true; node = node.parent; } return false; });
      building?.label.click();
    }
  }

  buildJunction() {
    const scene = new THREE.Scene(); lights(scene, true); this.scenes.push(scene);
    const p = this.parts;
    const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, .1, 80);
    camera.position.set(2, 17, 18); camera.lookAt(0, 0, 0);
    this.junction = { scene, camera, canvas: document.getElementById('junction-canvas') };
    p.box(scene, '#a9ce9f', [0, -.44, 0], [19, .8, 12]);
    p.box(scene, '#e2e8c9', [0, -.01, 0], [19.1, .1, 12.1]);
    p.box(scene, '#a4d4df', [1.9, .05, 3.8], [2.4, .04, 4.3]);
    const destination = destinationModel(p, this.game.selectedDestId);
    destination.position.set(7, .05, -.2); destination.scale.setScalar(.9); scene.add(destination);
    const houseStart = house(p, scene, '#f4cf97', -7.9, -1.9); houseStart.scale.setScalar(.6);
    for (let i = 0; i < 7; i++) tree(p, scene, -6 + i * 1.9, i % 2 ? -4.8 : 4.7, i % 2 === 0, .45);
    this.routes = [];
    const matrix = new THREE.Matrix4(); const position = new THREE.Vector3();
    const scale = new THREE.Vector3(); const rotation = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    this.game.currentDest.routes.forEach((route, index) => {
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-7, .15, .4), new THREE.Vector3(-.5, .15, (index - 1) * 8.5), new THREE.Vector3(6.3, .15, .4));
      const material = new THREE.MeshStandardMaterial({ color: route.color, roughness: 1, flatShading: true });
      p.materials.set('route-' + route.id, material);
      const mesh = new THREE.InstancedMesh(p.geometry('BoxGeometry', [1, 1, 1]), material, 36);
      mesh.userData.route = route.id; mesh.receiveShadow = true; scene.add(mesh);
      const dashes = new THREE.InstancedMesh(p.geometry('BoxGeometry', [1, 1, 1]), p.material('#fff8de'), 18); scene.add(dashes);
      for (let i = 0; i < 36; i++) {
        const a = curve.getPoint(i / 36); const b = curve.getPoint((i + 1) / 36);
        position.copy(a).add(b).multiplyScalar(.5);
        rotation.setFromAxisAngle(up, Math.atan2(b.x - a.x, b.z - a.z));
        scale.set(.84, .16, a.distanceTo(b) + .04);
        matrix.compose(position, rotation, scale); mesh.setMatrixAt(i, matrix);
        if (i % 2 === 0) {
          position.y += .09; scale.set(.07, .025, a.distanceTo(b) * .75);
          matrix.compose(position, rotation, scale); dashes.setMatrixAt(i / 2, matrix);
        }
      }
      const label = document.createElement('button'); label.className = 'route-label';
      label.type = 'button'; label.style.borderColor = route.color; label.style.color = route.color;
      label.textContent = route.segs.map(value => value + ' m').join(' + ');
      label.setAttribute('aria-label', `${route.name}, ${route.total} mét`);
      label.addEventListener('click', () => document.querySelectorAll('.route-choice-card')[index].click());
      document.getElementById('route-labels').append(label);
      const point = curve.getPoint(.48); point.y += .7;
      this.routes.push({ id: route.id, curve, mesh, label, point });
    });
    // Cầu nhỏ trên dòng sông, xe vẫn đi theo đường đã chọn.
    p.box(scene, '#d49e65', [1.9, .18, 4.1], [3, .18, .9]);
    this.mapCar = carModel(p, this.game.selectedCarId); this.mapCar.scale.setScalar(.4);
    this.mapCar.position.set(-7, .3, .4); scene.add(this.mapCar);
    this.chosenRoute = null; this.routeStarted = 0;
    this.mapDestinationLabel = document.createElement('span');
    this.mapDestinationLabel.className = 'route-label destination-label';
    this.mapDestinationLabel.textContent = this.game.currentDest.name;
    this.mapDestinationLabel.style.borderColor = '#83ac87';
    document.getElementById('route-labels').append(this.mapDestinationLabel);
    this.mapDestinationPoint = new THREE.Vector3(7, .3, 2);
  }

  renderJunction(now, reduced) {
    if (!this.junction) return;
    if (this.chosenRoute) {
      const progress = reduced ? 1 : Math.min(1, (now - this.routeStarted) / 1200);
      this.chosenRoute.curve.getPoint(progress, this.mapCar.position); this.mapCar.position.y = .28;
      this.chosenRoute.curve.getTangent(progress, this.vector);
      this.mapCar.rotation.y = Math.atan2(-this.vector.x, -this.vector.z);
      if (!reduced && progress < 1) this.mapCar.userData.wheels.forEach(wheel => wheel.rotation.x -= .16);
    }
    this.drawPreview(this.junction);
    this.routes.forEach(route => this.project(route.point, this.junction.camera, this.junction.canvas, route.label));
    this.project(this.mapDestinationPoint, this.junction.camera, this.junction.canvas, this.mapDestinationLabel);
  }

  pickRoute(event) {
    if (this.mode !== 'junction' || !this.junction) return;
    const { canvas, camera } = this.junction; const rect = canvas.getBoundingClientRect();
    this.pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    this.ray.setFromCamera(this.pointer, camera);
    const hits = this.ray.intersectObjects(this.routes.map(route => route.mesh));
    if (hits.length) {
      const index = this.routes.findIndex(route => route.id === hits[0].object.userData.route);
      document.querySelectorAll('.route-choice-card')[index].click();
    }
  }

  batchSegments() {
    const groups = new Map();
    this.segments.forEach(segment => {
      segment.updateMatrixWorld(true);
      segment.traverse(node => {
        if (!node.isMesh) return;
        const key = node.geometry.uuid + node.material.uuid;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push({ node, segment, matrix: node.matrixWorld.clone() });
      });
    });
    this.batches = [];
    for (const entries of groups.values()) {
      const first = entries[0].node;
      const mesh = new THREE.InstancedMesh(first.geometry, first.material, entries.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.castShadow = first.material.color?.getHexString() !== '475668'; mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      this.scene.add(mesh);
      entries.forEach(({ node }) => node.visible = false);
      this.batches.push({ mesh, entries });
    }
    this.tempMatrix = new THREE.Matrix4();
  }

  renderDrive(now, dt, reduced, shake) {
    if (this.mode !== 'drive') return;
    const game = this.game;
    this.segments.forEach((segment, i) => segment.position.z = 12 - i * 16 + (game.roadDistance * .16) % 16);
    for (const { mesh, entries } of this.batches) {
      entries.forEach(({ matrix, segment }, i) => {
        this.tempMatrix.copy(matrix); this.tempMatrix.elements[14] += segment.position.z;
        mesh.setMatrixAt(i, this.tempMatrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    const moving = game.isDriving && !reduced;
    this.car.position.y = moving ? Math.sin(now * .015) * .026 : 0;
    this.car.rotation.z = shake && !reduced ? Math.sin(now * .05) * .06 : moving ? Math.sin(now * .0025) * .012 : 0;
    this.car.userData.wheels.forEach(wheel => { if (game.isDriving) wheel.rotation.x -= dt * game.carSpeed * 4; });
    this.camera.position.z += ((this.baseCameraZ + (game.isBoosted && !reduced ? 1.3 : 0)) - this.camera.position.z) * .04;
    this.clouds.forEach((cloud, i) => { if (!reduced) cloud.position.x += dt * (.15 + i * .025); if (cloud.position.x > 65) cloud.position.x = -65; });
    Object.entries(this.signs).forEach(([id, sign]) => {
      sign.visible = game.approachingSign === id;
      if (sign.visible) sign.position.set(5.4, 0, -4 - Math.max(0, game.signZ - 90) * .085);
    });
    this.finish.visible = game.approachingSign === 'FINISH';
    this.finish.position.z = -4 - Math.max(0, game.signZ - 90) * .085;
    this.renderer.render(this.scene, this.camera);
  }

  render(now, dt, reduced, shake) {
    if (this.mode === 'drive') this.renderDrive(now, dt, reduced, shake);
    if (this.mode === 'start') this.renderGallery(now, reduced);
    if (this.mode === 'junction') this.renderJunction?.(now, reduced);
  }

  bounce(id) { this.bounceId = id; this.bounceAt = performance.now(); this.galleryLast = 0; }
  chooseRoute(id) {
    if (this.mode !== 'junction') return;
    this.chosenRoute = this.routes.find(route => route.id === id);
    this.routeStarted = performance.now();
    this.routes.forEach(route => {
      route.mesh.material.emissive.copy(route.mesh.material.color);
      route.mesh.material.emissiveIntensity = route.id === id ? .35 : 0;
      route.label.classList.toggle('selected', route.id === id);
    });
  }
  dispose() {
    this.clear();
    this.renderer.domElement.removeEventListener('webglcontextlost', this.lost);
    document.getElementById('city-canvas').removeEventListener('click', this.cityClick);
    document.getElementById('junction-canvas').removeEventListener('click', this.junctionClick);
    this.renderer.dispose();
  }
}
