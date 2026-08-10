import { Html } from "@react-three/drei";

export function Hotspot({ spot, active, onSelect }) {
  return (
    <Html position={spot.position} center occlude={false} zIndexRange={[15, 0]}>
      <div
        className={`hotspot${active ? " active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(spot.id);
        }}
      >
        <span className="hotspot-dot" />
        <span className="hotspot-label">
          {spot.doc} · {spot.label}
        </span>
      </div>
    </Html>
  );
}
