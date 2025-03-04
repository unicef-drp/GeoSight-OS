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

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { FormGroup } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import {
  SaveButton,
  ThemeButton
} from "../../../../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../../components/Modal";

import { dictDeepCopy, parseDateTime } from "../../../../../../utils/main";
import {
  getRelatedTableData,
  getRelatedTableFields
} from "../../../../../../utils/relatedTable";
import {
  SelectWithList
} from "../../../../../../components/Input/SelectWithList";
import WhereInputModal
  from "../../../../../../components/SqlQueryGenerator/WhereInputModal";
import Aggregation, {
  TYPES
} from "../../../../../../components/SqlQueryGenerator/Aggregation";
import Match from "../../../../../../utils/Match"
import {
  DateTimeDataFieldSetting
} from "../../../../Components/Input/DateTimeSettings";
import { fetchPagination } from "../../../../../../Requests";
import { queryData } from "../../../../../../utils/queryExtraction";
import { AdminForm } from "../../../../Components/AdminForm";
import {
  ViewLevelConfiguration
} from "../../../../Components/Input/ReferenceLayerLevelConfiguration";
import LabelForm from "../../../../Indicator/Form/LabelForm";
import PopupConfigForm from "../PopupConfigForm";
import StyleConfig from "../../../../Style/Form/StyleConfig";
import { MainDataGrid } from "../../../../../../components/Table";
import { CogIcon } from "../../../../../../components/Icons";
import { ExecuteWebWorker } from "../../../../../../utils/WebWorker";
import worker from "../../../../../Dashboard/LeftPanel/RelatedTable/Worker";
import { getCountryGeomIds } from "../../../../../../utils/Dataset";

import './style.scss';

/**
 * MultiIndicatorConfig
 * @param {string} referenceLayerUUID uuid of reference layer.
 * @param {boolean} configOpen Is open or close.
 * @param {Function} setConfigOpen Set Parent Open.
 * @param {Array} relatedTables List of relatedTables of selected data.
 * @param {dict} layer Data of layer.
 * @param {Function} onUpdate Function when data updated.
 */
