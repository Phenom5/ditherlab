import * as THREE from 'three';
import type { StyleOption, MoodOption, RenderingRules } from '@/store/useStore';

/**
 * Object Generator — Procedural Isometric Illustrations
 *
 * Parses the user's description heuristically to build 3D geometry
 * from primitives (Box, Cylinder, Cone, Sphere). Each keyword maps
 * to a generation function that composes a recognizable object.
 */

interface GeneratorConfig {
  description: string;
  style: StyleOption;
  details: string;
  mood: MoodOption;
  renderingRules: RenderingRules;
  material: THREE.Material;
}

// Style-driven geometry detail level
function segmentCount(style: StyleOption): number {
  switch (style) {
    case 'blocky': return 1;
    case 'minimal': return 8;
    case 'soft': return 16;
    case 'detailed': return 32;
  }
}

// Mood-driven scale modifier
function moodScale(mood: MoodOption): number {
  switch (mood) {
    case 'playful': return 1.15;
    case 'premium': return 0.9;
    case 'futuristic': return 1.05;
    default: return 1.0;
  }
}

// ---- Individual object builders ----

function buildServerRack(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  const unitH = 0.35 * scale;
  const width = 1.2 * scale;
  const depth = 0.8 * scale;

  // Main cabinet frame
  const frameGeo = new THREE.BoxGeometry(width, unitH * 5, depth);
  const frame = new THREE.Mesh(frameGeo, mat);
  frame.position.y = unitH * 2.5;
  group.add(frame);

  // Individual server units (horizontal slots)
  for (let i = 0; i < 5; i++) {
    const slotGeo = new THREE.BoxGeometry(width * 0.9, unitH * 0.7, depth * 0.95);
    const slot = new THREE.Mesh(slotGeo, mat);
    slot.position.y = unitH * (0.5 + i);
    slot.position.z = 0.02;
    group.add(slot);
  }

  // Status lights (small cylinders on front)
  for (let i = 0; i < 5; i++) {
    const lightGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, segments);
    const light = new THREE.Mesh(lightGeo, mat);
    light.rotation.x = Math.PI / 2;
    light.position.set(width * 0.35, unitH * (0.5 + i), depth * 0.49);
    group.add(light);
  }

  // Top ventilation unit
  const ventGeo = new THREE.BoxGeometry(width * 0.6, 0.08, depth * 0.4);
  const vent = new THREE.Mesh(ventGeo, mat);
  vent.position.y = unitH * 5 + 0.06;
  group.add(vent);

  return group;
}

function buildBank(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();

  // Base/platform
  const baseGeo = new THREE.BoxGeometry(3.0 * scale, 0.2 * scale, 2.0 * scale);
  const base = new THREE.Mesh(baseGeo, mat);
  base.position.y = 0.1 * scale;
  group.add(base);

  // Main building body
  const bodyGeo = new THREE.BoxGeometry(2.6 * scale, 1.5 * scale, 1.6 * scale);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.y = 0.95 * scale;
  group.add(body);

  // Columns (4 front columns)
  for (let i = 0; i < 4; i++) {
    const colGeo = new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 1.5 * scale, segments);
    const col = new THREE.Mesh(colGeo, mat);
    col.position.set(
      (-0.9 + i * 0.6) * scale,
      0.95 * scale,
      0.85 * scale
    );
    group.add(col);
  }

  // Triangular roof (using a cone squished into a triangle)
  const roofGeo = new THREE.ConeGeometry(1.6 * scale, 0.6 * scale, 4);
  const roof = new THREE.Mesh(roofGeo, mat);
  roof.position.y = 2.0 * scale;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  // Steps
  for (let i = 0; i < 3; i++) {
    const stepGeo = new THREE.BoxGeometry((2.0 - i * 0.2) * scale, 0.08 * scale, 0.3 * scale);
    const step = new THREE.Mesh(stepGeo, mat);
    step.position.set(0, (0.04 + i * 0.08) * scale, (1.0 + i * 0.15) * scale);
    group.add(step);
  }

  return group;
}

