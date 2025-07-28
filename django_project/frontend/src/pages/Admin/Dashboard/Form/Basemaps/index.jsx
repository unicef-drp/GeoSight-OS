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

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import ListForm from "../ListForm";
import BasemapSelector
  from "../../../../../components/ResourceSelector/BasemapSelector";

import "./style.scss";

/**
 * Basemaps dashboard
 */
export default function BasemapsForm() {
  const dispatch = useDispatch();
  const { basemapsLayers, basemapsLayersStructure } = useSelector(
    (state) => state.dashboard.data,
  );

  return (
    <ListForm
      pageName={"Basemaps"}
      data={basemapsLayers}
      dataStructure={basemapsLayersStructure}
      createNew={true}
      setDataStructure={(structure) => {
        dispatch(
          Actions.Dashboard.updateStructure(
            "basemapsLayersStructure",
            structure,
          ),
        );
      }}
      listUrl={urls.api.basemapListAPI}
      addLayerAction={(layer) => {
        dispatch(Actions.Basemaps.add(layer));
      }}
      removeLayerAction={(layer) => {
        dispatch(Actions.Basemaps.remove(layer));
      }}
      changeLayerAction={(layer) => {
        dispatch(Actions.Basemaps.update(layer));
      }}
      resourceSelector={<BasemapSelector />}
    />
  );
}
