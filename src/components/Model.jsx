import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { fitClone } from "../lib/fitModel.js";

// Smoothest a surface in the main scene is allowed to be. Applies here and not
// in PartViewer because only this scene has the IBL environment that the
// glossier materials were mirroring — the part previews are lit by plain lamps
// and look right as authored.
const MIN_ROUGHNESS = 0.5;

// Loads a GLB and auto-fits it: centered at the origin, resting on y = 0,
// scaled so its longest horizontal side matches the model's `length`. That
// way each model sits the same way in the scene regardless of how its source
// file was authored or scaled. Reports the fitted size back up so the camera
// can auto-frame it instead of guessing.
export function Model({ model, onClick, onMeasured }) {
  const { scene } = useGLTF(model.path);
  const { clone, fitted } = useMemo(
    () =>
      fitClone(scene, model.length, {
        rotation: model.rotation,
        materials: model.materials,
        minRoughness: MIN_ROUGHNESS,
      }),
    [scene, model.length, model.rotation, model.materials]
  );

  useEffect(() => {
    console.info(
      `[viewer] fitted "${model.id}" size (meters): ${fitted.width.toFixed(2)} x ${fitted.depth.toFixed(2)} x ${fitted.height.toFixed(2)} (W x D x H).`
    );
    onMeasured?.(fitted);
  }, [fitted, onMeasured, model.id]);

  return (
    <group onClick={onClick}>
      <primitive object={clone} />
    </group>
  );
}
