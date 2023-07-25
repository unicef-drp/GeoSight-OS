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

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { FormControl } from "@mui/material";
import { BaseIndicatorValue } from "../Base/base";
import {
  IndicatorSettings
} from "../../../../Components/Input/IndicatorSettings";
import {
  ContextLayerInputSelector
} from "../../../../ModalSelector/InputSelector";
import { fetchJSON } from "../../../../../../Requests";
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";
import { updateDataWithSetState } from "../../utils";

// Other inputs
import Filter from "../QueryForm/Filter"
import SpatialOperator from "../QueryForm/SpatialOperator"
import Aggregation from "../QueryForm/Aggregation"

const contextLayerGeometryTypes = ['Point', 'Line', 'Polygon']
/**
 * Base Excel Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 */
export const VectorContextLayer = forwardRef(
  ({
     data, setData, files, setFiles, indicatorList
   }, ref
  ) => {
    const indicatorValueFormRef = useRef(null);
    const indicatorRef = useRef(null);
    const [attributes, setAttributes] = useState([])

    // Context layer
    const [contextLayer, setContextLayer] = useState(null)
    const [fetching, setFetching] = useState(false)
    const [contextLayerFields, setContextLayerFields] = useState(null)

    // Set default data
    useEffect(
      () => {
        updateDataWithSetState(data, setData, {
          'geometry_type': data.geometry_type ? data.geometry_type : contextLayerGeometryTypes[0],
          'key_value': 'value',
          'key_administration_code': 'ucode',
        })
      }, []
    )

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(data.context_layer_id && data.geometry_type && data.spatial_operator && data.aggregation) && indicatorValueFormRef?.current?.isReady(data) && indicatorRef?.current?.isReady(data)
      }
    }));

    // Get the fields data
    useEffect(() => {
      setContextLayerFields(null);
      if (contextLayer) {
        (
          async () => {
            setFetching(true)
            let url = contextLayer.url + '?f=json'
            if (contextLayer.token) {
              url += '&token=' + contextLayer.token
            }
            const contextLayerData = await fetchJSON(url)
            contextLayerData.fields.map(field => {
              if (['esriFieldTypeOID', 'esriFieldTypeInteger', 'esriFieldTypeDouble'].includes(field.type)) {
                field.type = 'Number'
              }
            })
            setContextLayerFields(contextLayerData.fields)
            setFetching(false)
          }
        )()
      }
    }, [contextLayer]);

    return <Fragment>
      <BaseIndicatorValue
        data={data} setData={setData}
        files={files} setFiles={setFiles}
        attributes={attributes}
        ref={indicatorValueFormRef}
        valueOnly={true}
      />
      <div className='FormAttribute'>
        <IndicatorSettings
          data={data}
          setData={setData}
          attributes={attributes}
          indicatorList={indicatorList}
          ref={indicatorRef}
          valueOnly={true}
        />

        {/* Specifically for the context layer setting */}
        <FormControl className="BasicFormSection">
          <div>
            <label className="form-label required">
              Context Layer
            </label>
          </div>
          <ContextLayerInputSelector
            data={contextLayer ? [contextLayer] : []}
            setData={selectedDate => {
              setContextLayer(selectedDate[0])
              data.context_layer_id = selectedDate[0]?.id
              setData({ ...data })
            }}
            isMultiple={false}
            showSelected={false}
          />
          <span className="form-helptext">
          Context layer that will be used.
        </span>
        </FormControl>

        <div className="BasicFormSection">
          <div>
            <label className="form-label">
              The type of geometry data.
            </label>
          </div>
          <SelectWithList
            list={contextLayerGeometryTypes}
            value={data.geometry_type}
            onChange={evt => {
              data.geometry_type = evt.value
              setData({ ...data })
            }}/>
          <span className="form-helptext">
          Geometry type in data that will be fetched. If it is empty, it will use all geometry type.
        </span>
        </div>

        <div className="BasicFormSection">
          <div>
            <label className="form-label">
              Filter for the data.
            </label>
          </div>
          <Filter
            data={data.filter}
            setData={newData => {
              data.filter = newData
              setData({ ...data })
            }}
            fields={contextLayerFields}
            onLoading={fetching}
          />
          <span className="form-helptext">
          Filter query for the data that will be put as 'where'.
        </span>
        </div>

        <div className="BasicFormSection">
          <div>
            <label className="form-label required">
              Spatial operator for the data.
            </label>
          </div>
          <SpatialOperator
            data={data.spatial_operator ? data.spatial_operator : ''}
            setData={newData => {
              data.spatial_operator = newData
              setData({ ...data })
            }}
            fields={contextLayerFields}
            onLoading={fetching}
          />
        </div>

        <div className="BasicFormSection">
          <div>
            <label className="form-label required">
              Aggregation data for value.
            </label>
          </div>
          <Aggregation
            data={data.aggregation ? data.aggregation : ''}
            setData={newData => {
              data.aggregation = newData
              setData({ ...data })
            }}
            fields={contextLayerFields}
            onLoading={fetching}
          />
        </div>
      </div>
    </Fragment>
  }
)