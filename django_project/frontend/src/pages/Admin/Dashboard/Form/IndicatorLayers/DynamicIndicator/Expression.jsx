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
 * __date__ = '28/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment } from 'react';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Input } from "@mui/material";
import WhereInput
  from "../../../../../../components/SqlQueryGenerator/WhereQueryGenerator/WhereInput";
import { ThemeButton } from "../../../../../../components/Elements/Button";
import {
  Creatable,
  SelectPlaceholder
} from "../../../../../../components/Input";
import { capitalize } from "../../../../../../utils/main";
import { VALUE_TYPES } from "../../../../../../utils/queryExtraction";
import NunjucksConfig from "../../../../../../components/Nunjucks/Config";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";


export function ExposedVariable({ data, setData, remove }) {
  return <div className='BasicFormSection'>
    <div className="InputInLine">
      <FormControl className='BasicForm'>
        <InputLabel>Variable</InputLabel>
        <Input
          value={data.field}
          onChange={(evt) => {
            data.field = evt.target.value
            setData(data)
          }}
        />
      </FormControl>
      <SelectPlaceholder
        placeholder='Type of value'
        className={'TimeConfigurationOperator'}
        list={
          VALUE_TYPES.map((key, idx) => {
            return { id: key, name: capitalize(key) }
          })
        }
        initValue={data.type}
        onChangeFn={(value) => {
          if (data.type !== value) {
            if (value === 'number') {
              data.values = [0, 100]
            } else {
              data.values = []
            }
          }
          data.type = value
          setData({ ...data })
        }}
      />
      <div style={{ padding: "1rem 0.5rem" }}>DATA</div>
      {
        data.type === 'text' ?
          <Creatable
            placeholder='Add options and typing to create new option.'
            options={
              data.values.map((key, idx) => {
                return { id: key, label: key }
              })
            }
            onChange={(newValue) => {
              data.values = newValue.map(val => val.value ? val.value : val.id)
              setData({ ...data })
            }}
            value={
              data.values.map((key, idx) => {
                return { id: key, label: key }
              })
            }
            menuPlacement={'top'}
            isMulti
          /> :
          <Fragment>
            <FormControl className='BasicForm'>
              <InputLabel>Minimum value</InputLabel>
              <Input
                type='number'
                value={data.values[0]}
                onChange={(evt) => {
                  data.values[0] = evt.target.value
                  setData(data)
                }}
              />
            </FormControl>
            <FormControl className='BasicForm'>
              <InputLabel>Maximum value</InputLabel>
              <Input
                type='number'
                value={data.values[1]}
                onChange={(evt) => {
                  data.values[1] = evt.target.value
                  setData(data)
                }}
              />
            </FormControl>
          </Fragment>
      }
      <div style={{ padding: "1rem 0.5rem" }}>QUERY</div>
      <WhereInput
        where={data}
        upperWhere={null}
        updateWhere={() => {
          setData({ ...data })
        }}
        fields={[
          {
            "name": data.field,
            "type": data.type,
            "value": data.value,
            "options": data.values
          }
        ]}
        isSimplified={true}
        isAll={true}
      />
      <div className='Separator'/>
      <RemoveCircleIcon className='RemoveIcon' onClick={() => remove()}/>
    </div>
  </div>
}

export default function Expression({ indicators, data, setData }) {
  let context = {}
  data.exposedVariables?.map(variable => {
    context[variable.field] = variable.value;
  })
  indicators?.map((indicator, idx) => {
    context[indicator.shortcode ? indicator.shortcode : indicator.id] = idx + 1
  })
  context = { context: { values: context } };

  return <Fragment>
    <div className='Title'>Expression</div>
    <div className='form-helptext'>
      Context below is the example of context for each of geometry.
    </div>
    <NunjucksConfig
      template={data.expression}
      setTemplate={template => {
        data.expression = template
        setData({ ...data })
      }}
      context={context}
      defaultTemplateInput=''
    >
      <div className='context-data'>
        <pre>{JSON.stringify(context, undefined, 2)}</pre>
      </div>
    </NunjucksConfig>
    <div className='ExposedVariable'>
      <ThemeButton
        className='TitleButton'
        onClick={() => {
          data.exposedVariables.push({
            field: '',
            value: 0,
            type: 'number',
            operator: '=',
            values: [0, 100],
          })
          setData(data)
        }}>
        <div className='Title'>Exposed Variables</div>
        <AddCircleIcon className='AddButton'/>
      </ThemeButton>
      {
        data.exposedVariables.map((variable, idx) => {
          return <ExposedVariable
            key={idx}
            data={variable}
            setData={newVar => {
              data.exposedVariables[idx] = { ...newVar }
              setData({ ...data })
            }}
            remove={() => {
              delete data.exposedVariables[idx]
              data.exposedVariables = data.exposedVariables.filter(row => row)
              setData({ ...data })
            }}
          />
        })
      }
      <div></div>
    </div>
  </Fragment>
}