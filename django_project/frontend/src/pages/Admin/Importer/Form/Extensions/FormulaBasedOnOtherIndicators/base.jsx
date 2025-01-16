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
 * __date__ = '05/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';

import { updateDataWithSetState } from "../../utils";
import NunjucksConfigWithRequest
  from "../../../../../../components/Nunjucks/Config/WithRequest";
import ReferenceLayerGeometrySelector
  from "../../../../Components/Input/ReferenceLayerGeometrySelector";
import { AddButton } from "../../../../../../components/Elements/Button";
import { ModalButton } from "../../../../../../components/Modal/ModalButton";
import FunctionGenerator from "./FunctionGenerator";

import './style.scss';
import IndicatorSelector
  from "../../../../../../components/ResourceSelector/IndicatorSelector";

/**
 * Formula based form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 * @param {dict} ready .
 * @param {Function} setReady Set is ready.
 * @param {Array} attributes Data attributes.
 * @param {Function} setAttributes Set data attribute.
 */
export const FormulaBasedForm = forwardRef(
  ({
     data, setData, files, setFiles, attributes, setAttributes, children
   }, ref
  ) => {
    const [request, setRequest] = useState({})
    const [geomConfig, setGeomConfig] = useState({})
    const {
      reference_layer, reference_layer_data, admin_level_value,
      expression, selected_indicators,
      selected_indicators_data
    } = data

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(data.selected_indicators?.length && data.expression)
      }
    }));

    // Set default data
    useEffect(
      () => {
        updateDataWithSetState(data, setData, {
          selected_indicators: [],
          selected_indicators_data: [],
          key_administration_code: 'geom_code',
          admin_code_type: 'ucode',
          key_value: 'value',
          expression: ``
        })
      }, [data]
    )

    // Set default data
    useEffect(
      () => {
        if (reference_layer && selected_indicators?.length && geomConfig?.concept_uuid) {
          const url = `/georepo/entity/${geomConfig?.concept_uuid}/drilldown`
          const params = {
            indicators: selected_indicators.join(',')
          }
          setRequest({ url, params })
        }
      }, [
        reference_layer, admin_level_value, selected_indicators, geomConfig
      ]
    )

    const error = []
    if (!data.reference_layer) {
      error.push('Reference layer is empty.')
    }
    if (!data.selected_indicators?.length) {
      error.push('Indicator that will be used is empty.')
    }
    const text = "{{ value }},{{ time }}"
    const { url, params } = request
    return <Fragment>
      <div className="BasicFormSection">
        <label className="form-label required" htmlFor="group">
          Indicators that will be used
        </label>
        <IndicatorSelector
          initData={selected_indicators_data}
          dataSelected={selectedData => {
            data.selected_indicators_data = selectedData
            data.selected_indicators = selectedData.map(row => row.id)
            setData({ ...data })
          }}
          multipleSelection={true}
          showSelected={true}
        />
      </div>
      <div className="BasicFormSection">
        <label className="form-label required" htmlFor="group">
          Formula / expression
        </label>
        <span className='form-helptext'>
          Formula should returns "value, time". On the expression, you need to returns {text}. <br/>
          Time is optional, if "Date Time Setting" in "Reference Layer & Time" is "Selected Date" or "Now".
          <br/> But will be required if it is "Data-Driven Date".
          <br/>
          <br/>
          To get value of context, you can use this functions:<br/>
          get_value(indicator, geometryType, t1, t2, aggregation) -- Return one value of context by aggregating it.<br/>
          get_values(indicator, geometryType, t1, t2) -- Return list json of {"{admin_level, concept_uuid, geom_code, name, time, value}"}.<br/>
          Put t1 = null for not filter the data.
        </span>
        <br/>
        <div className='error'>
          {error.join(' ')}
        </div>
        <div className='ActionButtons'>
          {
            error.length ? null :
              <Fragment>
                <div className='Separator'/>
                <ModalButton
                  className='FunctionGenerator MuiBox-Large'
                  Button={
                    <AddButton
                      variant="primary Reverse" text={"Generate get_value"}
                    />
                  }
                  header={'Generate get_value'}
                >
                  <FunctionGenerator
                    selectedIndicators={data.selected_indicators}
                    functionTarget='get_value'
                    onApply={func => {
                      data.expression = `{% set x = ${func} %}\n` + data.expression
                      if (!data.expression.includes('{{')) {
                        data.expression += '{{ x }}'
                      }
                      setData({ ...data })
                    }}
                  />
                </ModalButton>

                <ModalButton
                  className='FunctionGenerator MuiBox-Large'
                  Button={
                    <AddButton
                      variant="primary Reverse" text={"Generate get_values"}
                    />
                  }
                  header={'Generate get_values'}
                >
                  <FunctionGenerator
                    selectedIndicators={data.selected_indicators}
                    functionTarget='get_values'
                    onApply={func => {
                      data.expression = `{% set x = ${func} %}\n` + data.expression
                      if (!data.expression.includes('{{')) {
                        data.expression += '{{ x }}'
                      }
                      setData({ ...data })
                    }}
                  />
                </ModalButton>
              </Fragment>
          }
        </div>
        <NunjucksConfigWithRequest
          template={expression}
          setTemplate={expression => {
            data.expression = expression
            setData({ ...data })
          }}
          url={url}
          params={params}
          preformatContext={admin_boundary => {
            let context = {
              admin_boundary
            }
            return { context: context }
          }}
        >
          <ReferenceLayerGeometrySelector
            referenceLayer={reference_layer_data ? reference_layer_data : {
              identifier: reference_layer
            }}
            onChange={config => {
              setGeomConfig(config)
            }}
          />
        </NunjucksConfigWithRequest>
      </div>
    </Fragment>
  }
)
