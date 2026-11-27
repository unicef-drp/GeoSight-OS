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
   Time settings: range (From / To) and the two time options.
   ========================================================================== */

import React from "react";
import { useTranslation } from "react-i18next";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { SelectWithList } from "../../../../../components/Input/SelectWithList";

import "./style.scss";

/**
 * Time settings panel.
 * @param {object[]} options Date options ({name, value}) for From / To.
 */
export default function TimeSettings(
  {
    options,
    minDate,
    maxDate,
    onChangeMinDate,
    onChangeMaxDate,
    isFitToIndicatorRange,
    onChangeFitToIndicatorRange,
    isInLatestValue,
    onChangeInLatestValue,
    inline = false,
  }
) {
  const { t } = useTranslation();
  return (
    <div
      className={"TimeSettings" + (inline ? " Inline" : "")}
      role={inline ? "group" : "dialog"}
      aria-label={t("dashboardPage.timeSlider.settings")}
      data-testid="time-slider-settings"
    >
      <div className="TimeSettingsTitle">
        {t("dashboardPage.timeSlider.range")}
      </div>
      <div className="TimeSettingsRange">
        <div className="TimeSettingsField" data-testid="time-slider-from">
          <span>{t("dashboardPage.timeSlider.from")}</span>
          <SelectWithList
            list={options}
            required={true}
            value={minDate}
            classNamePrefix={"ReactSelect"}
            aria-label={t("dashboardPage.timeSlider.from")}
            onChange={(evt) => onChangeMinDate(evt.value)}
          />
        </div>
        <div className="TimeSettingsField" data-testid="time-slider-to">
          <span>{t("dashboardPage.timeSlider.to")}</span>
          <SelectWithList
            list={options}
            required={true}
            value={maxDate}
            classNamePrefix={"ReactSelect"}
            aria-label={t("dashboardPage.timeSlider.to")}
            onChange={(evt) => onChangeMaxDate(evt.value)}
          />
        </div>
      </div>
      <div className="TimeSettingsDivider" />
      <FormControlLabel
        className="TimeSettingsSwitch"
        labelPlacement="start"
        control={
          <Switch
            size="small"
            checked={isFitToIndicatorRange}
            onChange={() => onChangeFitToIndicatorRange(!isFitToIndicatorRange)}
          />
        }
        label={t("dashboardPage.timeSlider.fitToIndicatorRange")}
      />
      <FormControlLabel
        className="TimeSettingsSwitch"
        labelPlacement="start"
        control={
          <Switch
            size="small"
            checked={isInLatestValue}
            onChange={() => onChangeInLatestValue(!isInLatestValue)}
          />
        }
        label={t("dashboardPage.timeSlider.lastKnownValue")}
      />
    </div>
  );
}
