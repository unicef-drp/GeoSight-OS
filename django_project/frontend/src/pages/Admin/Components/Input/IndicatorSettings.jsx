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

/** Specifically for Indicator input */

import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { IndicatorInputSelector } from "../../ModalSelector/InputSelector";
import Match from "../../../../utils/Match";

/**
 * Indicator specified input
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} attributes .
 * @param {Array} indicatorList .
 * @param {Boolean} valueOnly If the data just a value only.
 */
export const IndicatorSettings = forwardRef(
  ({
     data, setData, attributes, indicatorList, valueOnly
   }, ref
  ) => {
    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          !(data.indicator_data_type === 'Data Driven' && !data.indicator_data_field)
        )
      }
    }));
    /**
     * Switch time type
     */
    const switchTo = (type) => {
      data.indicator_data_type = type
      switch (type) {
        case 'Data Driven': {
          if (!data.indicator_data_field) {
            data.indicator_data_field = Match.inList.indicatorIdentifier(attributes)
          }
          delete data.indicator_data_value
          break
        }
        case 'By Value': {
          let indicator_data_value = indicatorList[0].id
          let indicator_data = indicatorList[0]

          if (data.indicator_data_value) {
            const indicator = indicatorList.find(indicator => {
              return indicator.id === parseInt(data.indicator_data_value)
            })
            if (indicator) {
              indicator_data_value = indicator.id
              indicator_data = indicator
            }
          }
          data.indicator_data_value = indicator_data_value
          data.indicator_data = indicator_data
          delete data.indicator_data_field
          break
        }
      }
      setData({ ...data })
    }

    // Set default data
    useEffect(
      () => {
        if (!data.indicator_data_type) {
          switchTo('By Value')
        } else if (valueOnly && data.indicator_data_type === 'Data Driven') {
          switchTo('By Value')
        }
      }, [data]
    )

    // Set default data
    useEffect(
      () => {
        if (data.indicator_data_type === 'Data Driven') {
          switchTo('Data Driven')
          setData({ ...data })
        }
      }, [attributes, indicatorList]
    )
    return (
      <div>
        {
          data.indicator_data_type ?
            <FormControl className="BasicFormSection">
              <div>
                <label className="form-label required">
                  Indicator
                </label>
              </div>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <RadioGroup
                    name="schedule_type"
                    value={data.indicator_data_type}
                    onChange={evt => {
                      switchTo(evt.target.value)
                    }}
                  >
                    <FormControlLabel
                      value={'By Value'} control={<Radio/>}
                      label={'Selected Indicator'}/>
                    <FormControlLabel
                      disabled={valueOnly}
                      value={'Data Driven'} control={<Radio/>}
                      label={'Data-Driven Indicator Column'}/>
                  </RadioGroup>
                </Grid>
                <Grid item xs={6}>
                  {
                    data.indicator_data_type === 'By Value' ?
                      <IndicatorInputSelector
                        data={data.indicator_data ? [data.indicator_data] : []}
                        setData={selectedDate => {
                          data.indicator_data = selectedDate[0]
                          data.indicator_data_value = selectedDate[0]?.id
                          setData({ ...data })
                        }}
                        isMultiple={false}
                        showSelected={false}
                      /> :
                      data.indicator_data_type === 'Data Driven' ?
                        attributes.length ?
                          <SelectWithList
                            placeholder={'Field for the indicator key'}
                            list={attributes}
                            value={data.indicator_data_field}
                            showFloatingLabel={true}
                            onChange={evt => {
                              data.indicator_data_field = evt.value
                              setData({ ...data })
                            }}
                          /> :
                          <input
                            type={'text'}
                            placeholder={'Field for the indicator key'}
                            value={data.indicator_data_field}
                            onChange={evt => {
                              data.indicator_data_field = evt.target.value
                              setData({ ...data })
                            }}
                          /> : null
                  }
                </Grid>
              </Grid>
            </FormControl> : null
        }
      </div>
    );
  }
)