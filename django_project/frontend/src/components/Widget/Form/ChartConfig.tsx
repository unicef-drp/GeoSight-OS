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
import { showsAreas, usesPalette } from "../ChartWidget/capabilities";
// @ts-ignore
import ColorPaletteSelector from "../../Input/ColorPaletteSelector";

import "./chart-config.scss";

/** Scatter: `pulse` on = the area selected on the map pulses. */
export const PULSE_ON = 1;

/** 24px icons of the type cards (1.5 stroke). */
const ICONS: Record<string, React.ReactNode> = {
  [ChartTypes.BAR]: (
    <>
      <path d="M4 6h10M4 12h15M4 18h7" strokeWidth="3" />
    </>
  ),
  [ChartTypes.LINE]: <path d="M3 17l5-6 4 3 4-7 5 5" />,
  [ChartTypes.DONUT]: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4v4.5M19.2 15.5l-3.9-1.8" />
    </>
  ),
  [ChartTypes.SCATTER]: (
    <>
      <path d="M4 4v16h16" />
      <circle cx="9" cy="14" r="1.5" />
      <circle cx="13" cy="9" r="2.5" />
      <circle cx="18" cy="12" r="1.5" />
    </>
  ),
  [ChartTypes.HEATMAP]: (
    <>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" fill="currentColor" />
      <rect x="4" y="13" width="7" height="7" fill="currentColor" />
      <rect x="13" y="13" width="7" height="7" />
    </>
  ),
  [ChartTypes.TREEMAP]: (
    <>
      <rect x="4" y="4" width="16" height="16" />
      <path d="M12 4v16M12 13h8M4 11h8" />
    </>
  ),
  [ChartTypes.GAUGE]: (
    <>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M12 16l4-5" />
    </>
  ),
  [ChartTypes.KPI]: (
    <>
      <path d="M4 7h7M4 11h4" strokeWidth="2.5" />
      <path d="M4 18l5-3 4 2 7-5" />
    </>
  ),
};

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

  const typeLabels: Record<string, string> = {
    [ChartTypes.BAR]: t("admin.widget.chartBar"),
    [ChartTypes.LINE]: t("admin.widget.chartLine"),
    [ChartTypes.DONUT]: t("admin.widget.chartDonut"),
    [ChartTypes.SCATTER]: t("admin.widget.chartScatter"),
    [ChartTypes.HEATMAP]: t("admin.widget.chartHeatmap"),
    [ChartTypes.TREEMAP]: t("admin.widget.chartTreemap"),
    [ChartTypes.GAUGE]: t("admin.widget.chartGauge"),
    [ChartTypes.KPI]: t("admin.widget.chartKpi"),
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
      <FormControl className="MuiForm-RadioGroup">
        <FormLabel className="MuiInputLabel-root" id="chart-config-type">
          {t("admin.widget.chartType")}
        </FormLabel>
        <div
          className="ChartConfig-Types"
          role="radiogroup"
          aria-labelledby="chart-config-type"
        >
          {Object.values(ChartTypes).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              className={
                "ChartConfig-Type" + (type === value ? " Selected" : "")
              }
              data-testid={`chart-type-${value}`}
              onClick={() => update({ type: value })}
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {ICONS[value]}
              </svg>
              <span>{typeLabels[value]}</span>
            </button>
          ))}
        </div>
      </FormControl>

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
        {(MAP_COLOR_TYPES.includes(type) || usesPalette(data)) && (
          <div className="ChartConfig-Colors">
            {radios(
              "colors",
              t("admin.widget.chartColors"),
              data.colors || ChartColorModes.MAP_STYLE,
              MAP_COLOR_TYPES.includes(type)
                ? {
                    [ChartColorModes.MAP_STYLE]: t(
                      "admin.widget.colorsMapStyle",
                    ),
                    [ChartColorModes.PALETTE]: t("admin.widget.colorsPalette"),
                  }
                : {},
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
