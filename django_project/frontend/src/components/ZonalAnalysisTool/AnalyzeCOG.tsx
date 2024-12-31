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
import { ContextLayer } from "../../store/dashboard/reducers/contextLayers";
import proj4 from 'proj4';
import {
  ZonalAnalysisConfiguration,
  ZonalAnalysisLayerConfiguration
} from "./index.d";
import { Feature } from "geojson";
import { fromUrl } from 'geotiff';
import { Variables } from "../../utils/Variables";
import { analyzeData } from "../../utils/analysisData";

export const analyzeCOG = async (
  contextLayer: ContextLayer,
  config: ZonalAnalysisConfiguration,
  analysisLayer: ZonalAnalysisLayerConfiguration,
  features: Array<Feature>,
  setIsAnalysing: (isAnalysing: boolean) => void,
  setValue: (value: number) => void,
  setError: (error: string) => void,
) => {
  if (contextLayer.layer_type !== Variables.LAYER.TYPE.RASTER_COG) {
    setIsAnalysing(false)
    setValue(null)
    setError(`Can't calculate for ${contextLayer.layer_type}`)
    return;
  }
  try {

    const geotiff = await fromUrl(contextLayer.url);
    const image = await geotiff.getImage();
    const [originX, originY] = image.getOrigin();
    const [resolutionX, resolutionY] = image.getResolution();
    const width = image.getWidth(); // Image width in pixels
    const height = image.getHeight(); // Image height in pixels

    const coordsToPixel = (lon: number, lat: number) => [
      Math.round((lon - originX) / resolutionX),
      Math.round((lat - originY) / resolutionY),
    ];

    const values = [];
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
            values.push(pixelValue[0][0]);
          }
        }
      }
    }
    setValue(analyzeData(analysisLayer.aggregation, values))
  } catch (err) {
    setError(err.toString())
  }
  setIsAnalysing(false)
}