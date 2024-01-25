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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import $ from 'jquery';
import CircularProgress from "@mui/material/CircularProgress";
import { debounce } from "@mui/material/utils";

import Admin, { pageNames } from '../../index';
import { codelistOptions, typeChoices } from "./Base";
import { AdminFormInput } from "../../Components/AdminForm/Base";
import { AdminForm } from '../../Components/AdminForm';
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { SaveButton } from "../../../../components/Elements/Button";
import { dictDeepCopy, urlParams } from "../../../../utils/main";
import DjangoTemplateForm from "../../Components/AdminForm/DjangoTemplateForm";
import AggregationForm from "./AggregationForm";
import LabelForm from "./LabelForm";
import StyleConfig from "../../Style/Form/StyleConfig";
import { Select } from "../../../../components/Input";
import { resourceActions } from "../List";
import { axiosPostWithSession } from "../../../../Requests";

import './style.scss';

/*** Additional General Indicator Inputs ***/
function AdditionalGeneralIndicator({ indicatorData, setIndicatorData }) {
  // This is for selectable input

  const selectableInput = batch !== null

  return <>
    <AdminFormInput
      selectableInput={selectableInput}
      label='Indicator type'
      attrName='type'
      required={true}>
      <Select
        options={typeChoices}
        value={typeChoices.find(type => type.value === indicatorData.type)}
        name='type'
        onChange={evt => {
          indicatorData.type = evt.value
          setIndicatorData({ ...indicatorData })
        }}
        menuPlacement="top"
      />
    </AdminFormInput>
    {
      indicatorData.type === 'String' ?
        <AdminFormInput
          selectableInput={selectableInput}
          label='Codelist'
          attrName='codelist'
          helptext={
            `
            Code list that being used as code of value. The code is in bracket. Example: Male (m), the value that expected for indicator is 'm'. 
            Codelists can be managed by super-admins. Please contact GeoSight administrator(s) if you need to create a new codelist or add a new value to the existing codelist.
            `
          }
        >
          <Select
            options={codelistOptions}
            value={codelistOptions.find(option => option.value === indicatorData.codelist)}
            onChange={evt => {
              indicatorData.codelist = evt.value
              setIndicatorData({ ...indicatorData })
            }}
            menuPlacement="top"
          />
          <input
            type="text"
            name="codelist"
            value={indicatorData.codelist}
            onChange={evt => {
            }}
            hidden={true}
          />
        </AdminFormInput> : (
          <>
            <AdminFormInput
              selectableInput={selectableInput}
              label='Min value'
              attrName='min_value'
            >
              <input
                type="number" name="min_value"
                value={indicatorData.min_value}
                onChange={evt => {
                  indicatorData.min_value = evt.target.value
                  const min = parseFloat(indicatorData.min_value)
                  const max = parseFloat(indicatorData.max_value)
                  if (!isNaN(min) && !isNaN(min)) {
                    if (min > max) {
                      indicatorData.max_value = indicatorData.min_value
                    }
                  }
                  setIndicatorData({ ...indicatorData })
                }}
              />
            </AdminFormInput>
            <AdminFormInput
              selectableInput={selectableInput}
              label='Max value'
              attrName='max_value'
            >
              <input
                type="number" name="max_value"
                value={indicatorData.max_value}
                onChange={evt => {
                  indicatorData.max_value = evt.target.value
                  const min = parseFloat(indicatorData.min_value)
                  const max = parseFloat(indicatorData.max_value)
                  if (!isNaN(min) && !isNaN(min)) {
                    if (min > max) {
                      indicatorData.min_value = indicatorData.max_value
                    }
                  }
                  setIndicatorData({ ...indicatorData })
                }}/>
            </AdminFormInput>
          </>
        )
    }
  </>
}

