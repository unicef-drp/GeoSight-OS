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
import { capitalize } from "../../../../../utils/main";
import { Session } from "../../../../../utils/Sessions";
import { RelatedTableLayerType } from "../../../../../utils/indicatorLayer";
import { queryData } from "../../../../../utils/queryExtraction";

export const referenceSimpleDefaultTemplate = `
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
    {% for obj in context.current.simplified %}
      {% if obj.key not in ['attributes'] %}
        <tr>
            <td valign="top"><b>{{ obj.key | capitalize | humanize }}</b></td>
            <td valign="top">{{ obj.value | safe }}</td>
        </tr>
      {% else %}
        <tr id="popup-attributes-wrapper">
            <td valign="top" colspan="2" style="text-align: center">
                Loading attributes
            </td>
        </tr>        
      {% endif %}        
    {% endfor %}
  </table>
</div>
{% endif %}
`;

export const referenceLayerDefaultTemplate = `
<!--  CUSTOM STYLE -->
<style>
    .popup-content tr td {
        padding: 2px 10px;
    }
</style>

<!--  HEADER  -->
<div class="header">
    {% set name = context.current.geometry_data.name %}
    <b>{{ name }}</b>
</div>

<!--  CONTENT  -->
<div class="content">
    {% set indicator = context.current.indicator_layers[0].name %}
    {% set value = context.current.indicator_layers[0].value %}
    {% set label = context.current.indicator_layers[0].label %}
    {% set time = context.current.indicator_layers[0].time %}
    {% set attributes = context.current.indicator_layers[0].attributes %}
    
    {% set admin_level = context.current.geometry_data.admin_level %}
    {% set admin_level_name = context.current.geometry_data.admin_level_name %}
    {% set concept_uuid = context.current.geometry_data.concept_uuid %}
    {% set geom_code = context.current.geometry_data.geom_code %}
    {% set name = context.current.geometry_data.name %}

    <table></table>
</div>
`;

function renderRow(name, alias) {
  return `
        <tr>
            <td><b>${alias}</b></td>
            <td>{{ ${name} }}</td>
        </tr>
  `;
}

export function getDefaultPopup(currentIndicatorLayer) {
  let table = "";
  currentIndicatorLayer?.data_fields?.map((field) => {
    const names = field.name.split(".");
    let name = names[names.length - 1];
    if (field.name === "context.current.indicator.name") {
      name = "indicator";
    } else if (field.name === "context.current.indicator.date") {
      name = "time";
    }
    if (field.visible) {
      if (field.name !== "context.current.indicator.attributes") {
        table += renderRow(name, field.alias);
      } else {
        table += `
          {% if attributes %}
            {% for key, value in attributes %}
                  <tr>
                      <td valign="top"><b>{{ key | capitalize | humanize }}</b></td>
                      <td valign="top">{{ value | safe }}</td>
                  </tr>
            {% endfor %}
        {% endif %}
        `;
      }
    }
  });
  return referenceLayerDefaultTemplate.replace(
    "<table></table>",
    `<table>${table}</table>`,
  );
}

