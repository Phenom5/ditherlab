import * as THREE from 'three';

/**
 * Renders only the object (no grid, shadow, or background) for export.
 * Temporarily hides environment elements and sets transparent background.
 */
function renderObjectOnly(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  scale: number
) {
  const currentSize = renderer.getSize(new THREE.Vector2());

  // Save current state
  const prevBackground = scene.background;
  const prevAlpha = renderer.getClearAlpha();
  const prevClearColor = renderer.getClearColor(new THREE.Color());

  // Collect environment objects to hide (grid + shadow plane)
  const hidden: THREE.Object3D[] = [];
  scene.traverse((child) => {
    if (
      (child instanceof THREE.GridHelper) ||
      (child.userData && child.userData.__ditherlab_shadow)
    ) {
      if (child.visible) {
        hidden.push(child);
        child.visible = false;
      }
    }
  });

  // Set transparent background
  scene.background = null;
  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);

  // Render at export resolution
  renderer.setSize(currentSize.x * scale, currentSize.y * scale, false);
  renderer.render(scene, camera);

  const dataURL = renderer.domElement.toDataURL('image/png');

  // Restore everything
  scene.background = prevBackground;
  renderer.setClearColor(prevClearColor, prevAlpha);
  renderer.setClearAlpha(prevAlpha);
  hidden.forEach((obj) => { obj.visible = true; });
  renderer.setSize(currentSize.x, currentSize.y, false);
  renderer.render(scene, camera);

  return { dataURL, width: currentSize.x * scale, height: currentSize.y * scale };
}

/**
 * Export the canvas as a high-res PNG — object only, transparent background.
 */
export function exportPNG(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const { dataURL } = renderObjectOnly(renderer, scene, camera, 2);
  const link = document.createElement('a');
  link.download = 'ditherlab-export.png';
  link.href = dataURL;
  link.click();
}

/**
 * Export as SVG with embedded raster — object only, transparent background.
 */
export function exportSVG(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const { dataURL, width: w, height: h } = renderObjectOnly(renderer, scene, camera, 2);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>DitherLab Export</title>
  <image width="${w}" height="${h}" xlink:href="${dataURL}" />
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'ditherlab-export.svg';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
