import React, { useState } from "react";
import { SketchPicker, ColorResult, SketchPickerProps } from "react-color";
// import {rgbaToHex} from "../../../pages/Dashboard/MapLibre/utils"

interface ColorPickerInputProps {
  color: string;
  setColor: (val: any) => void;

}

/**
 * Convert RGBA to hex
 * @param rgba object from react-color
 * @returns hex color with alpha
 */
export const rgbaToHex = (rgba: { r: number; g: number; b: number; a: number }) => {
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16);
    return hex.padStart(2, "0");
  };

  const alpha = Math.round(rgba.a * 255); // Convert alpha to a value between 0-255

  // Combine RGBA components into a single HEX string
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${toHex(alpha)}`;
}

export default function ColorPickerInput({color, setColor}: ColorPickerInputProps){
  // const [color, setColor] = useState({ r: 0, g: 0, b: 0, a: 1 }); // Default RGBA color
  const [showPicker, setShowPicker] = useState(false);
  console.log(`color: ${color}`)

  const handleColorChange = (colorResult: ColorResult) => {
    // @ts-ignore
    setColor(colorResult.rgb);
  };

  const togglePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const handleOk = () => {
    setShowPicker(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={color}
        readOnly
        onClick={togglePicker}
        style={{
          backgroundColor: color,
          cursor: "pointer",
          border: "1px solid #ccc",
          padding: "5px",
          color: "#00000000",
        }}
      />
      {showPicker && (
        <div style={{ position: "absolute", zIndex: 2, right: "0px" }}>
          {React.createElement(SketchPicker as unknown as React.ComponentType<SketchPickerProps>, {
            color,
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