export function updateCurrent(
  context,
  indicators,
  relatedTables,
  currentIndicatorLayer,
  currentIndicatorSecondLayer,
  indicatorValueByGeometry,
  indicatorSecondValueByGeometry,
  geom_id,
) {
  $("#popup-attributes-wrapper").html("");
  let indicatorsByDict = {};
  let relatedTableByDict = {};
  [currentIndicatorLayer, currentIndicatorSecondLayer].map((indicatorLayer) => {
    indicatorLayer?.indicators?.map((obj) => {
      const objFound = indicators.find((ind) => ind.id === obj.id);
      if (objFound) {
        indicatorsByDict[objFound.id] = {
          name: objFound.name,
          description: objFound.description,
          last_update: objFound.last_update,
          shortcode: objFound.shortcode,
        };
      }
    });
    indicatorLayer?.related_tables?.map((obj) => {
      const objFound = relatedTables.find((ind) => ind.id === obj.id);
      if (objFound) {
        relatedTableByDict[objFound.id] = {
          name: objFound.name,
          description: objFound.description,
          creator: objFound.creator,
          created_at: objFound.created_at,
        };
      }
    });
  });
  [indicatorValueByGeometry, indicatorSecondValueByGeometry].map((values) => {
    values[geom_id]?.map((data) => {
      let relatedName = "";
      if (data.related_table?.related_table) {
        const relatedNames = data.related_table?.related_table.split("(");
        relatedNames.pop();
        relatedName = relatedNames.join("(");
      }
      if (!data.date && data.time) {
        data.date = new Date(data.time * 1000)
          .toISOString()
          .replace(".000Z", "+00:00");
      }
      if (!data.date) {
        return;
      }
      const _data = {
        name: data.indicator?.name ? data.indicator?.name : relatedName,
        time: data.date.includes("T")
          ? data.date
          : data.date + "T00:00:00+00:00",
        value: data.value,
        label: data.label,
      };
      if (data.indicator) {
        // ------------------------------------
        // Find Attributes
        // ------------------------------------
        try {
          const drilldownIndicatorData =
            context.context.admin_boundary.indicators[data.indicator.shortcode];
          if (drilldownIndicatorData) {
            let fullDate = data.date;
            if (!data.date.includes("T")) {
              const dates = data.date.split("-");
              dates.reverse();
              fullDate = dates.join("-") + "T00:00:00+00:00";
            }
            const drilldownIndicatorCurrentData = drilldownIndicatorData.find(
              (data) => data.time === fullDate,
            );
            if (drilldownIndicatorCurrentData?.attributes) {
              _data.attributes = drilldownIndicatorCurrentData?.attributes;
              if (_data.attributes) {
                for (const [key, value] of Object.entries(_data.attributes)) {
                  $("#popup-attributes-wrapper").before(`
                    <tr>
                        <td valign="top"><b>${capitalize(key)}</b></td>
                        <td valign="top">${value}</td>
                    </tr>
                  `);
                }
              }
            }
          }
        } catch (err) {}
        indicatorsByDict[data.indicator.id] = {
          ...indicatorsByDict[data.indicator.id],
          ..._data,
        };
      } else if (data.related_table) {
        relatedTableByDict[data.related_table.id] = {
          ...relatedTableByDict[data.related_table.id],
          ..._data,
        };
      } else {
        // if the value is using indicator layers
        context.context.current.indicator_layers.map((indicatorLayer) => {
          if (indicatorLayer.id === data.indicatorLayer.id) {
            indicatorLayer.data = _data;
          }
        });
      }
      context.context.current.indicator_layers.map((indicatorLayer) => {
        const relatedTable = indicatorLayer.related_tables?.find(
          (indicator) => indicator.id === data.related_table?.id,
        );
        const indicator = indicatorLayer.indicators?.find(
          (indicator) => indicator.id === data.indicator?.id,
        );
        if (indicatorLayer.id === data.indicatorLayer?.id) {
          indicatorLayer.time = _data.time;
          indicatorLayer.value = _data.value;
          indicatorLayer.label = _data.label;
          if (_data.attributes) {
            indicatorLayer.attributes = _data.attributes;
          }
        } else if (indicator) {
          indicatorLayer.time = _data.time;
          indicatorLayer.value = _data.value;
          indicatorLayer.label = _data.label;
          indicator.time = _data.time;
          indicator.value = _data.value;
          indicator.label = _data.label;
          if (_data.attributes) {
            indicatorLayer.attributes = _data.attributes;
          }
        } else if (relatedTable) {
          indicatorLayer.time = _data.time;
          indicatorLayer.value = _data.value;
          indicatorLayer.label = _data.label;
          relatedTable.time = _data.time;
          relatedTable.value = _data.value;
          relatedTable.label = _data.label;
          if (_data.attributes) {
            indicatorLayer.attributes = _data.attributes;
          }
        }
      });
    });
  });

  const indicatorsContext = Object.keys(indicatorsByDict).map(
    (key) => indicatorsByDict[key],
  );
  const relatedTableContext = Object.keys(relatedTableByDict).map(
    (key) => relatedTableByDict[key],
  );
  if (indicatorsContext) {
    context.context.current["indicators"] = indicatorsContext;
  }
  if (relatedTableContext) {
    context.context.current["related_tables"] = relatedTableContext;
  }
  return context;
}

