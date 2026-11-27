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
   Playback state for the time slider.
   One instance per time slider, shared by the desktop bar and the mobile
   card / sheet, so playing continues when the layout changes.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { allLayerDataIsReady } from "../../../../../utils/indicatorLayer";
import { returnWhere } from "../../../../../utils/queryExtraction";
import { selectIndicatorLayers } from "../../../../../selectors/indicatorLayers";

/** Seconds per step. */
const STEP_SECONDS = 2;

/**
 * Playback over the data dates.
 * @param {string[]} dates Data dates the playback moves through.
 * @param {string} selectedDatePoint Current date.
 * @param {function} setSelectedDatePoint Sets the current date.
 */
export function usePlayback(dates, selectedDatePoint, setSelectedDatePoint) {
  const {
    filters,
    referenceLayer,
    indicatorLayers
  } = useSelector(state => state.dashboard.data)
  const indicatorsData = useSelector(state => state.indicatorsData)
  const relatedTableData = useSelector(state => state.relatedTableData)
  const selectedIndicatorLayers = useSelector(selectIndicatorLayers)
  const indicatorLayersData = useSelector((state) => state.indicatorLayersData)

  const [isPlay, setIsPlay] = useState(false);
  const timeout = useRef(null);
  const count = dates.length;
  const idx = dates.indexOf(selectedDatePoint);
  const disabled = count <= 1;

  const stopTimeout = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = null;
  }
  const goTo = (i) => {
    if (dates[i]) {
      setSelectedDatePoint(dates[i]);
    }
  }
  const nextIndex = () => (idx + 1 < count ? idx + 1 : 0);

  const stop = () => {
    stopTimeout();
    setIsPlay(false);
  }
  const play = () => {
    setIsPlay(true);
    goTo(nextIndex());
  }

  /** While playing, step to the next date once the map data is ready. */
  useEffect(() => {
    if (!isPlay) {
      return;
    }
    const where = returnWhere(filters ? filters : []);
    const layers = where ? indicatorLayers : selectedIndicatorLayers;
    const ready = allLayerDataIsReady(
      indicatorsData, relatedTableData, layers, referenceLayer, indicatorLayersData
    );
    if (ready) {
      stopTimeout();
      timeout.current = setTimeout(() => goTo(nextIndex()), STEP_SECONDS * 1000);
    }
  }, [indicatorsData, relatedTableData, selectedDatePoint, isPlay]);

  /** Stop the timer when unmounted. */
  useEffect(() => stopTimeout, []);

  return {
    isPlay,
    disabled,
    index: idx,
    count,
    play,
    stop,
    toggle: () => (isPlay ? stop() : play()),
    first: () => {
      stop();
      goTo(0);
    },
    previous: () => {
      stop();
      goTo(idx - 1 >= 0 ? idx - 1 : count - 1);
    },
    next: () => {
      stop();
      goTo(nextIndex());
    },
    last: () => {
      stop();
      goTo(count - 1);
    },
  };
}
