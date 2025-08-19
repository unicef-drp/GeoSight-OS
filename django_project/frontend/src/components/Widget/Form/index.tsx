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
 * __date__ = '19/08/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   WIDGET FORM
   ========================================================================== */

import React, { Fragment, useEffect, useState } from "react";
import { Button, FormControl, Radio } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTranslation } from "react-i18next";

import Modal, { ModalContent, ModalHeader } from "../../Modal";
import {
  SeriesDataType,
  SeriesType,
  SortMethodTypes,
  SortTypes,
  TimeType,
} from "../Definition";
import { INTERVALS } from "../../../utils/Dates";
import { DateTimeConfig, WidgetMetadata } from "../../../types/Widget";
import { DEFINITION } from "../index";
import {
  GeographyUnitSeriesConfig,
  IndicatorDataSeriesConfig,
} from "./UnitSelector";
import { DateTimeConfigForm } from "./DateTimeConfig";
import { AGGREGATION_TYPES } from "../../../utils/analysisData";

import "./style.scss";
import { AggregationConfigForm } from "./Aggregation";
import { SortConfigForm } from "./SortConfig";
import { Logger } from "../../../utils/logger";

/** Widget form. */
export interface Props {
  title: string;
  open: boolean;
  data: WidgetMetadata;
  setData: (data: WidgetMetadata) => void;
}