export function getContext(
  indicators,
  relatedTables,
  indicatorValueByGeometry,
  indicatorSecondValueByGeometry,
  geom_id,
  geometryProperties,
  selectedGlobalTime,
  selectedGlobalTimeConfig,
  indicatorLayers,
  referenceLayerData,
  currentIndicatorLayer,
  currentIndicatorSecondLayer,
  contextOnLoad,
  contextOnError,
) {
  let current = {};
  current["indicator_layers"] = [];
  [currentIndicatorLayer, currentIndicatorSecondLayer].map((indicatorLayer) => {
    if (indicatorLayer.id) {
      current["indicator_layers"].push({
        id: indicatorLayer.id,
        name: indicatorLayer.name,
        description: indicatorLayer.description,
        indicators: indicatorLayer.indicators?.map((obj) => {
          const objFound = indicators.find((ind) => ind.id === obj.id);
          return {
            id: objFound.id,
            name: objFound.name,
            shortcode: objFound.shortcode,
            description: objFound.description,
          };
        }),
        related_tables: indicatorLayer.related_tables?.map((obj) => {
          const objFound = relatedTables.find((ind) => ind.id === obj.id);
          return {
            id: objFound.id,
            name: objFound.name,
            description: objFound.description,
          };
        }),
      });
    }
  });
  current["geometry_data"] = geometryProperties;
  const timeslice = {
    active_window_start: selectedGlobalTime.min,
    active_window_end: selectedGlobalTime.max,
    range_start: selectedGlobalTimeConfig.minDate,
    range_end: selectedGlobalTimeConfig.maxDate,
    interval: selectedGlobalTimeConfig.interval,
  };

  const indicatorLayersConfig = {};
  indicatorLayers.map((indicatorLayer) => {
    if (indicatorLayer?.config?.date_field) {
      indicatorLayersConfig[indicatorLayer.related_tables[0].id] = {
        date_field: indicatorLayer.config.date_field,
        date_format: indicatorLayer.config.date_format
          ? indicatorLayer.config.date_format
          : null,
      };
    }
  });

  // Fetch drilldown
  const url = urls.drilldown.replace("geom_id", geom_id);
  const params = {
    rtconfigs: JSON.stringify(indicatorLayersConfig),
    reference_layer_uuid: referenceLayerData?.data?.uuid
      ? referenceLayerData?.data?.uuid
      : referenceLayerData?.data?.identifier,
  };
  const session = new Session("FetchingPopupContext");
  fetchingData(url, params, {}, function (admin_boundary, error) {
    if (!session.isValid) {
      return;
    }
    if (error) {
      if (contextOnError) {
        contextOnError(error);
      }
    } else {
      let context = {
        current,
        timeslice,
        admin_boundary,
      };
      updateContextData(
        context,
        referenceLayerData,
        currentIndicatorLayer,
        currentIndicatorSecondLayer,
      );
      if (contextOnLoad) {
        contextOnLoad(
          updateCurrent(
            { context: context },
            indicators,
            relatedTables,
            currentIndicatorLayer,
            currentIndicatorSecondLayer,
            indicatorValueByGeometry,
            indicatorSecondValueByGeometry,
            geom_id,
          ),
        );
      }
    }
  });
  return {
    context: {
      current,
    },
  };
}

