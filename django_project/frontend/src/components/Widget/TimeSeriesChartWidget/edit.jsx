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

/* ==========================================================================
   TIME SERIES WIDTER
   ========================================================================== */

import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import { Button, FormControl, Radio } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";

import Modal, { ModalContent, ModalHeader } from "../../Modal";
import { SeriesDataType, SeriesType, TimeType } from "./Definition";
import { INTERVALS } from "../../../utils/Dates";
import { SelectWithList } from "../../Input/SelectWithList";
import MultiSelectorConfig
  from "../../../pages/Admin/Components/Input/MultiSelector";
import {
  indicatorLayerId,
  indicatorLayersLikeIndicator
} from "../../../utils/indicatorLayer";
import ColorPaletteSelector from "../../Input/ColorPaletteSelector";
import { RemoveIcon } from "../../Icons";

/** Section config **/
export function SectionConfig(
  {
    name, configEnabled, type, setType, list, selectedList, setSelectedUnit,
    colorPalette, setColorPalette
  }
) {
  return <FormControl className='MuiForm-RadioGroup'>
    <FormLabel className="MuiInputLabel-root">
      {name}
    </FormLabel>
    <RadioGroup
      className='Horizontal'
      value={type}
      onChange={(evt) => {
        setType(evt.target.value)
      }}
    >
      {
        Object.keys(SeriesDataType).map(key => {
          return <FormControlLabel
            key={key}
            value={SeriesDataType[key]} control={<Radio/>}
            label={SeriesDataType[key]}/>
        })
      }
    </RadioGroup>
    {
      type === SeriesDataType.PREDEFINED ?
        <MultiSelectorConfig
          className={'MuiForm-SubGroup'}
          items={list}
          selectedItems={selectedList}
          setSelectedItems={items => {
            setSelectedUnit(items)
          }}
          configEnabled={configEnabled}
        /> :
        <div className='MuiForm-SubGroup'>
          <ColorPaletteSelector
            colorPalette={colorPalette}
            onChange={val => {
              setColorPalette(val)
            }}
            isDisabled={!configEnabled}
            keepData={true}
          />
        </div>
    }
  </FormControl>
}

/**
 * Edit section for widget.
 * @param {bool} open Is open or close.
 * @param {Function} setData Set data function.
 * @param {object} data Widget Data.
 */
