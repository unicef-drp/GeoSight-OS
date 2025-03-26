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

/** Reference layer view configuration. */
import React, { forwardRef, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { useDispatch, useSelector } from "react-redux";
import Checkbox from "@mui/material/Checkbox";
import {
  MultipleSelectWithSearch,
  SelectWithSearch
} from "../../../../../components/Input/SelectWithSearch";
import { GeorepoUrls } from "../../../../../utils/georepo";
import { FormControlLabel, FormGroup } from "@mui/material";
import { InternalReferenceDatasets, URLS } from "../../../../../utils/urls";
import { Actions } from "../../../../../store/dashboard";
import DatasetViewSelector
  from "../../../../../components/ResourceSelector/DatasetViewSelector";

import './styles.scss';

/**
 * Reference layer view configuration.
 * Rendering the level that will be used and also the default one.
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} attributes .
 * @param {Boolean} valueOnly If the data just a value only.
 */
export const ViewLevelConfiguration = forwardRef(
  ({
     data = {}, setData, referenceLayer, ableToSelectReferenceLayer = false
   }, ref
  ) => {
    const dispatch = useDispatch()
    const [overrideView, setOverrideView] = useState(!!data.referenceLayer);
    if (overrideView) {
      referenceLayer = data.referenceLayer ? data.referenceLayer : referenceLayer
    }

    const referenceLayerRequest = useSelector(state => state.referenceLayerData[referenceLayer.identifier]);
    const referenceLayerData = referenceLayerRequest?.data

    // When reference layer changed, fetch reference data
    const datasetLevels = referenceLayerData?.dataset_levels
    useEffect(() => {
      if (datasetLevels) {
        let updated = false

        // Update levels
        let levels = data.levels ? datasetLevels.filter(
          datasetLevel => data.levels.includes(datasetLevel.level)
        ).map(level => level.level) : [];

        let default_level = data.default_level ? data.default_level : 0

        // Check levels is on the dataset levels
        if (JSON.stringify(data.levels) !== JSON.stringify(levels)) {
          levels = datasetLevels.map(level => level.level)
          updated = true
        }
        if (levels?.length && !levels.includes(data.default_level)) {
          default_level = levels[0]
          updated = true
        }
        if (updated) {
          setData({ ...data, levels: levels, default_level: default_level })
        }
      }
    }, [referenceLayerData, data]);

    useEffect(() => {
      if (referenceLayer.identifier && !referenceLayerData) {
        const url = URLS.ReferenceLayer.VIEW.Detail(referenceLayer)
        dispatch(
          Actions.ReferenceLayerData.fetch(
            dispatch, referenceLayer.identifier, url
          )
        )
      }
    }, [referenceLayer]);

    // Create choices from levels
    const levels = datasetLevels ? datasetLevels.map(level => level.level_name) : []
    const defaultLevel = datasetLevels?.find(level => level.level === data.default_level)?.level_name
    const availableLayers = datasetLevels?.filter(level => data?.levels?.includes(level.level)).map(level => level.level_name)

    return <>
      {
        ableToSelectReferenceLayer ?
          <div className="ReferenceLayerLevelConfigurationView">
            <label className="form-label" htmlFor="group">View</label>
            <Grid
              container spacing={2}
              className='ReferenceLayerLevelConfigurationCheckbox'
            >
              <Grid item>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={overrideView}
                        onChange={evt => {
                          setOverrideView(evt.target.checked)
                          delete data.referenceLayer
                          setData({ ...data })
                        }}/>
                    }
                    label=''/>
                </FormGroup>
              </Grid>
              <Grid
                item
                className='ReferenceLayerLevelConfigurationViewSelector'
              >
                <div className="BasicFormSection">
                  <div className='ReferenceDatasetSection'>
                    <DatasetViewSelector
                      disabled={!overrideView}
                      initData={
                        referenceLayer?.identifier ? [
                          {
                            id: referenceLayer.identifier,
                            uuid: referenceLayer.identifier,
                            name: referenceLayerData?.name,
                            ...referenceLayer
                          }
                        ] : []
                      }
                      dataSelected={(selectedData) => {
                        let selected = { identifier: '', detail_url: '' }
                        if (selectedData[0]) {
                          const identifier = selectedData[0].identifier
                          selected = {
                            identifier: identifier,
                            detail_url: selectedData[0].is_local ? InternalReferenceDatasets.centroid(identifier) : GeorepoUrls.ViewDetail(identifier),
                            is_local: selectedData[0].is_local
                          }
                        }
                        setData({ ...data, referenceLayer: selected })
                      }}
                    />
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
          : null
      }
      <Grid container spacing={2}
            className='ReferenceLayerLevelConfiguration'>
        <Grid item xs={6}>
          <div className="BasicFormSection">
            <label className="form-label" htmlFor="group">
              Default Level
            </label>
            <SelectWithSearch
              name='default_admin'
              placeholder={datasetLevels ? 'Select default admin level' : 'Loading'}
              options={levels}
              value={defaultLevel ? defaultLevel : ''}
              onChangeFn={evt => {
                data.default_level = datasetLevels?.find(level => level.level_name === evt)?.level
                setData({ ...data })
              }}
              disableCloseOnSelect={false}
              fullWidth={true}
              smallHeight={true}
            />
          </div>
        </Grid>
        <Grid item xs={6}
              className='ReferenceLayerAvailableLevelsConfiguration'>
          <div className="BasicFormSection">
            <label className="form-label" htmlFor="group">
              Available Levels
            </label>
            <MultipleSelectWithSearch
              placeholder={datasetLevels ? 'Select available levels' : 'Loading'}
              options={levels}
              value={availableLayers ? availableLayers : []}
              onChangeFn={evt => {
                data.levels = datasetLevels?.filter(level => evt.includes(level.level_name)).map(level => level.level)
                setData({ ...data })
              }}
              fullWidth={true}
              smallHeight={true}
              showValues={true}
            />
          </div>
        </Grid>
      </Grid>
    </>
  }
)