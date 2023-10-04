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

import React, { Fragment, useEffect, useState } from 'react';
import { FormControlLabel, FormGroup } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import {
  SaveButton,
  ThemeButton
} from "../../../../../../components/Elements/Button";
import Modal, {
  ModalContent,
  ModalHeader
} from "../../../../../../components/Modal";
import { dictDeepCopy } from "../../../../../../utils/main";
import StyleConfig from "../../../../Style/Form/StyleConfig";
import { CogIcon } from "../../../../../../components/Icons";

import './style.scss';

export default function Config(
  { indicator, indicators, update }
) {
  const [data, setData] = useState(indicator)
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setData({ ...indicator })
    }
  }, [open])

  const apply = () => {
    setOpen(false)
    update(data)
  }

  /** Update data **/
  const updateData = (data) => {
    setData(dictDeepCopy(data, true))
  }

  const disabled = data.style_type === 'Style from library.' && !data?.style
  return (
    <Fragment>
      <Modal
        className='IndicatorLayerConfig IndicatorRuleForm MuiBox-Large'
        open={open}
        onClosed={() => {
          setOpen(false)
        }}
      >
        <ModalHeader onClosed={() => {
          setOpen(false)
        }}>
          {
            'Style for ' + data.name
          }
        </ModalHeader>
        <ModalContent className='Gray'>
          <div className='SaveButton-Section'>
            <SaveButton
              variant="primary"
              text={"Apply Changes"}
              disabled={disabled}
              onClick={apply}/>
          </div>
          <div className='AdminForm Section'>
            <form className="BasicForm Style">
              <div>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.override_style}
                        onChange={evt => {
                          data.override_style = evt.target.checked
                          if (data.override_style && !data.style) {
                            const indicatorData = indicators.find(ind => ind.id === data.id)
                            if (indicatorData) {
                              for (const [key, value] of Object.entries(indicatorData)) {
                                if (key.includes('style_')) {
                                  data[key] = value
                                }
                              }
                            }
                          }
                          updateData(data)
                        }}/>
                    }
                    label={"Override style from indicator style"}/>
                </FormGroup>
              </div>
              {
                data.override_style ?
                  <StyleConfig
                    data={data}
                    setData={newData => {
                      updateData(newData)
                    }}
                    valuesUrl={`/api/indicator/${data.id}/values/flat/`}
                    defaultStyleRules={data?.style ? data?.style : []}
                    selectableInput={null}
                  /> : null
              }
            </form>
          </div>
        </ModalContent>
      </Modal>
      <ThemeButton className='IndicatorStyleButton' onClick={() => {
        setOpen(true)
      }}>
        <CogIcon/> Config
      </ThemeButton>
    </Fragment>
  )
}