export default function RelatedTableLayerConfig(
  {
    referenceLayerData,
    configOpen,
    setConfigOpen,
    relatedTables,
    layer,
    onUpdate
  }
) {
  const prevState = useRef();

  /** Default data **/
  const defaultConfig = {
    where: "",
    date_field: Match.inList.date(relatedTables[0]?.related_fields),
    aggregation: TYPES.COUNT + `(${relatedTables[0]?.related_fields[0]})`
  }
  const defaultData = {
    name: "",
    description: "",
    indicators: [],
    related_tables: [relatedTables[0]],
    config: defaultConfig,
    type: 'Related Table'
  }

  const {
    referenceLayer,
    geoField
  } = useSelector(state => state.dashboard.data);

  const [data, setData] = useState(defaultData)
  const [open, setOpen] = useState(false)
  const [relatedTableData, setRelatedTableData] = useState(null)

  const relatedTable = data.related_tables[0]
  const relatedTableConfig = relatedTables.find(rt => rt.id === relatedTable?.id)

  const defaultDescription = (layer, relatedTableConfig) => {
    if (layer.description) return layer.description;
    let description = "Layer dynamically created based on {related-table-name} table. Data has been aggregated " +
      "using {aggr-method-name} on field {aggr-field-name}."
    if (relatedTableConfig?.query) {
      description = `${description}\nSource data has been filtered based on the following fields: {sql-field-names}.`;
    }
    return description
  }

  // Open data selection when the props true
  useEffect(() => {
    if (configOpen) {
      setOpen(true)
    }
  }, [configOpen])

  // Open data selection when the props true
  useEffect(() => {
    if (setConfigOpen) {
      setConfigOpen(open)
    }
    if (!layer) {
      setData(defaultData)
    } else {
      layer.config = Object.assign({}, defaultConfig, layer.config)
      setData(layer)
    }
  }, [open])

  // Open data selection when the props true
  useEffect(() => {
    if (!layer && data) {
      data.description = defaultDescription(data, relatedTableConfig);
      setData(data)
    }
  }, [data])

  // Loading data
  useEffect(() => {
    if (!open || !relatedTableConfig) {
      return
    }
    if (
      !referenceLayerData?.data?.name ||
      !relatedTableConfig.geography_code_field_name ||
      !relatedTableConfig.geography_code_type ||
      !data?.config?.date_field
    ) {
      return;
    }
    const params = {
      country_geom_ids: getCountryGeomIds(referenceLayerData.data).join(','),
      geography_code_field_name: relatedTableConfig.geography_code_field_name,
      geography_code_type: relatedTableConfig.geography_code_type,
      date_field: data?.config?.date_field
    }
    if (data?.config?.date_format) {
      params['date_format'] = data?.config?.date_format
    }
    const url = relatedTableConfig.url.replace('data', 'values')
    if (JSON.stringify(params) !== JSON.stringify(prevState.params) || JSON.stringify(url) !== JSON.stringify(prevState.url)) {
      prevState.params = params
      prevState.url = url
      setRelatedTableData(null)
      fetchPagination(
        url, { ...params, page: 1, page_size: 10000 }
      ).then(response => {
        // Update data by executed worker
        ExecuteWebWorker(
          worker, {
            response
          }, (response) => {
            setRelatedTableData(response)
          }
        )
      })
    }
  }, [open, data, referenceLayerData])

  /** Update data **/
  const updateData = () => {
    setData(dictDeepCopy(data, true))
  }

  /** Apply data **/
  const apply = () => {
    onUpdate(data)
    setOpen(false)
  }
  if ((layer && !relatedTables.length) || !relatedTableConfig) {
    return null
  }
  let rows = relatedTableData;
  let error = null;

  // If there is main query, filter it
  if (relatedTableConfig?.query) {
    try {
      rows = queryData(relatedTableData, relatedTableConfig.query)
    } catch (err) {
      error = err.toString()
    }
  }
  const disabled = !data.name || !data.style_type
  const relatedFields = getRelatedTableFields(relatedTableConfig, rows)

  // We format the example of RT Data
  if (!error) {
    let { rows: newRows, error: newError } = getRelatedTableData(
      rows,
      {
        geography_code_field_name: relatedTableConfig.geography_code_field_name,
        date_field: data.config.date_field,
        aggregation: data.config.aggregation,
        where: data.config.where
      },
      null,
      geoField
    );
    rows = newRows
    error = newError
  }

  if (!relatedTables[0]) {
    return ""
  }
  return (
    <Fragment>
      <Modal
        className='IndicatorLayerConfig RelatedTableIndicator MuiBox-Large'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          Setup Related Table Layer
        </ModalHeader>
        <ModalContent className='Gray'>
          <div className='SaveButton-Section'>
            <SaveButton
              variant="primary"
              text={"Apply Changes"}
              disabled={disabled}
              onClick={apply}/>
          </div>
          <div className='AdminForm Section'>
            <AdminForm
              selectableInput={false}
              forms={{
                'General': (
                  <div>
                    {/* STYLE DATA */}
                    {
                      !data.style_type ?
                        <span className='form-helptext error'>Style is not configured.</span> : null
                    }
                    <div className="BasicFormSection">
                      <div>
                        <label className="form-label required">Name</label>
                      </div>
                      <div className='ContextLayerConfig-IconSize'>
                        <input
                          type="text" spellCheck="false"
                          value={data.name}
                          onChange={evt => {
                            data.name = evt.target.value
                            updateData()
                          }}/>
                      </div>
                    </div>
                    <div className="BasicFormSection">
                      <div>
                        <label className="form-label">Description</label>
                      </div>
                      <div className='ContextLayerConfig-IconSize'>
                        <textarea
                          value={data.description}
                          onChange={evt => {
                            data.description = evt.target.value
                            updateData()
                          }}/>
                      </div>
                      <span className="form-helptext">
                        {"Put any text here. You can put markup {<Variable Name>}."}
                        {"The variable name that can be used are:"}<br/>
                        {'"aggr-method-name" = Name of the aggregation method defined in the ' +
                          'Related Table Layer config'}<br/>
                        {'"aggr-field-name" = Name of the field selected for aggregation in the ' +
                          'Related Table Layer config'}<br/>
                        {'"related-table-name" = Names\ of the Related Table'}<br/>
                        {'"sql-field-names" = Names of fields used for the SQL Filter in the Related Table config ' +
                          '(Related Tables tab of the Project config)'}<br/>
                        {'"sql-query" = Full SQL syntax as text, used for the SQL Filter in the Related Table config'}<br/>
                      </span>
                    </div>
                    {/* ADMIN LEVEL CONFIGURATION*/}
                    <div className='OverrideAdminLevel'>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!(data.level_config && Object.keys(data.level_config).length)}
                              onChange={evt => {
                                if (evt.target.checked) {
                                  data.level_config = {
                                    default_level: 0
                                  }
                                } else {
                                  data.level_config = {}
                                }
                                updateData()
                              }}/>
                          }
                          label={"Override admin level configuration"}/>
                      </FormGroup>
                      {
                        data.level_config && Object.keys(data.level_config).length ?
                          <ViewLevelConfiguration
                            data={data.level_config}
                            setData={
                              levelConfig => {
                                data.level_config = levelConfig
                                updateData()
                              }
                            }
                            referenceLayer={referenceLayer}
                            ableToSelectReferenceLayer={true}
                          /> : null
                      }
                    </div>
                    <div className="BasicFormSection">
                      <div>
                        <label className="form-label required">Related
                          Table</label>
                      </div>
                      <SelectWithList
                        list={
                          relatedTables.map(rt => {
                            return {
                              name: rt.name,
                              value: rt.id
                            }
                          })
                        }
                        required={true}
                        value={data.related_tables[0].id}
                        onChange={evt => {
                          data.related_tables = relatedTables.filter(rt => rt.id === evt.value)
                          updateData()
                        }}
                      />
                    </div>
                    <div className="BasicFormSection">
                      <div>
                        <label className="form-label required">
                          Related field as geometry code
                        </label>
                      </div>
                      <SelectWithList
                        list={
                          relatedTableConfig.related_fields.map(field => {
                            return {
                              name: field,
                              value: field
                            }
                          })
                        }
                        required={true}
                        isDisabled={true}
                        value={relatedTableConfig.geography_code_field_name}
                      />
                      <span className="form-helptext">
                        Related field as geography code. Change it on related tables section.
                      </span>
                    </div>
                    <div className="BasicFormSection">
                      <DateTimeDataFieldSetting
                        attributes={relatedTableConfig.related_fields}
                        field={data.config.date_field}
                        fieldChanged={field => {
                          data.config.date_field = field
                          updateData()
                        }}
                        format={data.config.date_format ? data.config.date_format : 'timestamp'}
                        formatChanged={format => {
                          data.config.date_format = format
                          updateData()

                        }}/>
                    </div>
                    <WhereInputModal
                      value={data.config.where}
                      fields={relatedFields}
                      setValue={val => {
                        data.config.where = val
                        updateData()
                      }}
                      disabledChanges={{ sql: true, and_or: true }}
                      isSimplified={true}
                      title={"Data Slicers"}
                    />
                    <Aggregation
                      value={data.config.aggregation}
                      fields={relatedTableConfig.related_fields}
                      setValue={val => {
                        data.config.aggregation = val
                        updateData()
                      }}
                      isString={true}
                    />
                  </div>
                ),
                'Sample Data': (
                  <div className='Section AdminList'>
                    {
                      error ? <div className={'error'}>{error}</div> :
                        <MainDataGrid
                          rows={rows}
                          columns={[
                            { field: 'id', headerName: 'id', hide: true },
                            {
                              field: 'geometry_name',
                              headerName: 'Name',
                              flex: 1
                            },
                            {
                              field: 'ucode',
                              headerName: 'Ucode',
                              flex: 1
                            },
                            { field: 'value', headerName: 'Value', flex: 1 },
                            {
                              field: 'date', headerName: 'Date', flex: 1,
                              renderCell: (params) => {
                                return parseDateTime(params.value)
                              }
                            }
                          ]}
                          pageSize={20}
                          rowsPerPageOptions={[20]}
                          disableSelectionOnClick
                          loading={!relatedTableData}
                        />
                    }
                  </div>
                ),
                'Style':
                  <StyleConfig
                    data={data}
                    setData={newData => {
                      setData({ ...newData })
                      updateData()
                    }}
                    defaultCodes={rows ? rows.map(row => row.value) : []}
                    defaultStyleRules={data?.style ? data?.style : []}
                  />,
                'Label': <LabelForm
                  indicator={data}
                  setIndicator={newData => {
                    setData({ ...data, label_config: newData.label_config })
                  }}/>,
                'Popup': <PopupConfigForm
                  indicator={data}
                  setIndicator={newDataLayer => {
                    data.popup_template = newDataLayer.popup_template
                    data.popup_type = newDataLayer.popup_type
                    data.data_fields = newDataLayer.data_fields
                    updateData()
                  }}
                />,
              }}
            />
          </div>
        </ModalContent>
      </Modal>
      {
        layer ?
          <ThemeButton className='IndicatorStyleButton' onClick={() => {
            setOpen(true)
          }}>
            <CogIcon/> Config
          </ThemeButton>
          : ""
      }
    </Fragment>
  )
}