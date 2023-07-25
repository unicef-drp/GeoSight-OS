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
   Measurement
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import {
  area as turfArea,
  length as turfLength,
  lineString as turfLineString
} from '@turf/turf';
import $ from 'jquery';

import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { ThemeButton } from "../../../../components/Elements/Button";
import { numberWithCommas } from "../../../../utils/main";

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './style.scss';
import { SelectWithList } from "../../../../components/Input/SelectWithList";

/**
 * Measurement
 */
export default function Measurement({ map }) {
  const [draw, setDraw] = useState(null);
  const [start, setStart] = useState(false);
  const [startDraw, setStartDraw] = useState(false);
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState('Area');

  /** Update Area **/
  const updateArea = () => {
    setStartDraw(false)
    setSelected(draw.getSelectedIds())
  }

  /**
   *
   * When use selects Area mode but only adds 2 points, MapBoxDraw will revert to SIMPLE_SELECT mode.
   * This function checks when such thing occurs,so the draw mode is still in the selected mode (Area or Distance).
   */
  const checkMode = () => {
    if (draw.getSelectedIds().length === 0) {
      const drawMode = mode === 'Area' ? draw.modes.DRAW_POLYGON : draw.modes.DRAW_LINE_STRING;
      draw.changeMode(drawMode);
    }
  }

  /**
   *
   */
  const updateCursor = (value) => {
    if (value === 'grab') {
      $('.maplibregl-canvas.mapboxgl-canvas').removeClass('crosshairCursor');
      $('.maplibregl-canvas.mapboxgl-canvas').addClass('grabCursor');
    } else if (value === 'crosshair') {
      $('.maplibregl-canvas.mapboxgl-canvas').removeClass('grabCursor');
      $('.maplibregl-canvas.mapboxgl-canvas').addClass('crosshairCursor');
    }
  }

  /**
   * Map created
   */
  useEffect(() => {
    if (map) {
      var draw = new MapboxDraw(
        {
          displayControlsDefault: false,
          controls: {
            polygon: true,
            line_string: true,
            trash: true
          },
          defaultMode: 'draw_polygon'
        }
      )
      setDraw(draw)
    }
  }, [map]);

  /**
   * Start changed
   */
  useEffect(() => {
    if (map && draw) {
      if (start) {
        map.addControl(draw, 'top-left')
        onStart()
      } else {
        map.removeControl(draw)
        setSelected([])
        onStop(true)
        map.boxZoom.enable();
      }
    }
  }, [start]);

  /**
   * mode changed
   */
  useEffect(() => {
    if (map && draw) {
      setSelected([])
      const drawMode = mode === 'Area' ? draw.modes.DRAW_POLYGON : draw.modes.DRAW_LINE_STRING;

      if (!startDraw) {
        draw.changeMode(draw.modes.SIMPLE_SELECT)
      } else {
        draw.changeMode(drawMode)
      }
    }
  }, [mode]);

  /**
   * Draw Created
   */
  useEffect(() => {
    if (map && draw) {
      map.on('draw.create', (e) => {
        map.measurementMode = false
        updateArea(e)
      });
      map.on('draw.delete', updateArea);
      map.on('draw.update', updateArea);
      map.on('draw.modechange', checkMode);
      map.on('draw.selectionchange', (e) => {
        if (e.features.length) {
          setStart(true)
          map.measurementMode = true
        }
        setSelected(draw.getSelectedIds())
      });
    }
  }, [draw]);

  /**
   * On Start Measurement
   */
  const onStart = () => {
    updateCursor('crosshair');
    setStartDraw(true)
    const drawMode = mode === 'Area' ? draw.modes.DRAW_POLYGON : draw.modes.DRAW_LINE_STRING
    draw.changeMode(drawMode)
    map.measurementMode = true
  }

  /**
   * On Stop Measurement
   */
  const onStop = (close) => {
    if (!close) {
      draw.changeMode(draw.modes.SIMPLE_SELECT)
    }
    map.measurementMode = false
    updateCursor('grab');
  }

  const Information = () => {
    var data = draw.getAll();
    let area = 0
    let lengthMeters = 0
    let lengthMiles = 0
    let lengthTerm = 'Perimeter'
    let featureType = 'Polygon'
    data.features.filter(feature => selected.includes(feature.id)).map(feature => {
      let coordinates = null;
      if (feature.geometry.type === 'Polygon') {
        area += turfArea(feature)
        coordinates = feature.geometry.coordinates[0]
      } else if (feature.geometry.type === 'LineString') {
        coordinates = feature.geometry.coordinates
        lengthTerm = 'Distance'
        featureType = 'LineString'
      }
      lengthMeters += turfLength(
        turfLineString(coordinates),
        { units: "meters" }
      )
      lengthMiles += turfLength(
        turfLineString(coordinates),
        { units: "miles" }
      )
    })
    return (
      <div>
        {featureType === 'Polygon' ? <div>
          {numberWithCommas(area, 2)} Sq Meters
        </div> : null}
        <div>
          {numberWithCommas(lengthMeters, 2)} Meters
          ({numberWithCommas(lengthMiles, 2)} Miles) {lengthTerm}
        </div>
      </div>
    )
  }

  return <Plugin className={'MeasurementComponent'}>
    <PluginChild
      title={'Start Measurement'}
      disabled={!map || !draw}
      active={start}
      onClick={() => {
        if (map && draw) {
          setStart(!start)
        }
      }}>
      <SquareFootIcon/>
    </PluginChild>
    {
      start ?
        <div className={'MeasurementComponentPopup'}>
          <div className={'Title'}>Measure distances and areas</div>
          <div className='MeasurementComponentText'>
            {
              selected.length ? <Information/> :
                <i>Draw on map and finish by double click.</i>
            }
            <div style={{ textAlign: "right" }}>
              {
                selected.length ?
                  <ThemeButton onClick={() => {
                    draw.delete(selected)
                    draw.changeMode(draw.modes.SIMPLE_SELECT)
                    map.measurementMode = false
                    updateArea()
                    setStartDraw(false)
                  }} className={'MeasurementDeleteButton'}>
                    <DeleteIcon/> Delete selected
                  </ThemeButton> : ""
              }
            </div>
          </div>
          <div className='MeasurementComponentFooter'>
            <ThemeButton onClick={() => {
              setStart(false)
            }}>
              <CancelIcon/> Cancel
            </ThemeButton>
            <ThemeButton onClick={() => {
              onStart()
            }} style={{ width: '300px' }} disabled={startDraw}>
              <AddLocationIcon/> Add new measurement
            </ThemeButton>
            <div className='Separator'/>
            <SelectWithList
              isMulti={false}
              value={mode}
              list={['Distance', 'Area']}
              onChange={(evt) => {
                setSelected([])
                setMode(evt.value)
              }}
            />
          </div>
        </div>
        : ""
    }
  </Plugin>
}