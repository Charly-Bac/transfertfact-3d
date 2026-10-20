// Rendu « caméra » : occlusion N8AO, profondeur de champ légère, tone mapping AgX, vignettage et grain fins.
// Les effets coûteux sont retirés selon le niveau de qualité adaptative.

import type { JSX } from "react";
import { DepthOfField, EffectComposer, N8AO, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { focusTarget } from "./CameraRig";
import { isMobile, useQualityLevel } from "./quality";

export function Effects() {
  const level = useQualityLevel();
  const ao = level >= 3 && !isMobile;
  const dof = level >= 2;

  // Tableau filtré : le composer n'accepte pas d'enfants nuls.
  const effects = [
    ao && <N8AO key="ao" halfRes aoRadius={0.6} distanceFalloff={0.6} intensity={2.2} color="#3a2c1e" quality="medium" />,
    dof && <DepthOfField key="dof" target={focusTarget} worldFocusRange={7} bokehScale={1.1} height={540} />,
    <ToneMapping key="tm" mode={ToneMappingMode.AGX} />,
    <Vignette key="vig" offset={0.32} darkness={0.32} />,
    <Noise key="grain" premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.18} />,
  ].filter((e): e is JSX.Element => Boolean(e));

  return (
    <EffectComposer multisampling={ao ? 0 : 4} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  );
}
