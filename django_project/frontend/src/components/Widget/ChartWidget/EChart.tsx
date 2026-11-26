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
   ECHART: thin React wrapper around ECharts (loaded on demand).
   ========================================================================== */

import React, { useEffect, useRef, useState } from "react";

let loader: Promise<any> | null = null;

/** Load the ECharts chunk once. */
export function loadECharts(): Promise<any> {
  if (!loader) {
    loader = import(/* webpackChunkName: "echarts" */ "./echartsSetup").then(
      (module) => module.default,
    );
  }
  return loader;
}

/** Use the page's real font: ECharts measures text with it. */
function withFont(option: any, element: HTMLElement | null): any {
  if (!option || !element) {
    return option;
  }
  const fontFamily = window.getComputedStyle(element).fontFamily;
  const tooltip = option.tooltip;
  return {
    ...option,
    textStyle: { ...option.textStyle, fontFamily },
    // The tooltip is HTML with its own font: use the chart's.
    tooltip:
      tooltip && !Array.isArray(tooltip)
        ? {
            ...tooltip,
            textStyle: { ...tooltip.textStyle, fontFamily },
          }
        : tooltip,
  };
}

export interface Props {
  option: any;
  height: number;
  className?: string;
  /** ECharts click event (series items and, with triggerEvent, axis labels). */
  onClick?: (params: any) => void;
}

export default function EChart({ option, height, className, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lib = useRef<any>(null);
  const chart = useRef<any>(null);
  const latestOption = useRef<any>(option);
  const latestClick = useRef<Props["onClick"]>(onClick);
  latestClick.current = onClick;
  const [error, setError] = useState<string | null>(null);
  latestOption.current = option;

  /**
   * Run an ECharts call. An error shows in this widget only, instead of
   * escaping from an effect or observer and unmounting the whole page.
   * ECharts can stay stuck after an error inside a render, so the instance
   * is dropped and the next option draws into a new one.
   */
  const safely = (fn: () => void): boolean => {
    try {
      fn();
      return true;
    } catch (err) {
      setError("" + err);
      try {
        chart.current?.dispose();
      } catch (e) {}
      chart.current = null;
      return false;
    }
  };

  /** Draw the option, creating the instance when needed. */
  const draw = (value: any) => {
    if (!lib.current || !ref.current) {
      return;
    }
    if (
      safely(() => {
        if (!chart.current) {
          chart.current = lib.current.init(ref.current, null, {
            renderer: "svg",
          });
          chart.current.on("click", (params: any) =>
            latestClick.current?.(params),
          );
        }
        chart.current.setOption(withFont(value, ref.current), true);
      })
    ) {
      setError(null);
    }
  };

  // Load ECharts once, dispose the chart on unmount.
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | null = null;
    loadECharts()
      .then((echarts) => {
        if (disposed || !ref.current) {
          return;
        }
        lib.current = echarts;
        draw(latestOption.current);
        observer = new ResizeObserver(() =>
          safely(() => chart.current?.resize()),
        );
        observer.observe(ref.current);
        // Web fonts can arrive after the first layout: measure again.
        document.fonts?.ready.then(() => {
          if (!disposed) {
            draw(latestOption.current);
          }
        });
      })
      .catch((err: any) => setError("" + err));
    return () => {
      disposed = true;
      observer?.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  // Update the option. A bad advanced override must not break the page.
  useEffect(() => {
    draw(option);
  }, [option]);

  // Update the size.
  useEffect(() => {
    safely(() => chart.current?.resize());
  }, [height]);

  // Keep the chart element mounted even on error, so a fixed option can
  // render again into it.
  return (
    <>
      {error && <div className="error">{error}</div>}
      <div
        ref={ref}
        className={"widget__chart " + (className ? className : "")}
        style={{ width: "100%", height: error ? 0 : height }}
      />
    </>
  );
}
