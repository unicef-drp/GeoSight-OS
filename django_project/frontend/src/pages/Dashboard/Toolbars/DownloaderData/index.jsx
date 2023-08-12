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
   DownloaderData
   ========================================================================== */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import CustomPopover from "../../../../components/CustomPopover";
import { ThemeButton } from "../../../../components/Elements/Button";
import { removeElement } from "../../../../utils/Array";
import { jsonToXlsx } from "../../../../utils/main";
import {
  extractCode,
  fetchFeatureList,
  fetchGeojson
} from "../../../../utils/georepo";
import { getIndicatorValueByGeometry } from "../../../../utils/indicatorData";
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";

import './style.scss';

export const GeographyFilter = {
  All: 'All Geographies',
  Filtered: 'Filtered Geographies'
}
export const Format = {
  Excel: 'Excel',
  Geojson: 'Geojson'
}
/**
 * DownloaderData component.
 */
export default function DownloaderData() {
  const filteredGeometries = useSelector(state => state.filteredGeometries)
  const {
    indicators,
    referenceLayer,
    indicatorLayers,
    relatedTables,
    name,
    geoField
  } = useSelector(state => state.dashboard.data)
  const referenceLayerData = useSelector(state => state.referenceLayerData)
  const selectedIndicatorLayer = useSelector(state => state.selectedIndicatorLayer)
  const selectedAdminLevel = useSelector(state => state.selectedAdminLevel)
  const indicatorsData = useSelector(state => state.indicatorsData)
  const relatedTableData = useSelector(state => state.relatedTableData)
  const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);

  const [downloading, setDownloading] = useState(false)

  // Indicator layers ids
  const indicatorLayersIds = indicatorLayers.map(indicatorLayer => indicatorLayer.id);
  indicatorLayersIds.sort()

  const levels = referenceLayerData[referenceLayer.identifier]?.data?.dataset_levels
  const [state, setState] = useState({
    levels: [],
    geographyFilter: GeographyFilter.All,
    indicators: [],
    format: Format.Excel
  })

  const disabled = downloading || !state.levels.length || !state.indicators.length || !indicatorLayers.length


  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  /** Add level **/
  const addLevel = (level) => {
    if (!state.levels.includes(level)) {
      state.levels.push(level)
    }
    setState({ ...state, levels: state.levels })
  }

  /** Remove level **/
  const removeLevel = (level) => {
    const levels = removeElement(state.levels, level)
    setState({ ...state, levels: levels })
  }

  /** Add indicator **/
  const addIndicator = (id) => {
    if (!state.indicators.includes(id)) {
      state.indicators.push(id)
    }
    state.indicators.sort()
    setState({ ...state, indicators: state.indicators })
  }

  /** Remove indicator **/
  const removeIndicator = (id) => {
    const indicators = removeElement(state.indicators, id)
    setState({ ...state, indicators: indicators })
  }

  /** Selected admin level changed **/
  useEffect(() => {
    state.levels = []
    addLevel(selectedAdminLevel.level)
  }, [selectedAdminLevel])

  /** Selected indicator changed **/
  useEffect(() => {
    state.indicators = []
    addIndicator(selectedIndicatorLayer.id)
  }, [selectedIndicatorLayer])

  // Get indicator data
  const getData = (indicatorLayer, indicatorData, indicatorValueByGeometry, ucode, isIndicator = true) => {
    // Get the data
    let the_data = null
    let name = ''
    let shortcode = ''
    try {
      let layerData = indicatorValueByGeometry[indicatorLayer.id][ucode]
      if (isIndicator) {
        let indicator = indicators.find(indicator => indicator.id === indicatorData.id)
        name = indicator?.name
        shortcode = indicator?.shortcode
        the_data = layerData.find(row => row?.style?.indicator === indicator.id)
      } else {
        the_data = layerData[0]
        name = indicatorLayer.name
      }
    } catch (err) {
    }
    return {
      IndicatorCode: shortcode ? shortcode : '',
      IndicatorName: name,
      Value: the_data?.value !== undefined ? '' + the_data?.value : '',
      Date: the_data?.date ? the_data?.date : '',
    }
  }
  // Construct the data
  const download = () => {
    // setDownloading(true);

    (
      async () => {
        try {
          // Get the data
          const levelsUsed = levels.filter(level => state.levels.includes(level.level))
          const indicatorValueByGeometry = {}
          state.indicators.map(indicatorId => {
            const indicatorLayer = indicatorLayers.find(indicatorLayer => indicatorId === indicatorLayer.id)
            if (!indicatorLayer) {
              return
            }

            const output = getIndicatorValueByGeometry(
              indicatorLayer, indicators, indicatorsData,
              relatedTables, relatedTableData, selectedGlobalTime,
              geoField, filteredGeometries
            )
            indicatorValueByGeometry[indicatorLayer.id] = output
          })

          // If excel
          if (state.format === Format.Excel) {
            // Get the geometries
            const tableData = []
            let geometries = []
            for (const level of levelsUsed) {
              let geometryData = await fetchFeatureList(level.url)
              geometryData.sort((a, b) => (a.ucode > b.ucode) ? 1 : ((b.ucode > a.ucode) ? -1 : 0))
              if (state.geographyFilter === GeographyFilter.Filtered) {
                geometryData = geometryData.filter(geom => filteredGeometries.includes(extractCode(geom)))
              }
              geometries = geometries.concat(geometryData);
            }

            // Get every indicators selected
            state.indicators.map(indicatorId => {
              //Get per indicator layer
              const indicatorLayer = indicatorLayers.find(indicatorLayer => indicatorId === indicatorLayer.id)

              // For indicators
              indicatorLayer.indicators.map(indicatorData => {
                // Get per geometries
                geometries.map(geom => {
                  const ucode = extractCode(geom)
                  const row = Object.assign({}, {
                    GeographyCode: geom.ucode,
                    GeographyName: geom.name,
                    GeographyLevel: levels.find(level => level.level === geom.admin_level)?.level_name,
                  }, geom.ext_codes)
                  delete row.default
                  delete row.ucode

                  tableData.push(
                    Object.assign({}, row, getData(
                      indicatorLayer, indicatorData, indicatorValueByGeometry, ucode
                    ))
                  )
                })
              })

              // For related tables
              indicatorLayer.related_tables.map(rt => {
                // Get per geometries
                geometries.map(geom => {
                  const ucode = extractCode(geom)
                  const row = Object.assign({}, {
                    GeographyCode: geom.ucode,
                    GeographyName: geom.name,
                    GeographyLevel: levels.find(level => level.level === geom.admin_level)?.level_name,
                  }, geom.ext_codes)
                  delete row.default
                  delete row.ucode

                  tableData.push(
                    Object.assign({}, row, getData(
                      indicatorLayer, null, indicatorValueByGeometry, ucode, false
                    ))
                  )
                })
              })
            })
            jsonToXlsx(tableData, name + '.xls')
          }
          // else if just geojson
          else if (state.format === Format.Geojson) {
            const features = []
            let geometries = []
            for (const level of levelsUsed) {
              let response = await fetchGeojson(level.url)
              let geometryData = response.features
              geometryData.sort((a, b) => (a.properties.ucode > b.properties.ucode) ? 1 : ((b.properties.ucode > a.properties.ucode) ? -1 : 0))
              if (state.geographyFilter === GeographyFilter.Filtered) {
                geometryData = geometryData.filter(geom => filteredGeometries.includes(extractCode(geom.properties)))
              }
              geometries = geometries.concat(geometryData);
            }

            // Get every indicators selected
            state.indicators.map(indicatorId => {
              //Get per indicator layer
              const indicatorLayer = indicatorLayers.find(indicatorLayer => indicatorId === indicatorLayer.id)

              // For indicators
              indicatorLayer.indicators.map(indicatorData => {
                // Get per geometries
                geometries.map(geom => {
                  geom.properties = Object.assign(
                    {}, geom.properties,
                    getData(
                      indicatorLayer, indicatorData,
                      indicatorValueByGeometry, extractCode(geom.properties)
                    )
                  )
                  features.push(geom)
                })
              })

              // For related_tables
              indicatorLayer.related_tables.map(rt => {
                // Get per geometries
                geometries.map(geom => {
                  geom.properties = Object.assign(
                    {}, geom.properties,
                    getData(
                      indicatorLayer, null,
                      indicatorValueByGeometry, extractCode(geom.properties),
                      false
                    )
                  )
                  features.push(geom)
                })
              })
            })

            // Download geojson
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
              type: "FeatureCollection",
              features: features
            })))
            element.setAttribute('download', name + '.geojson');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }
        } catch (err) {
          notify(err.toString(), NotificationStatus.ERROR)
        }
        setDownloading(false);
      }
    )()
  }

  return (
    <Plugin className='DownloadControl'>
      <div
        title={downloading ? "Preparing Data" : ""}
        className={(downloading ? "Disabled" : "")}
      >
        <CustomPopover
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          Button={
            <PluginChild title={'Download Data'}>
              <CloudDownloadIcon/>
            </PluginChild>
          }>
          <div
            className={"DownloaderDataComponent " + (disabled ? "Disabled" : "")}
          >
            <div className='DownloaderDataTitle'>
              <b className='light'>Download selected indicators</b>
            </div>
            <div className='DownloaderDataForm'>

              {/* FOR ADMIN FILTER */}
              <FormGroup className={'GroupSelection'}>
                <FormLabel>Admin level</FormLabel>
                <FormGroup>
                  {
                    levels ? levels.map(level => {
                      return <FormControlLabel
                        key={level.level} disabled={downloading}

                        control={
                          <Checkbox
                            checked={state.levels.includes(level.level)}
                            onChange={evt => {
                              if (evt.target.checked) {
                                addLevel(level.level)
                              } else {
                                removeLevel(level.level)
                              }
                            }}/>
                        }
                        label={level.level + ' - ' + level.level_name}
                      />
                    }) : null
                  }
                </FormGroup>
              </FormGroup>

              {/* FOR GEOGRAPHY FILTER */}
              <FormGroup className={'GroupSelection'}>
                <FormLabel>Geographical extent</FormLabel>
                <RadioGroup
                  defaultValue={state.geographyFilter}
                  onChange={evt => {
                    setState({ ...state, geographyFilter: evt.target.value })
                  }}
                >
                  {
                    Object.keys(GeographyFilter).map(key => {
                      return <FormControlLabel
                        key={key} disabled={downloading}
                        value={GeographyFilter[key]}
                        control={<Radio/>} label={key}/>
                    })
                  }
                </RadioGroup>
              </FormGroup>

              {/* FOR FORMAT */}
              <FormGroup className={'GroupSelection'}>
                <FormLabel>Format</FormLabel>
                <RadioGroup
                  defaultValue={state.format}
                  onChange={evt => {
                    setState({ ...state, format: evt.target.value })
                  }}
                >
                  {
                    Object.keys(Format).map(key => {
                      return <FormControlLabel
                        key={key} disabled={downloading}
                        value={Format[key]}
                        control={<Radio/>} label={key}/>
                    })
                  }
                </RadioGroup>
              </FormGroup>

              {/* FOR INDICATORS FILTER */}
              {indicatorLayers.length ? <table>
                <thead>
                <tr>
                  <td>
                    <Checkbox
                      checked={JSON.stringify(indicatorLayersIds) === JSON.stringify(state.indicators)}
                      onChange={evt => {
                        if (evt.target.checked) {
                          setState({
                            ...state,
                            indicators: indicatorLayersIds
                          })
                        } else {
                          setState({ ...state, indicators: [] })
                        }
                      }}/>
                  </td>
                  <td>Indicator</td>
                </tr>
                </thead>
                <tbody>
                {
                  indicatorLayers.map(indicatorLayer => {
                    return <tr key={indicatorLayer.id}>
                      <td>
                        <Checkbox
                          checked={state.indicators.includes(indicatorLayer.id)}
                          onChange={evt => {
                            if (evt.target.checked) {
                              addIndicator(indicatorLayer.id)
                            } else {
                              removeIndicator(indicatorLayer.id)
                            }
                          }}/>
                      </td>
                      <td>{indicatorLayer.name}</td>
                    </tr>
                  })
                }
                </tbody>
              </table> : null}
            </div>
            <div className='DownloadButton'>
              <ThemeButton
                disabled={disabled}
                variant="primary Reverse"
                onClick={download}
              >
                {downloading ? <CircularProgress/> : <CloudDownloadIcon/>}
                {downloading ? "Downloading" : "Download"}
              </ThemeButton>
            </div>
          </div>
        </CustomPopover>
      </div>
      <Notification ref={notificationRef}/>
    </Plugin>
  )
}