import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useScrollStore } from "@/lib/scroll-store";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789@#$%&=+<>{}[]";

// Classic matrix: many tight columns, characters stacked vertically
const COLUMN_COUNT = 80;
const CHARS_PER_COLUMN = 28;
const SPREAD_X = 50;
const FALL_HEIGHT = 60;
const CHAR_SPACING_Y = 1.0; // vertical distance between chars in a column
const FALL_SPEED_MIN = 4;
const FALL_SPEED_MAX = 12;

/**
 * Build a texture atlas with all characters on a single canvas.
 */
function buildAtlas(chars: string) {
  const cellSize = 128;
  const cols = 10;
  const rows = Math.ceil(chars.length / cols);
  const canvas = document.createElement("canvas");
  canvas.width = cellSize * cols;
  canvas.height = cellSize * rows;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${cellSize * 0.75}px "Courier New", monospace`;
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
  return { texture, cols, rows, totalCells: chars.length };
}

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  brightness: number;
  /** Position within its column (0 = head, higher = tail) */
  columnPos: number;
}

export function MatrixRain() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const columnCount = isMobile ? 35 : COLUMN_COUNT;
  const charsPerColumn = isMobile ? 16 : CHARS_PER_COLUMN;
  const totalChars = columnCount * charsPerColumn;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Each column has chars stacked vertically, moving together
  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let col = 0; col < columnCount; col++) {
      const x = (col / columnCount - 0.5) * SPREAD_X;
      const speed = FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN);
      const startY = Math.random() * FALL_HEIGHT * 2; // stagger start positions
      const z = -2 - Math.random() * 15; // keep chars closer to camera

      for (let row = 0; row < charsPerColumn; row++) {
        // Head chars are brightest, tail fades out
        const headFade = row / charsPerColumn;
        const brightness = Math.max(0.05, 1.0 - headFade * 0.9);

        arr.push({
          x,
          y: startY - row * CHAR_SPACING_Y,
          z,
          speed,
          brightness,
          columnPos: row,
        });
      }
    }
    return arr;
  }, [columnCount, charsPerColumn]);

  // Build atlas + UV offsets
  const { atlas, uvOffsets } = useMemo(() => {
    const a = buildAtlas(CHARS);
    const offsets = new Float32Array(totalChars * 2);
    const uSize = 1 / a.cols;
    const vSize = 1 / a.rows;
    for (let i = 0; i < totalChars; i++) {
      const charIdx = Math.floor(Math.random() * a.totalCells);
      const col = charIdx % a.cols;
      const row = Math.floor(charIdx / a.cols);
      offsets[i * 2] = col * uSize;
      offsets[i * 2 + 1] = 1 - (row + 1) * vSize;
    }
    return { atlas: a, uvOffsets: offsets };
  }, [totalChars]);

  // Custom shader: atlas UV + per-instance brightness with glow
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uAtlas: { value: atlas.texture },
        uCellSize: { value: new THREE.Vector2(1 / atlas.cols, 1 / atlas.rows) },
      },
      vertexShader: `
        uniform vec2 uCellSize;
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
        varying vec2 vUv;
        varying float vBrightness;
        void main() {
          vec4 tex = texture2D(uAtlas, vUv);
          if (tex.a < 0.05) discard;

          // Bright head chars get a white-green tint, tail is dimmer green
          vec3 color = mix(
            vec3(0.0, 0.6, 0.15),   // dim tail green
            vec3(0.7, 1.0, 0.8),    // bright head white-green
            vBrightness * vBrightness
          );

          float alpha = tex.a * (0.15 + vBrightness * 0.85);
          gl_FragColor = vec4(color * alpha, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
  }, [atlas]);

  // Attach instanced attributes on first frame
  const attrsSet = useRef(false);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

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
    const uvAttr = mesh.geometry.getAttribute("aUvOffset") as THREE.InstancedBufferAttribute;
    const uSize = 1 / atlas.cols;
    const vSize = 1 / atlas.rows;

    for (let i = 0; i < totalChars; i++) {
      const p = particles[i]!;

      // All chars in a column fall at the same speed
      p.y -= p.speed * delta * speedMod;

      // When head char wraps around, randomize the character shown
      if (p.y < -FALL_HEIGHT / 2) {
        p.y += FALL_HEIGHT + Math.random() * 10;

        // Assign new random character
        const charIdx = Math.floor(Math.random() * atlas.totalCells);
        const col = charIdx % atlas.cols;
        const row = Math.floor(charIdx / atlas.cols);
        uvAttr.setXY(i, col * uSize, 1 - (row + 1) * vSize);
        uvAttr.needsUpdate = true;
      }

      dummy.position.set(p.x + mouseX * 0.3, p.y, p.z);
      dummy.scale.setScalar(0.6);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Camera parallax from mouse
    state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, mouseX * 0.04, 0.03);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, mouseY * 0.02, 0.03);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalChars]} material={material}>
      <planeGeometry args={[0.55, 0.9]} />
    </instancedMesh>
  );
}
