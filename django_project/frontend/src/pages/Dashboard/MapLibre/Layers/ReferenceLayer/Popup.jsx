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

import $ from "jquery";
import { addPopup } from "../../utils";
import { renderPopup, renderTemplateContent } from "../../Popup";
import { fetchingData } from "../../../../../Requests";
import { updateContextData } from "../../../../../utils/dataContext";
import { extractCode } from "../../../../../utils/georepo";

export const referenceLayerDefaultTemplate = `
<!--  HEADER  -->
<div class="header">
    <b>{{ context.current.geometry_data.name }}</b>
</div>

<!--  INDICATOR LAYER SECTION  -->
{% if context.current %}
  <!--  CONTENT  -->
  <div class="content">
    <table>
    
    <!-- INDICATOR LAYERS DATA -->
    {% for obj in context.current.indicator_layers %}
      {% if obj.data %}
        {% for key, value in obj.data %}
            {% if key not in ['name'] %}
                <tr>
                    <td valign="top"><b>{{ key | capitalize | humanize }}</b></td>
                    <td valign="top">{{ value | safe }}</td>
                </tr>
            {% endif %}
        {% endfor %}
      {% endif %}
    {% endfor %}
    
    <!-- INDICATORS DATA -->
    {% for obj in context.current.indicators %}
      {% for key, value in obj %}
          {% if key not in ['name'] %}
              <tr>
                  <td valign="top"><b>{{ key | capitalize | humanize }}</b></td>
                  <td valign="top">{{ value | safe }}</td>
              </tr>
          {% endif %}
      {% endfor %}
    {% endfor %}

    
    <!-- RELATED TABLE DATA -->
    {% for obj in context.current.related_tables %}
      {% for key, value in obj %}
          {% if key not in ['name'] %}
              <tr>
                  <td valign="top"><b>{{ key | capitalize | humanize }}</b></td>
                  <td valign="top">{{ value | safe }}</td>
              </tr>
          {% endif %}
      {% endfor %}
    {% endfor %}
    
    
    <!-- GEOMETRY -->
    {% for key, value in context.current.geometry_data %}
        <tr>
            <td valign="top"><b>{{ key | capitalize | humanize }}</b></td>
            <td valign="top">{{ value | safe }}</td>
        </tr>
    {% endfor %}
  </table>
</div>
{% endif %}
`

export function updateCurrent(
  context, indicators, relatedTables,
  currentIndicatorLayer, currentIndicatorSecondLayer,
  indicatorValueByGeometry, indicatorSecondValueByGeometry,
  geom_id
) {
  let indicatorsByDict = {};
  let relatedTableByDict = {};
  [currentIndicatorLayer, currentIndicatorSecondLayer].map(indicatorLayer => {
    indicatorLayer?.indicators?.map(obj => {
      const objFound = indicators.find(ind => ind.id === obj.id)
      if (objFound) {
        indicatorsByDict[objFound.id] = {
          name: objFound.name,
          category: objFound.category,
          description: objFound.description,
          last_update: objFound.last_update,
          shortcode: objFound.shortcode,
          source: objFound.source,
        }
      }
    })
    indicatorLayer?.related_tables?.map(obj => {
      const objFound = relatedTables.find(ind => ind.id === obj.id)
      if (objFound) {
        relatedTableByDict[objFound.id] = {
          name: objFound.name,
          description: objFound.description,
          creator: objFound.creator,
          created_at: objFound.created_at
        }
      }
    })
  });
  [indicatorValueByGeometry, indicatorSecondValueByGeometry].map(values => {
    values[geom_id]?.map(data => {
      let relatedName = ''
      if (data.related_table?.related_table) {
        const relatedNames = data.related_table?.related_table.split('(')
        relatedNames.pop()
        relatedName = relatedNames.join('(')
      }
      const _data = {
        name: data.indicator?.name ? data.indicator?.name : relatedName,
        time: data.date,
        value: data.value,
        label: data.label,
      }
      if (data.indicator) {
        indicatorsByDict[data.indicator.id] = {
          ...indicatorsByDict[data.indicator.id],
          ..._data
        }
      } else if (data.related_table) {
        relatedTableByDict[data.related_table.id] = {
          ...relatedTableByDict[data.related_table.id],
          ..._data
        }
      } else {
        // if the value is using indicator layers
        context.context.current.indicator_layers.map(indicatorLayer => {
          if (indicatorLayer.id === data.indicatorLayer.id) {
            indicatorLayer.data = _data
          }
        })
      }
    })
  })

  const indicatorsContext = Object.keys(indicatorsByDict).map(key => indicatorsByDict[key]);
  const relatedTableContext = Object.keys(relatedTableByDict).map(key => relatedTableByDict[key]);
  if (indicatorsContext) {
    context.context.current['indicators'] = indicatorsContext
  }
  if (relatedTableContext) {
    context.context.current['related_tables'] = relatedTableContext
  }
  return context
}

