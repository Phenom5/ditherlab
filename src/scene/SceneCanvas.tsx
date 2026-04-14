'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { vertexShader, fragmentShader, ditherTypeToInt } from '@/shaders/ditherShader';
import { generateObject } from './objectGenerator';
import { exportPNG, exportSVG } from './exportUtils';

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const objectGroupRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const shadowRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number>(0);

  const config = useStore();

  // Expose export functions globally for the action bar
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__ditherlab_export_png = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        exportPNG(rendererRef.current, sceneRef.current, cameraRef.current);
      }
    };
    (window as unknown as Record<string, unknown>).__ditherlab_export_svg = () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        exportSVG(rendererRef.current, sceneRef.current, cameraRef.current);
      }
    };
  }, []);

  const rebuildObject = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old object
    if (objectGroupRef.current) {
      scene.remove(objectGroupRef.current);
      objectGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
    }

    // Parse hex color to vec3
    const hexColor = config.color;
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    const ditherMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: config.transparency < 1.0,
      uniforms: {
        baseColor: { value: new THREE.Vector3(r, g, b) },
        lightDirection: {
          value: new THREE.Vector3(
            config.lightDirection.x,
            config.lightDirection.y,
            config.lightDirection.z
          ).normalize(),
        },
        ditherType: { value: ditherTypeToInt(config.ditheringStyle) },
        ditherScale: { value: 1.0 },
        outlineStrength: { value: config.renderingRules.noOutlines ? 0.0 : 1.0 },
        opacity: { value: config.transparency },
      },
    });

    const newObject = generateObject({
      description: config.activeDescription,
      style: config.style,
      details: config.activeDetails,
      mood: config.mood,
      renderingRules: config.renderingRules,
      material: ditherMaterial,
    });

    objectGroupRef.current = newObject;
    scene.add(newObject);

    if (gridRef.current) {
      gridRef.current.visible = config.renderingRules.gridBackground;
    }
    if (shadowRef.current) {
      shadowRef.current.visible = config.renderingRules.softShadow;
    }
  }, [config]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f0);
    sceneRef.current = scene;

    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 5;
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );
    camera.position.set(6, 5, 6);
    camera.lookAt(0, 0.8, 0);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      preserveDrawingBuffer: true,
      alpha: true, // Allow transparent background for export
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ground grid
    const grid = new THREE.GridHelper(10, 20, 0xd0d0c8, 0xe0e0d8);
    grid.position.y = -0.01;
    scene.add(grid);
    gridRef.current = grid;

    // Soft shadow — tagged with userData so export can find and hide it
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(4, 4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    shadowMesh.userData.__ditherlab_shadow = true; // Tag for export filtering
    scene.add(shadowMesh);
    shadowRef.current = shadowMesh;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const a = w / h;
      camera.left = -frustumSize * a / 2;
      camera.right = frustumSize * a / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    rebuildObject();
  }, [rebuildObject]);

  return (
    <div
      ref={canvasRef}
      className="w-full h-full min-h-0"
      style={{ touchAction: 'none' }}
    />
  );
}