export default function TimeSeriesChartWidgetEditor(
  { open, setData, data }
) {
  const {
    indicators,
    indicatorLayers,
  } = useSelector(state => state.dashboard.data);
  const geometries = useSelector(state => state.geometries);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Time series attribute
  const [seriesType, setSeriesType] = useState(SeriesType.INDICATORS);

  // Indicator List Attributes
  const [indicatorsType, setIndicatorsType] = useState(SeriesDataType.PREDEFINED);
  const [indicatorsList, setIndicatorsList] = useState([]);
  const [indicatorsPaletteColor, setIndicatorsPaletteColor] = useState(0);

  // Indicator List Attributes
  const [geographicalUnitType, setGeographicalUnitType] = useState(SeriesDataType.PREDEFINED);
  const [geographicalUnitList, setGeographicalUnitList] = useState([]);
  const [geographicalUnitPaletteColor, setGeographicalUnitPaletteColor] = useState(0);

  // DATE TIME CONFIG
  const [dateTimeType, setDateTimeType] = useState(TimeType.PREDEFINED)
  const [dateTimeConfig, setDateTimeConfig] = useState({
    minDateFilter: 0,
    maxDateFilter: 0,
    interval: INTERVALS.DAILY
  })

  // On data Changed
  useEffect(() => {
    const { name, description, config } = data
    const { seriesType } = config
    setName(name ? name : '')
    setDescription(description ? description : '')
    setSeriesType(seriesType ? seriesType : SeriesType.INDICATORS)


    // ----------------------
    // For indicators configuration
    // ----------------------
    const {
      indicatorsType,
      indicatorsList,
      indicatorsPaletteColor
    } = config
    setIndicatorsType(indicatorsType ? indicatorsType : SeriesDataType.PREDEFINED)
    setIndicatorsList(indicatorsList ? indicatorsList : [])
    setIndicatorsPaletteColor(indicatorsPaletteColor ? indicatorsPaletteColor : 0)

    // ----------------------
    // For geographical units configuration
    // ----------------------
    const {
      geographicalUnitType,
      geographicalUnitList,
      geographicalUnitPaletteColor
    } = config
    setGeographicalUnitType(geographicalUnitType ? geographicalUnitType : SeriesDataType.PREDEFINED)
    setGeographicalUnitList(geographicalUnitList ? geographicalUnitList : [])
    setGeographicalUnitPaletteColor(geographicalUnitPaletteColor ? geographicalUnitPaletteColor : 0)

    // ----------------------
    // For time configuration
    // ----------------------
    const { dateTimeType, dateTimeConfig } = config
    let {
      minDateFilter,
      maxDateFilter,
      interval
    } = dateTimeConfig ? dateTimeConfig : {}
    setDateTimeType(dateTimeType ? dateTimeType : TimeType.PREDEFINED)
    if (!minDateFilter || (new Date(minDateFilter)).toString() === 'Invalid Date') {
      minDateFilter = new Date().toISOString()
    }
    if ((new Date(maxDateFilter)).toString() === 'Invalid Date') {
      maxDateFilter = null
    }
    setDateTimeConfig({
      minDateFilter: minDateFilter,
      maxDateFilter: maxDateFilter,
      interval: interval ? interval : INTERVALS.DAILY
    })
  }, [data])

  /** On Closed modal **/
  const onClosed = () => {
    setData();
  };

  /** On apply **/
  const onApply = () => {
    if (!data.config) {
      data.config = {}
    }
    const config = {
      ...data.config,
      seriesType: seriesType,
      indicatorsType: indicatorsType,
      indicatorsList: indicatorsList,
      indicatorsPaletteColor: indicatorsPaletteColor,
      geographicalUnitType: geographicalUnitType,
      geographicalUnitList: geographicalUnitList,
      geographicalUnitPaletteColor: geographicalUnitPaletteColor,
      dateTimeType: dateTimeType,
      dateTimeConfig: dateTimeConfig,
    }
    const newData = {
      ...data,
      ...{
        name: name,
        description: description,
        config: config
      }
    }
    setData(newData)
  }

  const geometryList = []
  Object.keys(geometries).map(level => Object.keys(geometries[level]).map(concept_uuid => {
    const geom = geometries[level][concept_uuid]
    geometryList.push({
      id: concept_uuid,
      name: geom.name + ` (${geom.ucode})`
    })
  }))

  const indicatorListConfig = []
  indicators.map(indicator => {
    indicatorListConfig.push({
      id: indicator.id,
      name: indicator.name
    })
  })
  indicatorLayersLikeIndicator(indicatorLayers).map(indicatorLayer => {
    indicatorListConfig.push({
      id: indicatorLayerId(indicatorLayer),
      name: indicatorLayer.name
    })
  })

  return (
    <Fragment>
      <Modal
        open={open}
        onClosed={onClosed}
        className='modal__widget__editor MuiFormControl-Form MuiBox-Large'
      >
        <ModalHeader onClosed={onClosed}>
          {name ? "Change " + name : "New Time Series Widget"}
        </ModalHeader>
        <ModalContent>
          <div className='BasicForm'>
            <div className="BasicFormSection">
              <div>
                <label className="form-label">Widget name</label>
              </div>
              <div>
                <input
                  type="text" placeholder="Widget name"
                  onChange={(event) => {
                    setName(event.target.value)
                  }}
                  value={name}
                />
              </div>
            </div>
            <div className="BasicFormSection">
              <div>
                <label className="form-label">Widget description</label>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Widget description"
                  onChange={(event) => {
                    setDescription(event.target.value)
                  }}
                  value={description}
                />
              </div>
            </div>

            {/* SERIES */}
            <FormControl className='MuiForm-RadioGroup'>
              <FormLabel className="MuiInputLabel-root">Series</FormLabel>
              <RadioGroup
                className='Horizontal'
                value={seriesType}
                onChange={(evt) => {
                  setSeriesType(evt.target.value)
                }}
              >
                {
                  Object.keys(SeriesType).map(key => {
                    return <FormControlLabel
                      key={key}
                      value={SeriesType[key]} control={<Radio/>}
                      label={SeriesType[key]}/>
                  })
                }
              </RadioGroup>
            </FormControl>

            {/* INDICATORS */}
            <SectionConfig
              name='Indicators'
              configEnabled={seriesType === SeriesType.INDICATORS}
              type={indicatorsType} setType={setIndicatorsType}
              list={indicatorListConfig}
              selectedList={indicatorsList}
              setSelectedUnit={setIndicatorsList}
              colorPalette={indicatorsPaletteColor}
              setColorPalette={setIndicatorsPaletteColor}
            />

            {/* GEOGRAPHICAL UNIT */}
            <SectionConfig
              name='Geographical units'
              configEnabled={seriesType === SeriesType.GEOGRAPHICAL_UNITS}
              type={geographicalUnitType} setType={setGeographicalUnitType}
              list={geometryList}
              selectedList={geographicalUnitList}
              setSelectedUnit={setGeographicalUnitList}
              colorPalette={geographicalUnitPaletteColor}
              setColorPalette={setGeographicalUnitPaletteColor}
            />

            {/* DATE TIME */}
            <FormControl className='MuiForm-RadioGroup'>
              <FormLabel className="MuiInputLabel-root">Date/Time</FormLabel>
              <RadioGroup
                className='Horizontal'
                value={dateTimeType}
                onChange={(evt) => {
                  setDateTimeType(evt.target.value)
                }}
              >
                {
                  Object.keys(TimeType).map(key => {
                    return <FormControlLabel
                      key={key}
                      value={TimeType[key]} control={<Radio/>}
                      label={TimeType[key]}/>
                  })
                }
              </RadioGroup>
              {
                dateTimeType === TimeType.PREDEFINED ?
                  <div className='MuiForm-SubGroup'>
                    <div className='CustomDateFilterValues BasicFormSection'>
                      <SelectWithList
                        list={[INTERVALS.DAILY, INTERVALS.MONTHLY, INTERVALS.YEARLY]}
                        menuPlacement={'top'}
                        required={true}
                        value={dateTimeConfig.interval}
                        onChange={evt => {
                          setDateTimeConfig({
                            ...dateTimeConfig,
                            interval: evt.value
                          })
                        }}/>
                      <div className='Separator'>FROM</div>
                      <DatePicker
                        showTimeSelect
                        dateFormat="dd-MM-yyyy hh:mm:ss"
                        selected={dateTimeConfig.minDateFilter ? new Date(dateTimeConfig.minDateFilter) : null}
                        maxDate={dateTimeConfig.maxDateFilter ? new Date(dateTimeConfig.maxDateFilter) : null}
                        onChange={date => {
                          setDateTimeConfig({
                            ...dateTimeConfig,
                            minDateFilter: new Date(date).toISOString()
                          })
                        }}
                      />
                      <div className='Separator'><RemoveIcon/></div>
                      <div className='react-datepicker-wrapper'>
                        <DatePicker
                          showTimeSelect
                          dateFormat="dd-MM-yyyy hh:mm:ss"
                          selected={dateTimeConfig.maxDateFilter ? new Date(dateTimeConfig.maxDateFilter) : null}
                          minDate={new Date(dateTimeConfig.minDateFilter)}
                          onChange={date => {
                            let newDate = null
                            if (date) {
                              newDate = new Date(date).toISOString()
                            }
                            setDateTimeConfig({
                              ...dateTimeConfig,
                              maxDateFilter: newDate
                            })
                          }}
                        />
                        <div className='helptext' style={{ width: '100%' }}>
                          Make the max date empty to make the data filtered up
                          to `today`.
                        </div>
                      </div>
                    </div>
                  </div> : null
              }
            </FormControl>

            <Button
              variant="primary"
              className="modal__widget__editor__apply"
              onClick={onApply}
              disabled={!name}
            >
              Apply
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </Fragment>
  )
}