/*** Handle popup ***/
export function popup(
  map,
  FILL_LAYER_ID,
  indicators,
  indicatorsData,
  relatedTables,
  relatedTableData,
  indicatorLayers,
  currentIndicatorLayer,
  currentIndicatorSecondLayer,
  indicatorValueByGeometry,
  indicatorSecondValueByGeometry,
  compareMode,
  geomFieldOnVectorTile,
  selectedGlobalTimeConfig,
  selectedGlobalTime,
  referenceLayerData,
) {
  addPopup(map, FILL_LAYER_ID, (featureProperties) => {
    let geom_id = extractCode(featureProperties, geomFieldOnVectorTile);
    let levelName = featureProperties.type;
    if (!levelName) {
      const levelFound = referenceLayerData?.data?.dataset_levels?.find(
        (level) => level.level === featureProperties.level,
      );
      levelName = levelFound?.level_name;
    }
    let geometryProperties = {
      name: featureProperties.label,
      geom_code: featureProperties.ucode,
      admin_level: featureProperties.level,
      admin_level_name: levelName,
      concept_uuid: featureProperties.concept_uuid,
    };
    const geomCode = geom_id;
    let context = getContext(
      indicators,
      relatedTables,
      indicatorValueByGeometry,
      indicatorSecondValueByGeometry,
      geom_id,
      geometryProperties,
      selectedGlobalTime,
      selectedGlobalTimeConfig,
      indicatorLayers,
      referenceLayerData,
      currentIndicatorLayer,
      currentIndicatorSecondLayer,
      function contextOnLoad(context) {
        $("#" + geomCode + " .copy-context").html(
          `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root css-1om0hkc" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ContentCopyIcon"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg> Copy context`,
        );
        $("#" + geomCode + " .copy-context").addClass("HasContent");
        $("#" + geomCode + " .copy-context").click(function () {
          navigator.clipboard.writeText(JSON.stringify(context, null, 2)).then(
            () => {
              alert("Context copied to clipboard");
            },
            () => {},
          );
        });
        $("#" + geomCode + " .template-content").html(
          renderTemplateContent(currentIndicatorLayer.popup_template, context),
        );
      },
    );

    let rawData = null;
    let rawDataContent = "";
    if (
      currentIndicatorLayer.raw_data_popup_enable &&
      currentIndicatorLayer.type === RelatedTableLayerType
    ) {
      const relatedTable = relatedTables.find(
        (rt) => currentIndicatorLayer.related_tables[0]?.id === rt.id,
      );
      if (relatedTable) {
        // Get the geocode from feature properties
        // Based on related table geography code type
        const geoFieldType = relatedTable.geography_code_type;
        const geoCode = featureProperties[geoFieldType];

        const geoField = relatedTable.geography_code_field_name;
        let where = currentIndicatorLayer?.config?.where;
        const geomWhere = `${geoField} = '${geoCode}`;
        where = where ? where + ` AND ${geomWhere}'` : geomWhere;
        console.log(where);
        const data =
          relatedTableData[currentIndicatorLayer.related_tables[0].id]?.data;
        if (data) {
          const fields = currentIndicatorLayer.raw_data_popup_config?.filter(
            (field) => field.visible,
          );
          if (fields?.length) {
            try {
              rawData = queryData(
                data,
                where,
                fields
                  .map((field) => `[${field.name}] AS [${field.alias}]`)
                  .join(`,`),
              );
            } catch (err) {
              console.error("Error on RT popup query");
            }
          }
        }
        console.log(rawData);
      }
    }
    if (rawData?.length) {
      const content = [];
      rawData.map((data, idx) => {
        const rows = [];
        Object.keys(data).forEach((key) => {
          rows.push(`<tr><td><b>${key}</b></td><td>${data[key]}</td></tr>`);
        });
        content.push(
          `<table id="row-data-${idx + 1}" class="maplibregl-popup-content-raw-data-row-data ${idx === 0 ? "selected" : ""}">${rows.join("")}</table>`,
        );
      });
      rawDataContent += `
        <div class="maplibregl-popup-content-tabs">
            <div class="maplibregl-popup-content-tab selected" onclick="document.querySelectorAll('.maplibregl-popup-content-tab').forEach(t=>t.classList.remove('selected')); this.classList.add('selected'); document.querySelector('.maplibregl-popup-content-main').style.display = 'block'; document.querySelector('.maplibregl-popup-content-raw-data').style.display = 'none';">Main</div>
            <div class="maplibregl-popup-content-tab" onclick="document.querySelectorAll('.maplibregl-popup-content-tab').forEach(t=>t.classList.remove('selected')); this.classList.add('selected'); document.querySelector('.maplibregl-popup-content-main').style.display = 'none'; document.querySelector('.maplibregl-popup-content-raw-data').style.display = 'block';">Related Records</div>
        </div>
        <div class="maplibregl-popup-content-raw-data content">
            ${content.join("")}
            <div 
                class="pagination" data-count="${content.length}" data-idx="1">
                <div class="maplibregl-popup-content-raw-data-prev disabled" onclick="
                    const pagination = document.querySelector('.pagination');
                    const count = Number(pagination.dataset.count);
                    const idx = Number(pagination.dataset.idx);
                    if (idx === 1) return;
                    const next = idx - 1;
                    document.querySelector('.maplibregl-popup-content-raw-data-prev').classList.remove('disabled');
                    document.querySelector('.maplibregl-popup-content-raw-data-next').classList.remove('disabled');
                    if (next === 1 ) document.querySelector('.maplibregl-popup-content-raw-data-prev').classList.add('disabled');
                    document.querySelector('.maplibregl-popup-content-raw-data-indicator').textContent = next;
                    pagination.dataset.idx = next;
                    document.querySelectorAll('.maplibregl-popup-content-raw-data-row-data').forEach(el => {
                      el.classList.remove('selected');
                    })
                    document.querySelector('#row-data-'+next).classList.add('selected');
                ">
                    <svg version="1.1" id="icons_1_" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 128 128" xml:space="preserve"><style>.st0{display:none}.st1{display:inline}.st2{fill:#0a0a0a}</style><g id="row2_1_"><g id="_x32__4_"><path class="st2" d="M64 .3C28.7.3 0 28.8 0 64s28.7 63.7 64 63.7 64-28.5 64-63.7S99.3.3 64 .3zm0 121C32.2 121.3 6.4 95.7 6.4 64 6.4 32.3 32.2 6.7 64 6.7s57.6 25.7 57.6 57.3c0 31.7-25.8 57.3-57.6 57.3zm22.4-63.7H57.6l12.3-15.2c0-2.2-1.8-3.9-3.9-3.9h-7.1L32 64l26.8 25.5H66c2.2 0 3.9-1.8 3.9-3.9L57.1 69.9h28.6c2.2 0 3.9-1.8 3.9-3.9v-4c0-2.1-1-4.4-3.2-4.4z" id="left_1_"/></g></g></svg>
                </div>
                <div><span class="maplibregl-popup-content-raw-data-indicator">1</span> / ${content.length}</div>
                <div class="maplibregl-popup-content-raw-data-next" onclick="
                    const pagination = document.querySelector('.pagination');
                    const count = Number(pagination.dataset.count);
                    const idx = Number(pagination.dataset.idx);
                    if (idx === count) return;
                    const next = idx + 1;
                    document.querySelector('.maplibregl-popup-content-raw-data-prev').classList.remove('disabled');
                    document.querySelector('.maplibregl-popup-content-raw-data-next').classList.remove('disabled');
                    if (next === count ) document.querySelector('.maplibregl-popup-content-raw-data-next').classList.add('disabled');
                    document.querySelector('.maplibregl-popup-content-raw-data-indicator').textContent = next;
                    pagination.dataset.idx = next;
                    document.querySelectorAll('.maplibregl-popup-content-raw-data-row-data').forEach(el => {
                      el.classList.remove('selected');
                    });
                    document.querySelector('#row-data-'+next).classList.add('selected');
                ">
                    <svg version="1.1" id="icons_1_" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 128 128" xml:space="preserve"><style>.st0{display:none}.st1{display:inline}.st2{fill:#0a0a0a}</style><g id="row2_1_"><g id="_x33__3_"><path class="st2" d="M64 .3C28.8.3.3 28.8.3 64s28.5 63.7 63.7 63.7 63.7-28.5 63.7-63.7S99.2.3 64 .3zm0 121C32.3 121.3 6.7 95.7 6.7 64 6.7 32.3 32.3 6.7 64 6.7c31.7 0 57.3 25.7 57.3 57.3 0 31.7-25.6 57.3-57.3 57.3zm-2-82.8c-2.2 0-3.9 1.8-3.9 3.9l12.2 15.2H41.7c-2.2 0-3.2 2.2-3.2 4.4v4c0 2.2 1.8 3.9 3.9 3.9h28.4L58.1 85.6c0 2.2 1.8 3.9 3.9 3.9h7.1L95.8 64 69.1 38.5H62z" id="right_1_"/></g></g></svg>
                </div>
            </div>
        </div>
    `;
    }

    if (currentIndicatorLayer.popup_type === "Custom") {
      return renderPopup(
        `
            ${rawDataContent}
            <div id="${geomCode}" class="maplibregl-popup-content-main">
              <div class="template-content"><div class="loading">Loading</div></div>
              <div class="copy-context"></div>
            </div>`,
      );
    }

    try {
      context = updateCurrent(
        context,
        indicators,
        relatedTables,
        currentIndicatorLayer,
        currentIndicatorSecondLayer,
        indicatorValueByGeometry,
        indicatorSecondValueByGeometry,
        geom_id,
      );
    } catch (err) {}

    // If not custom
    if (currentIndicatorLayer.popup_type !== "Custom") {
      try {
        const popupContext = new Map();
        currentIndicatorLayer.data_fields.map((field) => {
          if (!field.visible) {
            return;
          }
          if (field.name === "context.current.indicator.attributes") {
            popupContext.set("attributes", null);
            return;
          }

          const geometryDataId = "context.current.geometry_data.";
          if (field.name.includes(geometryDataId)) {
            const contextField = field.name.replace(geometryDataId, "");
            popupContext.set(
              field.alias,
              context?.context?.current?.geometry_data[contextField],
            );
          }
          const indicatorId = "context.current.indicator.";
          if (field.name.includes(indicatorId)) {
            const contextField = field.name.replace(indicatorId, "");

            // For indicators
            context?.context?.current?.indicators.map((indicator) => {
              popupContext.set(field.alias, indicator[contextField]);
            });

            // For related tables
            context?.context?.current?.related_tables.map((indicator) => {
              popupContext.set(field.alias, indicator[contextField]);
            });

            // For indicator layers
            context?.context?.current?.indicator_layers.map((indicator) => {
              if (indicator.data) {
                popupContext.set(field.alias, indicator[contextField]);
              }
            });
          }
        });
        context.context.current.simplified = [];
        for (var [key, value] of popupContext.entries()) {
          context.context.current.simplified.push({
            key: key,
            label: key,
            value: value,
          });
        }
      } catch (err) {}
    }
    return renderPopup(
      `
        ${rawDataContent}
        <div id="${geomCode}" class="maplibregl-popup-content-main">
          ${renderTemplateContent(
            currentIndicatorLayer.popup_template &&
              currentIndicatorLayer.popup_type !== "Simplified"
              ? currentIndicatorLayer.popup_template
              : referenceSimpleDefaultTemplate,
            context,
          )}
          <div class="copy-context"><div class="loading">Loading</div></div>
      </div>`,
    );
  });
}
