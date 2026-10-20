// Objet issu d'un modèle Poly Haven : le modèle entier, ou un seul de ses objets (par nom).

import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import type { Object3D } from "three";
import { useModel } from "../assets";

/** Les modèles Poly Haven sont en mètres ; la scène est en unités de 10 cm. */
const METERS = 10;

type Props = { path: string; node?: string } & ThreeElements["group"];

export function PolyProp({ path, node, ...props }: Props) {
  const { scene } = useModel(path);
  const object = useMemo(() => {
    let src: Object3D = scene;
    if (node) {
      const found = scene.getObjectByName(node);
      if (!found) throw new Error(`Objet « ${node} » absent de ${path}`);
      src = found;
    }
    const o = src.clone(true);
    // Un objet extrait est recentré : on garde sa forme, pas sa place dans la planche d'origine.
    if (node) o.position.set(0, 0, 0);
    o.traverse((c) => {
      c.castShadow = true;
      c.receiveShadow = true;
    });
    return o;
  }, [scene, node, path]);
  // Échelle sur un groupe parent : l'objet garde sa propre échelle (celle de la quantification meshopt).
  return (
    <group {...props}>
      <group scale={METERS}>
        <primitive object={object} />
      </group>
    </group>
  );
}
