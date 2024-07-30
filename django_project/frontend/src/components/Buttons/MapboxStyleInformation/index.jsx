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
 * __date__ = '30/07/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import InfoIcon from "@mui/icons-material/Info";
import Modal, { ModalContent, ModalHeader } from "../../Modal";

const MapboxStyleInformationModal = forwardRef(
  ({}, ref) => {
    const [open, setOpen] = useState(false);

    // Open
    useImperativeHandle(ref, () => ({
      open() {
        setOpen(true)
      }
    }));

    const onClosed = () => {
      setOpen(false);
    };

    return <Modal
      open={open}
      onClosed={onClosed}
    >
      <ModalHeader onClosed={onClosed}>
        Mapbox style information.
      </ModalHeader>
      <ModalContent>
        <span>
          <a
            href="https://docs.mapbox.com/style-spec/reference/layers/"
            target="_blank">
            See mapbox documentation for more detail.
          </a>
          <div>
            There are some information to control the Legend.
          </div>
          <ul>
            <li>
              Add <b>"hide-layer" : true</b> to a layer you wish to hide from legend.
            </li>
            <li>
              Add <b>"name" : [any name]</b> to a layer that you want override the legend text.
            </li>
          </ul>
        </span>
      </ModalContent>
    </Modal>
  }
)

export default function MapboxStyleInformation({ inIcon = true }) {
  const ref = useRef(null);

  return <>
    {
      inIcon ?
        <InfoIcon
          className='InfoIconButton'
          onClick={() => ref.current.open()}/> :
        <span className='InfoIconButton' onClick={() => ref.current.open()}>
      More information
    </span>
    }
    <MapboxStyleInformationModal ref={ref}/>
  </>
}