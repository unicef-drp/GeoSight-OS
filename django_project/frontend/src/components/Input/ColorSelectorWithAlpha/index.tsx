import React, { useState } from "react";
import { SketchPicker, ColorResult, SketchPickerProps } from "react-color";
import {hexToRgba} from "../../../pages/Dashboard/MapLibre/utils";
// import {rgbaToHex} from "../../../pages/Dashboard/MapLibre/utils"

interface ColorPickerInputProps {
  color: string;
  opacity: number
  setColor: (val: any) => void;

}

const toHex = (value: number) => {
  const hex = Math.round(value).toString(16);
  return hex.padStart(2, "0");
};

/**
 * Convert RGBA to hex
 * @param rgba object from react-color
 * @returns hex color with alpha
 */
export const rgbaToHex = (rgba: { r: number; g: number; b: number; a: number }) => {
  const alpha = Math.round(rgba.a * 255); // Convert alpha to a value between 0-255

  // Combine RGBA components into a single HEX string
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${toHex(alpha)}`;
}

export default function ColorPickerWithAlpha({color, opacity, setColor}: ColorPickerInputProps){
  if (color.length == 7) {
    const alphaHex = toHex(Math.round((opacity / 100) * 255))
    color = color + alphaHex
  }
  const [showPicker, setShowPicker] = useState(false);
   // Default RGBA color
  const [currentColor, setCurrentColor] = useState(color);
  const handleColorChange = (colorResult: ColorResult) => {
    // @ts-ignore
    setCurrentColor(rgbaToHex(colorResult.rgb))
  };

  const togglePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const handleOk = () => {
    setShowPicker(false);
    setColor(hexToRgba(currentColor, 1, 'object'));
  };

  return (
    <div style={{ position: "relative", border: "1px solid rgba(0, 0, 0, 0.23)" }}>
      <input
        type="text"
        value={currentColor}
        readOnly
        onClick={togglePicker}
        style={{
          backgroundColor: currentColor,
          cursor: "pointer",
          border: "1px solid rgba(0, 0, 0, 0.23)",
          padding: "5px",
          color: "#00000000",
        }}
      />
      {showPicker && (
        <div style={{ position: "absolute", zIndex: 2, right: "0px" }}>
          {React.createElement(SketchPicker as unknown as React.ComponentType<SketchPickerProps>, {
            // @ts-ignore
            // color: currentColor,
            color: hexToRgba(currentColor, opacity / 100, 'object'),
            onChange: handleColorChange,
          })}
          <button
            onClick={handleOk}
            style={{
              marginTop: "10px",
              display: "block",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
