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

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, FormControl, Radio } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";

import Modal, { ModalContent, ModalHeader } from "../../Modal";
import {
  SeriesDataType,
  SeriesType,
  SeriesTypeNone,
  SortMethodTypes,
  DEFAULT_CHART_CONFIG,
  SortTypes,
  TimeType,
  WidgetType,
} from "../Definition";
import { INTERVALS, toLocalDateTimeString } from "../../../utils/Dates";
import { DateTimeConfig, WidgetMetadata } from "../../../types/Widget";
import {
  GeographyUnitSeriesConfig,
  IndicatorDataSeriesConfig,
} from "./UnitSelector";
import { DateTimeConfigForm } from "./DateTimeConfig";
import { AGGREGATION_TYPES } from "../../../utils/analysisData";
import { AggregationConfigForm } from "./Aggregation";
import { SortConfigForm } from "./SortConfig";
import { ChartAdvancedForm, ChartConfigForm } from "./ChartConfig";
import ChartWidgetView from "../ChartWidget/View";
import GenericWidgetView from "../GenericWidget/View";
import TimeSeriesChartWidgetView from "../TimeSeriesChartWidget/View";
import TextWidgetView from "../TextWidget/View";
import { WidgetTiles, WidgetTypeTiles } from "./WidgetTypeTiles";
import { TextConfigForm } from "./TextConfig";
import {
  usesAggregation,
  usesCustomColors,
  customColorList,
  CustomColorLists,
  usesIndicatorList,
  usesSeries,
  usesSort,
} from "../ChartWidget/capabilities";
import { FALLBACK_COLORS } from "../ChartWidget/buildOption";

/**
 * Items just added to a predefined list get the default black; in a chart
 * give them the next palette colour instead, so custom colours start out
 * distinct.
 */
function withDefaultColors(items: any[], previous: any[]): any[] {
  const known = (previous || []).map((item) => item.id);
  return items.map((item, index) =>
    !known.includes(item.id) && (!item.color || item.color === "#000000")
      ? { ...item, color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] }
      : item,
  );
}
import { Logger } from "../../../utils/logger";

import "./style.scss";
import "./editor-layout.scss";

/** Widget form. */
export interface Props {
  title: string;
  open: boolean;
  data: WidgetMetadata;
  setData: (data: WidgetMetadata) => void;
}

/** Keeps an error in the live preview inside the preview. */
class PreviewBoundary extends React.Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: false };
  }

  static getDerivedStateFromError() {
    return { error: true };
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}

