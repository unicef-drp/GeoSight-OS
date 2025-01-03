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
 * __date__ = '03/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { fromUrl } from "geotiff";
import proj4 from "proj4";

export const getCogFeatureByPoint = async (url: string, coordinates: number[]) => {
  const geotiff = await fromUrl(url);
  const image = await geotiff.getImage();
  const [originX, originY] = image.getOrigin();
  const [resolutionX, resolutionY] = image.getResolution();
  const width = image.getWidth();
  const height = image.getHeight();

  // Coords to pixel
  const coordsToPixel = (lon: number, lat: number) => [
    Math.round((lon - originX) / resolutionX),
    Math.round((lat - originY) / resolutionY),
  ];

  const values = []
  const reprojectedCoordinates = proj4('EPSG:4326', 'EPSG:3857', coordinates);
  const [x, y] = coordsToPixel(reprojectedCoordinates[0], reprojectedCoordinates[1]);
  if (x >= 0 && y >= 0 && x < width && y < height) {
    const pixelValue = await image.readRasters({
      window: [x, y, x + 1, y + 1],
    });
    values.push(pixelValue[0]);
  }
  return values
}