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
 * __date__ = '23/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   CHART CONFIG FORM (chart widget)
   Type cards, the options of the selected type, colours and the advanced
   ECharts overrides (JSON only).
   ========================================================================== */

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { FormControl, Radio } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Checkbox from "@mui/material/Checkbox";
import { ChartConfig } from "../../../types/Widget";
import { Indicator } from "../../../types/Indicator";
import {
  ChartBarLayouts,
  ChartColorModes,
  ChartPeriods,
  ChartTypes,
} from "../Definition";
import {
  hasColorSetting,
  showsAreas,
  usesPalette,
} from "../ChartWidget/capabilities";
// @ts-ignore
import ColorPaletteSelector from "../../Input/ColorPaletteSelector";

import "./chart-config.scss";

/** Scatter: `pulse` on = the area selected on the map pulses. */
export const PULSE_ON = 1;

/** Types where the map style colours option has an effect. */
const MAP_COLOR_TYPES = [
  ChartTypes.BAR,
  ChartTypes.DONUT,
  ChartTypes.TREEMAP,
  ChartTypes.HEATMAP,
  ChartTypes.SCATTER,
];
/** Types without value labels. */
const NO_LABEL_TYPES = [ChartTypes.GAUGE, ChartTypes.KPI];
/** Types with a period option. */
const PERIOD_TYPES = [ChartTypes.LINE, ChartTypes.HEATMAP, ChartTypes.KPI];

/** Number or null from an input value. */
function toNumber(value: string): number | null {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const number = Number(value);
  return isNaN(number) ? null : number;
}

export interface Props {
  data: ChartConfig;
  setData: (data: ChartConfig) => void;
  /** Series of the widget: the link option needs areas in the chart. */
  seriesType?: string;
  /** Sections shown right below the chart type (e.g. number format). */
  afterType?: React.ReactNode;
  /** Sections shown after the chart options, before "Advanced". */
  children?: React.ReactNode;
}

