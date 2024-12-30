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
 * __date__ = '30/12/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useState } from 'react';

import './style.scss';
import {
  SELECTION_MODE
} from "../../../../../components/ZonalAnalysisTool/index.d";
import { AGGREGATION_TYPES } from "../../../../../utils/analysisData";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Checkbox } from "@mui/material";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../components/Modal";
import { SaveButton } from "../../../../../components/Elements/Button";
import EditIcon from "@mui/icons-material/Edit";

interface LayerConfiguration {
  id: number;
  aggregation: keyof typeof AGGREGATION_TYPES;
  aggregatedField: string;
}

interface ZonalAnalysisConfigurationProps {
  selectionModes: string[];
  layersConfiguration: LayerConfiguration[];
}

interface Props {
  config: ZonalAnalysisConfigurationProps;
  setConfig: (config: ZonalAnalysisConfigurationProps) => void;
}


/**
 * Zonal analysis configuration
 */
export function ZonalAnalysisConfiguration(
  { config, setConfig }: Props
) {
  const [data, setData] = useState<ZonalAnalysisConfigurationProps>(
    {
      selectionModes: [SELECTION_MODE.SELECT_ADMIN, SELECTION_MODE.MANUAL],
      layersConfiguration: []
    }
  );
  const [open, setOpen] = useState(false);

  /** Apply data **/
  const apply = () => {
    setConfig({ ...data })
    setOpen(false)
  }

  // Loading data
  useEffect(() => {
    if (config) {
      setData(config)
    }
  }, [config])

  if (!data) {
    return null
  }

  const { selectionModes } = data
  return <>
    <Modal
      className='ZonalAnalysisConfiguration'
      open={open}
      onClosed={() => {
        setOpen(false)
      }}
    >
      <ModalHeader onClosed={() => {
        setOpen(false)
      }}>
        Zonal analysis configuration
      </ModalHeader>
      <ModalContent className='White'>
        <div className='BasicForm'>
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem"
          }}>
            <div>Selection mode:</div>
            {
              [SELECTION_MODE.SELECT_ADMIN, SELECTION_MODE.MANUAL].map(mode => {
                return <FormControlLabel
                  checked={selectionModes.includes(mode)}
                  control={<Checkbox/>}
                  onChange={evt => {
                    // @ts-ignore
                    if (evt.target.checked) {
                      data.selectionModes = [...selectionModes, mode]
                    } else {
                      data.selectionModes = data.selectionModes.filter(
                        (row: string) => mode !== row
                      )
                    }
                    setData({ ...data })
                  }}
                  label={mode}/>
              })
            }
          </div>
        </div>
        <div className='SaveButton-Section'>
          <SaveButton
            variant="primary"
            text={"Apply Changes"}
            onClick={apply}/>
        </div>
      </ModalContent>
    </Modal>
    <EditIcon
      style={{ marginRight: "1rem", cursor: "pointer" }}
      onClick={() => {
        setOpen(true)
      }}
    />
  </>
}
