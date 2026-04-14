import * as THREE from 'three';

/**
 * Export the WebGL canvas as a high-resolution PNG.
 * Re-renders at 2x resolution for crisp output.
 */
export function exportPNG(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const currentSize = renderer.getSize(new THREE.Vector2());
  const scale = 2;
  renderer.setSize(currentSize.x * scale, currentSize.y * scale, false);
  renderer.render(scene, camera);

  const dataURL = renderer.domElement.toDataURL('image/png');

  // Restore original size
  renderer.setSize(currentSize.x, currentSize.y, false);
  renderer.render(scene, camera);

  // Trigger download
  const link = document.createElement('a');
  link.download = 'ditherlab-export.png';
  link.href = dataURL;
  link.click();
}

/**
 * Export as SVG — creates an SVG with the PNG embedded as a base64 image.
 * True vector SVG from WebGL is not feasible, so we embed the raster.
 */
export function exportSVG(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const currentSize = renderer.getSize(new THREE.Vector2());
  const scale = 2;
  renderer.setSize(currentSize.x * scale, currentSize.y * scale, false);
  renderer.render(scene, camera);

  const dataURL = renderer.domElement.toDataURL('image/png');
  const w = currentSize.x * scale;
  const h = currentSize.y * scale;

  renderer.setSize(currentSize.x, currentSize.y, false);
  renderer.render(scene, camera);

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
