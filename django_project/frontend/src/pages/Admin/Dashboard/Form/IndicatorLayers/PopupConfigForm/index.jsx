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

import React, { Fragment, useEffect, useState } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import NunjucksConfig from "../../../../../../components/Nunjucks/Config";
import ReplayIcon from '@mui/icons-material/Replay';
import { ThemeButton } from "../../../../../../components/Elements/Button";
import { ExamplePopup } from "./example_popup";
import FieldConfig from "../../../../../../components/FieldConfig";
import ExampleContextInput from "./ExampleContextInput";

import './style.scss';

/*** Popup Config Form ***/
export default function PopupConfigForm({ indicator, setIndicator }) {
  let examplePopup = ExamplePopup
  const key = indicator.indicators[0]?.shortcode ? indicator.indicators[0]?.shortcode : indicator.indicators[0]?.id
  if (key) {
    examplePopup = examplePopup.replaceAll('INDICATOR_A', key)
  }
  const [template, setTemplate] = useState(null)
  const [context, setContext] = useState({})
  const [defaultTemplate, setDefaultTemplate] = useState(examplePopup)

  /**
   * Update when indicator changed
   */
  useEffect(() => {
    if (indicator.popup_template) {
      if (indicator.popup_template !== template) {
        setDefaultTemplate(indicator.popup_template)
      }
    } else {
      setDefaultTemplate(examplePopup)
    }
  }, [])
  /**
   * Update when indicator changed
   */
  useEffect(() => {
    if (indicator.popup_template) {
      if (indicator.popup_template !== template) {
        setTemplate(indicator.popup_template)
      }
    } else {
      setTemplate(examplePopup)
    }
  }, [indicator])

  /**
   * Fetch data when list created
   */
  useEffect(() => {
    if (template !== null && indicator.popup_type === 'Custom') {
      setIndicator({ ...indicator, popup_template: template })
    }
  }, [template, indicator.popup_type])

  return <Fragment>
    <div className="BasicFormSection">
      <FormControlLabel
        checked={indicator.popup_type === 'Custom'}
        control={<Checkbox name='label_config_enable'/>}
        onChange={evt => {
          setIndicator({
            ...indicator,
            popup_type: evt.target.checked ? 'Custom' : 'Simplified'
          })
        }}
        label={'Customize popup'}/>
    </div>
    {
      indicator.popup_type !== 'Custom' ?
        <FieldConfig
          data_fields={indicator.data_fields}
          update={(fields) => {
            setIndicator({ ...indicator, data_fields: fields })
          }}
          noLabel={true}
        /> : null
    }
    {
      indicator.popup_type === 'Custom' ?
        <div className='PopupConfigWrapper'>
          <ThemeButton
            variant="Basic"
            className="DefaultButton"
            onClick={_ => {
              setTemplate(defaultTemplate)
            }}>
            <ReplayIcon/>
          </ThemeButton>
          <NunjucksConfig
            template={template} setTemplate={setTemplate}
            context={context}>
            <ExampleContextInput
              context={context}
              setContext={context => {
                setContext(context)
              }}
              currentIndicatorLayer={indicator}
            />
          </NunjucksConfig>
        </div> : null
    }
  </Fragment>
}