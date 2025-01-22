import React, { useState } from "react";
import { SketchPicker, ColorResult } from "react-color";

// interface ColorPickerInput {
//   color:
// }


export default function ColorPickerInput(){
  const [color, setColor] = useState({ r: 0, g: 0, b: 0, a: 1 }); // Default RGBA color
  const [showPicker, setShowPicker] = useState(false);

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

  const colorToString = (rgba: { r: number; g: number; b: number; a: number }) =>
    `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={colorToString(color)}
        readOnly
        onClick={togglePicker}
        style={{
          backgroundColor: colorToString(color),
          cursor: "pointer",
          border: "1px solid #ccc",
          padding: "5px",
          color: "#000",
        }}
      />
      {showPicker && (
        <div style={{ position: "absolute", zIndex: 2 }}>
          <SketchPicker
            color={color}
            onChange={handleColorChange}
          />
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