export const WidgetForm = ({ title, open, data, setData }: Props) => {
  const { t } = useTranslation();
  /** States of widget **/
  const [widgetData, setWidgetData] = useState<WidgetMetadata>({
    name: "",
    description: "",
    type: WidgetType.GENERIC_SUMMARY_WIDGET,
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
    const { seriesType, aggregation, sort, chart } = config;
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
      minDateFilter = toLocalDateTimeString(new Date());
    }
    if (new Date(maxDateFilter).toString() === "Invalid Date") {
      maxDateFilter = null;
    }
    const newData: WidgetMetadata = {
      name: name ? name : "",
      description: description ? description : "",
      type: type ? type : WidgetType.TIME_SERIES_CHART_WIDGET,
      config: {
        seriesType: seriesType
          ? seriesType
          : type === WidgetType.GENERIC_SUMMARY_WIDGET
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
    if (data.type !== WidgetType.TIME_SERIES_CHART_WIDGET) {
      newData.config.aggregation = aggregation
        ? aggregation
        : {
            method: AGGREGATION_TYPES.SUM,
            decimalPlace: 2,
            useDecimalPlace: false,
            useAutoUnits: false,
          };
      newData.config.sort = sort
        ? sort
        : {
            field: SortTypes.VALUE,
            method: SortMethodTypes.ASC,
            topN: 0,
            useTopN: false,
          };
    }
    if (newData.type === WidgetType.CHART_WIDGET) {
      newData.config.chart = { ...DEFAULT_CHART_CONFIG, ...(chart || {}) };
    }
    // Settings of single widget types: kept when the widget is opened again.
    if (config.text !== undefined) {
      newData.config.text = config.text;
    }
    if (config.linkAreas !== undefined) {
      newData.config.linkAreas = config.linkAreas;
    }
    setWidgetData(newData);
  }, [data]);

  /** On Closed modal **/
  const onClosed = () => {
    setData(null);
  };
  const setAggregation = (aggregation: any) => {
    setWidgetData({
      ...widgetData,
      config: { ...widgetData.config, aggregation: aggregation },
    });
  };

  /** On apply **/
  const onApply = () => {
    setData({ ...data, ...widgetData });
  };

  const isChart = widgetData.type === WidgetType.CHART_WIDGET;
  const isText = widgetData.type === WidgetType.TEXT_WIDGET;
  const chart = isChart ? widgetData.config.chart : null;
  const isSummary = widgetData.type === WidgetType.GENERIC_SUMMARY_WIDGET;

  // The tile of the widget: a chart type, the value (summary), the text, or
  // time series (only existing widgets of that type).
  const tile = isChart
    ? chart?.type
    : isText
      ? WidgetTiles.TEXT
      : widgetData.type === WidgetType.GENERIC_TIME_SERIES_WIDGET
        ? WidgetTiles.TIME_SERIES
        : WidgetTiles.VALUE;

  /** Change the widget type from a tile; the other settings are kept. */
  const selectTile = (newTile: string) => {
    const config = { ...widgetData.config };
    let type = WidgetType.GENERIC_SUMMARY_WIDGET;
    if (newTile === WidgetTiles.TEXT) {
      type = WidgetType.TEXT_WIDGET;
      config.text = config.text || "";
    } else if (newTile === WidgetTiles.TIME_SERIES) {
      type = WidgetType.GENERIC_TIME_SERIES_WIDGET;
    } else if (newTile !== WidgetTiles.VALUE) {
      type = WidgetType.CHART_WIDGET;
      config.chart = {
        ...(config.chart || DEFAULT_CHART_CONFIG),
        type: newTile,
      };
    }
    if (type !== WidgetType.CHART_WIDGET) {
      delete config.chart;
    }
    // Charts and time series always split the data by something.
    if (
      [WidgetType.CHART_WIDGET, WidgetType.GENERIC_TIME_SERIES_WIDGET].includes(
        type,
      ) &&
      config.seriesType === SeriesTypeNone
    ) {
      config.seriesType = SeriesType.GEOGRAPHICAL_UNITS;
    }
    setWidgetData({ ...widgetData, type, config });
  };
  const applyButton = (
    <Button
      /* @ts-ignore */
      variant="primary"
      className="WidgetEditor-apply"
      onClick={onApply}
      disabled={!widgetData.name}
    >
      Apply
    </Button>
  );

  // Data settings: the middle column.
  const dataSettings = (
    <>
      {/* SERIES or GROUP BY */}
      {(!chart || usesSeries(chart)) && (
        <FormControl className="MuiForm-RadioGroup">
          <FormLabel className="MuiInputLabel-root">
            {!isSummary ? "Series" : "Group By"}
          </FormLabel>
          <RadioGroup
            row
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
                value={SeriesTypeNone}
                /*@ts-ignore*/
                label={t(SeriesTypeNone)}
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
      )}

      {/* Sort by */}
      {(isSummary || (chart && usesSort(chart))) &&
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
      {(!chart || usesIndicatorList(chart)) && (
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
              config: {
                ...widgetData.config,
                indicators: isChart
                  ? withDefaultColors(
                      selectedList,
                      widgetData.config.indicators,
                    )
                  : selectedList,
              },
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
          useColorPalette={
            isChart
              ? !!chart &&
                usesCustomColors(chart) &&
                customColorList(chart, widgetData.config.seriesType) ===
                  CustomColorLists.INDICATORS
              : !isSummary
          }
          showPalette={!isChart}
        />
      )}
      {/* GEOGRAPHICAL UNIT */}
      <GeographyUnitSeriesConfig
        seriesType={widgetData.config.seriesType}
        type={widgetData.config.geographicalUnitType}
        setType={(type) => {
          setWidgetData({
            ...widgetData,
            config: {
              ...widgetData.config,
              geographicalUnitType: type,
            },
          });
        }}
        selectedList={widgetData.config.geographicalUnit}
        setSelectedList={(selectedList) => {
          setWidgetData({
            ...widgetData,
            config: {
              ...widgetData.config,
              geographicalUnit: isChart
                ? withDefaultColors(
                    selectedList,
                    widgetData.config.geographicalUnit,
                  )
                : selectedList,
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
        useColorPalette={
          isChart
            ? !!chart &&
              usesCustomColors(chart) &&
              customColorList(chart, widgetData.config.seriesType) ===
                CustomColorLists.UNITS
            : !isSummary
        }
        showPalette={!isChart}
      />

      {/* DATE TIME */}
      <DateTimeConfigForm
        showInterval={!isChart}
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
    </>
  );

  // A new preview object only when the settings change: the views fetch
  // their data again when it changes.
  const preview = useMemo(
    () => ({ ...data, ...widgetData, id: "preview" }),
    [data, widgetData],
  );

  /** The widget as it will look on the dashboard, with the unsaved settings. */
  const renderPreview = () => {
    switch (widgetData.type) {
      case WidgetType.CHART_WIDGET:
        return widgetData.config.chart ? (
          /* @ts-ignore */
          <ChartWidgetView data={preview} />
        ) : null;
      case WidgetType.GENERIC_SUMMARY_WIDGET:
        /* @ts-ignore */
        return <GenericWidgetView data={preview} />;
      case WidgetType.GENERIC_TIME_SERIES_WIDGET:
      case WidgetType.TIME_SERIES_CHART_WIDGET:
        /* @ts-ignore */
        return <TimeSeriesChartWidgetView data={preview} />;
      case WidgetType.TEXT_WIDGET:
        /* @ts-ignore */
        return <TextWidgetView data={preview} />;
      default:
        return null;
    }
  };

  return (
    <Fragment>
      <Modal
        open={open}
        onClosed={onClosed}
        className="WidgetEditor MuiFormControl-Form MuiBox-Large WidgetEditor-Layout"
      >
        <ModalHeader onClosed={onClosed}>
          {data.name ? "Change " + data.name : "New " + title + " Widget"}
        </ModalHeader>
        <ModalContent>
          <div className="BasicForm WidgetLayout">
            <div className="WidgetLayout-Main">
              {/* One grid of tiles for every widget type (legacy time series
                  widgets keep their own editor without it). */}
              {widgetData.type !== WidgetType.TIME_SERIES_CHART_WIDGET && (
                <WidgetTypeTiles
                  value={tile}
                  onChange={selectTile}
                  showTimeSeries={
                    data.type === WidgetType.GENERIC_TIME_SERIES_WIDGET
                  }
                />
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
                      setWidgetData({
                        ...widgetData,
                        name: event.target.value,
                      });
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
              {/* Value(s): number format, options, then aggregation, in the
                  same order as the charts. */}
              {isSummary && widgetData.config.aggregation && (
                <AggregationConfigForm
                  data={widgetData.config.aggregation}
                  setData={setAggregation}
                  showMethod={false}
                  label={t("admin.widget.chartNumberFormat")}
                />
              )}
              {/* Summary by area: the names select the area on the map. */}
              {isSummary &&
                widgetData.config.seriesType ===
                  SeriesType.GEOGRAPHICAL_UNITS && (
                  <div className="ChartConfig">
                    <FormControl className="MuiForm-RadioGroup ChartConfig-Section">
                      <FormLabel className="MuiInputLabel-root">
                        {t("admin.widget.chartOptions")}
                      </FormLabel>
                      <div className="ChartConfig-Checks">
                        <FormControlLabel
                          control={
                            <Checkbox
                              data-testid="summary-link-areas"
                              checked={widgetData.config.linkAreas !== false}
                              onChange={(evt) =>
                                setWidgetData({
                                  ...widgetData,
                                  config: {
                                    ...widgetData.config,
                                    linkAreas: evt.target.checked,
                                  },
                                })
                              }
                            />
                          }
                          label={t("admin.widget.chartLinkAreas")}
                        />
                      </div>
                    </FormControl>
                  </div>
                )}
              {isSummary && widgetData.config.aggregation && (
                <AggregationConfigForm
                  data={widgetData.config.aggregation}
                  setData={setAggregation}
                  showFormat={false}
                />
              )}
              {/* ------------------------------------- */}
              {/* --------------- GLOBAL -------------- */}
              {/* ------------------------------------- */}

              {/* CHART OPTIONS */}
              {isChart && widgetData.config.chart && (
                <ChartConfigForm
                  afterType={
                    // Number format: every value the chart shows.
                    widgetData.config.aggregation && (
                      <AggregationConfigForm
                        data={widgetData.config.aggregation}
                        setData={setAggregation}
                        showMethod={false}
                        label={t("admin.widget.chartNumberFormat")}
                      />
                    )
                  }
                  data={widgetData.config.chart}
                  seriesType={widgetData.config.seriesType}
                  setData={(chart) => {
                    setWidgetData({
                      ...widgetData,
                      config: { ...widgetData.config, chart: chart },
                    });
                  }}
                >
                  {/* Below the chart type, so the type tiles never move. */}
                  {widgetData.config.aggregation &&
                    usesAggregation(chart, widgetData.config.seriesType) && (
                      <AggregationConfigForm
                        data={widgetData.config.aggregation}
                        setData={setAggregation}
                        showFormat={false}
                      />
                    )}
                </ChartConfigForm>
              )}
            </div>
            <div className="WidgetLayout-Data">
              {isText ? (
                <TextConfigForm
                  text={widgetData.config.text || ""}
                  setText={(text) =>
                    setWidgetData({
                      ...widgetData,
                      config: { ...widgetData.config, text: text },
                    })
                  }
                />
              ) : (
                dataSettings
              )}
            </div>
            <div className="WidgetLayout-Side">
              {/* Advanced chart options, next to the preview they change. */}
              {isChart && widgetData.config.chart && (
                <ChartAdvancedForm
                  data={widgetData.config.chart}
                  setData={(chart) => {
                    setWidgetData({
                      ...widgetData,
                      config: { ...widgetData.config, chart: chart },
                    });
                  }}
                />
              )}
              {open && (
                <div
                  className="WidgetPreview"
                  data-testid={isChart ? "chart-preview" : "widget-preview"}
                >
                  <div className="WidgetPreview-Title">
                    {t("admin.widget.chartPreview")}
                  </div>
                  {/* The dashboard's widget styles (tables, texts) apply. */}
                  <div className="widget WidgetPreview-Widget">
                    <div className="widget__content">
                      {/* Remounted on a type change: each view has its own state. */}
                      <PreviewBoundary key={widgetData.type}>
                        {renderPreview()}
                      </PreviewBoundary>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Apply stays in the lower right corner. */}
            <div className="WidgetLayout-Footer">{applyButton}</div>
          </div>
        </ModalContent>
      </Modal>
    </Fragment>
  );
};