export function ChartConfigForm({
  data,
  setData,
  seriesType,
  afterType,
  children,
}: Props) {
  const { t } = useTranslation();
  const indicators: Indicator[] = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.indicators,
  );

  const update = (values: Partial<ChartConfig>) => {
    setData({ ...data, ...values });
  };

  const layoutLabels: Record<string, string> = {
    [ChartBarLayouts.SIMPLE]: t("admin.widget.layoutSimple"),
    [ChartBarLayouts.STACKED]: t("admin.widget.layoutStacked"),
    [ChartBarLayouts.GROUPED]: t("admin.widget.layoutGrouped"),
    [ChartBarLayouts.PERCENT]: t("admin.widget.layoutPercent"),
  };
  const periodLabels: Record<string, string> = {
    [ChartPeriods.DATE]: t("admin.widget.periodDate"),
    [ChartPeriods.MONTHLY]: t("admin.widget.periodMonthly"),
    [ChartPeriods.YEARLY]: t("admin.widget.periodYearly"),
  };

  const type = data.type;
  // Lines have no map style: their default is the palette.
  const colorMode =
    data.colors === ChartColorModes.CUSTOM
      ? ChartColorModes.CUSTOM
      : MAP_COLOR_TYPES.includes(data.type)
        ? data.colors || ChartColorModes.MAP_STYLE
        : ChartColorModes.PALETTE;
  const isBar = type === ChartTypes.BAR;
  const layout = data.layout || ChartBarLayouts.SIMPLE;

  /** A labelled number input (target, min, max). */
  const numberInput = (
    key: "target" | "min" | "max",
    label: string,
    placeholder: string,
  ) => (
    <div className="ChartConfig-Field">
      <label className="form-label" htmlFor={`chart-config-${key}`}>
        {label}
      </label>
      <input
        id={`chart-config-${key}`}
        data-testid={`chart-config-${key}`}
        type="number"
        inputMode="decimal"
        placeholder={placeholder}
        value={
          data[key] === null || data[key] === undefined ? "" : "" + data[key]
        }
        onChange={(evt) => update({ [key]: toNumber(evt.target.value) })}
      />
    </div>
  );

  /** A select of the dashboard indicators (scatter axes). */
  const indicatorSelect = (
    key: "x" | "y" | "size",
    label: string,
    optional: boolean,
  ) => (
    <div className="ChartConfig-Field">
      <label className="form-label" htmlFor={`chart-config-${key}`}>
        {label}
      </label>
      <select
        id={`chart-config-${key}`}
        data-testid={`chart-config-${key}`}
        value={data[key] ? "" + data[key] : ""}
        onChange={(evt) =>
          update({ [key]: evt.target.value ? Number(evt.target.value) : null })
        }
      >
        <option value="">
          {optional
            ? t("admin.widget.chartNone")
            : t("admin.widget.chartSelectIndicator")}
        </option>
        {(indicators || []).map((indicator) => (
          <option key={indicator.id} value={"" + indicator.id}>
            {indicator.name}
          </option>
        ))}
      </select>
    </div>
  );

  /** A labelled radio group. */
  const radios = (
    key: "layout" | "period" | "colors",
    label: string,
    value: string,
    labels: Record<string, string>,
    extra?: React.ReactNode,
  ) => (
    <FormControl className="MuiForm-RadioGroup ChartConfig-Radios">
      <FormLabel className="MuiInputLabel-root" id={`chart-config-${key}`}>
        {label}
      </FormLabel>
      <RadioGroup
        row
        aria-labelledby={`chart-config-${key}`}
        data-testid={`chart-config-${key}`}
        value={value}
        onChange={(evt) => update({ [key]: evt.target.value })}
      >
        {Object.keys(labels).map((option) => (
          <FormControlLabel
            key={option}
            control={<Radio />}
            value={option}
            label={labels[option]}
          />
        ))}
        {extra}
      </RadioGroup>
    </FormControl>
  );

  const checkbox = (
    key: "horizontal" | "area" | "labels" | "linkAreas",
    label: string,
  ) => (
    <FormControlLabel
      control={
        <Checkbox
          data-testid={`chart-config-${key}`}
          checked={!!data[key]}
          onChange={(evt) => update({ [key]: evt.target.checked })}
        />
      }
      label={label}
    />
  );

  return (
    <div className="ChartConfig" data-testid="chart-config">
      {afterType}

      <div className="ChartConfig-Options">
        {/* Bar */}
        {isBar && (
          <>
            {radios(
              "layout",
              t("admin.widget.chartLayout"),
              layout,
              layoutLabels,
            )}
            {layout !== ChartBarLayouts.SIMPLE && (
              <div className="ChartConfig-Help">
                {t("admin.widget.chartLayoutHelp")}
              </div>
            )}
            <div className="ChartConfig-Row">
              {checkbox("horizontal", t("admin.widget.chartHorizontal"))}
              {layout !== ChartBarLayouts.PERCENT &&
                numberInput(
                  "target",
                  t("admin.widget.chartTarget"),
                  t("admin.widget.chartOptional"),
                )}
            </div>
          </>
        )}

        {/* Line */}
        {type === ChartTypes.LINE &&
          checkbox("area", t("admin.widget.chartArea"))}

        {/* Line, heatmap, KPI */}
        {PERIOD_TYPES.includes(type) &&
          radios(
            "period",
            t("admin.widget.chartPeriod"),
            data.period || ChartPeriods.DATE,
            periodLabels,
          )}

        {/* Scatter */}
        {type === ChartTypes.SCATTER && (
          <>
            <div className="ChartConfig-Help">
              {t("admin.widget.chartScatterHelp")}
            </div>
            <div className="ChartConfig-Row">
              {indicatorSelect("x", t("admin.widget.chartScatterX"), false)}
              {indicatorSelect("y", t("admin.widget.chartScatterY"), false)}
              {indicatorSelect(
                "size",
                t("admin.widget.chartScatterSize"),
                true,
              )}
            </div>
            <FormControlLabel
              control={
                <Checkbox
                  data-testid="chart-config-pulse"
                  checked={!!data.pulse}
                  onChange={(evt) =>
                    update({ pulse: evt.target.checked ? PULSE_ON : 0 })
                  }
                />
              }
              label={t("admin.widget.chartPulse")}
            />
          </>
        )}

        {/* Gauge */}
        {type === ChartTypes.GAUGE && (
          <div className="ChartConfig-Row">
            {numberInput("min", t("admin.widget.chartMin"), "0")}
            {numberInput(
              "max",
              t("admin.widget.chartMax"),
              t("admin.widget.chartAuto"),
            )}
            {numberInput(
              "target",
              t("admin.widget.chartTarget"),
              t("admin.widget.chartOptional"),
            )}
          </div>
        )}

        {/* Common: colours, and the palette in the same box */}
        {hasColorSetting(data) && (
          <div className="ChartConfig-Colors">
            {radios(
              "colors",
              t("admin.widget.chartColors"),
              colorMode,
              {
                ...(MAP_COLOR_TYPES.includes(type)
                  ? {
                      [ChartColorModes.MAP_STYLE]: t(
                        "admin.widget.colorsMapStyle",
                      ),
                    }
                  : {}),
                [ChartColorModes.PALETTE]: t("admin.widget.colorsPalette"),
                [ChartColorModes.CUSTOM]: t("admin.widget.colorsCustom"),
              },
              usesPalette(data) && (
                <div
                  className="ChartConfig-Palette"
                  data-testid="chart-config-palette"
                >
                  {/* @ts-ignore: JS component */}
                  <ColorPaletteSelector
                    colorPalette={data.palette}
                    onChange={(value: number) => update({ palette: value })}
                    keepData={true}
                    menuPlacement="bottom"
                  />
                </div>
              ),
            )}
            {colorMode === ChartColorModes.CUSTOM && (
              <div className="ChartConfig-Help">
                {t("admin.widget.colorsCustomHelp")}
              </div>
            )}
          </div>
        )}
        <div className="ChartConfig-Row">
          {!NO_LABEL_TYPES.includes(type) &&
            checkbox("labels", t("admin.widget.chartLabels"))}
          {showsAreas(data, seriesType) &&
            checkbox("linkAreas", t("admin.widget.chartLinkAreas"))}
        </div>

        {children}
      </div>
    </div>
  );
}

