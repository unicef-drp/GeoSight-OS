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
  ChartAreaLabels,
  ChartBarLayouts,
  ChartColorModes,
  ChartPeriods,
  ChartTypes,
} from "../Definition";
import {
  allowsCustomColors,
  customColorList,
  CustomColorLists,
  hasColorSetting,
  showsAreas,
  usesPalette,
} from "../ChartWidget/capabilities";
import { indicatorLabel } from "./UnitSelector";
// @ts-ignore
import ColorPaletteSelector from "../../Input/ColorPaletteSelector";
// @ts-ignore
import Select from "../../Input/Select";

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
    data.colors === ChartColorModes.CUSTOM && allowsCustomColors(data)
      ? ChartColorModes.CUSTOM
      : MAP_COLOR_TYPES.includes(data.type)
        ? data.colors || ChartColorModes.MAP_STYLE
        : ChartColorModes.PALETTE;
  const isBar = type === ChartTypes.BAR;
  const layout = data.layout || ChartBarLayouts.SIMPLE;

  /** A number input with its label on the left (target, min, max). */
  const numberInput = (
    key: "target" | "min" | "max",
    label: string,
    placeholder: string,
  ) => (
    <div className="ChartConfig-Inline" key={key}>
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

  /** A searchable select of the dashboard indicators (scatter axes). */
  const indicatorSelect = (
    key: "x" | "y" | "size",
    label: string,
    optional: boolean,
  ) => {
    const options = [
      ...(optional
        ? [{ value: null, label: t("admin.widget.chartNone") }]
        : []),
      ...(indicators || []).map((indicator) => ({
        value: indicator.id,
        label: indicatorLabel(indicator),
      })),
    ];
    return (
      <div className="ChartConfig-Inline" key={key}>
        <label className="form-label" htmlFor={`chart-config-${key}`}>
          {label}
        </label>
        <div className="ChartConfig-Select" data-testid={`chart-config-${key}`}>
          <Select
            inputId={`chart-config-${key}`}
            options={options}
            value={
              options.find((option) => option.value === (data[key] || null)) ||
              null
            }
            placeholder={t("admin.widget.chartSelectIndicator")}
            menuPlacement="auto"
            onChange={(option: { value: number | null }) =>
              update({ [key]: option?.value || null })
            }
          />
        </div>
      </div>
    );
  };

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
      key={key}
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

  // Options of the chart type: fields (numbers, axes) and checkboxes.
  const fields: React.ReactNode[] = [];
  const checks: React.ReactNode[] = [];
  if (type === ChartTypes.SCATTER) {
    fields.push(
      indicatorSelect("x", t("admin.widget.chartScatterX"), false),
      indicatorSelect("y", t("admin.widget.chartScatterY"), false),
      indicatorSelect("size", t("admin.widget.chartScatterSize"), true),
    );
  }
  if (type === ChartTypes.GAUGE) {
    fields.push(
      numberInput("min", t("admin.widget.chartMin"), "0"),
      numberInput(
        "max",
        t("admin.widget.chartMax"),
        t("admin.widget.chartAutoShort"),
      ),
    );
  }
  if (
    type === ChartTypes.GAUGE ||
    (isBar && layout !== ChartBarLayouts.PERCENT)
  ) {
    fields.push(
      numberInput(
        "target",
        t("admin.widget.chartTarget"),
        // Bar: a short field next to the checkboxes, no room for a hint.
        isBar ? "" : t("admin.widget.chartOptional"),
      ),
    );
  }
  if (isBar) {
    checks.push(checkbox("horizontal", t("admin.widget.chartHorizontal")));
  }
  if (type === ChartTypes.LINE) {
    checks.push(checkbox("area", t("admin.widget.chartArea")));
  }
  if (!NO_LABEL_TYPES.includes(type)) {
    checks.push(checkbox("labels", t("admin.widget.chartLabels")));
  }
  if (showsAreas(data, seriesType)) {
    checks.push(checkbox("linkAreas", t("admin.widget.chartLinkAreas")));
  }
  // With value labels: areas by name or by code.
  if (showsAreas(data, seriesType) && data.labels) {
    checks.push(
      <div key="areaLabels" className="ChartConfig-AreaLabels">
        <span id="chart-config-areaLabels">
          {t("admin.widget.chartAreaLabels")}
        </span>
        <RadioGroup
          row
          aria-labelledby="chart-config-areaLabels"
          data-testid="chart-config-areaLabels"
          value={data.areaLabels || ChartAreaLabels.NAME}
          onChange={(evt) => update({ areaLabels: evt.target.value })}
        >
          <FormControlLabel
            control={<Radio />}
            value={ChartAreaLabels.NAME}
            label={t("admin.widget.sortName")}
          />
          <FormControlLabel
            control={<Radio />}
            value={ChartAreaLabels.CODE}
            label={t("admin.widget.sortCode")}
          />
        </RadioGroup>
      </div>,
    );
  }
  if (type === ChartTypes.SCATTER) {
    checks.push(
      <FormControlLabel
        key="pulse"
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
      />,
    );
  }

  // Bar target: one short field, next to the checkboxes.
  const inlineFields = isBar;

  return (
    <div className="ChartConfig" data-testid="chart-config">
      {afterType}

      <div className="ChartConfig-Options">
        {/* Bar */}
        {isBar &&
          radios("layout", t("admin.widget.chartLayout"), layout, layoutLabels)}
        {isBar && layout !== ChartBarLayouts.SIMPLE && (
          <div className="ChartConfig-Help">
            {t("admin.widget.chartLayoutHelp")}
          </div>
        )}

        {/* Line, heatmap, KPI */}
        {PERIOD_TYPES.includes(type) &&
          radios(
            "period",
            t("admin.widget.chartPeriod"),
            data.period || ChartPeriods.DATE,
            periodLabels,
          )}

        {/* Common: colours on one line; the palette follows its radio */}
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
                ...(allowsCustomColors(data)
                  ? { [ChartColorModes.CUSTOM]: t("admin.widget.colorsCustom") }
                  : {}),
                [ChartColorModes.PALETTE]: t("admin.widget.colorsPalette"),
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
                {customColorList(data, seriesType) ===
                CustomColorLists.INDICATORS
                  ? t("admin.widget.colorsCustomHelpIndicators")
                  : t("admin.widget.colorsCustomHelpUnits")}
              </div>
            )}
          </div>
        )}
        {/* The options of the chart type, in one section */}
        {(fields.length > 0 || checks.length > 0) && (
          <FormControl
            className="MuiForm-RadioGroup ChartConfig-Section"
            data-testid="chart-config-options"
          >
            <FormLabel className="MuiInputLabel-root">
              {t("admin.widget.chartOptions")}
            </FormLabel>
            {type === ChartTypes.SCATTER && (
              <div className="ChartConfig-Help">
                {t("admin.widget.chartScatterHelp")}
              </div>
            )}
            {inlineFields ? (
              // A few short fields: on the line of the checkboxes.
              <div className="ChartConfig-Checks">
                {fields}
                {checks}
              </div>
            ) : (
              <>
                {fields.length > 0 && (
                  <div
                    className={
                      "ChartConfig-Fields" +
                      (type === ChartTypes.SCATTER ? " Stacked" : "")
                    }
                  >
                    {fields}
                  </div>
                )}
                {checks.length > 0 && (
                  <div className="ChartConfig-Checks">{checks}</div>
                )}
              </>
            )}
          </FormControl>
        )}

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
