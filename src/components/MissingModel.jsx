import { Html } from "@react-three/drei";
import { CAR_LENGTH, CAR_WIDTH, CAR_HEIGHT, MODEL_PATH } from "../config.js";

// Shown when public/models/monopost.glb hasn't been dropped in yet (or
// fails to load), so the app is still usable for wiring up hotspots/UI.
export function MissingModel() {
  return (
    <group position={[0, CAR_HEIGHT / 2, 0]}>
      <mesh>
        <boxGeometry args={[CAR_WIDTH * 0.6, CAR_HEIGHT, CAR_LENGTH]} />
        <meshBasicMaterial color="#f3ca60" wireframe />
      </mesh>
      <Html center distanceFactor={6} style={{ pointerEvents: "none" }}>
        <div
          style={{
            fontFamily: "DM Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.06em",
            color: "#f3ca60",
            background: "#000000c0",
            border: "1px solid #ffffff30",
            padding: "8px 12px",
            whiteSpace: "nowrap",
          }}
        >
          NO MODEL LOADED — drop a .glb at {MODEL_PATH}
        </div>
      </Html>
    </group>
  );
}