function buildDome(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();

  // Cylindrical base
  const baseGeo = new THREE.CylinderGeometry(1.0 * scale, 1.1 * scale, 0.8 * scale, segments);
  const base = new THREE.Mesh(baseGeo, mat);
  base.position.y = 0.4 * scale;
  group.add(base);

  // Dome (half sphere)
  const domeGeo = new THREE.SphereGeometry(1.0 * scale, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, mat);
  dome.position.y = 0.8 * scale;
  group.add(dome);

  // Top spire
  const spireGeo = new THREE.ConeGeometry(0.08 * scale, 0.5 * scale, segments);
  const spire = new THREE.Mesh(spireGeo, mat);
  spire.position.y = 1.8 * scale + 0.25;
  group.add(spire);

  return group;
}

function buildHouse(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();

  // Main body
  const bodyGeo = new THREE.BoxGeometry(1.6 * scale, 1.2 * scale, 1.2 * scale);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.y = 0.6 * scale;
  group.add(body);

  // Roof
  const roofGeo = new THREE.ConeGeometry(1.2 * scale, 0.7 * scale, 4);
  const roof = new THREE.Mesh(roofGeo, mat);
  roof.position.y = 1.55 * scale;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  // Door
  const doorGeo = new THREE.BoxGeometry(0.3 * scale, 0.5 * scale, 0.05 * scale);
  const door = new THREE.Mesh(doorGeo, mat);
  door.position.set(0, 0.3 * scale, 0.625 * scale);
  group.add(door);

  // Windows
  for (const xOff of [-0.45, 0.45]) {
    const winGeo = new THREE.BoxGeometry(0.25 * scale, 0.25 * scale, 0.05 * scale);
    const win = new THREE.Mesh(winGeo, mat);
    win.position.set(xOff * scale, 0.75 * scale, 0.625 * scale);
    group.add(win);
  }

  // Chimney
  const chimGeo = new THREE.BoxGeometry(0.2 * scale, 0.5 * scale, 0.2 * scale);
  const chim = new THREE.Mesh(chimGeo, mat);
  chim.position.set(0.5 * scale, 1.6 * scale, -0.2 * scale);
  group.add(chim);

  return group;
}

function buildTower(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();

  // Main tower shaft
  const shaftGeo = new THREE.CylinderGeometry(0.5 * scale, 0.6 * scale, 3.0 * scale, segments);
  const shaft = new THREE.Mesh(shaftGeo, mat);
  shaft.position.y = 1.5 * scale;
  group.add(shaft);

  // Observation deck
  const deckGeo = new THREE.CylinderGeometry(0.7 * scale, 0.5 * scale, 0.3 * scale, segments);
  const deck = new THREE.Mesh(deckGeo, mat);
  deck.position.y = 2.8 * scale;
  group.add(deck);

  // Antenna/spire
  const antGeo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 1.0 * scale, segments);
  const ant = new THREE.Mesh(antGeo, mat);
  ant.position.y = 3.5 * scale;
  group.add(ant);

  // Base
  const baseGeo = new THREE.BoxGeometry(1.4 * scale, 0.15 * scale, 1.4 * scale);
  const baseMesh = new THREE.Mesh(baseGeo, mat);
  baseMesh.position.y = 0.075 * scale;
  group.add(baseMesh);

  return group;
}

function buildFactory(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();

  // Main building
  const bodyGeo = new THREE.BoxGeometry(2.5 * scale, 1.0 * scale, 1.5 * scale);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.y = 0.5 * scale;
  group.add(body);

  // Smokestacks
  for (let i = 0; i < 3; i++) {
    const stackGeo = new THREE.CylinderGeometry(0.12 * scale, 0.15 * scale, 1.2 * scale, segments);
    const stack = new THREE.Mesh(stackGeo, mat);
    stack.position.set((-0.6 + i * 0.6) * scale, 1.6 * scale, -0.3 * scale);
    group.add(stack);
  }

  // Loading dock
  const dockGeo = new THREE.BoxGeometry(0.8 * scale, 0.3 * scale, 0.5 * scale);
  const dock = new THREE.Mesh(dockGeo, mat);
  dock.position.set(0.85 * scale, 0.15 * scale, 1.0 * scale);
  group.add(dock);

  return group;
}

