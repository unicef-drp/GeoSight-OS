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

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import maplibregl from "maplibre-gl";
import CancelIcon from '@mui/icons-material/Cancel';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { ThemeButton } from "../../../../components/Elements/Button";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import {
  DeleteIcon,
  MeasurementOffIcon,
  MeasurementOnIcon
} from "../../../../components/Icons";
import { MapDrawing } from "../../../../utils/MapDrawing";
import { numberWithCommas } from "../../../../utils/main";

import './style.scss';

interface Props {
  map: maplibregl.Map;
  started: () => void
}

/**
 * Measurement
 */
export const MeasurementTool = forwardRef(
  ({ map, started }: Props, ref
  ) => {
    const [draw, setDraw] = useState<MapDrawing>(null);
    const [drawState, setDrawState] = useState<number>(null);

    const [start, setStart] = useState(false);
    const [mode, setMode] = useState('Area');

    useImperativeHandle(ref, () => ({
      stop() {
        setStart(false)
      }
    }));

    /**
     * Start changed
     */
    useEffect(() => {
      if (map) {
        if (start) {
          const mapDrawing = new MapDrawing(
            map,
            'draw_polygon',
            () => {
              setDrawState(new Date().getTime())
            }
          )
          setDraw(mapDrawing)
        } else {
          if (draw) {
            draw.destroy()
          }
          setDraw(null)
          map.boxZoom.enable();
        }
      }
    }, [map, start]);

    /** Mode changed */
    useEffect(() => {
      if (draw) {
        const drawMode = mode === 'Area' ? draw.draw.modes.DRAW_POLYGON : draw.draw.modes.DRAW_LINE_STRING;
        draw.changeMode(drawMode)
      }
    }, [mode]);

    let information = null;
    if (draw) {
      information = draw.selectedInformation()
    }
    return <Plugin className='PopupToolbarIcon'>
      <div className='Active'>
        <PluginChild
          title={'Start Measurement'}
          disabled={!map}
          active={start}
          onClick={() => {
            if (map) {
              started()
              setStart(!start)
            }
          }}>
          {start ? <MeasurementOnIcon/> : <MeasurementOffIcon/>}
        </PluginChild>
      </div>
      {
        start ?
          <div className={'PopupToolbarComponent'}>
            <div className={'Title'}>Measure distances and areas</div>
            <div className='MeasurementComponentText'>
              {
                draw?.draw.getSelectedIds().length && information ? (
                    <div>
                      {information.featureType === 'Polygon' ? <div>
                        {numberWithCommas(information.area, 2)} Sq Meters
                      </div> : null}
                      <div>
                        {numberWithCommas(information.lengthMeters, 2)} Meters
                        ({numberWithCommas(information.lengthMiles, 2)} Miles) {information.lengthTerm}
                      </div>
                    </div>
                  ) :
                  <i>Draw on map and finish by double click.</i>
              }
              <div style={{ textAlign: "right" }}>
                {
                  draw?.draw.getSelectedIds().length ?
                    <ThemeButton
                      onClick={() => {
                        draw.deleteSelected()
                      }}
                      className={'MeasurementDeleteButton'}>
                      <DeleteIcon/> Delete selected
                    </ThemeButton> : ""
                }
              </div>

            </div>
            <div className='PopupToolbarComponentFooter CenteredFlex'>
              <SelectWithList
                isMulti={false}
                value={mode}
                list={['Distance', 'Area']}
                onChange={(evt: any) => {
                  setMode(evt.value)
                }}
              />
              <div className='Separator'/>
              <ThemeButton
                disabled={draw?.isDrawing}
                onClick={() => {
                  draw.start()
                }}
                style={{ width: '300px' }}
              >
                <AddLocationIcon/> Add new measurement
              </ThemeButton>
              {
                draw?.isDrawing ?
                  <ThemeButton
                    variant='Error Reverse NoBorder'
                    onClick={() => {
                      draw.stop()
                    }}>
                    <CancelIcon/> Cancel
                  </ThemeButton> :
                  <ThemeButton onClick={() => {
                    draw.deleteFeatures()
                  }}>
                    <CancelIcon/> Clear
                  </ThemeButton>
              }
            </div>
          </div>
          : ""
      }
    </Plugin>
  }
)