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
 * __date__ = '28/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
export default () => {
  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  self.addEventListener("message", (e) => {
    // eslint-disable-line no-restricted-globals
    if (!e) return;
    let { identifier, geometriesData, unitList, color, colors } = e.data;
    const newGeographicUnits = [];
    if (geometriesData) {
      for (const [code, geom] of Object.entries(geometriesData)) {
        const geomInList = unitList.find((row) =>
          [geom.ucode, geom.concept_uuid].includes(row.id),
        );
        if (!geomInList) {
          newGeographicUnits.push({
            id: geom.concept_uuid,
            name: `${geom.name} (${geom.ucode})`,
            color: "" + getRandomColor(),
            reference_layer_uuid: identifier,
          });
        } else {
          newGeographicUnits.push(geomInList);
        }
      }
    }
    newGeographicUnits.map((list, idx) => {
      if (colors?.length) {
        list.color = colors[idx % color.colors.length];
      }
    });

    postMessage(newGeographicUnits);
  });
};
