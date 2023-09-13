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

import React, { Fragment, useEffect, useRef, useState } from 'react';
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Checkbox from '@mui/material/Checkbox';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import SortableItem
  from '../../../../Admin/Dashboard/Form/ListForm/SortableItem'
import { AddButton } from "../../../../../components/Elements/Button";
import { arrayMove } from "../../../../../utils/Array";
import { fetchJSON } from "../../../../../Requests";
import { uniqueList } from "../../../../../utils/main";
import ColorSelector from "../../../../../components/Input/ColorSelector";
import { Creatable, Select } from "../../../../../components/Input";

import './style.scss';

/***
 * Get rule data
 */
const getRuleData = (rule, operator) => {
  const split = rule.split(operator).map(
    _ => _.replaceAll(' ', '').replace('=', '')
  )
  return split[0] === 'x' ? split[1] : split[0]
}


const ruleTypeCategory = 'Category'
const ruleTypeNumber = 'Number'

/**
 * Indicator Rule
 * @param {dict} rule Rule.
 * @param {int} idx Index.
 * @param {Function} onDelete OnDelete.
 * @param {Function} onChange OnChange.
 * @param {dict} type Type.
 * @param {Array} codesChoices.
 */
export function Rule(
  { rule, idx, onDelete, onChange, type, codesChoices }
) {
  const ruleNameName = 'rule_name_' + idx;
  const ruleNameRule = 'rule_rule_' + idx;
  const ruleNameColor = 'rule_color_' + idx;
  const ruleNameOutlineColor = 'rule_outline_color_' + idx;
  const ruleNameOutlineSize = 'rule_outline_size_' + idx;

  const deleteRow = () => {
    onDelete(idx)
  }
  const [currentRule, setCurrentRule] = useState(null);
  const [name, setName] = useState(rule.name);
  const [ruleValue, setRuleValue] = useState(rule.rule);
  const [color, setColor] = useState(rule.color);
  const [outlineColor, setOutlineColor] = useState(rule.outline_color);
  const [outlineSize, setOutlineSize] = useState(rule.outline_size);

  const [includes, setIncludes] = useState('');
  const [equal, setEqual] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  // Code rule
  const [ruleType, setRuleType] = useState(
    type === 'String' ? ruleTypeCategory : ruleTypeNumber
  );

  // When the rule changed
  useEffect(() => {
    rule.name = name
    rule.rule = ruleValue
    rule.color = color
    rule.outline_color = outlineColor
    rule.outline_size = outlineSize
    onChange()
  }, [name, ruleValue, color, outlineColor, outlineSize])

  // Return rule value
  useEffect(() => {
    setCurrentRule(null)
    const value = rule.rule
    const values = value.split('and')
    let equal = ''
    let includes = ''
    let min = ''
    let max = ''
    values.forEach(currentValue => {
      if (currentValue.indexOf("includes") >= 0) {
        includes = JSON.parse(value.replaceAll('.includes("x")', ''))
      } else if (currentValue.indexOf("==") >= 0) {
        equal = getRuleData(currentValue, '==')
      } else if (currentValue.indexOf("<") >= 0) {
        max = getRuleData(currentValue, '<')
      } else if (currentValue.indexOf(">") >= 0) {
        min = getRuleData(currentValue, '>')
      }
    })
    setName(rule.name)
    setColor(rule.color)
    setOutlineColor(rule.outline_color)
    setOutlineSize(rule.outline_size ? rule.outline_size : 0.5)
    setCurrentRule(rule)

    // set formula
    setEqual(equal)
    setMax(max)
    setMin(min)
    setIncludes(includes)
    if (includes) {
      setRuleType(ruleTypeCategory)
    } else if (equal || min || max) {
      setRuleType(ruleTypeNumber)
    }
  }, [rule])

  // Construct rule
  useEffect(() => {
    if (rule === currentRule) {
      let newRule = '';
      if (includes.length) {
        newRule = JSON.stringify(includes) + '.includes("x")'
      } else if (equal !== '') {
        newRule = 'x==' + equal;
      } else if (min !== '' || max !== '') {
        const values = []
        if (min) {
          values.push('x>' + min)
        }
        if (max) {
          values.push('x<=' + max)
        }
        newRule = values.join(' and ');
      }
      setRuleValue(newRule);
    }
  }, [currentRule, equal, min, max, includes])

  const ruleTypeOptions = [ruleTypeNumber, ruleTypeCategory].map(rule => {
    return { value: rule, label: rule }
  })
  return (
    <Fragment>
      <td>
        <div className='RemoveSection'>
          <RemoveCircleIcon
            className='MuiButtonLike RemoveButton' onClick={deleteRow}
          />
        </div>
      </td>
      <td>
        <input
          type="text" name={ruleNameName} value={name}
          spellCheck="false"
          onChange={(evt) => {
            setName(evt.target.value)
          }}/>
      </td>
      <td>
        <div className={'RuleSectionCell ' + ruleType}>
          <div className="RuleSection">
            <Select
              className='RuleSectionSelection RuleSectionSelectionType'
              value={ruleTypeOptions.find(option => option.value === ruleType)}
              options={ruleTypeOptions}
              onChange={evt => {
                setRuleType(evt.value)
                setEqual('')
                setMax('')
                setMin('')
                setIncludes('')
              }}
            />
          </div>
          <div className="RuleSection OrSection">
            <div className="RuleSectionSymbol">▶</div>
          </div>
          {
            ruleType === ruleTypeCategory ?
              <div>
                <input
                  type="text" className="RuleValue"
                  name={ruleNameRule}
                  value={ruleValue}
                  onChange={(evt) => {
                    setRuleValue(evt.target.value)
                  }}/>
                <div className="RuleSection">
                  <div className="RuleSectionSymbol">value</div>
                  <div className="RuleSectionSymbol">in</div>
                  <Creatable
                    menuPlacement={"top"}
                    className='RuleSectionSelection RuleSectionSelectionCategory'
                    noOptionsMessage={() => 'No options, write to create new option.'}
                    options={codesChoices}
                    isMulti
                    value={
                      includes ? includes.map(code => {
                        return {
                          label: code,
                          value: code
                        }
                      }) : []
                    }
                    onCh
                    onChange={evt => {
                      const newCodes = evt.map(row => row.value)
                      setIncludes(newCodes)
                    }}
                  />
                </div>
              </div>
              :
              <Fragment>
                <input type="text" className="RuleValue"
                       name={ruleNameRule}
                       value={ruleValue}
                       onChange={(evt) => {
                         setRuleValue(evt.target.value)
                       }}/>
                <div className="RuleSection">
                  <div className="RuleSectionSymbol">value</div>
                  <div className="RuleSectionSymbol">is</div>
                  <div>
                    <input
                      type="number" spellCheck="false"
                      value={equal}
                      disabled={!!(min !== '' || max !== '')}
                      onChange={(evt) => {
                        setEqual(evt.target.value)
                        setMin('')
                        setMax('')
                      }}
                    />
                  </div>
                </div>
                <div className="RuleSection OrSection">
                  <div className="RuleSectionSymbol">or</div>
                </div>
                <div className="RuleSection">
                  <div>
                    <input
                      type="number" spellCheck="false"
                      className="RuleSectionMin"
                      step="any" value={min}
                      disabled={equal !== ''}
                      onChange={(evt) => {
                        setMin(evt.target.value)
                        setEqual('')
                      }}/>
                  </div>
                  <div
                    className="RuleSectionSymbol RuleSectionSymbolLeft">{'<'}</div>
                  <div className="RuleSectionSymbol">value</div>
                  <div className="RuleSectionSymbol">{'<='}</div>
                  <div>
                    <input
                      type="number" spellCheck="false"
                      className="RuleSectionMax"
                      step="any" value={max}
                      disabled={equal !== ''}
                      onChange={(evt) => {
                        setMax(evt.target.value)
                        setEqual('')
                      }}/>
                  </div>
                </div>
              </Fragment>
          }

          <div className="Separator"/>
        </div>
      </td>
      <td>
        <ColorSelector
          color={color}
          name={ruleNameColor}
          onChange={evt => setColor(evt.target.value)}
        />
      </td>
      <td>
        <ColorSelector
          color={outlineColor}
          name={ruleNameOutlineColor}
          onChange={evt => setOutlineColor(evt.target.value)}
        />
      </td>
      <td>
        <input
          type="number" spellCheck="false"
          name={ruleNameOutlineSize}
          min={0.1}
          step="0.1" value={outlineSize}
          onChange={(evt) => setOutlineSize(evt.target.value)}/>
      </td>
    </Fragment>
  )
}