export function getContext(
  indicators, relatedTables,
  indicatorValueByGeometry, indicatorSecondValueByGeometry,
  geom_id, geometryProperties,
  selectedGlobalTime, selectedGlobalTimeConfig,
  indicatorLayers, referenceLayerData,
  currentIndicatorLayer, currentIndicatorSecondLayer, concept_uuid,
  contextOnLoad, contextOnError
) {
  let current = {}
  current['indicator_layers'] = [];
  [currentIndicatorLayer, currentIndicatorSecondLayer].map(indicatorLayer => {
    if (indicatorLayer.id) {
      current['indicator_layers'].push({
        id: indicatorLayer.id,
        name: indicatorLayer.name,
        description: indicatorLayer.description,
        indicators: indicatorLayer.indicators?.map(obj => {
          const objFound = indicators.find(ind => ind.id === obj.id)
          return {
            name: objFound.name,
            shortcode: objFound.shortcode,
            description: objFound.description,
          }
        }),
        related_tables: indicatorLayer.related_tables?.map(obj => {
          const objFound = relatedTables.find(ind => ind.id === obj.id)
          return {
            name: objFound.name,
            description: objFound.description,
          }
        })
      })
    }
  })
  try {
    const orderedGeometryProperties = {}
    Object.keys(geometryProperties).sort().map(key => {
      orderedGeometryProperties[key] = geometryProperties[key]
    })
    current['geometry_data'] = orderedGeometryProperties
  } catch (err) {
  }
  const timeslice = {
    active_window_start: selectedGlobalTime.min,
    active_window_end: selectedGlobalTime.max,
    range_start: selectedGlobalTimeConfig.minDate,
    range_end: selectedGlobalTimeConfig.maxDate,
    interval: selectedGlobalTimeConfig.interval,
  }

  const indicatorLayersConfig = {}
  indicatorLayers.map(indicatorLayer => {
    if (indicatorLayer.config.date_field) {
      indicatorLayersConfig[indicatorLayer.related_tables[0].id] = {
        date_field: indicatorLayer.config.date_field,
        date_format: indicatorLayer.config.date_format ? indicatorLayer.config.date_format : null,
      }
    }
  })

  // Fetch drilldown
  const url = urls.drilldown.replace('concept_uuid', concept_uuid)
  const params = {
    rtconfigs: JSON.stringify(indicatorLayersConfig)
  }
  fetchingData(
    url, params, {}, function (admin_boundary, error) {
      if (error) {
        if (contextOnError) {
          contextOnError(error)
        }
      } else {
        let context = {
          current,
          timeslice,
          admin_boundary
        }
        updateContextData(context, referenceLayerData, currentIndicatorLayer, currentIndicatorSecondLayer)
        if (contextOnLoad) {
          contextOnLoad(
            updateCurrent(
              { context: context }, indicators, relatedTables,
              currentIndicatorLayer, currentIndicatorSecondLayer,
              indicatorValueByGeometry, indicatorSecondValueByGeometry,
              geom_id
            )
          )
        }
      }
    }
  )
  return {
    context: {
      current
    }
  }
}

