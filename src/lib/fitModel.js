import * as THREE from "three";

// Repaints the meshes using `tint.material` by multiplying the base colour
// through the existing texture, so the paint changes while livery decals,
// panel shading and dirt stay put. Object3D.clone() shares materials with the
// cached GLTF, so the material is copied first — tinting in place would
// repaint every other instance loaded from that file too.
function applyTint(mesh, { material: name, color }) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

  const repainted = materials.map((material) => {
    if (!material || material.name !== name) return material;
    const copy = material.clone();
    copy.color = new THREE.Color(color);
    return copy;
  });

  mesh.material = Array.isArray(mesh.material) ? repainted : repainted[0];
}

// Clones a loaded GLTF scene, centers it at the origin resting on y = 0, and
// scales it so its longest horizontal side equals targetLength. Shared by
// the main car Model and the smaller PartViewer so both auto-fit the same
// way regardless of how the source GLB was authored/scaled.
//
// `rotation` is applied before measuring, so a model authored facing the
// wrong way is measured (and scaled) in the orientation it'll actually be
// shown in — the fit keys off the longest *horizontal* side.
export function fitClone(scene, targetLength, { rotation, tint } = {}) {
  const clone = scene.clone(true);

  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (tint) applyTint(child, tint);
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
