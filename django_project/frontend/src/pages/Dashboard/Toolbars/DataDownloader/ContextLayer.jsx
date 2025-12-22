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
 * __date__ = '16/10/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import { Variables } from "../../../../utils/Variables";
import { CloudNativeDownloadComponent } from "../../../../components/ContextLayerDownload";

export const CLOUD_NATIVE_DOWNLOAD_FORMATS = {
  original: "original",
  geojson: ".geojson",
  shapefile: ".shp",
  kml: ".kml",
  geopackage: ".gpkg",
};

/** Context layer data downloader component. */
export default function ContextLayerDownloader() {
  const contextLayers = useSelector(
    (state) => state.dashboard.data.contextLayers,
  );

  const contextLayersUsed = contextLayers.filter(
    (contextLayer) =>
      [Variables.LAYER.TYPE.CLOUD_NATIVE_GIS].includes(
        contextLayer.layer_type,
      ) && contextLayer.permission?.read,
  );
  if (!contextLayersUsed.length) {
    return (
      <div style={{ padding: "2rem 0", textAlign: "center" }}>
        No context layers are eligible to be downloaded.
      </div>
    );
  }
  return (
    <div style={{ marginTop: "1rem" }}>
      <table>
        {contextLayersUsed.map((contextLayer) => (
          <tr>
            <td style={{ padding: "4px 4px 4px 1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div>{contextLayer.name}</div>
                <div className="ContextLayerDownloaderExtensions">
                  <CloudNativeDownloadComponent
                    id={contextLayer.id}
                    ItemComponent={Box}
                    baseUrl={urls.contextLayerDownload.replaceAll(
                      "0",
                      contextLayer.id,
                    )}
                  />
                </div>
              </div>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
