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

/** Specifically for Reference Layer <> Level input */

import React from 'react';
import { FormControl } from "@mui/material";
import Grid from '@mui/material/Grid';
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { ThemeButton } from "../../../../components/Elements/Button";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Match from "../../../../utils/Match";
import { optionsToList } from "../../../../utils/main";

/***
 * Mapping default
 */
export function indicatorMappingDefault(config, attributes, indicatorList) {
  const newData = JSON.parse(JSON.stringify(config))
  if (attributes?.length) {
    // Auto mapping
    indicatorList.map(indicator => {
      const headerMatcher = Match.inList.match(
        optionsToList(attributes), indicator.shortcode
      )
      if (headerMatcher) {
        if (!newData.mapping) {
          newData.mapping = []
        }
        const key = headerMatcher
        const value = 'indicator-' + indicator.value
        if (!newData.mapping.find(map => map.key === key)) {
          newData.mapping.push({
            key: key,
            value: value
          })
        }
      }
    })
  }
  return newData
}

/**
 * Reference layer specified input
 * @param {string} config .
 * @param {Function} setConfig .
 * @param {Array} attributes .
 * @param {Array} indicatorList .
 */
export default function IndicatorMapping(
  {
    config, setConfig, attributes, indicatorList
  }
) {
  let { mapping } = config;
  if (!mapping) {
    mapping = []
  }
  const mappingKeys = mapping.map(map => map.key);

  return <FormControl className="BasicFormSection MappingSection">
    <ThemeButton
      variant="primary"
      disabled={!indicatorList.length}
      onClick={() => {
        let key = attributes.find(
          attr => !mappingKeys.includes(attr)
        )
        const value = 'indicator-' + indicatorList[0].value
        if (!key) {
          key = 'FIELD'
        }
        if (!mappingKeys.includes(key)) {
          mapping.push({
            key: key,
            value: value
          })
          setConfig({ ...config, mapping: mapping })
        }
      }}
    >
      <AddCircleIcon/>Add new mapping
    </ThemeButton>
    {
      mapping && indicatorList.length ?
        mapping.map((map, idx) => {
          const value = map.value
          const key = map.key
          return <Grid key={idx} container spacing={2}>
            <Grid item xs={6}>
              {
                attributes.length ?
                  <SelectWithList
                    placeholder={'Column From Excel'}
                    showFloatingLabel={true}
                    list={
                      attributes.filter(
                        attr => !mappingKeys.filter(mapping => mapping !== key).includes(attr)
                      )
                    }
                    value={key}
                    onChange={evt => {
                      map.key = evt.value
                      setConfig({ ...config, mapping: mapping })
                    }}
                  /> : <input
                    placeholder={'Column From Excel'}
                    value={key}
                    onChange={evt => {
                      map.key = evt.target.value
                      setConfig({ ...config, mapping: mapping })
                    }}
                  />
              }
            </Grid>
            <Grid item xs={6}>
              <SelectWithList
                placeholder={'Indicator'}
                showFloatingLabel={true}
                list={indicatorList}
                value={value ? parseInt(value?.replace('indicator-', '')) : null}
                onChange={evt => {
                  map.value = 'indicator-' + evt.value
                  setConfig({ ...config, mapping: mapping })
                }}
              />
              <ThemeButton
                className={"RemoveButton"}
                variant="Error Basic Reverse"
                onClick={() => {
                  mapping = mapping.filter(map => map.key !== key)
                  setConfig({ ...config, mapping: mapping })
                }}
              >
                <RemoveCircleIcon/>
              </ThemeButton>
            </Grid>
          </Grid>
        }) : null
    }
  </FormControl>
}