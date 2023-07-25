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

/**
 * POPUP that using nunjucks
 */
import { dictDeepCopy } from "../../../utils/main";
import { nunjucksContent } from "../../../components/Nunjucks";

// -------------------------------------------------
// New popup
// -------------------------------------------------

/**
 * Render popup
 */
export function renderPopup(content) {
  return `
    <div class='maplibregl-popup-content-wrapper'>${content}</div>
    <div class="maplibregl-popup-tip mapboxgl-popup-tip"></div>`;
}

/**
 * Return template content
 */
export function renderTemplateContent(template, context, title, defaultTemplateInput) {
  if (title) {
    context.title = title
  }
  return nunjucksContent(template, context, defaultTemplateInput);
}

export const defaultTemplate = `
    {% if title %}
      <div class="header" style="background: {{ title.color }}"><b>{{ title.name }}</b></div>
    {% endif %}
    <div class="content">
      <table>
        {% for key, value in context %}
          <tr>
            <td valign="top"><b>{{ key | capitalize | humanize }}</b></td><td valign="top">{{ value | safe }}</td>
          </tr>
        {% endfor %}
      </table>
    </div>
`

/**
 * Returning popup from template with context
 * @param {string} template Template that will be rendered.
 * @param {Object} context Context that will be calculated.
 * @param {string} title Title of data.
 */
export function popupTemplate(template, context, title) {
  context = dictDeepCopy(context)
  if (!template) {
    template = defaultTemplate
  }
  if (!context['context']) {
    context.context = { ...context }
  }
  const content = renderTemplateContent(template, context, title);
  // Render the content
  return renderPopup(content);
}