/**
 * Indicator Other Rule
 * @param {dict} rule Rule.
 * @param {int} idx Index.
 * @param {Function} onChange OnChange.
 */
export const NO_DATA_RULE = 'No data'
export const OTHER_DATA_RULE = 'Other data'

export function IndicatorOtherRule(
  { rule, idx, onChange, nameInput = 'rule' }
) {
  const ruleNameName = nameInput + '_name_' + idx;
  const ruleNameActive = nameInput + '_active_' + idx;
  const ruleNameRule = nameInput + '_rule_' + idx;
  const ruleNameColor = nameInput + '_color_' + idx;
  const ruleNameOutlineColor = nameInput + '_outline_color_' + idx;
  const ruleNameOutlineSize = nameInput + '_outline_size_' + idx;

  const [name, setName] = useState(rule.name);
  const [color, setColor] = useState(rule.color);
  const [active, setActive] = useState(rule.active);
  const [outlineColor, setOutlineColor] = useState(rule.outline_color);
  const [outlineSize, setOutlineSize] = useState(rule.outline_size);

  // When the rule changed
  useEffect(() => {
    rule.name = name
    rule.color = color
    rule.outline_color = outlineColor
    rule.outline_size = outlineSize
    rule.active = active
    onChange()
  }, [name, color, outlineColor, active])

  // When the rule changed
  useEffect(() => {
    if (!outlineSize && outlineSize !== rule.outline_size) {
      setOutlineSize(rule.outline_size)
    }
  }, [rule])

  return (
    <tr className='OtherData'>
      <td colSpan={2}>
        <Checkbox
          checked={active}
          onClick={() => {
            setActive(!active)
          }}
        />
        <input
          type="hidden" name={ruleNameActive} value={active}
          onChange={(evt) => {
          }}/>
      </td>
      <td>
        <input
          type="text" name={ruleNameName} value={name}
          spellCheck="false"
          onChange={(evt) => {
            setName(evt.target.value)
          }}/>
      </td>
      <td>
        <input
          type="text" className="RuleValue"
          name={ruleNameRule}
          value={rule.rule}
          onChange={() => {
          }}/>
        <div className="RuleSection">
          <div className="RuleSectionSymbol">value</div>
          <div className="RuleSectionSymbol">is</div>
          <div>
            <input
              type="text" spellCheck="false"
              value={rule.rule}
              disabled={true}
              onChange={(evt) => {
              }}
            />
          </div>
        </div>
      </td>
      <td>
        <ColorSelector
          color={color}
          name={ruleNameColor}
          onChange={evt => setColor(evt.target.value)}
        />
      </td>
      <td>
        <ColorSelector
          color={outlineColor}
          name={ruleNameOutlineColor}
          onChange={evt => setOutlineColor(evt.target.value)}
        />
      </td>
      <td>
        <input
          type="number" spellCheck="false"
          name={ruleNameOutlineSize}
          min={0.1}
          step="0.1" value={outlineSize}
          onChange={(evt) => setOutlineSize(evt.target.value)}/>
      </td>
    </tr>
  )
}

