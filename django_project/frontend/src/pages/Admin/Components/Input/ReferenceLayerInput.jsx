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
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import Grid from '@mui/material/Grid';
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { GeorepoViewInputSelector } from "../../ModalSelector/InputSelector";
import { axiosGet, GeorepoUrls } from "../../../../utils/georepo";

const defaultIdType = 'ucode'
const ANY_LEVEL = 'Any Level (Data Driven)'
const BY_VALUE = 'Specific Level'

/**
 * Reference layer specified input
 * @param {string} data .
 * @param {Function} setData .
 * @param {Array} attributes .
 * @param {Boolean} valueOnly If the data just a value only.
 */
export const ReferenceLayerInput = forwardRef(
  ({
     data, setData, attributes, valueOnly, ...props
   }, ref
  ) => {
    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(
          data.reference_layer && !(data.admin_level_type === BY_VALUE && data.admin_level_value === undefined) && data.admin_code_type
        )
      }
    }));

    const [references, setReferences] = useState([])

    let referenceLayer = references?.find(row => {
      return row.identifier === data?.reference_layer
    })
    if (!referenceLayer && data.reference_layer && data.reference_layer_name) {
      referenceLayer = {
        identifier: data.reference_layer,
        name: data.reference_layer_name,
      }
    }

    /***
     * Switch type
     */
    const switchTo = (type) => {
      data.admin_level_type = type
      if (!data.admin_code_type) {
        data.admin_code_type = defaultIdType
      }
      switch (type) {
        case ANY_LEVEL: {
          delete data.admin_level_value
          break
        }
        case BY_VALUE: {
          data.admin_level_value = defaultLevel(referenceLayer?.dataset_levels)
          break
        }
      }
      setData({ ...data })
    }

    // Set default data
    useEffect(
      () => {
        if (!data.admin_level_type) {
          switchTo(ANY_LEVEL)
        } else if (valueOnly && data.admin_level_type === ANY_LEVEL) {
          switchTo(BY_VALUE)
        }
        if (typeof data.admin_level_value === 'string' || data.admin_level_value instanceof String) {
          data.admin_level_value = parseInt(data.admin_level_value)
        }
      }, [data, attributes]
    )

    // Set default data
    useEffect(
      () => {
        if (references.length && !data.reference_layer) {
          data.reference_layer = references[0].value
          setData({ ...data })
        }
      }, [references]
    )

    /**
     * Return default level
     * @param {Array} levels
     */
    const defaultLevel = (levels) => {
      if (levels) {
        levels = levels.map(level => {
          return level.value
        });
        if (!levels.includes(parseInt(data.admin_level_value))) {
          return levels[0]
        }
      }
      return data.admin_level_value
    }

    /**
     * Set default level
     * @param {Array} levels
     */
    const defaultData = (levels) => {
      if (levels) {
        levels = levels.map(level => {
          return level.value
        });
        let updated = false
        if (data.admin_level_type === BY_VALUE) {
          const level = defaultLevel(referenceLayer?.dataset_levels)
          if (level !== parseInt(data.admin_level_value)) {
            data.admin_level_value = level
            updated = true
          }
        }
        if (updated) {
          setData({ ...data })
        }
      }
    }

    // When reference changed, get the levels
    useEffect(
      () => {
        if (references && referenceLayer) {
          if (!referenceLayer.dataset_levels) {
            axiosGet(GeorepoUrls.ViewDetail(data.reference_layer)).then(response => {
              const responseData = response.data
              responseData.dataset_levels = responseData.dataset_levels.map(level => {
                level.value = level.level
                level.name = level.level_name
                return level
              })
              if (referenceLayer.uuid) {
                referenceLayer.possible_id_types = responseData.possible_id_types
                referenceLayer.dataset_levels = responseData.dataset_levels
              } else {
                responseData.identifier = responseData.uuid
                references.push(responseData)
              }
              setReferences([...references])
              defaultData(referenceLayer.dataset_levels)
            });
          } else {
            defaultData(referenceLayer.dataset_levels)
          }
        }
      }, [references, data.reference_layer]
    )

    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <div className="BasicFormSection">
            <label className="form-label required" htmlFor="group">
              Reference Layer
            </label>
            <GeorepoViewInputSelector
              data={referenceLayer ? [referenceLayer] : []}
              setData={selectedData => {
                const reference = selectedData[0]
                const referenceLayer = references.find(row => {
                  return row.identifier === reference
                })
                if (!referenceLayer && reference) {
                  setReferences([...references, reference])
                }
                data.reference_layer = selectedData[0]?.identifier
                setData({ ...data })
              }}
              isMultiple={false}
              showSelected={false}
            />
          </div>
        </Grid>
        <Grid item xs={3}>
          <label className="form-label required" htmlFor="group">
            Admin Level
          </label>
          <RadioGroup
            value={data?.admin_level_type ? data.admin_level_type : BY_VALUE}
            onChange={evt => {
              switchTo(evt.target.value)
            }}
          >
            <FormControlLabel
              disabled={valueOnly}
              value={ANY_LEVEL} control={<Radio/>}
              label={ANY_LEVEL}/>
            <FormControlLabel
              value={BY_VALUE} control={<Radio/>}
              label={BY_VALUE}/>
          </RadioGroup>
          <div className="BasicFormSection" style={{ paddingTop: '2px' }}>
            {
              data.admin_level_type === BY_VALUE ?
                <SelectWithList
                  name='admin_level'
                  required={true}
                  placeholder={referenceLayer && referenceLayer.dataset_levels ? 'Select admin level' : 'Loading'}
                  list={referenceLayer && referenceLayer.dataset_levels}
                  value={data.admin_level_value}
                  onChange={evt => {
                    data.admin_level_value = evt.value
                    setData({ ...data })
                  }}
                /> : null
            }

          </div>
        </Grid>
        {
          props.noGeoCode ? null :
            <Grid item xs={3}>
              <label className="form-label required" htmlFor="group">
                Type of Geo Code
              </label>
              <SelectWithList
                required={true}
                placeholder={referenceLayer?.possible_id_types?.length ? 'Select code type' : 'Loading'}
                list={referenceLayer?.possible_id_types ? referenceLayer?.possible_id_types : []}
                value={data.admin_code_type}
                onChange={evt => {
                  data.admin_code_type = evt.value
                  setData({ ...data })
                }}
              />
              <span className={'form-helptext'}>
                The code type that being used on the data.
              </span>
            </Grid>
        }
      </Grid>
    );
  }
)