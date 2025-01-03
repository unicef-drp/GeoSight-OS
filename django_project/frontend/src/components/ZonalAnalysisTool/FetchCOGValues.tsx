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
import {postData} from "../../Requests";

export const fetchCOGValues = async (
  {
    contextLayer,
    config,
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
    let geometries = [];
    for (let i = 0; i < features.length; i++) {
      const feature = features[i]
      // @ts-ignore
      geometries.push(feature.geometry)
    }
    let data = new FormData();
    data.append( "geometries", JSON.stringify( geometries) );
    postData(
      `/api/context-layer/${contextLayer.id}/zonal-analysis/avg`,
        data,
      (response: any) => {
        console.log(response)
      }
    )
    setData(values, null)
  } catch (err) {
    setData(null, err.toString())
  }
}