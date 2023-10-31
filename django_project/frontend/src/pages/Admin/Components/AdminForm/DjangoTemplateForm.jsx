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

import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Checkbox from "@mui/material/Checkbox";
import { IconTextField } from '../../../../components/Elements/Input'
import { urlParams } from "../../../../utils/main";
import { Creatable, Select } from "../../../../components/Input";

import './style.scss';

/**
 * Django template form
 * @param {Boolean} isSubmitted If submitted.
 * @param {Function} submit Submit.
 * @param {Function} onChange Events onchange for every input.
 * @param {React.Component} children React component to be rendered.
 */
export default function DjangoTemplateForm(
  {
    submit,
    onChange,
    children,
    ...props
  }
) {
  const selectableInput = props.selectableInput ? props.selectableInput : false
  const selectableInputExcluded = props.selectableInputExcluded ? props.selectableInputExcluded : []
  const [selectableInputState, setSelectableInputState] = useState({});

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (submit) {
        submit();
      }
    }
  }

  /*** When on change ***/
  useEffect(() => {
    if (onChange) {
      $('.DjangoForm').find('input').each(function () {
        onChange($(this).attr('name'), $(this).val())
        $(this).change(() => {
          onChange($(this).attr('name'), $(this).val())
        })
      })
    }
  }, [selectableInputState]);

  /** Render Input per row
   * @param p
   * @param idx
   */
  const renderInputRow = (p, idx) => {
    if (selectableInput) {
      $(p).find('.form-label').removeClass('required')
    }
    const label = $(p).find('.form-label')[0]?.outerHTML;
    const error = $(p).find('.form-error')[0]?.outerHTML;
    const helptext = $(p).find('.form-helptext')[0]?.outerHTML;

    const attrName = $(p).data('field-name')
    if (selectableInput && selectableInputExcluded.includes(attrName)) {
      return null
    }

    const selectableInputChecked = !selectableInputState[attrName] ? false : true
    const selectableInputEnabled = !selectableInput || selectableInputChecked
    const isHidden = $(p).find('.form-input input').attr('type') === 'hidden'
    if (!selectableInputEnabled && !isHidden) {
      $($(p).find('.form-input input, .form-input textarea')).prop("disabled", true);
    }

    let input = <div dangerouslySetInnerHTML={{
      __html: $(p).find('.form-input')[0]?.outerHTML
    }}></div>

    // If Select, change the widget
    const $select = $(p).find('.form-input select');
    if ($select.length > 0) {
      let initValue = null
      const options = []
      $select.find('option').each(function () {
        const option = { value: $(this).attr('value'), label: $(this).html() }
        options.push(option);
        if ($(this).attr('selected')) {
          initValue = option
        }
      })

      if ($select.data('autocreated')) {
        input = <Creatable
          id={$select.attr('id')}
          options={options} defaultValue={initValue}
          name={$select.attr('name')}
          isDisabled={!selectableInputEnabled}
          onChange={e => {
            if (onChange) {
              onChange(attrName, e.value)
            }
          }}
        />
      } else {
        input = <Select
          options={options} defaultValue={initValue}
          name={$select.attr('name')}
          onChange={e => {
            if (onChange) {
              onChange(attrName, e.value)
            }
          }}
          isDisabled={!selectableInputEnabled}
        />
      }
    } else {
      const $input = $(p).find('.form-input input');
      if (attrName === 'username') {
        input = <IconTextField
          type={$input.attr('type')} name={$input.attr('name')}
          iconStart={<PersonIcon/>}
          onKeyDown={onKeyDown}
          defaultValue={$input.attr('value')}
          disabled={!selectableInputEnabled}
          onChange={e => {
            if (onChange) {
              onChange(attrName, e.value)
            }
          }}
        />
      } else if (attrName === 'password') {
        input = <IconTextField
          type='password'
          name={$input.attr('name')}
          iconStart={<LockIcon/>}
          onKeyDown={onKeyDown}
          disabled={!selectableInputEnabled}
          onChange={e => {
            if (onChange) {
              onChange(attrName, e.value)
            }
          }}
        />
      }
    }
    // Render
    return <div
      className={'BasicFormSection ' + (isHidden ? 'Hidden' : '')} key={idx}>
      <div dangerouslySetInnerHTML={{ __html: label }}></div>
      <div className='InputInLine'>
        {
          selectableInput && attrName ?
            <Checkbox
              className='InputEnabler'
              checked={selectableInputChecked}
              onClick={evt => {
                selectableInputState[attrName] = !selectableInputChecked
                $('*[name="' + attrName + '"]').prop("disabled", selectableInputChecked);
                setSelectableInputState({ ...selectableInputState })
              }}
            /> : null}
        {input}
      </div>
      {error ? <div dangerouslySetInnerHTML={{ __html: error }}></div> : ''}
      {helptext ?
        <div dangerouslySetInnerHTML={{ __html: helptext }}></div> : ''}
    </div>
  }

  const params = urlParams()

  /** Render **/
  return (
    <div className='DjangoForm'>
      <input type="hidden" name="ids" value={params.ids}/>
      {$('#FormTemplate').find('.errorlist').map(function (idx) {
        return <ul className='Errorlist' dangerouslySetInnerHTML={{
          __html: $(this).html()
        }}></ul>
      })}
      {$('#FormTemplate').find('p').map(function (idx) {
        return renderInputRow(this, idx)
      })}
      {children ? children : ''}
    </div>
  );
}