export interface AdvancedProps {
  data: ChartConfig;
  setData: (data: ChartConfig) => void;
}

/**
 * Advanced ECharts options (JSON), merged last into the chart option. In the
 * editor it sits above the preview, next to what it changes.
 */
export function ChartAdvancedForm({ data, setData }: AdvancedProps) {
  const { t } = useTranslation();
  const [overridesText, setOverridesText] = useState<string>(
    data.overrides ? JSON.stringify(data.overrides, null, 2) : "",
  );
  const [overridesError, setOverridesError] = useState<boolean>(false);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(!!data.overrides);

  // Keep the text in sync when another widget is opened.
  useEffect(() => {
    const current = overridesText.trim() ? safeParse(overridesText) : null;
    if (JSON.stringify(current) !== JSON.stringify(data.overrides || null)) {
      setOverridesText(
        data.overrides ? JSON.stringify(data.overrides, null, 2) : "",
      );
      setOverridesError(false);
    }
  }, [data.overrides]);

  const update = (values: Partial<ChartConfig>) => {
    setData({ ...data, ...values });
  };

  return (
    <div className="ChartConfig ChartConfig-AdvancedBox">
      {/* Advanced */}
      <details
        className="ChartConfig-Advanced"
        open={advancedOpen}
        onToggle={(evt) =>
          setAdvancedOpen((evt.target as HTMLDetailsElement).open)
        }
      >
        <summary data-testid="chart-config-advanced">
          {t("admin.widget.chartAdvanced")}
        </summary>
        <div className="ChartConfig-Help">
          {t("admin.widget.chartAdvancedHelp")}
        </div>
        <textarea
          data-testid="chart-config-overrides"
          aria-label={t("admin.widget.chartAdvanced")}
          aria-invalid={overridesError}
          spellCheck={false}
          rows={6}
          placeholder={'{ "legend": { "top": 0 } }'}
          value={overridesText}
          onChange={(evt) => {
            const text = evt.target.value;
            setOverridesText(text);
            if (!text.trim()) {
              setOverridesError(false);
              update({ overrides: null });
              return;
            }
            const parsed = safeParse(text);
            if (parsed === undefined) {
              setOverridesError(true);
              return;
            }
            setOverridesError(false);
            update({ overrides: parsed });
          }}
        />
        {overridesError && (
          <div className="ChartConfig-Error" role="alert">
            {t("admin.widget.chartAdvancedInvalid")}
          </div>
        )}
      </details>
    </div>
  );
}

/** Parse a JSON object; undefined when it is not valid or not an object. */
export function safeParse(text: string): object | undefined {
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    return undefined;
  }
  return undefined;
}
