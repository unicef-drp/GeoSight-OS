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

import React, { useEffect, useState } from "react";
import $ from "jquery";
import Modal, { ModalContent, ModalFooter, ModalHeader } from "../Modal";
import { SaveButton } from "../Elements/Button";

import './style.scss';

/** Create json to display **/
function jsonSampleToDisplay(json, chainKey, suffix, isJsonValue) {
  if (json === undefined) {
    return ""
  }
  if (!suffix) {
    suffix = '';
  }
  if (json.constructor === String) {
    return `"${json}"` + suffix
  } else if (json.constructor === Number) {
    return json + suffix
  } else if (json.constructor === Array) {
    let arrayClass = "";
    if (json[0] && json[0].constructor === Object) {
      arrayClass = "array"
    }
    return "" +
      "<div>" +
      (!isJsonValue ? `<span class='${arrayClass}' data-keys='${chainKey}'>[</span>` : "") +
      "   <div class='content'>" + jsonSampleToDisplay(json[0], chainKey + `[0]`) + "</div>" +
      (!isJsonValue ? "<div>] </div>" : "") +
      "</div>"
  } else if (json.constructor === Object) {
    const rows = []
    $.each(json, function (key, value) {
      if (!value) {
        return
      }
      let prefix = ""
      let comma = ""
      let presuffix = ""
      const currentChainKey = chainKey + `.${key}`;
      if (value.constructor === Array) {
        let arrayClass = "";
        if (value[0] && value[0].constructor === Object) {
          arrayClass = "array"
        }
        prefix = `<span class="${arrayClass}" data-keys='${currentChainKey}'>[</span>`
        presuffix = "]"
        comma = ","
      } else if (value.constructor === Object) {
        prefix = "{";
        presuffix = "}";
        comma = ",";
      }
      rows.push(
        `<div><span class='key' data-keys='${currentChainKey}'>"${key}"</span>&nbsp:&nbsp` + prefix +
        jsonSampleToDisplay(value, currentChainKey, ',', true) +
        "   </div>" +
        (presuffix ? "<div>" + presuffix + comma + "</div>" : "")
      )
    });
    return (!isJsonValue ? "<div>{</div>" : "") +
      "   <div class='content'>" + rows.join("") + "</div>" +
      (!isJsonValue ? "<div>} </div>" : "")
  }
  return ""
}

/**
 * Json Selector
 * @param {str} url The json.
 * @param {boolean} open Is Model Open.
 * @param {Function} setOpen Set modal open.
 * @param {Function} setInputAttributes Set parent attributes.
 * @param {Array} inputAttributes Attributes.
 */