function buildRocket(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.CylinderGeometry(0.35 * scale, 0.4 * scale, 2.5 * scale, segments);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.y = 1.25 * scale;
  group.add(body);

  // Nose cone
  const noseGeo = new THREE.ConeGeometry(0.35 * scale, 0.8 * scale, segments);
  const nose = new THREE.Mesh(noseGeo, mat);
  nose.position.y = 2.9 * scale;
  group.add(nose);

  // Fins
  for (let i = 0; i < 4; i++) {
    const finGeo = new THREE.BoxGeometry(0.05 * scale, 0.6 * scale, 0.4 * scale);
    const fin = new THREE.Mesh(finGeo, mat);
    fin.position.y = 0.3 * scale;
    fin.rotation.y = (Math.PI / 2) * i;
    fin.position.x = Math.cos((Math.PI / 2) * i) * 0.4 * scale;
    fin.position.z = Math.sin((Math.PI / 2) * i) * 0.4 * scale;
    group.add(fin);
  }

  // Engine nozzle
  const nozzleGeo = new THREE.CylinderGeometry(0.3 * scale, 0.2 * scale, 0.3 * scale, segments);
  const nozzle = new THREE.Mesh(nozzleGeo, mat);
  nozzle.position.y = -0.15 * scale;
  group.add(nozzle);

  return group;
}

function buildTree(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.2 * scale, segments);
  const trunk = new THREE.Mesh(trunkGeo, mat);
  trunk.position.y = 0.6 * scale;
  group.add(trunk);

  // Foliage layers (3 cones stacked)
  for (let i = 0; i < 3; i++) {
    const r = (0.8 - i * 0.15) * scale;
    const h = 0.7 * scale;
    const leafGeo = new THREE.ConeGeometry(r, h, segments);
    const leaf = new THREE.Mesh(leafGeo, mat);
    leaf.position.y = (1.3 + i * 0.45) * scale;
    group.add(leaf);
  }

  return group;
}

function buildCube(mat: THREE.Material, _segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1.5 * scale, 1.5 * scale, 1.5 * scale);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.75 * scale;
  group.add(mesh);
  return group;
}

function buildDefault(mat: THREE.Material, segments: number, scale: number): THREE.Group {
  const group = new THREE.Group();

  // A generic multi-shape composition for unrecognized descriptions
  const boxGeo = new THREE.BoxGeometry(1.0 * scale, 1.2 * scale, 1.0 * scale);
  const box = new THREE.Mesh(boxGeo, mat);
  box.position.y = 0.6 * scale;
  group.add(box);

  const cylGeo = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 0.6 * scale, segments);
  const cyl = new THREE.Mesh(cylGeo, mat);
  cyl.position.set(0.6 * scale, 0.9 * scale, 0);
  group.add(cyl);

  const sphereGeo = new THREE.SphereGeometry(0.25 * scale, segments, segments);
  const sphere = new THREE.Mesh(sphereGeo, mat);
  sphere.position.set(-0.4 * scale, 1.3 * scale, 0.3 * scale);
  group.add(sphere);

  return group;
}

// ---- Keyword matching ----

type BuilderFn = (mat: THREE.Material, segments: number, scale: number) => THREE.Group;

const KEYWORD_MAP: [string[], BuilderFn][] = [
  [['server', 'rack', 'data center', 'datacenter', 'computer'], buildServerRack],
  [['bank', 'institution', 'courthouse', 'government', 'temple'], buildBank],
  [['dome', 'mosque', 'observatory', 'planetarium', 'capitol'], buildDome],
  [['house', 'home', 'cabin', 'cottage', 'residence'], buildHouse],
  [['tower', 'skyscraper', 'lighthouse', 'antenna', 'cell tower'], buildTower],
  [['factory', 'warehouse', 'industrial', 'plant', 'mill'], buildFactory],
  [['rocket', 'missile', 'spaceship', 'shuttle', 'spacecraft'], buildRocket],
  [['tree', 'pine', 'forest', 'plant', 'garden'], buildTree],
  [['cube', 'box', 'block', 'crate'], buildCube],
];

function matchBuilder(description: string): BuilderFn {
  const lower = description.toLowerCase();
  for (const [keywords, builder] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return builder;
    }
  }
  return buildDefault;
}

/**
 * Main entry point: generates a THREE.Group from user config.
 */
export function generateObject(config: GeneratorConfig): THREE.Group {
  const segments = segmentCount(config.style);
  const scale = moodScale(config.mood);
  const builder = matchBuilder(config.description + ' ' + config.details);
  const object = builder(config.material, segments, scale);

  // Center the object if requested
  if (config.renderingRules.centeredComposition) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.x -= center.x;
    object.position.z -= center.z;
  }

  // Elevate base if requested
  if (config.renderingRules.elevatedBase) {
    const box = new THREE.Box3().setFromObject(object);
    if (box.min.y < 0) {
      object.position.y -= box.min.y;
    }
  }

  return object;
}
