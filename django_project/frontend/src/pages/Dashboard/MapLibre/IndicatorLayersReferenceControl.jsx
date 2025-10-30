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
import { referenceLayerIndicatorLayer } from "../../../utils/indicatorLayer";
import { Actions } from "../../../store/dashboard";

export default function IndicatorLayersReferenceControl() {
  const dispatch = useDispatch();
  const selectedIndicatorLayer = useSelector(
    (state) => state.selectedIndicatorLayer,
  );
  const selectedIndicatorSecondLayer = useSelector(
    (state) => state.selectedIndicatorSecondLayer,
  );
  const referenceLayer = useSelector(
    (state) => state.dashboard.data?.referenceLayer,
  );

  /** When indicator layer and second layer changed
   * Update reference layer views
   * */
  useEffect(() => {
    const views = [referenceLayer];
    if (Object.keys(selectedIndicatorLayer).length) {
      const view = referenceLayerIndicatorLayer(
        referenceLayer,
        selectedIndicatorLayer,
      );
      if (
        !views.find((_view) =>
          [view, view.identifier].includes(_view.identifier),
        )
      ) {
        views.push(view);
      }
    }
    if (Object.keys(selectedIndicatorSecondLayer).length) {
      const view = referenceLayerIndicatorLayer(
        referenceLayer,
        selectedIndicatorSecondLayer,
      );
      if (
        !views.find((_view) =>
          [view, view.identifier].includes(_view.identifier),
        )
      ) {
        views.push(view);
      }
    }
    views.map((view) => {
      if (view.is_local) {
        view.detail_url = `/reference-dataset/${view.identifier}/`;
      }
    });
    dispatch(Actions.Map.changeReferenceLayers(views));
  }, [referenceLayer, selectedIndicatorLayer, selectedIndicatorSecondLayer]);

  return null;
}