/** Adding new rule **/
export const newRule = (
  theStyleRules, active, defaultValue, defaultName,
  defaultColor, defaultOutlineColor, defaultOutlineSize, defaultIdx
) => {
  let idx = defaultIdx ? defaultIdx : Math.max(...theStyleRules.map(rule => {
    return rule.id
  }))

  return {
    "id": idx + 1,
    "name": defaultName ? defaultName : "",
    "rule": defaultValue ? defaultValue : "",
    "color": defaultColor ? defaultColor : preferences.style_new_rule_fill_color,
    "outline_color": defaultOutlineColor ? defaultOutlineColor : preferences.style_new_rule_outline_color,
    "outline_size": defaultOutlineSize ? defaultOutlineSize : preferences.style_new_rule_outline_size,
    "active": active,
  }
}

/**
 * Indicator StyleRules
 * @param {Array} inputStyleRules Input rules.
 * @param {Function} onStyleRulesChanged OnChange.
 * @param {dict} valueType Type of Data.
 * @param {string} valuesUrl Url for fetching value.
 * @param {Array} defaultCodeChoices Default code choices.
 */
export default function StyleRules(
  {
    inputStyleRules,
    onStyleRulesChanged,
    valueType,
    valuesUrl,
    defaultCodeChoices = []
  }
) {

  /** Update rule for adding NO DATA RULE and OTHER RULE **/
  const updateStyleRules = (oldStyleRules) => {
    let theStyleRules = []
    if (Array.isArray(oldStyleRules)) {
      theStyleRules = [...oldStyleRules]
    }
    const newStyleRules = []
    theStyleRules.map(rule => {
      if (![NO_DATA_RULE, OTHER_DATA_RULE].includes(rule.rule)) {
        newStyleRules.push(rule)
      }
    })
    const noDataRule = theStyleRules.find(rule => rule.rule === NO_DATA_RULE)
    if (!noDataRule) {
      newStyleRules.push(
        newRule(
          theStyleRules, false, NO_DATA_RULE, NO_DATA_RULE,
          preferences.style_no_data_fill_color,
          preferences.style_no_data_outline_color,
          preferences.style_no_data_outline_size,
          -2
        )
      )
    } else {
      newStyleRules.push(noDataRule)
    }
    const otherDataRule = theStyleRules.find(rule => rule.rule === OTHER_DATA_RULE)
    if (!otherDataRule) {
      newStyleRules.push(
        newRule(
          theStyleRules, false, OTHER_DATA_RULE, OTHER_DATA_RULE,
          preferences.style_other_data_fill_color,
          preferences.style_other_data_outline_color,
          preferences.style_other_data_outline_size,
          -1
        )
      )
    } else {
      newStyleRules.push(otherDataRule)
    }
    return newStyleRules
  }

  const [codesChoices, setCodeChoices] = useState([]);
  const [codesChoicesFromResponse, setCodeChoicesFromResponse] = useState([]);
  const [rules, setStyleRules] = useState(updateStyleRules(inputStyleRules));
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (defaultCodeChoices && JSON.stringify(codesChoices) !== JSON.stringify(defaultCodeChoices)) {
      setCodeChoices(
        defaultCodeChoices.map(code => {
          return {
            label: code,
            value: code
          }
        })
      )
    }
  }, [defaultCodeChoices])

  /** When indicator data type changed */
  useEffect(
    () => {
      (
        async () => {
          if (valuesUrl) {
            try {
              const response = await fetchJSON(valuesUrl, {}, true);
              setCodeChoicesFromResponse(response.map(code => {
                return {
                  label: code,
                  value: code
                }
              }))
            } catch (err) {

            }
          }
        }
      )();
    }, [valuesUrl]
  )

  const prevState = useRef();
  const id = 'StyleRules'
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // When the rule changed
  useEffect(() => {
    setStyleRules(updateStyleRules(inputStyleRules))
  }, [inputStyleRules])

  useEffect(() => {
    if (onStyleRulesChanged) {
      onStyleRulesChanged(rules)
    }
    setItems(
      rules.map((rule, idx) => {
        return idx + 1
      })
    )
  }, [rules])

  /** On delete a row of rule **/
  const onDelete = (idx) => {
    const newStyleRules = []
    items.map(item => {
      if (idx !== item - 1) {
        newStyleRules.push(rules[item - 1])
      }
    })
    setStyleRules([...newStyleRules]);
  }

  const addNewRule = () => {
    const newStyleRules = []
    items.map(item => {
      newStyleRules.push(rules[item - 1])
    })
    setStyleRules(
      updateStyleRules([...newStyleRules, newRule(rules, true)])
    )
  }
  const onChange = () => {
    if (onStyleRulesChanged) {
      onStyleRulesChanged(rules)
    }
  }

  /** When drag event ended **/
  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      const activeIndex = active.data.current.sortable.index;
      const overIndex = over.data.current?.sortable.index || 0;
      let newGroupList = arrayMove(
        items,
        activeIndex,
        overIndex
      )
      setItems(newGroupList)

      if (onStyleRulesChanged) {
        const newStyleRules = []
        newGroupList.map(item => {
          newStyleRules.push(rules[item - 1])
        })
        onStyleRulesChanged(newStyleRules)
      }
    }
  };
  const newChoices = codesChoices.concat(codesChoicesFromResponse)
  const codes = uniqueList(newChoices.map(code => code.value)).map(code => {
    return {
      label: code,
      value: code
    }
  })

  return <DndContext
    sensors={sensors}
    onDragEnd={handleDragEnd}
  >
    <table id="RuleTable" className='BasicForm'>
      <thead>
      <tr className="RuleTable-Header">
        <th colSpan="2"></th>
        <th valign="top">Name</th>
        <th valign="top">Rule</th>
        <th valign="top">Color</th>
        <th valign="top">Outline Color</th>
        <th valign="top">Outline Width</th>
      </tr>
      <tr className="RuleTable-Help">
        <th valign="top" colSpan="2"></th>
        <th valign="top" colSpan="2">
          <div>
            The values for each rule can either be:
            <ul>
              <li>{
                `Text-based items that map to a number (e.g.
                    'Worsening' maps to value '1'). In this case, you
                    should use the '=' box below to declare one value
                    per rule text option. When harvesting from a
                    datasource, that
                    datasource can contain either numeric or text
                    values for the indicator.`
              }
              </li>
              <li>{
                `Number based items in a range that map to a
                    rule (e.g. '1 to 5' maps to 'Worsening'). In
                    this case, use the upper and lower range options
                    individually or together to define the ranges (e.g.
                    'Worsening' <= 5,
                    'Better' > 5 and <= 10). When harvesting from a
                    datasource, that datasource can contain ONLY
                    numeric values for the indicator.`
              }</li>
            </ul>
          </div>
        </th>
        <th valign="top">
        <span className='ColorConfigLabel'>
            Used for filling the geometry.
            Put the hex color with # (e.g. #ffffff).
        </span>
        </th>
        <th valign="top">
        <span className='ColorConfigLabel'>
            Used for coloring the outline of the geometry.
            Put the hex color with # (e.g. #ffffff).
        </span>
        </th>
        <th valign="top">
        <span>
            Change width of the outline (in px)
        </span>
        </th>
      </tr>
      </thead>
      <tbody key={id} id={id} style={style} ref={setNodeRef}>
      <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
        {
          items.map(item => {
            const idx = item - 1;
            let rule = rules[item - 1]
            if (rule) {
              rule = ![
                NO_DATA_RULE, OTHER_DATA_RULE
              ].includes(rule.rule) ? rule : null
            }
            return rule ? <SortableItem key={rule.id} id={item}>
              <Rule
                key={rule.id} rule={rule} idx={idx}
                onDelete={onDelete}
                onChange={onChange}
                type={valueType}
                codesChoices={codes}
              /></SortableItem> : ""

          })
        }
      </SortableContext>
      {
        items.map(item => {
          const idx = item - 1;
          let rule = rules[item - 1]
          if (rule) {
            rule = [
              NO_DATA_RULE, OTHER_DATA_RULE
            ].includes(rule.rule) ? rule : null
          }
          return rule ?
            <IndicatorOtherRule
              key={rule.id} rule={rule} idx={idx}
              onChange={onChange}
            /> : ""

        })
      }
      <tr className='Rule-Divider'>
        <td colSpan={5}>
        </td>
      </tr>
      </tbody>
      <tbody>
      <tr className='Rule-Add'>
        <td colSpan={7}>
          <AddButton
            variant="primary"
            text="Add New Rule"
            onClick={addNewRule}
          />
        </td>
      </tr>
      </tbody>
    </table>
  </DndContext>
}