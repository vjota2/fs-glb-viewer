import * as THREE from "three";

// Clones a loaded GLTF scene, centers it at the origin resting on y = 0, and
// scales it so its longest horizontal side equals targetLength. Shared by
// the main car Model and the smaller PartViewer so both auto-fit the same
// way regardless of how the source GLB was authored/scaled.
//
// `rotation` is applied before measuring, so a model authored facing the
// wrong way is measured (and scaled) in the orientation it'll actually be
// shown in — the fit keys off the longest *horizontal* side.
export function fitClone(scene, targetLength, { rotation } = {}) {
  const clone = scene.clone(true);

  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
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
