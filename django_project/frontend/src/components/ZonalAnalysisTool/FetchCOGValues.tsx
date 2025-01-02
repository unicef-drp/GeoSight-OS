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
 * __date__ = '31/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import proj4 from 'proj4';
import { FetchingFunctionProp } from "./index.d";
import { fromUrl } from 'geotiff';
import { Variables } from "../../utils/Variables";

export const fetchCOGValues = async (
  {
    contextLayer,
    features,
    setData
  }: FetchingFunctionProp) => {
  if (contextLayer.layer_type !== Variables.LAYER.TYPE.RASTER_COG) {
    setData(null, `Can't calculate for ${contextLayer.layer_type}`)
    return;
  }
  try {
    // Load file
    const geotiff = await fromUrl(contextLayer.url);
    const image = await geotiff.getImage();
    const [originX, originY] = image.getOrigin();
    const [resolutionX, resolutionY] = image.getResolution();
    const width = image.getWidth(); // Image width in pixels
    const height = image.getHeight(); // Image height in pixels

    // Coords to pixel
    const coordsToPixel = (lon: number, lat: number) => [
      Math.round((lon - originX) / resolutionX),
      Math.round((lat - originY) / resolutionY),
    ];

    const values: { Pixel: number }[] = [];
    for (let i = 0; i < features.length; i++) {
      const feature = features[i]
      // @ts-ignore
      const { coordinates, type } = feature.geometry;
      switch (type) {
        case Variables.FEATURE_TYPE.POINT: {
          // Convert the point to pixel coordinates
          const reprojectedCoordinates = proj4('EPSG:4326', 'EPSG:3857', coordinates);
          const [x, y] = coordsToPixel(reprojectedCoordinates[0], reprojectedCoordinates[1]);
          if (x >= 0 && y >= 0 && x < width && y < height) {
            const pixelValue = await image.readRasters({
              window: [x, y, x + 1, y + 1],
            });
            // @ts-ignore
            values.push({ Pixel: pixelValue[0][0] });
          }
          break;
        }
        default:
          throw Error(`${type} is not covered yet.`)
      }
    }
    setData(values, null)
  } catch (err) {
    setData(null, err.toString())
  }
}