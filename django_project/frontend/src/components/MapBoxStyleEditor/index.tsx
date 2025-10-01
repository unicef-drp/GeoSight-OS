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

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { Circle } from "./Circle";
import { Symbol } from "./Symbol";
import { Line } from "./Line";
import { Fill } from "./Fill";
import { MaputnikIcon } from "../Icons";
import { ThemeButton } from "../Elements/Button";
import {
  defaultPointStyle
} from "../../pages/Admin/ContextLayer/StyleConfig/layerStyles";

interface MapBoxStyleEditorProps {
  source: string;
  layers: LayerSpecification[];
  setLayers: (layer: LayerSpecification[]) => void;
}

export function MapBoxStyleEditor({
  source,
  layers,
  setLayers,
}: MapBoxStyleEditorProps) {
  const setLayer = (layer: LayerSpecification, idx: number) => {
    const newLayers = [...layers];
    newLayers[idx] = layer;
    setLayers(newLayers);
  };
  return layers.map((layer, idx) => {
    switch (layer.type) {
      case "circle":
        return (
          <Circle layer={layer} setLayer={(layer) => setLayer(layer, idx)} />
        );
      case "fill":
        return (
          <Fill layer={layer} setLayer={(layer) => setLayer(layer, idx)} />
        );
      case "line":
        return (
          <Line layer={layer} setLayer={(layer) => setLayer(layer, idx)} />
        );
      case "symbol":
        return (
          <Symbol layer={layer} setLayer={(layer) => setLayer(layer, idx)} />
        );
      default:
        return <div>This type does not have editor</div>;
    }
  });
}

interface Props {
  layers: LayerSpecification[];
  setLayers: (layers: LayerSpecification[]) => void;
  source?: SourceSpecification;
}

export function Editor({ layers, setLayers, source }: Props) {
  const [textArea, setTextArea] = useState<string>(null);

  useEffect(() => {
    if (textArea !== JSON.stringify(layers)) {
      setTextArea(JSON.stringify(layers, null, 4));
    }
  }, [layers]);
  return (
    <>
      {/* Extra button */}
      <div style={{ display: "flex" }}>
        <ThemeButton variant="primary">Free text form</ThemeButton>
        <ThemeButton variant="primary">Editor</ThemeButton>
        <div style={{ flexGrow: 1 }} />
        {/* MAPUTNIK EDITOR */}
        {source ? (
          <ThemeButton
            variant="primary Reverse"
            onClick={() => {
              let uuid = uuidv4();
              const _window = window.open(
                "/cloud-native-gis/maputnik/",
                uuid,
                "popup=true",
              );
              // @ts-ignore
              _window.inputStyle = JSON.stringify({
                id: 1,
                name: "Layer",
                sources: source,
                layers: layers,
              });
              window.addEventListener(
                "message",
                (event) => {
                  // @ts-ignore
                  if (event.source?.name === uuid) {
                    const layers = event.data.layers.filter(
                      (layer: LayerSpecification) =>
                        layer.id !== "openstreetmap",
                    );
                    setLayers(layers);
                  }
                },
                false,
              );
            }}
          >
            <MaputnikIcon /> Maputnik editor
          </ThemeButton>
        ) : null}
      </div>
      <textarea
        style={{ flexGrow: 1 }}
        placeholder={`Fill with style, which is list if Mapbox Layer specification. e.g: ${JSON.stringify(
          defaultPointStyle,
          null,
          4,
        )}`}
        value={textArea}
        onChange={(evt) => {
          setTextArea(evt.target.value);
          try {
            setLayers(JSON.parse(evt.target.value));
          } catch (err) {}
        }}
      />
    </>
  );
}
