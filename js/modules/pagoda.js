let scene, camera, renderer;
let pagodaGroup;

function initThree() {
  try {
    const container = document.getElementById('scene-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 60, 170);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffd700, 0.5);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(30, 100, 50);
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0xffdd88, 0.4);
    fillLight.position.set(-30, 50, -30);
    scene.add(fillLight);
    
    createPagoda();
    
    window.addEventListener('resize', onWindowResize);
    
    document.getElementById('loading').style.display = 'none';
    
    animate();
  } catch (e) {
    console.error('Three.js init error:', e);
    document.getElementById('loading').textContent = '加载失败: ' + e.message;
  }
}

function createGoldMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.12,
    emissive: 0xffaa00,
    emissiveIntensity: 0.35
  });
}

const layerGroups = [];

function createPagoda() {
  pagodaGroup = new THREE.Group();
  pagodaGroup.position.y = 20;
  const goldMat = createGoldMaterial();
  
  createLotusBase(pagodaGroup, goldMat);
  
  let currentY = 10;
  for (let i = 0; i < 9; i++) {
    const scale = 1 - i * 0.08;
    const layerGroup = createPagodaLayer(goldMat, currentY, scale, i);
    layerGroups.push(layerGroup);
    pagodaGroup.add(layerGroup);
    currentY += 10 * scale;
  }
  
  createSpire(pagodaGroup, goldMat, currentY);
  
  scene.add(pagodaGroup);
}

function createLotusBase(group, material) {
  const baseGroup = new THREE.Group();
  baseGroup.position.y = 10;
  
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(25, 28, 6, 12), material);
  platform.position.y = 3;
  baseGroup.add(platform);
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.ConeGeometry(6, 10, 4),
      material
    );
    petal.position.set(
      Math.sin(angle) * 20,
      6,
      Math.cos(angle) * 20
    );
    petal.rotation.z = -Math.PI / 2;
    petal.rotation.y = angle;
    baseGroup.add(petal);
  }
  
  const rim = new THREE.Mesh(new THREE.TorusGeometry(26, 1, 8, 24), material);
  rim.position.y = 6;
  rim.rotation.x = Math.PI / 2;
  baseGroup.add(rim);
  
  group.add(baseGroup);
}

function createPagodaLayer(material, y, scale, index) {
  const layerGroup = new THREE.Group();
  layerGroup.userData.layerIndex = index;
  
  const width = 16 * scale;
  const height = 7 * scale;
  
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.6, width * 0.7, height, 8),
    material.clone()
  );
  body.position.y = y + height / 2;
  body.userData.layerIndex = index;
  layerGroup.add(body);
  
  const band1 = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.72, width * 0.72, height * 0.12, 8),
    material.clone()
  );
  band1.position.y = y + height * 0.25;
  layerGroup.add(band1);
  
  const band2 = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.72, width * 0.72, height * 0.12, 8),
    material.clone()
  );
  band2.position.y = y + height * 0.75;
  layerGroup.add(band2);
  
  for (let j = 0; j < 4; j++) {
    const angle = (j / 4) * Math.PI * 2;
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(3 * scale, 4 * scale, 1.2 * scale),
      material.clone()
    );
    const r = width * 0.55;
    door.position.set(
      Math.sin(angle) * r,
      y + height * 0.45,
      Math.cos(angle) * r
    );
    door.rotation.y = angle;
    layerGroup.add(door);
  }
  
  const roofY = y + height;
  const roofH = 4.5 * scale;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(width * 1.25, roofH, 4),
    material.clone()
  );
  roof.position.y = roofY + roofH / 2;
  roof.rotation.y = Math.PI / 4;
  layerGroup.add(roof);
  
  for (let j = 0; j < 4; j++) {
    const angle = (j / 4) * Math.PI * 2 + Math.PI / 4;
    const eave = new THREE.Mesh(
      new THREE.BoxGeometry(2.5 * scale, 0.7 * scale, 6.5 * scale),
      material.clone()
    );
    const r = width * 0.9;
    eave.position.set(
      Math.sin(angle) * r,
      roofY + 0.6,
      Math.cos(angle) * r
    );
    eave.rotation.y = angle;
    layerGroup.add(eave);
  }
  
  for (let j = 0; j < 4; j++) {
    const angle = (j / 4) * Math.PI * 2 + Math.PI / 4;
    const bell = new THREE.Mesh(
      new THREE.SphereGeometry(0.55 * scale, 8, 8),
      material.clone()
    );
    const r = width * 1.1;
    bell.position.set(
      Math.sin(angle) * r,
      roofY - 0.4,
      Math.cos(angle) * r
    );
    layerGroup.add(bell);
  }
  
  return layerGroup;
}

function highlightLayer(layerIndex) {
  if (layerGroups[layerIndex]) {
    layerGroups[layerIndex].children.forEach(mesh => {
      if (mesh.material) {
        mesh.material.emissiveIntensity = 1.0;
        mesh.material.emissive.setHex(0xffff00);
      }
    });
  }
}

function resetLayer(layerIndex) {
  if (layerGroups[layerIndex]) {
    layerGroups[layerIndex].children.forEach(mesh => {
      if (mesh.material) {
        mesh.material.emissiveIntensity = 0.35;
        mesh.material.emissive.setHex(0xffaa00);
      }
    });
  }
}

function setLayerGlow(layerIndex, intensity) {
  if (layerGroups[layerIndex]) {
    layerGroups[layerIndex].children.forEach(mesh => {
      if (mesh.material) {
        mesh.material.emissiveIntensity = intensity;
      }
    });
  }
}

function createSpire(group, material, y) {
  const spire = new THREE.Group();
  
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(4.5, 12, 12), material);
  bowl.position.y = y;
  spire.add(bowl);
  
  for (let i = 0; i < 11; i++) {
    const r = 2.3 - i * 0.14;
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, 0.85, 6),
      material
    );
    ring.position.y = y + 4.5 + i;
    spire.add(ring);
  }
  
  const umbrella = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 3, 6),
    material
  );
  umbrella.position.y = y + 16;
  spire.add(umbrella);
  
  const jewel = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 12, 12),
    material
  );
  jewel.position.y = y + 18;
  spire.add(jewel);
  
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 22, 6),
    material
  );
  pole.position.y = y + 9;
  spire.add(pole);
  
  const top = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 5, 4),
    material
  );
  top.position.y = y + 21.5;
  top.rotation.y = Math.PI / 4;
  spire.add(top);
  
  group.add(spire);
}

function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (pagodaGroup) {
    pagodaGroup.rotation.y += 0.0025;
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

window.Pagoda = {
  highlightLayer,
  resetLayer,
  setLayerGlow,
  getLayerCount: () => 9,
  layerGroups
};