/*** Similarity Check ***/
function SimilarityCheck() {
  const [nameValue, setNameValue] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  /** On init **/
  useEffect(() => {
    $('input[name="name"]').keyup(function () {
      setNameValue($(this).val())
    });
    $('input[name="name"]').change(function () {
      setNameValue($(this).val())
    });
  }, []);

  /** Name value changed, debouce **/
  const nameValueUpdate = useMemo(
    () =>
      debounce(
        (newValue) => {
          setName(newValue)
        },
        400
      ),
    []
  )
  /** Name value changed **/
  useEffect(() => {
    nameValueUpdate(nameValue)
  }, [nameValue]);

  /** Name changed **/
  useEffect(() => {
    setLoading(true)
    const url = `/api/indicator/search/similarity`
    axiosPostWithSession('SearchSimilarity', url, {
      name: name
    })
      .then(data => {
          setData(data)
          setLoading(false)
        }
      ).catch(err => {
        setLoading(false)
      }
    );

  }, [name]);

  if (!objectId && !batch && (data.length || loading)) {
    return <div className="BasicFormSection Similarity">
      <div>
        <label className="form-label">
          Similar indicators
        </label>
      </div>
      {
        loading ? <div className='Throbber'>
          <CircularProgress size="1rem"/> Checking...
        </div> : <table>
          {
            data.map((row, idx) => {
              return <tr key={idx}>
                <td className='SimilarityName'><a
                  href={`/admin/indicators/${row.id}/edit`}
                  target={"_blank"}>{row.name}</a></td>
                <td className='SimilarityDescription' title={row.description}>
                  {row.description}
                </td>
                <td
                  className='SimilarityScore'>{Math.round(row.name_score * 100)}%
                </td>
              </tr>
            })
          }
        </table>
      }
    </div>
  }
  return null
}

/**
 * Indicator Form App
 */
export default function IndicatorForm() {
  const formRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [indicatorData, setIndicatorData] = useState(indicator);

  // This is for selectable input
  const selectableInput = batch !== null


  /** When indicator data type changed */
  useEffect(
    () => {
      if (selectableInput) {
        const params = urlParams()
        const ids = params.ids.split(',')
        if (ids[0]) {
          setIndicatorData({ ...indicatorData, id: ids[0] })
        }
      }
    }, []
  )

  return (
    <Admin
      minifySideNavigation={true}
      className='Indicator'
      pageName={pageNames.Indicators}
      rightHeader={
        <>
          {
            indicator.id ?
              resourceActions(
                {
                  id: indicator.id,
                  row: {
                    ...indicator,
                    permission
                  }
                }, true
              ) : ""
          }
          {
            indicatorId ?
              <SaveButton
                variant="primary Reverse"
                text="Save As"
                onClick={() => {
                  formRef.current.submit(true)
                  setSubmitted(true)
                }}
                disabled={submitted ? true : false}
              /> : ""
          }
          <SaveButton
            variant="primary"
            text="Save"
            onClick={() => {
              formRef.current.submit()
              setSubmitted(true)
            }}
            disabled={submitted ? true : false}
          />
        </>
      }>
      <AdminForm
        ref={formRef}
        selectableInput={selectableInput}
        forms={{
          'General': (
            <DjangoTemplateForm
              selectableInput={selectableInput}
              selectableInputExcluded={['name', 'shortcode']}
              additionalElementAfter={{
                'name': <SimilarityCheck/>
              }}
            >
              <AdditionalGeneralIndicator
                indicatorData={indicatorData}
                setIndicatorData={setIndicatorData}
              />
            </DjangoTemplateForm>
          ),
          'Aggregation': <AggregationForm/>,
          'Style': <StyleConfig
            data={dictDeepCopy(indicatorData)}
            setData={newData => {
              if (JSON.stringify(newData) !== JSON.stringify(indicatorData)) {
                setIndicatorData({ ...newData })
              }
            }}
            valuesUrl={`/api/indicator/${indicatorData.id}/values/flat/`}
            defaultStyleRules={indicatorData.style ? indicatorData.style : indicatorRules ? indicatorRules : []}
            selectableInput={batch !== null}
          />,
          'Label': <LabelForm indicator={indicatorData}/>,
        }}
      />
    </Admin>
  );
}

render(IndicatorForm, store)