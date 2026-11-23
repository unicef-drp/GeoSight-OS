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
   DATE SELECTOR
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";

import { axiosPostWithSession } from "../../../../Requests";
import { Actions } from "../../../../store/dashboard";
import { formatDate, nowUTC } from "../../../../utils/main";
import { INTERVALS } from "../../../../utils/Dates";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import PlayControl from "./PlayControl";
import TimeTrack from "./TimeTrack";
import TimeSettings from "./TimeSettings";
import { periodLabel, windowLabel } from "./utils";
import {
  ChevronDownIcon,
  TimeSettingsIcon
} from "../../../../components/Icons";
import { Session } from "../../../../utils/Sessions";
import {
  referenceLayerIndicatorLayer
} from "../../../../utils/indicatorLayer";

import "./style.scss";
import { isProjectUsingConceptUUID } from "../../../../selectors/dashboard";
import { selectIndicatorLayers } from "../../../../selectors/indicatorLayers";

/**
 * Indicator data.
 */
export default function GlobalDateSelector() {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { globalDateSelectorOpened } = useSelector(
    (state) => state.globalState,
  );
  const referenceLayer = useSelector(
    (state) => state.dashboard.data?.referenceLayer,
  );
  const isUsingConceptUUID = useSelector(isProjectUsingConceptUUID);
  const indicators = useSelector((state) => state.dashboard.data?.indicators);
  const indicatorLayers = useSelector(
    (state) => state.dashboard.data?.indicatorLayers,
  );
  const default_time_mode = useSelector(
    (state) => state.dashboard.data?.default_time_mode,
  );
  const indicatorLayerMetadata = useSelector(
    (state) => state.indicatorLayerMetadata,
  );
  const selectedGlobalTime = useSelector((state) => state.selectedGlobalTime);
  const relatedTableData = useSelector((state) => state.relatedTableData);
  const selectedIndicatorLayers = useSelector(selectIndicatorLayers);

  const [dates, setDates] = useState([]);
  const [selectedDatePointSelected, setSelectedDatePointSelected] =
    useState(false);
  const {
    default_interval,
    use_only_last_known_value,
    fit_to_current_indicator_range,
    show_last_known_value_in_range,
  } = default_time_mode;
  // Project defaults (also used by Stop, which resets to them).
  const defaultIsInLatestValue = use_only_last_known_value
    ? true
    : show_last_known_value_in_range === undefined
      ? false
      : show_last_known_value_in_range;
  const defaultIsFitToIndicatorRange = use_only_last_known_value
    ? false
    : fit_to_current_indicator_range === undefined
      ? false
      : fit_to_current_indicator_range;
  const defaultInterval = default_interval
    ? default_interval
    : INTERVALS.MONTHLY;

  const [isInLatestValue, setIsInLatestValue] = useState(
    defaultIsInLatestValue,
  );
  const [isFitToIndicatorRange, setIsFitToIndicatorRange] = useState(
    defaultIsFitToIndicatorRange,
  );
  const [selectedDatePoint, setSelectedDatePoint] = useState(null);
  const [interval, setInterval] = useState(defaultInterval);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [animationDone, setAnimationDone] = useState(true);
  const [hide, setHide] = useState(true);

  const prevState = useRef();

  /** Update time **/
  const updateTime = (min, max) => {
    const newSelectedGlobalStr = JSON.stringify({
      min: min,
      max: max,
    });
    if (newSelectedGlobalStr !== prevState.selectedGlobalTimeStr) {
      prevState.selectedGlobalTimeStr = newSelectedGlobalStr;
      dispatch(Actions.SelectedGlobalTime.change(min, max));
    }
  };

  /**
   *  Update dates time
   * **/
  const updateDatesTime = (newMinDate) => {
    // if it is in filter
    if (selectedDatePoint) {
      let min = null;
      let max = selectedDatePoint;

      let selectedMinDateStr = selectedDatePoint;
      let selectedMaxDateStr = selectedDatePoint;
      // Override with min date
      if (isInLatestValue) {
        if (newMinDate) {
          selectedMinDateStr = newMinDate;
        } else if (minDate) {
          selectedMinDateStr = minDate;
        }
      }

      const selectedMinDate = new Date(selectedMinDateStr);
      const minYear = selectedMinDate.getUTCFullYear();
      const minMonth = selectedMinDate.getUTCMonth();
      const minDay = selectedMinDate.getUTCDate();

      const selectedMaxDate = new Date(selectedMaxDateStr);
      const maxYear = selectedMaxDate.getUTCFullYear();
      const maxMonth = selectedMaxDate.getUTCMonth();
      const maxDay = selectedMaxDate.getUTCDate();

      // construct min/max
      switch (interval) {
        case INTERVALS.YEARLY:
          min = new Date(Date.UTC(minYear, 0, 1, 0, 0, 0)).toISOString();
          max = new Date(Date.UTC(maxYear, 11, 31, 23, 59, 59)).toISOString();
          break;
        case INTERVALS.MONTHLY:
          min = new Date(Date.UTC(minYear, minMonth, 1, 0, 0, 0)).toISOString();
          max = new Date(
            Date.UTC(maxYear, maxMonth + 1, 0, 23, 59, 59),
          ).toISOString();
          break;
        case INTERVALS.DAILY:
          min = new Date(
            Date.UTC(minYear, minMonth, minDay, 0, 0, 0),
          ).toISOString();
          max = new Date(
            Date.UTC(maxYear, maxMonth, maxDay, 23, 59, 59),
          ).toISOString();
          break;
      }
      if (min) {
        min = min.replace(".000Z", "+00:00");
      }
      if (max) {
        max = max.replace(".000Z", "+00:00");
      }
      updateTime(min, max);
    }
  };

  // Indicator configs
  let indicatorLayersSelected = selectedIndicatorLayers.map((l) => l?.id).filter(Boolean);
  if (!isFitToIndicatorRange) {
    indicatorLayersSelected = indicatorLayers.map((indicator) => indicator.id);
  }
  indicatorLayersSelected.sort();

  /**
   * Return dates list of data
   * **/
  let errorMessage = "";
  const formatDates = () => {
    let newDates = [];
    indicatorLayersSelected.map((id) => {
      const indicatorLayer = indicatorLayers.find((layer) => layer.id === id);
      if (indicatorLayer) {
        const identifier = referenceLayerIndicatorLayer(
          null,
          indicatorLayer,
        )?.identifier;
        indicatorLayer?.indicators?.map((indicator) => {
          let metadataId = "indicator-" + indicator.id;
          if (identifier) {
            metadataId += "-" + identifier;
          }
          const indicatorDates = indicatorLayerMetadata[metadataId]?.dates;
          if (
            typeof indicatorDates === "string" &&
            indicatorDates.includes("Error")
          ) {
            errorMessage = indicatorDates;
          }
          if (Array.isArray(indicatorDates)) {
            newDates = newDates.concat(indicatorDates);
          }
        });

        // For indicator layer
        const indicatorDates = indicatorLayerMetadata[id]?.dates;
        if (
          typeof indicatorDates === "string" &&
          indicatorDates.includes("Error")
        ) {
          errorMessage = indicatorDates;
        }
        if (Array.isArray(indicatorDates)) {
          newDates = newDates.concat(indicatorDates);
        }
      }
    });
    newDates = [...new Set(newDates)];
    newDates = newDates.reverse();

    // Check interval and create dates
    const intervalGroupDates = {};
    newDates.map((newDate) => {
      let group = "";
      const date = new Date(newDate);
      switch (interval) {
        case INTERVALS.YEARLY:
          group = date.getUTCFullYear();
          break;
        case INTERVALS.MONTHLY:
          group = date.getUTCFullYear() + "-" + date.getUTCMonth();
          break;
        case INTERVALS.DAILY:
          group = formatDate(date, true, true);
          break;
      }
      if (!intervalGroupDates[group]) {
        intervalGroupDates[group] = [];
      }
      intervalGroupDates[group].push(newDate);
    });

    // We sort
    newDates = [];
    for (const [key, dates] of Object.entries(intervalGroupDates)) {
      newDates.push(dates[0]);
    }
    newDates.sort();
    return newDates;
  };

  /**
   * CURRENT DATES
   * **/
  const currentDates = formatDates();

  /**
   * Update Global Dates
   */
  useEffect(() => {
    updateDatesTime();
    if (!minDate || !currentDates.includes(minDate) || minDate > maxDate) {
      setMinDate(currentDates[0]);
    }
    if (!maxDate || !currentDates.includes(maxDate) || minDate > maxDate) {
      setMaxDate(currentDates[currentDates.length - 1]);
    }
  }, [selectedDatePoint, interval, relatedTableData, isInLatestValue]);

  /**
   * Update config date when indicator selected
   */
  useEffect(() => {
    if (
      JSON.stringify(prevState.indicatorLayersSelected) !==
      JSON.stringify(indicatorLayersSelected)
    ) {
      if (isFitToIndicatorRange) {
        setMinDate(currentDates[0]);
        setMaxDate(currentDates[currentDates.length - 1]);
      }
    }
  }, [selectedIndicatorLayers]);

  /**
   * Update Global Dates
   */
  useEffect(() => {
    if (isInLatestValue) {
      updateDatesTime(currentDates[0]);
    }
    setMinDate(currentDates[0]);
    setMaxDate(currentDates[currentDates.length - 1]);
  }, [isFitToIndicatorRange, interval]);

  /**
   * Update global config
   */
  useEffect(() => {
    if (use_only_last_known_value) {
      const newMinDate = currentDates[0];
      const newMaxDate = currentDates[currentDates.length - 1];
      if (newMinDate !== minDate) {
        setMinDate(newMinDate);
      }
      if (newMaxDate !== maxDate) {
        setMaxDate(newMaxDate);
      }
      if (selectedDatePoint !== newMaxDate) {
        setSelectedDatePoint(newMaxDate);
      }
      if (isFitToIndicatorRange) {
        setIsFitToIndicatorRange(false);
      }
      if (!isInLatestValue) {
        setIsInLatestValue(true);
      }
    }
    dispatch(
      Actions.SelectedGlobalTimeConfig.change({
        selectedDatePoint,
        interval,
        minDate,
        maxDate,
        isInLatestValue,
      }),
    );
  }, [
    selectedDatePoint,
    interval,
    minDate,
    maxDate,
    isInLatestValue,
    use_only_last_known_value,
    isFitToIndicatorRange,
  ]);

  /**
   * Update Global Dates
   */
  useEffect(() => {
    if (
      !selectedDatePointSelected ||
      !(selectedDatePoint >= minDate && selectedDatePoint <= maxDate)
    ) {
      setSelectedDatePoint(maxDate);
    }
    if (isInLatestValue && selectedGlobalTime?.min !== minDate) {
      updateDatesTime();
    }
  }, [minDate, maxDate]);

  /**
   * Update indicator dates
   */
  useEffect(() => {
    (async () => {
      if (indicators.length) {
        const session = new Session("GlobalDateSelector");

        // This is for default identifier
        let metadataUrl =
          `/api/indicator/metadata?reference_layer_uuid=` +
          referenceLayer?.identifier;
        if (isUsingConceptUUID) {
          metadataUrl += `&is_using_uuid=true`;
        }
        await axiosPostWithSession(
          "FetchMetadata",
          metadataUrl,
          indicators.map((indicator) => indicator.id),
        )
          .then((responses) => {
            const data = {};
            indicators.map((indicator) => {
              const response = responses[indicator.id];
              const id = "indicator-" + indicator.id;
              if (!response?.dates?.length) {
                data[id] = {
                  dates: [nowUTC().toISOString()],
                  count: 0,
                  version:
                    new Date().getTime() + "-" + referenceLayer?.identifier,
                };
              } else {
                data[id] = response;
              }
            });
            if (session.isValid) {
              dispatch(Actions.IndicatorLayerMetadata.updateBatch(data));
            }
          })
          .catch((err) => {
            if (session.isValid) {
              dispatch(Actions.IndicatorLayerMetadata.updateBatch({}));
            }
          });
      }
    })();
  }, [indicators, referenceLayer]);

  /**
   * Update indicator dates
   */
  useEffect(() => {
    (async () => {
      if (indicatorLayers.length) {
        const datasetWithIndicators = {};
        selectedIndicatorLayers
          .concat(indicatorLayers)
          .map((layer) => {
            const identifier = referenceLayerIndicatorLayer(
              referenceLayer,
              layer,
            )?.identifier;
            if (identifier !== referenceLayer.identifier) {
              if (!datasetWithIndicators[identifier]) {
                datasetWithIndicators[identifier] = [];
              }
              datasetWithIndicators[identifier] = datasetWithIndicators[
                identifier
              ].concat(layer?.indicators?.map((indicator) => indicator.id));
            }
          });
        for (var identifier of Object.keys(datasetWithIndicators)) {
          const indicators = datasetWithIndicators[identifier];
          let metadataUrl =
            `/api/indicator/metadata?reference_layer_uuid=` + identifier;
          if (isUsingConceptUUID) {
            metadataUrl += `&is_using_uuid=true`;
          }
          if (indicators?.length) {
            await axiosPostWithSession(metadataUrl, metadataUrl, indicators)
              .then((responses) => {
                const data = {};
                indicators.map((indicator) => {
                  const response = responses[indicator];
                  const id = "indicator-" + indicator + "-" + identifier;
                  if (!response?.dates?.length) {
                    data[id] = {
                      dates: [nowUTC().toISOString()],
                      count: 0,
                      version:
                        new Date().getTime() + "-" + referenceLayer?.identifier,
                    };
                  } else {
                    data[id] = response;
                  }
                });
                dispatch(Actions.IndicatorLayerMetadata.updateBatch(data));
              })
              .catch((err) => {});
          }
        }
      }
    })();
  }, [indicatorLayers]);

  /**
   * Update dates
   */
  useEffect(() => {
    if (
      JSON.stringify(prevState.currentDates) !== JSON.stringify(currentDates)
    ) {
      let newDates = currentDates;
      setDates([...newDates]);
      prevState.currentDates = currentDates;
      const max = newDates[newDates.length - 1];
      const min = newDates[0];
      if (selectedDatePoint !== max) {
        setSelectedDatePoint(max);
      }
      if (maxDate !== max) {
        setMaxDate(max);
      }
      if (minDate !== min) {
        setMinDate(min);
      }
    }
  }, [indicatorLayerMetadata]);

  /**
   * Update dates
   */
  useEffect(() => {
    if (
      JSON.stringify(prevState.currentDates) !== JSON.stringify(currentDates) ||
      JSON.stringify(prevState.indicatorLayersSelected) !==
        JSON.stringify(indicatorLayersSelected)
    ) {
      let newDates = currentDates;
      setDates([...newDates]);
      prevState.currentDates = currentDates;

      // Check current min/max
      let max = selectedGlobalTime.max;
      if (newDates && newDates.indexOf(selectedGlobalTime.max) < 0) {
        max = newDates[newDates.length - 1];
      }
      if (!newDates.includes(selectedDatePoint)) {
        setSelectedDatePoint(max);
      } else if (
        selectedIndicatorLayers[1]?.id &&
        prevState.indicatorLayersSelected &&
        !prevState.indicatorLayersSelected.includes(selectedIndicatorLayers[1]?.id)
      ) {
        setSelectedDatePoint(max);
      }
      prevState.indicatorLayersSelected = indicatorLayersSelected;
    }
  }, [selectedIndicatorLayers, interval, isFitToIndicatorRange]);

  /**
   * Animation done
   */
  useEffect(() => {
    const wrapper = document.querySelector(".GlobalDateSelection");
    wrapper.addEventListener("transitionstart", () => {
      setAnimationDone(false);
    });

    wrapper.addEventListener("transitionend", () => {
      setAnimationDone(true);
    });
  }, []);

  /** Everytime globalDateSelectorOpened changed, unhide it */
  useEffect(() => {
    setHide(false);
  }, [globalDateSelectorOpened]);

  /** Everytime animationDone and not opened, hide it */
  useEffect(() => {
    if (!globalDateSelectorOpened && animationDone) {
      setHide(true);
    }
  }, [animationDone]);

  /** Stop: reset to the project's default time settings. */
  const resetToDefaults = () => {
    setSettingsOpen(false);
    setSelectedDatePointSelected(false);
    setInterval(defaultInterval);
    setIsInLatestValue(defaultIsInLatestValue);
    setIsFitToIndicatorRange(defaultIsFitToIndicatorRange);
    const first = currentDates[0];
    const last = currentDates[currentDates.length - 1];
    setMinDate(first);
    setMaxDate(last);
    setSelectedDatePoint(last);
  };

  // Data dates inside the range
  const usedDates =
    minDate && maxDate
      ? dates.filter((date) => date >= minDate && date <= maxDate)
      : dates;
  const language = i18n.language;
  const dateOptions = usedDates.map((date) => ({
    name: periodLabel(date, interval, language),
    value: date,
  }));
  const rangeOptions = currentDates.map((date) => ({
    name: periodLabel(date, interval, language),
    value: date,
  }));
  const intervalOptions = [
    {
      value: INTERVALS.DAILY,
      name: t("dashboardPage.timeSlider.intervalDaily"),
    },
    {
      value: INTERVALS.MONTHLY,
      name: t("dashboardPage.timeSlider.intervalMonthly"),
    },
    {
      value: INTERVALS.YEARLY,
      name: t("dashboardPage.timeSlider.intervalYearly"),
    },
  ];
  const activeWindow = windowLabel(
    selectedGlobalTime?.min,
    selectedGlobalTime?.max,
    language,
  );
  const selectDate = (date) => {
    setSelectedDatePoint(date);
    setSelectedDatePointSelected(true);
  };
  const ready = selectedDatePoint && minDate && maxDate;

  return (
    <div
      className={
        "GlobalDateSelection " +
        (globalDateSelectorOpened ? "Open " : "") +
        (hide ? "Hide" : "")
      }
    >
      <div
        className="TimeBar"
        role="region"
        aria-label={t("dashboardPage.timeSlider.title")}
      >
        {errorMessage && !usedDates.length ? (
          <div className="TimeBarMessage Error">{errorMessage}</div>
        ) : ready ? (
          <Fragment>
            <PlayControl
              dates={usedDates}
              selectedDatePoint={selectedDatePoint}
              setSelectedDatePoint={setSelectedDatePoint}
              onReset={resetToDefaults}
            />
            <div className="TimeBarRule" />
            <div
              className="TimeBarDate"
              title={activeWindow}
              data-testid="time-slider-date"
            >
              <SelectWithList
                list={dateOptions}
                required={true}
                value={selectedDatePoint}
                classNamePrefix={"ReactSelect"}
                aria-label={t("dashboardPage.timeSlider.date")}
                onChange={(evt) => selectDate(evt.value)}
              />
            </div>
            <div className="TimeBarInterval" data-testid="time-slider-interval">
              <SelectWithList
                list={intervalOptions}
                required={true}
                value={interval}
                classNamePrefix={"ReactSelect"}
                aria-label={t("dashboardPage.timeSlider.interval")}
                onChange={(evt) => setInterval(evt.value)}
              />
            </div>
            <TimeTrack
              dates={dates}
              minDate={minDate}
              maxDate={maxDate}
              selectedDatePoint={selectedDatePoint}
              interval={interval}
              onSelect={selectDate}
            />
            <div className="TimeBarRule" />
            <ClickAwayListener onClickAway={() => setSettingsOpen(false)}>
              <div
                className="TimeBarSettings"
                onKeyDown={(evt) => {
                  if (evt.key === "Escape") {
                    setSettingsOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  className={
                    "TimeBarButton" + (settingsOpen ? " Active" : "")
                  }
                  title={t("dashboardPage.timeSlider.settings")}
                  aria-label={t("dashboardPage.timeSlider.settings")}
                  aria-expanded={settingsOpen}
                  aria-pressed={settingsOpen}
                  data-testid="time-slider-settings-button"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                >
                  <TimeSettingsIcon />
                </button>
                {settingsOpen && (
                  <TimeSettings
                    options={rangeOptions}
                    minDate={minDate}
                    maxDate={maxDate}
                    onChangeMinDate={(value) =>
                      setMinDate(value > maxDate ? maxDate : value)
                    }
                    onChangeMaxDate={(value) =>
                      setMaxDate(value < minDate ? minDate : value)
                    }
                    isFitToIndicatorRange={isFitToIndicatorRange}
                    onChangeFitToIndicatorRange={setIsFitToIndicatorRange}
                    isInLatestValue={isInLatestValue}
                    onChangeInLatestValue={setIsInLatestValue}
                  />
                )}
              </div>
            </ClickAwayListener>
          </Fragment>
        ) : (
          <div className="TimeBarMessage">
            <CircularProgress size={16} />
            {t("dashboardPage.timeSlider.preparing")}
          </div>
        )}
        <button
          type="button"
          className="TimeBarButton"
          title={t("dashboardPage.timeSlider.hide")}
          aria-label={t("dashboardPage.timeSlider.hide")}
          data-testid="time-slider-hide"
          onClick={() => {
            setSettingsOpen(false);
            dispatch(
              Actions.GlobalState.update({ globalDateSelectorOpened: false }),
            );
          }}
        >
          <ChevronDownIcon />
        </button>
      </div>
    </div>
  );
}
