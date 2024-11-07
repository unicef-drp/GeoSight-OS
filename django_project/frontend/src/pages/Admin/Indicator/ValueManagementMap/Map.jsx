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

import React, { Fragment, useEffect, useState } from 'react';
import $ from 'jquery';
import L from 'leaflet';

import { SelectWithList } from "../../../../components/Input/SelectWithList";
import { axiosGet, fetchGeojson } from '../../../../utils/georepo'
import { GeorepoViewInputSelector } from "../../ModalSelector/InputSelector";
import { RefererenceLayerUrls } from "../../../../utils/referenceLayer";

/**
 * Map component.
 */
export default function Map() {
  const featureColor = function (feature) {
    return legends['NODATA']['color'];
  };

  const [map, setMap] = useState(null);
  const [layer, setLayer] = useState(null);
  const [references, setReferences] = useState([])
  const [reference, setReference] = useState(null)
  const [level, setLevel] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async (reference_layer, level, page) => {
    const data = await fetchGeojson(level.url)
    data.features.map(feature => {
      feature.identifier = reference_layer.identifier
      feature.level = level.level
      return feature
    })
    level.layer = data
    level.finished = true
    setReferences([...references])
  }
  useEffect(() => {
    // Init Map
    if (!map) {
      const newMap = L.map('Map', {
        center: [0, 0],
        zoom: 6,
        zoomControl: false,
        maxZoom: maxZoom
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(newMap);
      setMap(newMap);

      const geojson = L.geoJSON(
        null, {
          style: function (feature, layer) {
            return {
              color: "#ffffff",
              weight: 1,
              fillColor: featureColor(feature)
            };
          },
          onEachFeature: function (feature, layer) {
            const identifier = feature?.properties?.ucode;
            if (!identifier) {
              return
            }
            const id = identifier;
            feature.properties['id'] = id;
            feature.properties['url'] = urlValueByGeometry.replace('/0', '/' + identifier);

            // update bind popup
            layer.bindPopup(
              L.popup({
                closeOnClick: false
              }).setContent(
                identifier ? `
                <div data-id="${id}"
                   class="feature-value-popup">
                  <div class="popup-header"><b>${feature.properties['name']} ${id}</b>
                  </div>
                  <div class="popup-content">
                      <div class="popup-content-form" data-action="${feature.properties['url']}">
                        <input type="hidden" name="csrfmiddlewaretoken" value=${csrfmiddlewaretoken}/>
                        <div class="popup-content-form-title"><b>Add new value</b></div>
                        <input id="feature-value-date" type="date"
                               name="date" placeholder="Date"
                               autocomplete="off">
                        <input id="feature-value-value" type="number"
                               name="value" placeholder="Value"
                               autocomplete="off">
                        <input class="main-button" type="submit"
                               value="Submit">
                      </div>
                      <div class="popup-content-table">
                          <table>
                              <tr>
                                  <th><b>x</b></th>
                                  <th><b>Date</b></th>
                                  <th>Value</th>
                              </tr>
                              <tr class="loading">
                                  <td colspan="2"><i>Loading</i></td>
                              </tr>
                          </table>
                      </div>
                  </div>
              </div>
                ` : '<div>No identifier found</div>'
              )
            ).on("popupopen", () => {
              setTimeout(function () {
                const $popup = $('.popup-content')

                function loadData() {
                  const url = urlValueByGeometry.replace('/0', '/' + id);
                  $.ajax({
                    url: url,
                    dataType: 'json',
                    success: function (data, textStatus, request) {
                      $('.loading').remove()
                      const $table = $popup.find('table');

                      const onClick = (valueID) => {
                        if (!valueID) {
                          return
                        }
                        if (confirm(`Are you sure you want to delete this value?`)) {
                          $.ajax({
                            url: valueDetail.replace('/0', '/' + valueID),
                            method: 'DELETE',
                            success: function () {
                              loadData()
                            },
                            beforeSend: beforeAjaxSend
                          });
                          return false;
                        }
                      }
                      $('.row-value').remove();
                      data.map(row => {
                          $table.append(
                            `<tr class="row-value"><td class="DeleteButton" data-id="${row.id}"><b>x</b></td><td><b>${row.date}</b></td><td>${row.value}</td></tr>`
                          )

                          $($table.find('.DeleteButton').last()).click(function () {
                            onClick($(this).data('id'))
                          })
                        }
                      )
                    }
                  });
                }

                loadData()

                const $featureValueDate = $popup.find('#feature-value-date');
                const $featureValueValue = $popup.find('#feature-value-value');
                const $submitButton = $popup.find('.main-button');
                $('.main-button').click(function (event) {
                  const $form = $('.popup-content-form');
                  const url = $form.data('action');
                  const date = $featureValueDate.val();
                  const value = $featureValueValue.val();

                  // POST DATA
                  if (date && value) {
                    $submitButton.attr('disabled', true)
                    $.ajax({
                      url: url,
                      data: {
                        date: date,
                        value: value,
                        reference_layer: feature.identifier,
                        admin_level: feature.level
                      },
                      dataType: 'json',
                      type: 'POST',
                      success: function (data, textStatus, request) {
                        $('.leaflet-popup-close-button')[0].click();
                        loadData()
                      },
                      error: function (error, textStatus, request) {
                      },
                      beforeSend: beforeAjaxSend
                    });
                  }
                });
              }, 300);
            });

            // on mouse over
            layer.on('mouseover', function () {
              this.setStyle({
                'fillColor': '#0000ff'
              });
            });
            layer.on('mouseout', function () {
              this.setStyle({
                'fillColor': featureColor(feature)
              });
            });
          }
        });
      geojson.addTo(newMap);
      setLayer(geojson)
    }
  }, [])

  // Delete layer when reference and level changed
  useEffect(() => {
    if (layer) {
      layer.clearLayers();
    }
  }, [reference, level])

  // When reference changed
  useEffect(() => {
    setError('')
    if (reference) {
      const referenceLayer = references.find(row => {
        return row.identifier === reference.identifier
      })
      if (!referenceLayer) {
        return
      }
      if (!referenceLayer.data) {
        const url = RefererenceLayerUrls.ViewDetail(referenceLayer)
        axiosGet(url).then(response => {
          const data = response.data
          referenceLayer.data = data.dataset_levels.map(level => {
            level.value = level.level
            level.name = level.level_name
            return level
          });
          setReferences([...references])
          setLevel(referenceLayer.data[0]?.value)
        });
      } else {
        // Check levels
        const referenceLayerLevel = referenceLayer.data.filter(refLevel => {
          return refLevel.level === level
        })[0]
        if (referenceLayerLevel) {
          if (!referenceLayerLevel.finished) {
            setLoading(true)
            fetchData(referenceLayer, referenceLayerLevel, !referenceLayerLevel.page ? 1 : referenceLayerLevel.page)
          } else {
            setLoading(false)
          }
          // render
          if (referenceLayerLevel?.layer) {
            layer.clearLayers();
            layer.addData(referenceLayerLevel.layer);
            if (Object.keys(layer.getBounds()).length) {
              map.fitBounds(layer.getBounds());
            }
          }
        } else {
          setLoading(false)
        }
      }
    }
  }, [reference, references, level])

  return <Fragment>
    <div id="Map"></div>
    <div className='ReferenceList'>{
      <Fragment>
        <div className='ReferenceLayerSelection'>
          <b className='light'>View</b>
        </div>
        <div className='ReferenceLayerSelection'>
          <GeorepoViewInputSelector
            data={reference?.identifier ? [reference] : []}
            setData={selectedData => {
              const reference = selectedData[0]
              const referenceLayer = references.find(row => {
                return row.identifier === reference
              })
              if (!referenceLayer) {
                setReferences([...references, reference])
              }
              setReference(reference)
            }}
            isMultiple={false}
            showSelected={false}
          />
        </div>
        <div className='ReferenceLayerSelection'>
          <b className='light'>Admin Level</b>
        </div>
        <div className='ReferenceLayerSelection'>
          <SelectWithList
            name='admin_level'
            list={reference && reference.data}
            value={level}
            onChange={evt => {
              setLevel(evt.value)
            }}
          />
        </div>
        {error ? <div className='error'>{error}</div> : ''}
        {loading ? <div className='ReferenceListLoading'>Loading</div> : ''}
      </Fragment>
    }</div>
  </Fragment>
}

