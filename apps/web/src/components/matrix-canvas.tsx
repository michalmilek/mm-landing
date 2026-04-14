// apps/web/src/components/matrix-canvas.tsx
import { Canvas } from "@react-three/fiber";

import { MatrixRain } from "./matrix-rain";

export function MatrixCanvas() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <MatrixRain />
      </Canvas>
    </div>
  );
}