export const WidgetForm = ({ title, open, data, setData }: Props) => {
  const { t } = useTranslation();
  /** States of widget **/
  const [widgetData, setWidgetData] = useState<WidgetMetadata>({
    name: "",
    description: "",
    type: DEFINITION.WidgetType.GENERIC_SUMMARY_WIDGET,
    config: {
      seriesType: SeriesType.INDICATORS,

      indicators: [],
      indicatorsType: SeriesDataType.PREDEFINED,
      indicatorsPaletteColor: 0,

      geographicalUnitType: SeriesDataType.PREDEFINED,
      geographicalUnit: [],
      geographicalUnitPaletteColor: 0,

      dateTimeType: TimeType.SYNC,
      dateTimeConfig: {
        minDateFilter: "",
        maxDateFilter: "",
        interval: INTERVALS.DAILY,
      },
    },
  });

  // CHECKING WIDGET CONFIG
  Logger.log("WIDGET_CONFIG:", JSON.stringify(widgetData));

  // On data Changed
  useEffect(() => {
    const { name, type, description, config } = data;
    const { seriesType } = config;
    const { indicatorsType, indicators, indicatorsPaletteColor } = config;
    const {
      geographicalUnit,
      geographicalUnitType,
      geographicalUnitPaletteColor,
    } = config;
    const { dateTimeType, dateTimeConfig } = config;

    // ----------------------
    // For time configuration
    // ----------------------
    let { minDateFilter, maxDateFilter, interval }: DateTimeConfig =
      dateTimeConfig
        ? dateTimeConfig
        : {
            minDateFilter: "",
            maxDateFilter: "",
            interval: INTERVALS.DAILY,
          };
    if (
      !minDateFilter ||
      new Date(minDateFilter).toString() === "Invalid Date"
    ) {
      minDateFilter = new Date().toISOString();
    }
    if (new Date(maxDateFilter).toString() === "Invalid Date") {
      maxDateFilter = null;
    }
    const newData: WidgetMetadata = {
      name: name ? name : "",
      description: description ? description : "",
      type: type ? type : DEFINITION.WidgetType.TIME_SERIES_CHART_WIDGET,
      config: {
        seriesType: seriesType
          ? seriesType
          : type === DEFINITION.WidgetType.GENERIC_SUMMARY_WIDGET
            ? "None"
            : SeriesType.INDICATORS,

        indicators: indicators ? indicators : [],
        indicatorsType: indicatorsType
          ? indicatorsType
          : SeriesDataType.PREDEFINED,
        indicatorsPaletteColor: indicatorsPaletteColor
          ? indicatorsPaletteColor
          : 0,

        geographicalUnit: geographicalUnit ? geographicalUnit : [],
        geographicalUnitType: geographicalUnitType
          ? geographicalUnitType
          : SeriesDataType.PREDEFINED,
        geographicalUnitPaletteColor: geographicalUnitPaletteColor
          ? geographicalUnitPaletteColor
          : 0,

        dateTimeType: dateTimeType ? dateTimeType : TimeType.SYNC,
        dateTimeConfig: {
          minDateFilter: dateTimeType ? minDateFilter : null,
          maxDateFilter: dateTimeType ? maxDateFilter : null,
          interval: interval ? interval : INTERVALS.DAILY,
        },
      },
    };

    // This is for additional data
    if (data.type !== DEFINITION.WidgetType.TIME_SERIES_CHART_WIDGET) {
      newData.config.aggregation = {
        method: AGGREGATION_TYPES.SUM,
        decimalPlace: 0,
        useDecimalPlace: false,
        useAutoUnits: false,
      };
      newData.config.sort = {
        field: SortTypes.NAME,
        method: SortMethodTypes.ASC,
        topN: 0,
        useTopN: false,
      };
    }
    setWidgetData(newData);
  }, [data]);

  /** On Closed modal **/
  const onClosed = () => {
    setData(null);
  };
  /** On apply **/
  const onApply = () => {
    setData({ ...data, ...widgetData });
  };

  const isSummary = ![
    DEFINITION.WidgetType.TIME_SERIES_CHART_WIDGET,
    DEFINITION.WidgetType.GENERIC_TIME_SERIES_WIDGET,
  ].includes(widgetData.type);
  return (
    <Fragment>
      <Modal
        open={open}
        onClosed={onClosed}
        className="modal__widget__editor MuiFormControl-Form MuiBox-Large"
      >
        <ModalHeader onClosed={onClosed}>
          {data.name ? "Change " + data.name : "New " + title + " Widget"}
        </ModalHeader>
        <ModalContent>
          <div>{JSON.stringify(widgetData)}</div>
          <div className="BasicForm">
            {widgetData.type !==
              DEFINITION.WidgetType.TIME_SERIES_CHART_WIDGET && (
              <RadioGroup
                className="TypeSelector"
                style={{ display: "flex", flexDirection: "row" }}
                value={widgetData.type}
                onChange={(evt) => {
                  setWidgetData({ ...widgetData, type: evt.target.value });
                }}
              >
                <FormControlLabel
                  style={{ marginLeft: 0 }}
                  value={DEFINITION.WidgetType.GENERIC_SUMMARY_WIDGET}
                  control={<Radio />}
                  label="Summary"
                />
                <FormControlLabel
                  style={{ marginLeft: 0 }}
                  value={DEFINITION.WidgetType.GENERIC_TIME_SERIES_WIDGET}
                  control={<Radio />}
                  label="Time Series"
                />
              </RadioGroup>
            )}

            {/* ------------------------------------- */}
            {/* --------------- GLOBAL -------------- */}
            {/* ------------------------------------- */}
            <div className="BasicFormSection">
              <div>
                <label className="form-label">Widget name</label>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Widget name"
                  onChange={(event) => {
                    setWidgetData({ ...widgetData, name: event.target.value });
                  }}
                  value={widgetData.name}
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
                    setWidgetData({
                      ...widgetData,
                      description: event.target.value,
                    });
                  }}
                  value={widgetData.description}
                />
              </div>
            </div>
            {isSummary && widgetData.config.aggregation && (
              <AggregationConfigForm
                data={widgetData.config.aggregation}
                setData={(data) => {
                  setWidgetData({
                    ...widgetData,
                    config: {
                      ...widgetData.config,
                      aggregation: data,
                    },
                  });
                }}
              />
            )}
            {/* ------------------------------------- */}
            {/* --------------- GLOBAL -------------- */}
            {/* ------------------------------------- */}

            {/* SERIES or GROUP BY */}
            <FormControl className="MuiForm-RadioGroup">
              <FormLabel className="MuiInputLabel-root">
                {!isSummary ? "Series" : "Group By"}
              </FormLabel>
              <RadioGroup
                className="Horizontal"
                value={widgetData.config.seriesType}
                onChange={(evt) => {
                  setWidgetData({
                    ...widgetData,
                    config: {
                      ...widgetData.config,
                      seriesType: evt.target.value,
                    },
                  });
                }}
              >
                {isSummary && (
                  <FormControlLabel
                    control={<Radio />}
                    /*@ts-ignore*/
                    value={"None"}
                    /*@ts-ignore*/
                    label={t("None")}
                  />
                )}
                {Object.keys(SeriesType).map((key) => {
                  return (
                    <FormControlLabel
                      key={key}
                      control={<Radio />}
                      /*@ts-ignore*/
                      value={SeriesType[key]}
                      /*@ts-ignore*/
                      label={SeriesType[key]}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>

            {/* Sort by */}
            {isSummary &&
              widgetData.config.seriesType !== "None" &&
              widgetData.config.sort && (
                <SortConfigForm
                  data={widgetData.config.sort}
                  setData={(data) => {
                    setWidgetData({
                      ...widgetData,
                      config: {
                        ...widgetData.config,
                        sort: data,
                      },
                    });
                  }}
                />
              )}

            {/* INDICATORS */}
            <IndicatorDataSeriesConfig
              seriesType={widgetData.config.seriesType}
              type={widgetData.config.indicatorsType}
              setType={(type) => {
                setWidgetData({
                  ...widgetData,
                  config: { ...widgetData.config, indicatorsType: type },
                });
              }}
              selectedList={widgetData.config.indicators}
              setSelectedList={(selectedList) => {
                setWidgetData({
                  ...widgetData,
                  config: { ...widgetData.config, indicators: selectedList },
                });
              }}
              colorPalette={widgetData.config.indicatorsPaletteColor}
              setColorPalette={(colorPalette) => {
                setWidgetData({
                  ...widgetData,
                  config: {
                    ...widgetData.config,
                    indicatorsPaletteColor: colorPalette,
                  },
                });
              }}
              useColorPalette={!isSummary}
            />
            {/* GEOGRAPHICAL UNIT */}
            <GeographyUnitSeriesConfig
              seriesType={widgetData.config.seriesType}
              type={widgetData.config.geographicalUnitType}
              setType={(type) => {
                setWidgetData({
                  ...widgetData,
                  config: { ...widgetData.config, geographicalUnitType: type },
                });
              }}
              selectedList={widgetData.config.geographicalUnit}
              setSelectedList={(selectedList) => {
                setWidgetData({
                  ...widgetData,
                  config: {
                    ...widgetData.config,
                    geographicalUnit: selectedList,
                  },
                });
              }}
              colorPalette={widgetData.config.geographicalUnitPaletteColor}
              setColorPalette={(colorPalette) => {
                setWidgetData({
                  ...widgetData,
                  config: {
                    ...widgetData.config,
                    geographicalUnitPaletteColor: colorPalette,
                  },
                });
              }}
              useColorPalette={!isSummary}
            />

            {/* DATE TIME */}
            <DateTimeConfigForm
              dateTimeType={widgetData.config.dateTimeType}
              setDateTimeType={(dateTimeType) => {
                setWidgetData({
                  ...widgetData,
                  config: {
                    ...widgetData.config,
                    dateTimeType: dateTimeType,
                  },
                });
              }}
              dateTimeConfig={widgetData.config.dateTimeConfig}
              setDateTimeConfig={(dateTimeConfig) => {
                setWidgetData({
                  ...widgetData,
                  config: {
                    ...widgetData.config,
                    dateTimeConfig: dateTimeConfig,
                  },
                });
              }}
            />

            <Button
              /* @ts-ignore */
              variant="primary"
              className="modal__widget__editor__apply"
              onClick={onApply}
              disabled={!widgetData.name}
            >
              Apply
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </Fragment>
  );
};
