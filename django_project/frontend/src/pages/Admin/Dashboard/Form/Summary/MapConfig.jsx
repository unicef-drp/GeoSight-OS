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
   MAP CONFIG CONTAINER
   ========================================================================== */

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import L from 'leaflet';
import Draw from 'leaflet-draw';

import { Actions } from "../../../../../store/dashboard";

/**
 * Map component.
 */
export default function MapConfig() {
  const prevState = useRef();
  const dispatcher = useDispatch();
  const { extent } = useSelector(state => state.dashboard.data);
  const [map, setMap] = useState(null);
  const [editableLayers, setEditableLayers] = useState(null);

  const [west, setWest] = useState(extent[0]);
  const [south, setSouth] = useState(extent[1]);
  const [east, setEast] = useState(extent[2]);
  const [north, setNorth] = useState(extent[3]);

  useEffect(() => {
    if (!map) {
      const newMap = L.map('MapConfig', {
        center: [0, 0],
        zoom: 6,
        zoomControl: false,
        maxZoom: maxZoom,
        noWrap: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        noWrap: true
      }).addTo(newMap);

      // ---------------------------------------------------------
      // FOR EDITABLE LAYERS
      var editableGroups = new L.FeatureGroup();
      newMap.addLayer(editableGroups);

      var drawPluginOptions = {
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
      var drawControl = new L.Control.Draw(drawPluginOptions)
      newMap.addControl(drawControl)

      const edited = (e) => {
        editableGroups.clearLayers()
        editableGroups.addLayer(e.layer)

        const bounds = e.layer.getBounds()
        const newExtent = [
          bounds._southWest.lng, bounds._southWest.lat,
          bounds._northEast.lng, bounds._northEast.lat
        ]
        dispatcher(Actions.Extent.changeDefault(newExtent))
      }
      newMap.on('draw:created', edited);
      newMap.on('draw:edited', function (e) {
        var layers = e.layers;
        layers.eachLayer(function (layer) {
          edited({
            layer: layer
          })
        });
      });

      // ---------------------------------------------------------
      setEditableLayers(editableGroups);
      setMap(newMap);
    }

    if (map && extent) {
      if (JSON.stringify(extent) !== JSON.stringify(prevState.extent)) {
        editableLayers.clearLayers()
        editableLayers.addLayer(
          L.polygon([
            [extent[1], extent[0]],
            [extent[1], extent[2]],
            [extent[3], extent[2]],
            [extent[3], extent[0]],
          ], { color: 'blue' })
        );
        prevState.extent = extent
        const bounds = editableLayers.getBounds()
        map.fitBounds(bounds);

        // set value
        setWest(extent[0])
        setSouth(extent[1])
        setEast(extent[2])
        setNorth(extent[3])
      }
    }
  }, [map, extent]);

  useEffect(() => {
    if (map) {
      if (north !== '' && south !== '' && east !== '' && west !== '') {
        const newExtent = [
          west, south,
          east, north
        ]
        dispatcher(Actions.Extent.changeDefault(newExtent))
      }
    }
  }, [north, south, east, west]);

  return <div className='ExtentConfig'>
    <div className='ExtentInput'>
      <div id="MapConfig"></div>
      <div className='ExtentManualInput'>
        WEST (Longitude)
        <input
          defaultValue={west}
          onChange={(event) => {
            const value = parseFloat(event.target.value)
            if (!isNaN(value)) {
              setWest(value)
            }
          }} type="number" min={-180} max={180}/>
        <br/>
        <br/>
        NORTH (Latitude)
        <input
          defaultValue={north}
          onChange={(event) => {
            const value = parseFloat(event.target.value)
            if (!isNaN(value)) {
              setNorth(value)
            }
          }} type="number" min={-90} max={90}/>
        <br/>
        <br/>
        EAST (Longitude)
        <input
          defaultValue={east}
          onChange={(event) => {
            const value = parseFloat(event.target.value)
            if (!isNaN(value)) {
              setEast(value)
            }
          }} type="number" min={-180} max={180}/>
        <br/>
        <br/>
        SOUTH (Latitude)
        <input
          defaultValue={south}
          onChange={(event) => {
            const value = parseFloat(event.target.value)
            if (!isNaN(value)) {
              setSouth(value)
            }
          }} type="number" min={-90} max={90}/>
      </div>
    </div>
  </div>
}

