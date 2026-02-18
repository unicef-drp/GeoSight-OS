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

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import L from 'leaflet';
import 'leaflet-draw';

import { Actions } from "../../../../../store/dashboard";
import { debounce } from "@mui/material/utils";
import { Extent } from "../../../../../types/Geometry";
import { urlParams } from "../../../../../utils/main";


export interface Props {
}

/** Map config component. */
const MapConfig = memo(({}: Props) => {
    const { entity_ids } = urlParams() as { entity_ids: string };
    const extentState = useRef<Extent | null | boolean>();
    const dispatcher = useDispatch();

    // @ts-ignore
    let id = useSelector(state => state.dashboard.data?.id);
    // @ts-ignore
    let extent = useSelector(state => state.dashboard.data?.extent);
    // @ts-ignore
    const minZoomConfig = useSelector(state => state.dashboard.data?.minZoom);
    // @ts-ignore
    const maxZoomConfig = useSelector(state => state.dashboard.data?.maxZoom);

    const {
      identifier
      // @ts-ignore
    } = useSelector(state => state.dashboard.data?.referenceLayer);
    const identifierState = useRef<null | string>(identifier);

    const [map, setMap] = useState(null);
    const [editableLayers, setEditableLayers] = useState(null);
    const [isInit, setIsInit] = useState(true);

    // west = extent[0];
    // south = extent[1];
    // east = extent[2];
    // north = extent[3];
    const [editedExtent, setEditedExtent] = useState<Extent>(extent);
    const [editedMinZoom, setEditedMinZoom] = useState(minZoomConfig);
    const [editedMaxZoom, setEditedMaxZoom] = useState(maxZoomConfig);

    // @ts-ignore
    const referenceLayerData = useSelector(state => state.referenceLayerData[identifier]);

    /** Create the drawing map **/
    useEffect(() => {
      if (!map) {
        const newMap = L.map(
          // @ts-ignore
          'MapConfig', {
            center: [0, 0],
            zoom: minZoomConfig > 6 ? minZoomConfig : 6,
            zoomControl: false,
            // @ts-ignore
            maxZoom: maxZoomConfig,
            minZoom: minZoomConfig,
            // @ts-ignore
            noWrap: true
          }
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          noWrap: true
        }).addTo(newMap);

        // ---------------------------------------------------------
        // FOR EDITABLE LAYERS
        const editableGroups = new L.FeatureGroup();
        newMap.addLayer(editableGroups);

        const drawPluginOptions = {
          position: 'topright',
          draw: {
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#red',
              },
              shapeOptions: {
                color: 'blue'
              }
            },
            polyline: false,
            circle: false,
            rectangle: false,
            marker: false,
            circlemarker: false,
          },
          edit: {
            featureGroup: editableGroups,
            remove: false
          }
        };
        // @ts-ignore
        const drawControl = new L.Control.Draw(drawPluginOptions)
        newMap.addControl(drawControl)

        const edited = (e: { layer: any; }) => {
          editableGroups.clearLayers()
          editableGroups.addLayer(e.layer)

          const bounds = e.layer.getBounds()
          const newExtent: Extent = [
            bounds._southWest.lng, bounds._southWest.lat,
            bounds._northEast.lng, bounds._northEast.lat
          ]
          setEditedExtent(newExtent)
        }
        newMap.on('draw:created', edited);
        newMap.on('draw:edited', function (e: any) {
          // @ts-ignore
          const layers = e.layers;
          layers.eachLayer(function (layer: any) {
            edited({ layer: layer })
          });
        });
        // ---------------------------------------------------------
        setEditableLayers(editableGroups);
        setMap(newMap);
      }
    }, []);

    // Change previous extent
    useEffect(() => {
      if (!identifier || extentState.current) {
        extentState.current = null
      }
    }, [identifier]);

    // When referenceLayerData changed
    useEffect(() => {
      if (
        referenceLayerData?.data?.bbox?.length &&
        JSON.stringify(referenceLayerData?.data?.bbox) !== JSON.stringify(extentState?.current)
      ) {
        if (entity_ids || !identifierState.current || (!!extent && !isInit) || !id) {
          setEditedExtent(referenceLayerData?.data?.bbox)
          identifierState.current = identifier
        }
        setIsInit(false)
      } else if (referenceLayerData) {
        extentState.current = true
      }
    }, [referenceLayerData]);

    /** Update map when extent changed **/
    useEffect(() => {
      if (map && editedExtent) {
        editableLayers.clearLayers()
        editableLayers.addLayer(
          L.polygon([
            [editedExtent[1], editedExtent[0]],
            [editedExtent[1], editedExtent[2]],
            [editedExtent[3], editedExtent[2]],
            [editedExtent[3], editedExtent[0]],
          ], { color: 'blue' })
        );
        const bounds = editableLayers.getBounds()
        map.fitBounds(bounds);
      }
    }, [map, editedExtent]);

    /** Update to project state **/
    const extentUpdate = useMemo(
      () =>
        debounce(
          (newExtent) => {
            if (JSON.stringify(newExtent) !== JSON.stringify(extentState.current)) {
              dispatcher(Actions.Extent.changeDefault(newExtent))
              extentState.current = newExtent
            }
          },
          300
        ),
      []
    );

    const update = useMemo(
        () =>
          debounce((key, newValue) => {
            let shouldUpdate = false;
            if (key === "minZoom") {
              shouldUpdate = minZoomConfig !== newValue;
            } else if (key === "maxZoom") {
              shouldUpdate = maxZoomConfig !== newValue;
            }

            if (shouldUpdate) {
              const props: any = {};
              props[key] = newValue;
              dispatcher(Actions.Dashboard.updateProps(props));
            }
          }, 400),
        [],
      );

    /** Extent update **/
    useEffect(() => {
      if (map) {
        extentUpdate(editedExtent)
      }
    }, [editedExtent]);

    /** Min and Max zoom update **/
    useEffect(() => {
      if (map) {
        map.setMinZoom(editedMinZoom);
        update("minZoom", editedMinZoom);
      }
    }, [editedMinZoom]);

    useEffect(() => {
      if (map) {
        map.setMaxZoom(editedMaxZoom);
        update("maxZoom", editedMaxZoom);
      }
    }, [editedMaxZoom]);

    return <div className='ExtentConfig'>
      <div className='ExtentInput'>
        <div id="MapConfig"></div>
        <div className='ExtentManualInput'>
          WEST (Longitude)
          <input
            value={editedExtent[0]}
            onChange={(event) => {
              const value = parseFloat(event.target.value)
              if (!isNaN(value)) {
                setEditedExtent(
                  [value, extent[1], extent[2], extent[3]]
                )
              }
            }} type="number" min={-180} max={180}/>
          <br/>
          <br/>
          NORTH (Latitude)
          <input
            value={editedExtent[3]}
            onChange={(event) => {
              const value = parseFloat(event.target.value)
              if (!isNaN(value)) {
                setEditedExtent(
                  [extent[0], extent[1], extent[2], value]
                )
              }
            }} type="number" min={-90} max={90}/>
          <br/>
          <br/>
          EAST (Longitude)
          <input
            value={editedExtent[2]}
            onChange={(event) => {
              const value = parseFloat(event.target.value)
              if (!isNaN(value)) {
                setEditedExtent(
                  [extent[0], extent[1], value, extent[3]]
                )
              }
            }} type="number" min={-180} max={180}/>
          <br/>
          <br/>
          SOUTH (Latitude)
          <input
            value={editedExtent[1]}
            onChange={(event) => {
              const value = parseFloat(event.target.value)
              if (!isNaN(value)) {
                setEditedExtent(
                  [extent[0], value, extent[2], extent[3]]
                )
              }
            }} type="number" min={-90} max={90}/>
          <br/>
          <br/>
          <div className="ExtentZoomInput">
            <div>
              Min Zoom
              <input
                value={editedMinZoom}
                onChange={(event) => {
                  const value = parseInt(event.target.value)
                  if (!isNaN(value)) {
                    setEditedMinZoom(value)
                  }
                }} type="number" min={0} max={14}/>
            </div>
            <div>
              Max Zoom
              <input
                value={editedMaxZoom}
                onChange={(event) => {
                  const value = parseInt(event.target.value)
                  if (!isNaN(value)) {
                    setEditedMaxZoom(value)
                  }
              }} type="number" min={0} max={14}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  }
)
export default MapConfig;