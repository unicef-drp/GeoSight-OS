/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '01/10/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Mapbox style editor
   ========================================================================== */

import React from "react";
import { EditorProps } from "./type";
import { useTranslation } from "react-i18next";
import { capitalize } from "../../utils/main";
import ColorSelector from "../Input/ColorSelector/index";

interface Props extends EditorProps {
  layerAttr: string;
  styleKey: string;
}

interface NumberProps extends Props {
  min: number;
  max: number;
  step: number;
}

export function NumberInput({
  layer,
  setLayer,
  layerAttr,
  styleKey,
  min,
  max,
  step,
}: NumberProps) {
  const { t } = useTranslation();
  // @ts-ignore
  const value = layer[layerAttr][styleKey];

  return (
    <div>
      <div>
        <label className="form-label">
          {t(capitalize(styleKey.replaceAll("-", " ")))}
        </label>
      </div>
      <div>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          /* @ts-ignore */
          value={value}
          onChange={(evt) => {
            const newLayer = { ...layer };
            if (evt.target.value) {
              // @ts-ignore
              newLayer[layerAttr][styleKey] = parseFloat(evt.target.value);
            } else {
              // @ts-ignore
              delete newLayer[layerAttr][styleKey];
            }
            setLayer(newLayer);
          }}
        />
      </div>
    </div>
  );
}

export function ColorSelectorStyle({
  layer,
  setLayer,
  layerAttr,
  styleKey,
}: Props) {
  const { t } = useTranslation();
  // @ts-ignore
  const value = layer[layerAttr][styleKey];
  return (
    <div>
      <div>
        <label className="form-label">
          {t(capitalize(styleKey.replaceAll("-", " ")))}
        </label>
      </div>
      <div>
        <ColorSelector
          color={value}
          onChange={(evt) => {
            const newLayer = { ...layer };
            if (evt.target.value) {
              // @ts-ignore
              newLayer[layerAttr][styleKey] = evt.target.value;
            } else {
              // @ts-ignore
              delete newLayer[layerAttr][styleKey];
            }
            setLayer(newLayer);
          }}
        />
      </div>
    </div>
  );
}

export function ImageInput({ layer, setLayer, layerAttr, styleKey }: Props) {
  const { t } = useTranslation();
  // @ts-ignore
  const value = layer[layerAttr][styleKey];
  return (
    <div>
      <div>
        <label className="form-label">{t(styleKey)}</label>
      </div>
      <div>
        {/* @ts-ignore */}
        <img src={value} height="100px" />
        <input
          type="file"
          spellCheck="false"
          accept="image/png, image/gif, image/jpeg"
          onChange={(evt) => {
            const file = evt.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              const newLayer = { ...layer };
              // @ts-ignore
              newLayer[layerAttr][styleKey] = reader.result;
              setLayer(newLayer);
            };
          }}
        />
      </div>
    </div>
  );
}
