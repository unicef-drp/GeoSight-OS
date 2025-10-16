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
 * __date__ = '14/06/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */


import React, { useState } from "react";
import {
  SelectWithList
} from "../../../../../components/Input/SelectWithList";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../components/Modal";
import { defaultAggregationStyle } from "../layerStyles";

import './style.scss';

/**
 * AggregationStyleGuide
 */

function AggregationJsonGuide() {
  const guide = `
  [
    <--- This is the layer for the label -->
    {
      "id": "clusterLabel",
      "type": "symbol",
      "source": "source",
      "filter": [ "has", "point_count" ],
      "layout": {
        "text-field": [
          "format",
          [ "get", "sum"]         ---> Change sum to point_count, sum, min, or max for the property
        ],
        "text-font": ["Rubik","Rubik"],
        "text-size": 10
      },
      "paint": {
          "text-color": [
              "step",
              [ "get", "sum" ],   ---> Change sum to point_count, sum, min, or max for the property
              "#000000",          ---> First color
              250,                ---> First color used from 0 to 250
              "#000000",          ---> Second color
              500,                ---> Second color used from 250 to 500
              "#FFFFFF",          ---> Third color
              750,                ---> Third color used from 500 to 750
              "#FFFFFF",          ---> Forth color
              1000,               ---> Forth color used from 750 to 1000
              "#FFFFFF"           ---> Color that used for default (more than 1000)
          ]
      }
    },
    <--- This is the layer for the cluster -->
    {
        "id": "clusterLayer",
        "type": "circle",
        "source": "source",
        "filter": [ "has", "point_count" ],
        "paint": {
            "circle-color": [
                "step",
                [ "get", "sum" ], ---> Change sum to point_count, sum, min, or max for the property
                "#5fff5f",          ---> First color
                250,                ---> First color used from 0 to 250
                "#4bd448",          ---> Second color
                500,                ---> Second color used from 250 to 500
                "#36aa32",          ---> Third color
                750,                ---> Third color used from 500 to 750
                "#21831d",          ---> Forth color
                1000,               ---> Forth color used from 750 to 1000
                "#004b00"           ---> Color that used for default (more than 1000)
            ],
            "circle-radius": [
                "step",
                [ "get", "sum" ], ---> Change sum to point_count, sum, min, or max for the property
                10,               ---> First radius (10)
                250,              ---> First radius used from 0 to 250
                15,               ---> Second radius (15)
                500,              ---> Second radius used from 250 to 500
                20,               ---> Third radius (20)
                750,              ---> Third radius used from 500 to 750
                25,               ---> Forth radius (25)
                1000,             ---> Forth radius used from 750 to 1000
                30                ---> Radius that used for default (more than 1000)
            ],
            "circle-stroke-width": 1,
            "circle-stroke-color": "#004b00"
        }
    },
    <--- This is the layer for the uncluster -->
    {
        "id": "unclusterLayer",
        "type": "circle",
        "source": "source",
        "filter": [ "!", [ "has", "point_count" ] ],
        "paint": {
            "circle-color": "#0000FF",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#000000"
        }
    }
  ]
  `
  return <>
    <br/>
    <br/>
    <div>
      In the cluster point, it has 5 properties that we can use on the styling.
      They are
      : <b>point_count</b>, <b>point_count_abbreviated</b>, <b>sum</b>, <b>min</b>, <b>max</b>.<br/>
      point_count, sum, min, and max are the number that we can use for step on
      styling.<br/>
      point_count_abbreviated is the string of point_count for label<br/>
      <br/>
      Below is default styling that we can use. There is comments on the
      styling for the guide.
    </div>
    <pre style={{ fontSize: "0.8rem" }}>{guide}</pre>
  </>
}

export default function AggregationStyleGuide({ styleChanged }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [aggregationMethod, setAggregationMethod] = useState('point_count');

  return <>
    <div>This layer has aggregation. Click <span
      className='TextLinkButton'
      onClick={() => {
        setModalOpen(true)
      }}
    >this</span> to see the guide
      for style.
    </div>
    <Modal
      open={modalOpen}
      onClosed={() => {
        setModalOpen(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setModalOpen(false)
      }}>
        Style guide for aggregation
      </ModalHeader>
      <ModalContent className='AggregationStyleGuide'>
        This is the guid for aggregation.
        The aggregation will make the points clustered.
        <br/>
        <br/>
        Select <SelectWithList
        list={
          [
            {
              name: 'point_count',
              value: 'point_count',
            },
            {
              name: 'sum',
              value: 'sum',
            },
            {
              name: 'min',
              value: 'min',
            },
            {
              name: 'max',
              value: 'max',
            }
          ]
        }
        value={aggregationMethod}
        onChange={evt => {
          setAggregationMethod(evt.value)
        }}/> and click <span
        className='TextLinkButton'
        onClick={() => {
          setModalOpen(false)
          let style = JSON.stringify(defaultAggregationStyle, null, 4)
          if (aggregationMethod === 'point_count') {
            style = style.replaceAll('_value_text_', 'point_count_abbreviated')
          } else {
            style = style.replaceAll('_value_text_', aggregationMethod)
          }
          style = style.replaceAll('_value_', aggregationMethod)
          styleChanged(style)
        }}
      >this</span> if you want to put default styles.

        <AggregationJsonGuide/>
      </ModalContent>
    </Modal>
    <br/>
  </>
}