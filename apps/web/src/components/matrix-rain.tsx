// apps/web/src/components/matrix-rain.tsx
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useScrollStore } from "@/lib/scroll-store";

// Characters: katakana range + digits + some symbols
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789@#$%&";
const COLUMN_COUNT = 60;
const CHARS_PER_COLUMN = 20;
const SPREAD_X = 40;
const SPREAD_Z = 50;
const FALL_SPEED_MIN = 2;
const FALL_SPEED_MAX = 8;

/** Generate a canvas texture with a single character */
function createCharTexture(char: string): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, size, size);
  ctx.font = `${size * 0.7}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#00ff41";
  ctx.fillText(char, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function MatrixRain() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const columnCount = isMobile ? 25 : COLUMN_COUNT;
  const charsPerColumn = isMobile ? 12 : CHARS_PER_COLUMN;
  const totalChars = columnCount * charsPerColumn;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-generate per-instance data
  const instanceData = useMemo(() => {
    const data = [];
    for (let col = 0; col < columnCount; col++) {
      const x = (col / columnCount - 0.5) * SPREAD_X;
      for (let row = 0; row < charsPerColumn; row++) {
        data.push({
          x,
          y: (row / charsPerColumn) * SPREAD_Z - SPREAD_Z * Math.random(),
          z: -Math.random() * SPREAD_Z,
          speed: FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
          opacity: 0.1 + Math.random() * 0.9,
          charIndex: Math.floor(Math.random() * CHARS.length),
        });
      }
    }
    return data;
  }, []);

  // Create a shared texture atlas (single character for simplicity, rotated per instance)
  const texture = useMemo(() => {
    const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)]!;
    return createCharTexture(randomChar);
  }, []);

  // Per-instance colors for varying opacity (reserved for future vertex color wiring)
  const _colors = useMemo(() => {
    const arr = new Float32Array(totalChars * 3);
    for (let i = 0; i < totalChars; i++) {
      const d = instanceData[i]!;
      // Green channel varies by opacity, slight tint variation
      arr[i * 3] = 0;
      arr[i * 3 + 1] = d.opacity;
      arr[i * 3 + 2] = d.opacity * 0.25;
    }
    return arr;
  }, [instanceData]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { scrollProgress, mouseX, mouseY } = useScrollStore.getState();
    // Reduce density as user scrolls (skip more chars)
    const densityFactor = 1 - scrollProgress * 0.4;
    // Speed modifier
    const speedMod = 1 - scrollProgress * 0.3;

    for (let i = 0; i < totalChars; i++) {
      const d = instanceData[i]!;

      // Skip some instances based on density
      if (d.opacity < 1 - densityFactor) {
        dummy.position.set(0, -9999, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      // Fall downward
      d.y -= d.speed * delta * speedMod;

      // Reset when fallen past camera
      if (d.y < -SPREAD_Z / 2) {
        d.y = SPREAD_Z / 2 + Math.random() * 10;
        d.charIndex = Math.floor(Math.random() * CHARS.length);
      }

      dummy.position.set(d.x + mouseX * 0.5, d.y, d.z);
      dummy.scale.setScalar(0.3);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Subtle camera sway based on mouse
    state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, mouseX * 0.05, 0.05);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, mouseY * 0.03, 0.05);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalChars]}>
      <planeGeometry args={[0.5, 0.8]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
        depthWrite={false}
        vertexColors
      />
    </instancedMesh>
  );
}
