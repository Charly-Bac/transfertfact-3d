// Chargement des assets compressés (textures KTX2, modèles GLB meshopt + KTX2).
// Le transcodeur Basis est servi localement (public/basis/) : dist/ ne dépend d'aucun CDN.

import { useGLTF, useKTX2 } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { RepeatWrapping, type Texture, type WebGLRenderer } from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

const BASE = import.meta.env.BASE_URL;
export const BASIS_PATH = `${BASE}basis/`;
export const asset = (path: string) => `${BASE}${path}`;

// Un seul KTX2Loader partagé (il démarre des workers de transcodage).
let ktx2Loader: KTX2Loader | null = null;
function sharedKtx2(gl: WebGLRenderer) {
  if (!ktx2Loader) ktx2Loader = new KTX2Loader().setTranscoderPath(BASIS_PATH).detectSupport(gl);
  return ktx2Loader;
}

/** Modèle GLB : meshopt + KTX2, sans Draco. */
export function useModel(path: string) {
  const gl = useThree((s) => s.gl);
  return useGLTF(asset(path), false, true, (loader) => {
    // drei passe le GLTFLoader de three-stdlib : on ne s'appuie que sur setKTX2Loader.
    (loader as unknown as { setKTX2Loader(l: KTX2Loader): void }).setKTX2Loader(sharedKtx2(gl));
  });
}

/** Jeu de textures KTX2, répétées `repeat` fois (textures tuilables du décor). */
export function useTiledTextures<K extends string>(paths: Record<K, string>, repeat: [number, number]): Record<K, Texture> {
  const keys = Object.keys(paths) as K[];
  const textures = useKTX2(
    keys.map((k) => asset(paths[k])),
    BASIS_PATH,
  ) as Texture[];
  return useMemo(() => {
    const out = {} as Record<K, Texture>;
    keys.forEach((k, i) => {
      const t = textures[i];
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
      t.anisotropy = 8;
      t.needsUpdate = true;
      out[k] = t;
    });
    return out;
  }, [textures, repeat[0], repeat[1]]);
}
