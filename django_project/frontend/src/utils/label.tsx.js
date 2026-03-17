import { IS_DEBUG } from "./logger";

export const formatStyle = (config, features = null) => {
  const layout = {
    "text-anchor": "bottom",
    "text-size": 14,
    "text-variable-anchor": ["center"],
  };

  // This is for test
  if (IS_DEBUG) {
    layout["text-allow-overlap"] = true;
    layout["text-ignore-placement"] = true;
    layout["symbol-avoid-edges"] = true;
  }
  const paint = {
    "text-halo-blur": 2
  };
  let minZoom = 0;
  let maxZoom = 24;

  // Check the style
  const { text, style } = config;
  if (text && style) {
    minZoom = style.minZoom ? style.minZoom : minZoom;
    maxZoom = style.maxZoom ? style.maxZoom : maxZoom;
    paint["text-color"] = style.fontColor.replaceAll("##", "#");
    if (style.fontFamily) {
      const font = style.fontFamily.split(",")[0].replaceAll('"', "");
      layout["text-font"] = [font, font];
    } else {
      layout["text-font"] = ["Arial", "Arial"];
    }
    layout["text-size"] = style.fontSize;
    paint["text-halo-color"] = style.haloColor.replaceAll("##", "#");
    paint["text-halo-width"] = style.haloWeight ? 1 : 0;

    const textField = ["format"];
    const formattedText = text.replaceAll("{", " {{").replaceAll("}", "}} ");
    const separators = [" {", "} "];
    formattedText.split("\n").map((label, idx) => {
      label.split(new RegExp(separators.join("|"), "g")).map((row) => {
        if (row.includes("{")) {
          textField.push(["get", row.replace("{", "").replace("}", "")]);
        } else if (row.includes("round")) {
          const property = textField[textField.length - 1][1];
          if (property) {
            const decimalNumber = row.split(/.round\(|\)/);
            if (decimalNumber[0]) {
              textField.push(row);
            } else if (!isNaN(parseInt(decimalNumber[1]))) {
              const decimalPlace = parseInt(decimalNumber[1]);
              if (decimalNumber[2]) {
                textField.push(decimalNumber[2]);
              }
              if (features) {
                features.map((feature) => {
                  if (feature.properties[property]) {
                    try {
                      feature.properties[property] =
                        feature.properties[property].round(decimalPlace);
                    } catch (err) {}
                  }
                });
              }
            }
          }
        } else if (row) {
          textField.push(row);
        }
      });
      textField.push("\n");
    });
    layout["text-field"] = textField;
  }
  return { paint, layout, minZoom, maxZoom };
};
