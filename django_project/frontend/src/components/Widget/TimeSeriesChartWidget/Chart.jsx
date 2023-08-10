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
   SHOW DATA IN TIME SERIES IN CHART WIDGET
   ========================================================================== */

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Chart as ChartJs, Filler } from 'chart.js';
import { Line } from "react-chartjs-2";
import { chartAreaBorder } from "../../../utils/chart.js.plugins";
import CircularProgress from '@mui/material/CircularProgress';
import { newShade } from "../../../utils/main";


/**
 * Chart data
 * @param {dict} chartData Chart data
 */
export default function Chart(
  { chartData, selectedLabel , fill=true}
) {
  ChartJs.register(chartAreaBorder);
  ChartJs.register(chartAreaBorder, Filler);

  const prevState = useRef();
  const [selectedLegend, setSelectedLegend] = useState([]);

  // When chart data
  useEffect(() => {
    let labels = []
    if (chartData) {
      labels = chartData.datasets.map(dataset => dataset.label)
      if (JSON.stringify(prevState.labels) !== JSON.stringify(labels)) {
        prevState.labels = labels
        setSelectedLegend(labels)
      }
    }
    labels.sort()

  }, [chartData])


  let empty = false
  if (chartData) {
    if (chartData.datasets.length === chartData.datasets.filter(dataset => dataset.data.length === 0).length) {
      empty = true
    }
  }

  return (
    <Fragment>
      {
        chartData ?
          <div className='widget__time_series__wrapper'>
            {
              empty ? <div className='NoDataFound'>No data found</div> : null
            }
            <div className="widget__time_series__chart">
              <Line
                options={{
                  radius: (context) => {
                    return  context?.raw?.x === selectedLabel ? 6 : 3;
                  },
                  borderWidth: 2,
                  responsive: true,
                  maintainAspectRatio: false,
                  drawChartBorder: true,
                  plugins: {
                    legend: {
                      display: false
                    },
                    title: {
                      display: false,
                    },
                    chartAreaBorder: {
                      borderColor: '#1CABE233',
                      borderWidth: 1
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxRotation: 90,
                        minRotation: 90,
                      },
                    },
                  },
                }}
                data={{
                  ...chartData,
                  datasets: chartData.datasets.filter(data => selectedLegend.includes(data.label))
                }}/>
            </div>
            <div className="widget__time_series__legend">
              {
                chartData.datasets.map(dataset => {
                  const label = dataset.label
                  const selected = selectedLegend.includes(label)
                  return <div
                    key={label}
                    className={"widget__time_series__row " + (selected ? '' : 'unselected')}
                    onClick={evt => {
                      if (selected) {
                        setSelectedLegend(selectedLegend.filter(legend => legend !== label))
                      } else {
                        setSelectedLegend([...selectedLegend, label])
                      }
                    }}>
                    <div className="widget__time_series__row_inner">
                      <div className="widget__time_series__color"
                           style={{ backgroundColor: dataset.borderColor }}>
                      </div>
                      <div>{label.split(' (')[0]}</div>
                    </div>
                  </div>
                })
              }
            </div>
          </div> :
          <div className='dashboard__right_side__loading'>
            <CircularProgress/>
          </div>
      }
    </Fragment>
  )
}
