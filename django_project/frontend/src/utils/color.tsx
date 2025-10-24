const toHex = (value: number) => {
  const hex = Math.round(value).toString(16);
  return hex.padStart(2, "0");
};

export const hexToRgba = (hex: string | null, alpha = 1, format = "array") => {
  if (!hex) {
    return;
  }
  // Remove the hash if present
  const hexClean = hex.replace("#", "");

  // Parse the R, G, and B values
  const r = parseInt(hexClean.substring(0, 2), 16);
  const g = parseInt(hexClean.substring(2, 4), 16);
  const b = parseInt(hexClean.substring(4, 6), 16);
  alpha =
    hexClean.length == 8 ? parseInt(hexClean.substring(6, 8), 16) / 255 : alpha;

  // Return in RGBA format
  if (format == "array") {
    return [r, g, b, alpha];
  } else if (format == "object") {
    return {
      r: r,
      g: g,
      b: b,
      a: alpha,
    };
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Convert RGBA to hex
 * @param rgba object from react-color
 * @returns hex color with alpha
 */
export const rgbaToHex = (rgba: {
  r: number;
  g: number;
  b: number;
  a: number;
}) => {
  const alpha = Math.round(rgba.a * 255); // Convert alpha to a value between 0-255

  // Combine RGBA components into a single HEX string
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${toHex(alpha)}`;
};

/**
 * Remove alpha from hex color
 * @param hex
 */
export function removeHexAlpha(hex: string) {
  return hex.slice(0, 7);
}