/*** Handle popup ***/
export function popup(
  map, FILL_LAYER_ID, indicators, indicatorsData,
  relatedTables, relatedTableData,
  indicatorLayers, currentIndicatorLayer, currentIndicatorSecondLayer,
  indicatorValueByGeometry, indicatorSecondValueByGeometry,
  compareMode, geomFieldOnVectorTile,
  selectedGlobalTimeConfig,
  selectedGlobalTime, referenceLayerData
) {
  addPopup(map, FILL_LAYER_ID, featureProperties => {
    let geom_id = extractCode(featureProperties, geomFieldOnVectorTile)
    let geometryProperties = {
      name: featureProperties.label,
      geom_code: featureProperties.ucode,
      admin_level: featureProperties.level,
      admin_level_name: featureProperties.type,
      concept_uuid: featureProperties.concept_uuid,
    }
    let concept_uuid = geometryProperties.concept_uuid
    const geomCode = concept_uuid
    let context = getContext(
      indicators, relatedTables,
      indicatorValueByGeometry, indicatorSecondValueByGeometry,
      geom_id, geometryProperties,
      selectedGlobalTime, selectedGlobalTimeConfig,
      indicatorLayers, referenceLayerData,
      currentIndicatorLayer, currentIndicatorSecondLayer, concept_uuid,
      function contextOnLoad(context) {
        $('#' + geomCode + ' .copy-context').html(
          `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ContentCopyIcon"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg> Copy context`
        )
        $('#' + geomCode + ' .copy-context').addClass('HasContent')
        $('#' + geomCode + ' .copy-context').click(function () {
          navigator.clipboard.writeText(JSON.stringify(context, null, 2)).then(() => {
            alert('Context copied to clipboard');
          }, () => {
          });
        })
        $('#' + geomCode + ' .template-content').html(
          renderTemplateContent(
            currentIndicatorLayer.popup_template,
            context
          )
        )
      }
    )

    if (currentIndicatorLayer.popup_type === 'Custom') {
      return renderPopup(
        `<div id="${geomCode}">
              <div class="template-content"><div class="loading">Loading</div></div>
              <div class="copy-context"></div>
          </div>`
      )
    }

    try {
      const newIndicatorsContext = {}
      const newRelatedTablesContext = {}
      context = updateCurrent(
        context, indicators, relatedTables,
        currentIndicatorLayer, currentIndicatorSecondLayer,
        indicatorValueByGeometry, indicatorSecondValueByGeometry,
        geom_id
      )
      const newGeometryContext = {
        name: context?.context?.current?.geometry_data.name
      }
      currentIndicatorLayer.data_fields.map(field => {
        if (!field.visible) {
          return
        }
        const geometryDataId = 'context.current.geometry_data.'
        if (field.name.includes(geometryDataId)) {
          const contextField = field.name.replace(geometryDataId, '')
          newGeometryContext[field.alias] = context?.context?.current?.geometry_data[contextField]
        }
        const indicatorId = 'context.current.indicator.'
        if (field.name.includes(indicatorId)) {
          const contextField = field.name.replace(indicatorId, '')
          context?.context?.current?.indicators.map(indicator => {
            if (!newIndicatorsContext[indicator.name]) {
              newIndicatorsContext[indicator.name] = {
                name: indicator.name
              }
            }
            newIndicatorsContext[indicator.name][field.alias] = indicator[contextField]
          })

          // For related tables
          context?.context?.current?.related_tables.map(indicator => {
            if (!newRelatedTablesContext[indicator.name]) {
              newRelatedTablesContext[indicator.name] = {
                name: indicator.name
              }
            }
            newRelatedTablesContext[indicator.name][field.alias] = indicator[contextField]
          })
        }
      })
      context.context.current.geometry_data = newGeometryContext
      context.context.current.indicators = Object.keys(newIndicatorsContext).map(key => {
        return newIndicatorsContext[key]
      })
      context.context.current.related_tables = Object.keys(newRelatedTablesContext).map(key => {
        return newRelatedTablesContext[key]
      })
    } catch (err) {
    }

    return renderPopup(
      `<div id="${geomCode}">
        ${renderTemplateContent(
        currentIndicatorLayer.popup_template && currentIndicatorLayer.popup_type !== 'Simplified' ? currentIndicatorLayer.popup_template : referenceLayerDefaultTemplate,
        context
      )}
        <div class="copy-context"><div class="loading">Loading</div></div>
      </div>`
    )
  })
}