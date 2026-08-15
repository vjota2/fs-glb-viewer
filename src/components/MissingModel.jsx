import { Html } from "@react-three/drei";

// Shown when a model's .glb hasn't been dropped in yet (or fails to load), so
// the app is still usable for wiring up hotspots/UI. Sized from the model's
// own declared dimensions so the placeholder box stands in at roughly the
// right scale for whichever car is selected.
export function MissingModel({ model }) {
  const { length = 2.834, width = 1.412, height = 1.7, path } = model ?? {};

  return (
    <group position={[0, height / 2, 0]}>
      <mesh>
        <boxGeometry args={[width * 0.6, height, length]} />
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
          NO MODEL LOADED — drop a .glb at {path ?? "/models/"}
        </div>
      </Html>
    </group>
  );
}
