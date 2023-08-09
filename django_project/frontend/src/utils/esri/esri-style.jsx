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
* __date__ = '13/06/2023'
* __copyright__ = ('Copyright 2023, Unicef')
*/

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Read Symbol
 */
const readSymbol = (symbol) => {
  if (!symbol.color) {
    symbol.color = [0, 0, 0, 0]
  }
  switch (symbol.type) {
    case 'esriSMS':
      switch (symbol.style) {
        case 'esriSMSCircle':
          return {
            type: 'circle',
            style: {
              radius: symbol.size,
              fillColor: symbol.color ? rgbToHex(...symbol.color) : null,
              color: symbol.outline && symbol.outline.color ? rgbToHex(...symbol.outline.color) : null,
              weight: symbol.outline && symbol.outline.width ? symbol.outline.width : null,
              fillOpacity: 1
            },
          };
        case 'esriSMSSquare':
          return {
            type: 'square',
            style: {
              radius: symbol.size,
              fillColor: symbol.color ? rgbToHex(...symbol.color) : null,
              color: symbol.outline && symbol.outline.color ? rgbToHex(...symbol.outline.color) : null,
              weight: symbol.outline && symbol.outline.width ? symbol.outline.width : null,
              fillOpacity: 1
            },
          };
        default:
          throw `Symbol type ${symbol.type} and style ${symbol.style} is not implemented yet.`;
      }
    case 'esriPMS':
      let icon = {
        iconUrl: `data:image/png;base64,${symbol.imageData}`,
        rotation: symbol.angle,
      };
      if (symbol.height && symbol.width) {
        icon['height'] = symbol.height;
        icon['width'] = symbol.width;
        icon['iconSize'] = [symbol.width, symbol.height];
      }
      return {
        type: 'icon',
        style: icon
      };

    case 'esriSLS':
      return {
        type: 'line',
        style: {
          color: rgbToHex(...symbol.color),
          width: symbol.width,
          weight: symbol.weight,
          fillOpacity: 1
        },
      };
    case 'esriSFS':
      let style = symbol.outline ? readSymbol(symbol.outline) : {};
      return {
        type: 'polygon',
        style: {
          color: style ? style['style']?.color : null,
          weight: style ? style['style']?.width : 0,
          fillColor: rgbToHex(...symbol.color),
          fillOpacity: 1
        },
      };
    case 'esriPFS': {
      let style = symbol.outline ? readSymbol(symbol.outline) : {};
      let icon = {
        iconUrl: symbol.imageData.includes('data:image') ? symbol.imageData : `data:image/png;base64,${symbol.imageData}`,
        rotation: symbol.angle,
        color: style ? style['style']?.color : null,
        weight: style ? style['style']?.width : 0
      };
      if (symbol.color) {
        icon['fillColor'] = rgbToHex(...symbol.color)
        icon['fillOpacity'] = 1
      } else {
        icon['fillColor'] = icon.color
        icon['fillOpacity'] = 0.1
      }
      if (symbol.height && symbol.width) {
        icon['height'] = symbol.height;
        icon['width'] = symbol.width;
        icon['iconSize'] = [symbol.width, symbol.height];
      }
      return {
        type: 'icon',
        style: icon
      };
    }
    default:
      throw `Symbol type ${symbol.type} is not implemented yet.`;
  }
};

/** From degree to radians
 * @param degrees
 */
const toRadians = (degrees) => {
  var pi = Math.PI;
  return degrees * (pi / 180);
}
export default function parseArcRESTStyle(data) {
  /**
   * Parse Arcrest layer style json for style details
   * ESRI Alpha is scaled up tp 255 - use maxTrans ceiling
   * @param  {json} data ArcREST response as json
   * @return {ol.style.Style}     Style to apply
   */
  const drawingInfo = data.drawingInfo;
  switch (drawingInfo?.renderer.type) {
    case "classBreaks":
    case "uniqueValue": {
      let info = {
        type: data.type,
        geometryType: data.geometryType,
        classifications: []
      };

      // CHeck which field need to check as classification
      if (drawingInfo.renderer.field1) {
        info['fieldName'] = drawingInfo.renderer.field1
      } else if (drawingInfo.renderer.field) {
        info['fieldName'] = drawingInfo.renderer.field
      }

      let list = []
      if (drawingInfo.renderer.type === "classBreaks") {
        list = drawingInfo.renderer.classBreakInfos;
      } else if (drawingInfo.renderer.type === "uniqueValue") {
        list = drawingInfo.renderer.uniqueValueInfos;
      }
      list.forEach(
        renderer => {
          renderer['style'] = readSymbol(renderer.symbol);
          info['classifications'].push(renderer);
          info['classificationValueMethod'] = renderer.classMaxValue !== undefined ? 'classMaxValue' : 'classExactValue';
        }
      );
      return info;
    }
    case "simple": {
      let info = {
        type: data.type,
        geometryType: data.geometryType,
        classificationValueMethod: 'noClassification'
      };
      info['style'] = readSymbol(drawingInfo.renderer.symbol);
      return info;
    }
    default: {
      return null;
    }
  }
};
