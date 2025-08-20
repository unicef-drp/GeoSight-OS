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

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Checkbox from "@mui/material/Checkbox";
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { DownloadIcon } from "../../../../components/Icons";
import CustomPopover from "../../../../components/CustomPopover";
import { ThemeButton } from "../../../../components/Elements/Button";
import { removeElement } from "../../../../utils/Array";
import { dictDeepCopy, jsonToXlsx } from "../../../../utils/main";
import {
  extractCode,
  fetchFeatureList,
  fetchGeojson,
} from "../../../../utils/georepo";
import {
  Notification,
  NotificationStatus,
} from "../../../../components/Notification";

import {
  SelectWithSearch
} from "../../../../components/Input/SelectWithSearch";
import { fetchingData } from "../../../../Requests";
import {
  dynamicLayerIndicatorList,
  fetchDynamicLayerData,
} from "../../../../utils/indicatorLayer";
import { getRelatedTableData } from "../../../../utils/relatedTable";
import { Indicator } from "../../../../class/Indicator";
import { Variables } from "../../../../utils/Variables";
import { getDashboardTool } from "../../../../utils/dashboard";

import "./style.scss";

export const GeographyFilter = {
  All: "All Geographies",
  Filtered: "Filtered Geographies",
};
export const Format = {
  Excel: "Excel",
  Geojson: "Geojson",
};
export const TimeType = {
  Current: "Current date/time (active window)",
  All: "All history",
};
/**
 * DownloaderData component.
 */
