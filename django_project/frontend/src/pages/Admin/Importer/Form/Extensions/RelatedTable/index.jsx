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
import {
  RelatedTableInputSelector
} from "../../../../ModalSelector/InputSelector";
import { updateDataWithSetState } from "../../utils";
import {
  ReferenceLayerInput
} from "../../../../Components/Input/ReferenceLayerInput";
import {
  DateTimeSettings
} from "../../../../Components/Input/DateTimeSettings";
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";

// Other inputs
import Filter from "../QueryForm/Filter"
import Aggregation from "../QueryForm/Aggregation"
import Match from "../../../../../../utils/Match";
import {
  arrayToOptions,
  isInOptions,
  optionsToList
} from "../../../../../../utils/main";
import {
  IndicatorSettings
} from "../../../../Components/Input/IndicatorSettings";
import RelatedTableRequest from "../../../../../../utils/RelatedTable/Request";

let lastId = null;
/**
 * Base Excel Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 */
export const RelatedTableFormat = forwardRef(
  ({
     data, setData, files, setFiles, indicatorList
   }, ref
  ) => {
    const indicatorRef = useRef(null);
    const referenceLayerRef = useRef(null);
    const dateTimeSettingsRef = useRef(null);
    const [attributes, setAttributes] = useState([])

    // Related Table
    const [relatedTable, setRelatedTable] = useState(null)
    const [fetching, setFetching] = useState(false)
    const [fields, setFields] = useState(null)

    // Set default data
    useEffect(
      () => {
        updateDataWithSetState(data, setData, {
          'key_value': 'value',
        })
      }, []
    )

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(data.related_table_id && data.key_administration_code && data.aggregation) &&
          indicatorRef?.current?.isReady(data) &&
          referenceLayerRef?.current?.isReady(data) &&
          dateTimeSettingsRef?.current?.isReady(data)
      }
    }));

    // Get the fields data
    useEffect(() => {
      setFields(null);
      if (relatedTable) {
        (
          async () => {
            setFetching(true)
            lastId = relatedTable.id

            const request = new RelatedTableRequest(relatedTable.id)
            const relatedTableDetail = await request.getDetail()
            const array = [[], [], []]
            relatedTableDetail.fields_definition.map(field => {
              field.value = field.name
              array[0].push(field.name)
              array[1].push(field.example[0])
              array[2].push(field.example[1])
            })
            const relatedTableData = await request.getData()
            relatedTableDetail.fields_definition.map(field => {
              field.options = relatedTableData.map(
                row => row[field.name]
              ).filter(row => !!row)
            })
            if (lastId === relatedTable.id) {
              setFields(relatedTableDetail.fields_definition)
              setAttributes(arrayToOptions(array))
              setFetching(false)
            }
          }
        )()
      }
    }, [relatedTable]);

    // Set default data
    useEffect(
      () => {
        if (attributes?.length) {
          const newData = JSON.parse(JSON.stringify(data))
          if (!isInOptions(attributes, newData.key_administration_code)) {
            newData.key_administration_code = Match.inList.geocode(optionsToList(attributes))
          }
          updateDataWithSetState(data, setData, newData)
        }
      }, [attributes]
    )

    return <Fragment>
      {/* Specifically for the context layer setting */}
      <div className='BaseIndicatorAttribute'>
        <ReferenceLayerInput
          data={data} setData={setData}
          attributes={attributes}
          ref={referenceLayerRef}
        />
        <DateTimeSettings
          data={data} setData={setData}
          attributes={attributes}
          ref={dateTimeSettingsRef}
        />
      </div>
      <div className='FormAttribute'>
        <IndicatorSettings
          data={data}
          setData={setData}
          attributes={attributes}
          indicatorList={indicatorList}
          ref={indicatorRef}
        />
        <FormControl className="BasicFormSection">
          <div>
            <label className="form-label required">
              Related Table
            </label>
          </div>
          <RelatedTableInputSelector
            data={relatedTable ? [relatedTable] : []}
            setData={selectedDate => {
              setRelatedTable(selectedDate[0])
              data.related_table_id = selectedDate[0]?.id
              setData({ ...data })
            }}
            isMultiple={false}
            showSelected={false}
          />
          <span className="form-helptext">
          Related table that will be used.
        </span>
        </FormControl>

        {/* For other data */}
        <FormControl className="BasicFormSection">
          <label className="form-label required">Column Geograph Code</label>
          <SelectWithList
            list={attributes}
            value={data.key_administration_code}
            onChange={evt => {
              data.key_administration_code = evt.value
              setData({ ...data })
            }}
          />
        </FormControl>

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
            fields={fields}
            onLoading={fetching}
          />
          <span className="form-helptext">
          Filter query for the data that will be put as 'where'.
        </span>
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
            fields={fields}
            onLoading={fetching}
          />
        </div>
      </div>
    </Fragment>
  }
)