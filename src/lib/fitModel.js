import * as THREE from "three";

// Per-material fixups applied to a model's meshes, matched by material name.
// A GLB often can't be authored exactly as the viewer wants it — the demo car
// ships every glass material as alphaMode OPAQUE, so its windows render solid,
// and its paint is white — and re-exporting someone else's model for each
// tweak isn't practical. Declaring the overrides alongside the model keeps
// those corrections visible instead of buried in an edited binary.
//
// `color` multiplies through the existing texture, so paint changes while
// livery decals and panel shading survive. `opacity` makes a material
// see-through; `hide` drops the mesh entirely. `untextured` discards the base
// colour map — needed when the baked texture is the problem rather than the
// tint over it: the demo car's glass ships as a near-black image, so no amount
// of `color` (which multiplies) or `opacity` clears it, and it always reads as
// heavy smoke.
//
// Object3D.clone() shares materials with the cached GLTF, so a matched
// material is copied before being changed — editing in place would alter
// every other instance loaded from that file, the other cars included.
function applyMaterialOverrides(mesh, overrides) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const matched = (material) =>
    material && overrides.find((o) => o.name === material.name);

  if (materials.every((m) => matched(m)?.hide)) {
    mesh.visible = false;
    return;
  }

  const patched = materials.map((material) => {
    const override = matched(material);
    if (!override) return material;

    const copy = material.clone();
    if (override.untextured) copy.map = null;
    if (override.color !== undefined) copy.color = new THREE.Color(override.color);
    if (override.opacity !== undefined) {
      copy.transparent = true;
      copy.opacity = override.opacity;
      // Transparent surfaces that write depth occlude the ones behind them —
      // without this the far window blanks out the near one as the car turns.
      copy.depthWrite = false;
    }
    return copy;
  });

  mesh.material = Array.isArray(mesh.material) ? patched : patched[0];
}

// Clones a loaded GLTF scene, centers it at the origin resting on y = 0, and
// scales it so its longest horizontal side equals targetLength. Shared by
// the main car Model and the smaller PartViewer so both auto-fit the same
// way regardless of how the source GLB was authored/scaled.
//
// `rotation` is applied before measuring, so a model authored facing the
// wrong way is measured (and scaled) in the orientation it'll actually be
// shown in — the fit keys off the longest *horizontal* side.
export function fitClone(scene, targetLength, { rotation, materials } = {}) {
  const clone = scene.clone(true);

  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (materials?.length) applyMaterialOverrides(child, materials);
    }
  });

  if (rotation) {
    clone.rotation.set(...rotation);
    clone.updateMatrixWorld(true);
  }

  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const longestHorizontal = Math.max(size.x, size.z) || 1;
  const scale = targetLength / longestHorizontal;

  clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  clone.scale.setScalar(scale);

  const fitted = {
    width: size.x * scale,
    depth: size.z * scale,
    height: size.y * scale,
  };

  return { clone, fitted };
}

// Computes a camera target/position that frames a fitted object's full
// bounding sphere, regardless of its real proportions.
export function computeFraming(fit, { viewDir, fovDeg, margin = 1.3 }) {
  const target = new THREE.Vector3(0, fit.height / 2, 0);
  const radius = 0.5 * Math.sqrt(fit.width ** 2 + fit.depth ** 2 + fit.height ** 2);
  const vFov = (fovDeg * Math.PI) / 180;
  const distance = (radius * margin) / Math.sin(vFov / 2);
  const position = target.clone().addScaledVector(viewDir, distance);
  return { target, position };
}
