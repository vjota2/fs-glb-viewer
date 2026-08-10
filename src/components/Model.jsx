import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { fitClone } from "../lib/fitModel.js";
import { MODEL_PATH, CAR_LENGTH } from "../config.js";

// Loads the real GLB and auto-fits it: centered at the origin, resting on
// y = 0, scaled so its longest horizontal side matches CAR_LENGTH. That way
// swapping in the final model doesn't require re-tuning hotspot positions
// unless the new model's proportions are very different. Reports the fitted
// size back up so the camera can auto-frame it instead of guessing.
export function Model({ onClick, onMeasured }) {
  const { scene } = useGLTF(MODEL_PATH);
  const { clone, fitted } = useMemo(() => fitClone(scene, CAR_LENGTH), [scene]);

  useEffect(() => {
    console.info(
      `[viewer] fitted model size (meters): ${fitted.width.toFixed(2)} x ${fitted.depth.toFixed(2)} x ${fitted.height.toFixed(2)} (W x D x H).`
    );
    onMeasured?.(fitted);
  }, [fitted, onMeasured]);

  useEffect(() => () => useGLTF.clear(MODEL_PATH), []);

  return (
    <group onClick={onClick}>
      <primitive object={clone} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