export default function JsonSelector(
  { url, open, setOpen, inputAttributes, setInputAttributes }) {
  const exceptionNames = ['api_url', 'date_format'];
  const [urlResponse, setUrlResponse] = useState(null)
  const [error, setError] = useState(null)
  const [errorCode, setErrorCode] = useState(null)
  const [attributes, setAttributes] = useState(inputAttributes)


  // Show api response modal when url changed
  useEffect(() => {
    setAttributes(inputAttributes.map(attr => {
      if (attr === 'api_url') {
        attr.value = ''
      }
      return attr
    }))
  }, [inputAttributes])

  // Show api response modal when url changed
  useEffect(() => {
    setUrlResponse(null)
    setError(null)
    setErrorCode(null)
    if (url && open) {
      // GET URL DATA
      $.ajax({
        url: url
      }).done(function (data) {
        if (typeof data === 'string' || data instanceof String) {
          data = JSON.parse(data)
        }
        setOpen(true)
        setUrlResponse(data)
      }).fail(function (data, error) {
        setError(data.responseText)
        setErrorCode(data.status)
      });
    }
  }, [url, open])

  function getAllKeys(parents = [], properties) {
    const keys = []
    for (const [key, value] of Object.entries(properties)) {
      if (value) {
        const currKeys = parents.concat(key)
        if (value.constructor === Object) {
          getAllKeys(currKeys, value).map(key => {
            keys.push(key)
          })
        } else if (Array.isArray(value)) {

        } else {
          keys.push(currKeys)
        }
      }
    }
    return keys
  }

  // For the jquery
  function init() {
    let $arraySelected = null;
    const $jsonDisplay = $('.JsonDisplay');
    const $applyModal = $('#apply-modal');
    const $attributeSelection = $('#attribute-selection');
    const $ListSelection = $attributeSelection.find('#keys_for_list');
    const $geographySelection = $attributeSelection.find('#keys_for_geography_identifier');
    const $valueSelection = $attributeSelection.find('#keys_for_value');
    const $dateSelection = $attributeSelection.find('#keys_for_date');

    $applyModal.click(function () {
      const list_key = attributes[0].value
      const features = eval(list_key.replaceAll('x.', 'urlResponse.'))
      setInputAttributes(
        [...attributes],
        eval(list_key.replaceAll('x.', 'urlResponse.')),
        getAllKeys([], features[0]).map(keys => keys.join('.'))
      )
    })

    $applyModal.prop('disabled', true);
    $arraySelected = null;

    $ListSelection.removeClass('disabled');
    $geographySelection.addClass('disabled');
    $valueSelection.addClass('disabled');
    $dateSelection.addClass('disabled');

    $ListSelection.click(function () {
      $arraySelected = null;
      $jsonDisplay.find(`.indicator`).remove();
      $jsonDisplay.addClass('highlighted');

      $ListSelection.addClass('selected');
      $geographySelection.addClass('disabled');
      $valueSelection.addClass('disabled');
      $dateSelection.addClass('disabled');

      const $array = $jsonDisplay.find('.array');
      $array.addClass('highlighted');
      $array.off("click");
      $array.click(function () {
        if ($(this).hasClass('highlighted')) {
          $arraySelected = $(this).closest('div');

          $array.removeClass('highlighted');
          $jsonDisplay.removeClass('highlighted');
          $ListSelection.removeClass('selected');
          $geographySelection.removeClass('disabled');
          $valueSelection.removeClass('disabled');
          $dateSelection.removeClass('disabled');

          const right = '-' + ($ListSelection.width() + 25) + 'px';
          $(this).append(`<div class="attribute-selection indicator ${$ListSelection.attr('id')}" data-name="${$ListSelection.attr('id')}" style="right:${right}">${$ListSelection.html()}</div>`);
          selected()
        }
      })
    });

    const selected = () => {
      let listKey = ""

      $jsonDisplay.find('.indicator').each(function () {
        let key = $($(this).closest('span')).data('keys');
        if ($(this).data('name') === "keys_for_list") {
          listKey = key;
        } else {
          key = key.replace((listKey + "[0]"), "x");
        }
        const name = $(this).data('name');
        const attr = attributes.filter(attribute => {
          return attribute.name === name
        })[0]
        if (key) {
          attr.value = key
        }
      })
      if (attributes.filter(attr => {
        if (!exceptionNames.includes(attr.name)) {
          return !attr.value
        } else {
          return false
        }
      }).length) {
        $applyModal.prop('disabled', true);
      } else {
        $applyModal.prop('disabled', false);
      }
    }

    function clicked() {
      const $that = $(this)
      if ($(this).hasClass('disable') || !$arraySelected) {
        return false
      }
      $that.addClass('selected');
      $jsonDisplay.addClass('highlighted');
      $jsonDisplay.find(`.${$that.attr('id')}`).remove();

      const $keys = $arraySelected.find('.content').find('.key');
      $keys.off("click");
      $keys.addClass('highlighted');
      $keys.click(function () {
        if ($(this).hasClass('highlighted')) {
          $jsonDisplay.removeClass('highlighted');
          $that.removeClass('selected');
          $keys.removeClass('highlighted');

          const right = '-' + ($that.width() + 25) + 'px';
          $(this).append(`<div class="attribute-selection indicator ${$that.attr('id')}" data-name="${$that.attr('id')}" style="right:${right}">${$that.html()}</div>`)
          selected()
        }
      })
    }

    $geographySelection.click(clicked);
    $valueSelection.click(clicked);
    $dateSelection.click(clicked);
  }

  if (open) {
    init()
  }

  return <Modal
    className='JsonDisplay'
    open={open}
    onClosed={() => {
      setOpen(false)
    }}
  >
    <ModalHeader onClosed={() => {
      setOpen(false)
    }}>
      <div>Click a box below then click list or key on the highlighted in json.
        After everything has been setup, click apply.
      </div>
      <div id="attribute-selection" className="row">
        {
          attributes ?
            attributes.map(attribute => {
              if (!exceptionNames.includes(attribute.name)) {
                return <div
                  key={attribute.name}
                  className="attribute-selection"
                  id={attribute.name}>
                  {attribute.title}
                </div>
              } else {
                return ''
              }
            }) : ""
        }
      </div>
    </ModalHeader>
    <ModalContent>
      {error ? <div className='error'>
          <div>Status code : {errorCode}</div>
          <div dangerouslySetInnerHTML={{ __html: error }}></div>
        </div> :
        <div dangerouslySetInnerHTML={
          { __html: urlResponse ? jsonSampleToDisplay(urlResponse, 'x') : 'Is loading' }
        }></div>
      }
    </ModalContent>
    <ModalFooter>
      <SaveButton variant="primary" text="Apply" id='apply-modal'/>
    </ModalFooter>
  </Modal>
}