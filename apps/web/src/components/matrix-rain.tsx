import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useScrollStore } from "@/lib/scroll-store";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789@#$%&";
const COLUMN_COUNT = 60;
const CHARS_PER_COLUMN = 20;
const SPREAD_X = 40;
const DEPTH = 50;
const FALL_SPEED_MIN = 2;
const FALL_SPEED_MAX = 8;

/**
 * Build a texture atlas: a grid of characters on a single canvas.
 * Each cell is 64×64. Layout: 10 columns, as many rows as needed.
 */
function buildAtlas(chars: string) {
  const cellSize = 64;
  const cols = 10;
  const rows = Math.ceil(chars.length / cols);
  const canvas = document.createElement("canvas");
  canvas.width = cellSize * cols;
  canvas.height = cellSize * rows;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${cellSize * 0.6}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#00ff41";

  for (let i = 0; i < chars.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.fillText(chars[i]!, col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return { texture, cols, rows, cellSize, totalCells: chars.length };
}

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  brightness: number;
}

export function MatrixRain() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const columnCount = isMobile ? 25 : COLUMN_COUNT;
  const charsPerColumn = isMobile ? 12 : CHARS_PER_COLUMN;
  const totalChars = columnCount * charsPerColumn;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let col = 0; col < columnCount; col++) {
      const x = (col / columnCount - 0.5) * SPREAD_X;
      for (let row = 0; row < charsPerColumn; row++) {
        arr.push({
          x,
          y: Math.random() * DEPTH - DEPTH / 2,
          z: -Math.random() * DEPTH,
          speed: FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
          brightness: 0.15 + Math.random() * 0.85,
        });
      }
    }
    return arr;
  }, [columnCount, charsPerColumn]);

  // Build atlas and UV-offset attribute for random characters per instance
  const { atlas, uvOffsets } = useMemo(() => {
    const a = buildAtlas(CHARS);
    // Each instance gets a random character → UV offset into the atlas
    const offsets = new Float32Array(totalChars * 2);
    const uSize = 1 / a.cols;
    const vSize = 1 / a.rows;
    for (let i = 0; i < totalChars; i++) {
      const charIdx = Math.floor(Math.random() * a.totalCells);
      const col = charIdx % a.cols;
      const row = Math.floor(charIdx / a.cols);
      offsets[i * 2] = col * uSize;
      offsets[i * 2 + 1] = 1 - (row + 1) * vSize; // flip Y
    }
    return { atlas: a, uvOffsets: offsets };
  }, [totalChars]);

  // Custom shader material for atlas UV + per-instance brightness
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uAtlas: { value: atlas.texture },
        uCellSize: { value: new THREE.Vector2(1 / atlas.cols, 1 / atlas.rows) },
      },
      vertexShader: `
        attribute vec2 aUvOffset;
        attribute float aBrightness;
        varying vec2 vUv;
        varying float vBrightness;
        void main() {
          vUv = uv * uCellSize + aUvOffset;
          vBrightness = aBrightness;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uAtlas;
        uniform vec2 uCellSize;
        varying vec2 vUv;
        varying float vBrightness;
        void main() {
          vec4 tex = texture2D(uAtlas, vUv);
          if (tex.a < 0.1) discard;
          gl_FragColor = vec4(tex.rgb * vBrightness, tex.a * vBrightness);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [atlas]);

  // Set up instanced attributes once mesh is available
  const attrsSet = useRef(false);
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Attach custom instanced attributes on first frame
    if (!attrsSet.current) {
      const geo = mesh.geometry;
      geo.setAttribute("aUvOffset", new THREE.InstancedBufferAttribute(uvOffsets, 2));
      const brightnessArr = new Float32Array(totalChars);
      for (let i = 0; i < totalChars; i++) {
        brightnessArr[i] = particles[i]!.brightness;
      }
      geo.setAttribute("aBrightness", new THREE.InstancedBufferAttribute(brightnessArr, 1));
      attrsSet.current = true;
    }

    const { scrollProgress, mouseX, mouseY } = useScrollStore.getState();
    const speedMod = 1 - scrollProgress * 0.3;

    for (let i = 0; i < totalChars; i++) {
      const p = particles[i]!;

      p.y -= p.speed * delta * speedMod;

      if (p.y < -DEPTH / 2) {
        p.y = DEPTH / 2 + Math.random() * 10;
      }

      dummy.position.set(p.x + mouseX * 0.5, p.y, p.z);
      dummy.scale.setScalar(0.35);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Camera parallax from mouse
    state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, mouseX * 0.05, 0.05);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, mouseY * 0.03, 0.05);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalChars]} material={material}>
      <planeGeometry args={[0.5, 0.8]} />
    </instancedMesh>
  );
}