export default function DownloaderData() {
  const { tools } = useSelector((state) => state.dashboard.data);
  const dataDownloadEnable = getDashboardTool(
    tools,
    Variables.DASHBOARD.TOOL.DATA_DOWNLOAD,
  )?.visible_by_default;

  const filteredGeometries = useSelector((state) => state.filteredGeometries);
  const { indicators, referenceLayer, indicatorLayers, relatedTables, name } =
    useSelector((state) => state.dashboard.data);
  const geoField = "geometry_code";
  const referenceLayerData = useSelector(
    (state) => state.referenceLayerData[referenceLayer.identifier],
  );
  const selectedIndicatorLayer = useSelector(
    (state) => state.selectedIndicatorLayer,
  );
  const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);
  const indicatorsData = useSelector((state) => state.indicatorsData);
  const relatedTableData = useSelector((state) => state.relatedTableData);
  const selectedGlobalTime = useSelector((state) => state.selectedGlobalTime);

  const countries = referenceLayerData?.data?.countries?.map(
    (country) => country.ucode,
  );

  const [downloading, setDownloading] = useState(false);

  // Indicator layers ids
  const indicatorLayersIds = indicatorLayers.map(
    (indicatorLayer) => indicatorLayer.id,
  );
  indicatorLayersIds.sort();

  const levels = referenceLayerData?.data?.dataset_levels;
  const [state, setState] = useState({
    levels: [],
    geographyFilter: GeographyFilter.All,
    indicators: [],
    format: Format.Excel,
    excludeEmptyValue: true,
    time: TimeType.Current,
  });

  const disabled =
    downloading ||
    !state.levels.length ||
    !state.indicators.length ||
    !indicatorLayers.length ||
    !countries;

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity);
  };

  /** Add level **/
  const addLevel = (level) => {
    if (!state.levels.includes(level)) {
      state.levels.push(level);
    }
    setState({ ...state, levels: state.levels });
  };

  /** Remove level **/
  const removeLevel = (level) => {
    const levels = removeElement(state.levels, level);
    setState({ ...state, levels: levels });
  };

  /** Add indicator **/
  const addIndicator = (id) => {
    if (!state.indicators.includes(id)) {
      state.indicators.push(id);
    }
    state.indicators.sort();
    setState({ ...state, indicators: state.indicators });
  };

  /** Remove indicator **/
  const removeIndicator = (id) => {
    const indicators = removeElement(state.indicators, id);
    setState({ ...state, indicators: indicators });
  };

  /** Selected admin level changed **/
  useEffect(() => {
    state.levels = [];
    addLevel(selectedAdminLevel.level);
  }, [selectedAdminLevel]);

  /** Selected indicator changed **/
  useEffect(() => {
    state.indicators = [];
    addIndicator(selectedIndicatorLayer.id);
  }, [selectedIndicatorLayer]);

  // Get indicator data
  const getData = (
    indicatorLayer,
    indicatorData,
    indicatorValueByGeometry,
    ucode,
    isIndicator = true,
  ) => {
    // Get the data
    let the_data = null;
    let name = "";
    let shortcode = "";
    try {
      let layerData = indicatorValueByGeometry[indicatorLayer.id][ucode];
      if (isIndicator) {
        let indicator = indicators.find(
          (indicator) => indicator.id === indicatorData.id,
        );
        name = indicator?.name;
        shortcode = indicator?.shortcode;
        the_data = layerData.filter(
          (row) => row.indicator?.id === indicator.id,
        );
      } else {
        the_data = layerData;
        name = indicatorLayer.name;
      }
    } catch (err) {}
    if (the_data?.length) {
      return the_data.map((row) => {
        return {
          IndicatorCode: shortcode ? shortcode : "",
          IndicatorName: name,
          Value: row?.value !== undefined ? "" + row?.value : "",
          Date: row?.date ? row?.date : "",
        };
      });
    } else if (!state.excludeEmptyValue) {
      return [
        {
          IndicatorCode: shortcode ? shortcode : "",
          IndicatorName: name,
          Value: "",
          Date: "",
        },
      ];
    }
    return null;
  };

  /** Clean data to excel **/
  const cleanDataToExcel = (
    tableData,
    geometries,
    indicatorLayer,
    indicatorData,
    indicatorValueByGeometry,
    isIndicator,
  ) => {
    // Get per geometries
    geometries.map((geom) => {
      const ucode = extractCode(geom, geoField);
      const row = Object.assign(
        {},
        {
          GeographyCode: geom.ucode,
          GeographyName: geom.name,
          GeographyLevel: levels.find(
            (level) => level.level === geom.admin_level,
          )?.level_name,
        },
        geom.ext_codes,
      );
      delete row.default;
      delete row.ucode;

      const data = getData(
        indicatorLayer,
        indicatorData,
        indicatorValueByGeometry,
        ucode,
        isIndicator,
      );
      if (data) {
        data.map((dataRow) => {
          tableData.push(Object.assign({}, row, dataRow));
        });
      }
    });
  };

  /** Clean data to geojson **/
  const cleanDataToGeojson = (
    features,
    geometries,
    indicatorLayer,
    indicatorData,
    indicatorValueByGeometry,
    isIndicator,
  ) => {
    // Get per geometries
    geometries.map((geom) => {
      const ucode = extractCode(geom.properties);
      const data = getData(
        indicatorLayer,
        indicatorData,
        indicatorValueByGeometry,
        ucode,
        isIndicator,
      );
      if (data) {
        data.map((dataRow) => {
          const usedGeom = dictDeepCopy(geom);
          usedGeom.properties = Object.assign({}, usedGeom.properties, dataRow);
          features.push(usedGeom);
        });
      }
    });
  };
  const indicatorLayerData = async (timeType, indicator) => {
    const output = [];
    if (state.time === TimeType.All) {
      await fetchingData(
        `/api/v1/data-browser/`,
        {
          indicator_id: indicator.id,
          country_geom_id__in: countries,
        },
        {},
        (response, error) => {
          if (!error) {
            response.map((row) => {
              row.indicator = indicator;
              output.push(row);
            });
          }
        },
      );
    } else {
      const response = await new Indicator(indicator).valueLatest({
        date__lte: selectedGlobalTime.max
          ? selectedGlobalTime.max.split("T")[0]
          : null,
        date__gte: selectedGlobalTime.min.split("T")[0],
        admin_level__in: state.levels.map((level) => level).join(","),
        country_geom_id__in: countries,
      });
      response.map((row) => {
        row.indicator = indicator;
        output.push(row);
      });
    }
    return output;
  };
  const dynamicLayerData = async (timeType, indicatorLayer) => {
    const dynamicIndicatorsData = {};
    const dynamicLayerIndicators = dynamicLayerIndicatorList(
      indicatorLayer,
      indicators,
    );
    for (let j = 0; j < dynamicLayerIndicators.length; j++) {
      const indicator = dynamicLayerIndicators[j];
      dynamicIndicatorsData[indicator.id] = await indicatorLayerData(
        timeType,
        indicator,
      );
    }
    return dynamicIndicatorsData;
  };

  // Construct the data
  const download = () => {
    setDownloading(true);
    (async () => {
      // try {
      // Get the data
      const levelsUsed = levels.filter((level) =>
        state.levels.includes(level.level),
      );
      const indicatorValueByGeometry = {};

      // The data
      for (let i = 0; i < state.indicators.length; i++) {
        const indicatorId = state.indicators[i];
        const indicatorLayer = indicatorLayers.find(
          (indicatorLayer) => indicatorId === indicatorLayer.id,
        );
        // For indicator
        if (indicatorLayer) {
          // This is for dynamic layer
          if (
            !indicatorLayer.indicators?.length &&
            !indicatorLayer.related_tables?.length
          ) {
            const dynamicIndicatorsData = await dynamicLayerData(
              state.time,
              indicatorLayer,
            );
            // Create layer data
            const output = {}; // Output by concept uuid
            fetchDynamicLayerData(
              indicatorLayer,
              indicators,
              dynamicIndicatorsData,
              geoField,
              (error) => {},
              (response) => {
                response.map((row) => {
                  row.indicator = indicatorLayer;
                  if (!output[row.geom_id]) {
                    output[row.geom_id] = [];
                  }
                  output[row.geom_id].push(row);
                });
              },
              true,
            );
            indicatorValueByGeometry[indicatorLayer.id] = output;
          } else if (indicatorLayer.related_tables?.length) {
            if (state.time !== TimeType.All) {
              continue;
            }
            const relatedTable = relatedTables.find(
              (rt) => rt.id === indicatorLayer.related_tables[0].id,
            );
            if (relatedTable) {
              const params = {
                geography_code_field_name:
                  relatedTable.geography_code_field_name,
                geography_code_type: relatedTable.geography_code_type,
                country_geom_ids: countries,
              };
              if (indicatorLayer.config.date_field) {
                params.date_field = indicatorLayer.config.date_field;
              }
              if (indicatorLayer.config.date_format) {
                params.date_format = indicatorLayer.config.date_format;
              }
              const url = `/api/v1/related-tables/${relatedTable.id}/geo-data/`;
              await fetchingData(url, params, {}, function (response, error) {
                if (!error) {
                  const relatedTableData = {};
                  relatedTableData[relatedTable.id] = {
                    data: response,
                    fetching: true,
                    fetched: true,
                  };
                  const { rows } = getRelatedTableData(
                    response,
                    {
                      ...indicatorLayer.config,
                      geography_code_field_name:
                        relatedTable.geography_code_field_name,
                    },
                    selectedGlobalTime,
                    geoField,
                    false,
                  );
                  if (rows) {
                    const output = {};
                    rows.map((row) => {
                      row.geom_id = row.geometry_code;
                      row.indicator = indicatorLayer;
                      if (!output[row.geom_id]) {
                        output[row.geom_id] = [];
                      }
                      output[row.geom_id].push(row);
                    });
                    indicatorValueByGeometry[indicatorLayer.id] = output;
                  }
                }
              });
            }
          } else {
            const output = {}; // Output by concept uuid
            for (let j = 0; j < indicatorLayer.indicators.length; j++) {
              const indicator = indicatorLayer.indicators[j];
              const response = await indicatorLayerData(state.time, indicator);
              response.map((row) => {
                row.indicator = indicator;
                if (!output[row.geometry_code]) {
                  output[row.geometry_code] = [];
                }
                output[row.geometry_code].push(row);
              });
            }
            indicatorValueByGeometry[indicatorLayer.id] = output;
          }
        }
      }

      // If excel
      if (state.format === Format.Excel) {
        // Get the geometries
        const tableData = [];
        let geometries = [];
        for (const level of levelsUsed) {
          let geometryData = await fetchFeatureList(level.url);
          geometryData.sort((a, b) =>
            a.ucode > b.ucode ? 1 : b.ucode > a.ucode ? -1 : 0,
          );
          if (state.geographyFilter === GeographyFilter.Filtered) {
            geometryData = geometryData.filter((geom) =>
              filteredGeometries.includes(extractCode(geom)),
            );
          }
          geometries = geometries.concat(geometryData);
        }

        // Get every indicators selected
        state.indicators.map((indicatorId) => {
          // Get per indicator layer
          const indicatorLayer = indicatorLayers.find(
            (indicatorLayer) => indicatorId === indicatorLayer.id,
          );
          if (
            !indicatorLayer.indicators?.length &&
            !indicatorLayer.related_tables?.length
          ) {
            cleanDataToExcel(
              tableData,
              geometries,
              indicatorLayer,
              indicatorLayer,
              indicatorValueByGeometry,
              false,
            );
          } else {
            // For indicators
            indicatorLayer.indicators.map((indicatorData) => {
              cleanDataToExcel(
                tableData,
                geometries,
                indicatorLayer,
                indicatorData,
                indicatorValueByGeometry,
                true,
              );
            });

            // For related tables
            indicatorLayer.related_tables.map((rt) => {
              cleanDataToExcel(
                tableData,
                geometries,
                indicatorLayer,
                rt,
                indicatorValueByGeometry,
                false,
              );
            });
          }
        });
        jsonToXlsx(tableData, name + ".xls");
      }
      // else if just geojson
      else if (state.format === Format.Geojson) {
        const features = [];
        let geometries = [];
        for (const level of levelsUsed) {
          let response = await fetchGeojson(level.url);
          let geometryData = response.features;
          geometryData.sort((a, b) =>
            a.properties.ucode > b.properties.ucode
              ? 1
              : b.properties.ucode > a.properties.ucode
                ? -1
                : 0,
          );
          if (state.geographyFilter === GeographyFilter.Filtered) {
            geometryData = geometryData.filter((geom) =>
              filteredGeometries.includes(extractCode(geom.properties)),
            );
          }
          geometries = geometries.concat(geometryData);
        }

        // Get every selected indicators
        state.indicators.map((indicatorId) => {
          // Get per indicator layer
          const indicatorLayer = indicatorLayers.find(
            (indicatorLayer) => indicatorId === indicatorLayer.id,
          );
          if (
            !indicatorLayer.indicators?.length &&
            !indicatorLayer.related_tables?.length
          ) {
            cleanDataToGeojson(
              features,
              geometries,
              indicatorLayer,
              indicatorLayer,
              indicatorValueByGeometry,
              false,
            );
          } else {
            // For indicators
            indicatorLayer.indicators.map((indicatorData) => {
              cleanDataToGeojson(
                features,
                geometries,
                indicatorLayer,
                indicatorData,
                indicatorValueByGeometry,
                true,
              );
            });

            // For related tables
            indicatorLayer.related_tables.map((rt) => {
              cleanDataToGeojson(
                features,
                geometries,
                indicatorLayer,
                rt,
                indicatorValueByGeometry,
                false,
              );
            });
          }
        });

        // Download geojson
        var element = document.createElement("a");
        element.setAttribute(
          "href",
          "data:text/json;charset=utf-8," +
            encodeURIComponent(
              JSON.stringify({
                type: "FeatureCollection",
                features: features,
              }),
            ),
        );
        element.setAttribute("download", name + ".geojson");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
      // } catch (err) {
      //   notify(err.toString(), NotificationStatus.ERROR)
      // }
      setDownloading(false);
    })();
  };

  return (
    <Plugin className="DownloadControl" hidden={!dataDownloadEnable}>
      <div
        title={downloading ? "Preparing Data" : ""}
        className={downloading ? "Disabled" : ""}
        data-tool={Variables.DASHBOARD.TOOL.DATA_DOWNLOAD}
      >
        <CustomPopover
          showCloseButton={true}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          Button={
            <div className="Active">
              <PluginChild title={"Download Data"}>
                <DownloadIcon />
              </PluginChild>
            </div>
          }
        >
          <div
            className={
              "DownloaderDataComponent " + (disabled ? "Disabled" : "")
            }
          >
            <div className="DownloaderDataTitle">
              <b className="light">Download data from indicators</b>
            </div>
            <div className="DownloaderDataForm">
              <FormControlLabel
                key={state.excludeEmptyValue}
                disabled={downloading}
                control={
                  <Checkbox
                    checked={state.excludeEmptyValue}
                    onChange={(evt) => {
                      setState({
                        ...state,
                        excludeEmptyValue: !state.excludeEmptyValue,
                      });
                    }}
                  />
                }
                label={"Exclude records without indicator values"}
              />
              <br />
              <br />

              {/* FOR ADMIN FILTER */}
              <FormGroup className={"GroupSelection"}>
                <FormLabel>Admin level</FormLabel>
                <FormGroup>
                  {levels
                    ? levels.map((level) => {
                        return (
                          <FormControlLabel
                            key={level.level}
                            disabled={downloading}
                            control={
                              <Checkbox
                                checked={state.levels.includes(level.level)}
                                onChange={(evt) => {
                                  if (evt.target.checked) {
                                    addLevel(level.level);
                                  } else {
                                    removeLevel(level.level);
                                  }
                                }}
                              />
                            }
                            label={level.level_name}
                          />
                        );
                      })
                    : null}
                </FormGroup>
              </FormGroup>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormLabel>Geographical extent</FormLabel>
                  <SelectWithSearch
                    disableCloseOnSelect={false}
                    options={[GeographyFilter.All, GeographyFilter.Filtered]}
                    value={state.geographyFilter}
                    onChangeFn={(value) => {
                      setState({ ...state, geographyFilter: value });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormLabel>Format</FormLabel>
                  <SelectWithSearch
                    disableCloseOnSelect={false}
                    options={[Format.Geojson, Format.Excel]}
                    value={state.format}
                    onChangeFn={(value) => {
                      setState({ ...state, format: value });
                    }}
                  />
                </Grid>
              </Grid>

              {/* TIME */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormLabel>Time filter</FormLabel>
                  <SelectWithSearch
                    disableCloseOnSelect={false}
                    options={[TimeType.Current, TimeType.All]}
                    value={state.time}
                    onChangeFn={(value) => {
                      setState({ ...state, time: value });
                    }}
                  />
                </Grid>
              </Grid>

              {/* FOR INDICATORS FILTER */}
              {indicatorLayers.length ? (
                <table>
                  <thead>
                    <tr>
                      <td>
                        <Checkbox
                          checked={
                            JSON.stringify(indicatorLayersIds) ===
                            JSON.stringify(state.indicators)
                          }
                          onChange={(evt) => {
                            if (evt.target.checked) {
                              setState({
                                ...state,
                                indicators: indicatorLayersIds,
                              });
                            } else {
                              setState({ ...state, indicators: [] });
                            }
                          }}
                        />
                      </td>
                      <td>Indicator</td>
                    </tr>
                  </thead>
                  <tbody>
                    {indicatorLayers.map((indicatorLayer) => {
                      return (
                        <tr key={indicatorLayer.id}>
                          <td>
                            <Checkbox
                              checked={state.indicators.includes(
                                indicatorLayer.id,
                              )}
                              onChange={(evt) => {
                                if (evt.target.checked) {
                                  addIndicator(indicatorLayer.id);
                                } else {
                                  removeIndicator(indicatorLayer.id);
                                }
                              }}
                            />
                          </td>
                          <td>{indicatorLayer.name}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </div>
            <div className="DownloadButton">
              <ThemeButton
                disabled={disabled}
                variant="primary Reverse"
                onClick={download}
              >
                {downloading ? <CircularProgress /> : <DownloadIcon />}
                {downloading ? "Downloading" : "Download"}
              </ThemeButton>
            </div>
          </div>
        </CustomPopover>
      </div>
      <Notification ref={notificationRef} />
    </Plugin>
  );
}
