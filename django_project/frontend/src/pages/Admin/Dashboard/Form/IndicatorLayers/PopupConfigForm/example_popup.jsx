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

export const ExamplePopup = `
<!--  CUSTOM STYLE -->
<style>
    .popup-content tr td {
        padding: 2px 10px;
    }
</style>

<!--  HEADER  -->
<div class="header">
    <b>indicator value for a given admin unit</b>
</div>

<!--  CONTENT  -->
<div class="popup-content">
    <table>
        <tr>
            <td valign="top">INDICATOR_A</td>
            <td valign="top">
                {% set valuesInTime = [] %}
                {% for i in context.admin_boundary.indicators["INDICATOR_A"] %}
                    {% if context.timeslice.range_start <= i['time'] and context.timeslice.range_end >= i['time'] %}
                        {% set valuesInTime = (valuesInTime.push(i), valuesInTime) %}
                    {% endif %}
                {% endfor %}
                {{ valuesInTime[0]['value'] }}
            </td>
        </tr>
    </table>
</div>

<!--  HEADER  -->
<div class="header">
    <b>Siblings (MAX)</b>
</div>

<!--  CONTENT  -->
<div class="popup-content">
    <table>
        <tr>
            <td valign="top">INDICATOR_A</td>
            {% set value = {} %}
            {% for i in context.admin_boundary.siblings %}
                {% set valuesInTime = [] %}
                {% for j in i.indicators["INDICATOR_A"] %}
                    {% if context.timeslice.range_start <= j['time'] and context.timeslice.range_end >= j['time'] %}
                        {% set valuesInTime = (valuesInTime.push(j), valuesInTime) %}
                    {% endif %}
                {% endfor %}
                {% if valuesInTime[0]['value'] %}
                    {% if not value['value'] or valuesInTime[0]['value'] > value['value'] %}
                        {% set value = {'value':valuesInTime[0]['value'], 'name':i['name']} %}
                    {% endif %}
                {% endif %}
            {% endfor %}
            <td valign="top">
                {% if value['value'] %}
                    {{ value['value'] }} in {{ value['name'] }}
                {% endif %}
            </td>
        </tr>
    </table>
</div>
`