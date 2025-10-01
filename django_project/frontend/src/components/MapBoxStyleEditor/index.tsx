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
import { useTranslation } from "react-i18next";
import type { LayerSpecification, SourceSpecification } from "maplibre-gl";
import { Circle } from "./Circle";
import { Symbol } from "./Symbol";
import { Line } from "./Line";
import { Fill } from "./Fill";
import { AddIcon, DeleteIcon, MaputnikIcon } from "../Icons";
import { ThemeButton } from "../Elements/Button";
import {
  defaultPointStyle
} from "../../pages/Admin/ContextLayer/StyleConfig/layerStyles";
import { DEFAULT_STYLES } from "./style";

import "./style.scss";

interface MapBoxStyleEditorProps {
  layers: LayerSpecification[];
  setLayers: (layer: LayerSpecification[]) => void;
}

interface MapBoxStyleEditorMemberProps {
  layer: LayerSpecification;
  idx: number;
}

export function MapBoxStyleEditor({
  layers,
  setLayers,
}: MapBoxStyleEditorProps) {
  const setLayer = (layer: LayerSpecification, idx: number) => {
    const newLayers = [...layers];
    newLayers[idx] = { ...layer };
    setLayers(newLayers);
  };
  const Render = ({ layer, idx }: MapBoxStyleEditorMemberProps) => {
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
  };
  return layers.map((layer, idx) => (
    <div key={idx}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="LayerId">{layer.id}</div>
        <div
          className="LayerDelete"
          onClick={() => setLayers(layers.filter((l) => l.id !== layer.id))}
        >
          <DeleteIcon />
        </div>
      </div>
      <div className="LayerForm">
        <Render layer={layer} idx={idx} />
      </div>
    </div>
  ));
}

interface Props {
  layers: LayerSpecification[];
  setLayers: (layers: LayerSpecification[]) => void;
  source?: SourceSpecification;
  sourceLayer: string;
}

const FREE_TEXT_FORM = "Free text form";
const EDITOR = "Editor";

export function Editor({ layers, setLayers, source, sourceLayer }: Props) {
  const { t } = useTranslation();
  const [textArea, setTextArea] = useState<string>(null);
  const [mode, setMode] = useState<string>(EDITOR);

  useEffect(() => {
    if (textArea !== JSON.stringify(layers)) {
      setTextArea(JSON.stringify(layers, null, 4));
    }
  }, [layers]);

  const onAdd = (layerType: string) => {
    // @ts-ignore
    const style = DEFAULT_STYLES[layerType];
    if (sourceLayer) {
      style["source-layer"] = sourceLayer;
    }
    if (source && Object.keys(source)[0]) {
      style.source = Object.keys(source)[0];
    } else {
      style.source = "source";
    }
    if (style?.layout && style?.layout["icon-image"]) {
      style.layout["icon-image"] =
        window.location.origin + style?.layout["icon-image"];
    }

    const maxId = Math.max(
      ...layers.map((l) => Number(l.id)).filter((n) => !isNaN(n)),
    );
    style.id = (
      Number.isFinite(maxId) ? maxId + 1 : layers.length + 1
    ).toString();
    setLayers([...layers, style]);
  };

  return (
    <>
      {/* Extra button */}
      <div style={{ display: "flex" }}>
        <ThemeButton
          variant={"primary " + (mode !== FREE_TEXT_FORM ? "Reverse" : "")}
          onClick={() => setMode(FREE_TEXT_FORM)}
        >
          {t(FREE_TEXT_FORM)}
        </ThemeButton>
        <ThemeButton
          variant={"primary " + (mode !== EDITOR ? "Reverse" : "")}
          onClick={() => setMode(EDITOR)}
        >
          {t(EDITOR)}
        </ThemeButton>
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
                version: 8,
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
      {mode === FREE_TEXT_FORM && (
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
      )}
      {mode === EDITOR && (
        <div style={{ flexGrow: 1 }}>
          <div className="MapBoxStyleEditor">
            <MapBoxStyleEditor
              layers={layers ? layers : []}
              setLayers={setLayers}
            />
            <div className="AdditonalStyleEditor">
              <div onClick={() => onAdd("fill")}>
                <AddIcon />
                Add fill
              </div>
              <div onClick={() => onAdd("circle")}>
                <AddIcon />
                Add circle
              </div>
              <div onClick={() => onAdd("line")}>
                <AddIcon />
                Add line
              </div>
              <div onClick={() => onAdd("symbol")}>
                <AddIcon />
                Add symbol
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
