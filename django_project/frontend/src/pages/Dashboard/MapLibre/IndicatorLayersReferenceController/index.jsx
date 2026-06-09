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
 * __date__ = '13/06/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { referenceLayerIndicatorLayer } from "../../../../utils/indicatorLayer";
import { Actions } from "../../../../store/dashboard";
import { selectIndicatorLayers } from "../../../../selectors/indicatorLayers";

export default function IndicatorLayersReferenceController() {
  const dispatch = useDispatch();
  const selectedIndicatorLayers = useSelector(selectIndicatorLayers);
  const referenceLayer = useSelector(
    (state) => state.dashboard.data?.referenceLayer,
  );

  /** When indicator layer and second layer changed
   * Update reference layer views
   * */
  useEffect(() => {
    const views = [];
    selectedIndicatorLayers.forEach((layer) => {
      const view = referenceLayerIndicatorLayer(referenceLayer, layer);
      if (
        !views.find((_view) =>
          [view, view.identifier].includes(_view.identifier),
        )
      ) {
        views.push(view);
      }
    });
    views.map((view) => {
      if (view.is_local) {
        view.detail_url = `/reference-dataset/${view.identifier}/`;
      }
    });
    if (views.length === 0) {
      views.push(referenceLayer);
    }
    dispatch(Actions.Map.changeReferenceLayers(views));
  }, [referenceLayer, selectedIndicatorLayers]);

  return null;
}
