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
import React, { forwardRef, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { useSelector } from "react-redux";
import {
  MultipleSelectWithSearch,
  SelectWithSearch
} from "../../../../components/Input/SelectWithSearch";

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
     data = {}, setData, referenceLayer
   }, ref
  ) => {
    const referenceLayerRequest = useSelector(state => state.referenceLayerData[referenceLayer.identifier]);
    const referenceLayerData = referenceLayerRequest?.data

    // When reference layer changed, fetch reference data
    const datasetLevels = referenceLayerData?.dataset_levels
    useEffect(() => {
      if (datasetLevels) {
        let updated = false
        let levels = data.levels ? data.levels : []
        let default_level = data.default_level ? data.default_level : 0
        if (!data.levels) {
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

    // Create choices from levels
    const levels = datasetLevels ? datasetLevels.map(level => level.level_name) : []
    const defaultLevel = datasetLevels?.find(level => level.level === data.default_level)?.level_name
    const availableLayers = datasetLevels?.filter(level => data?.levels?.includes(level.level)).map(level => level.level_name)

    return (
      <Grid container spacing={2} className='ReferenceLayerLevelConfiguration'>
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
        <Grid item xs={6} className='ReferenceLayerAvailableLevelsConfiguration'>
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
    );
  }
)