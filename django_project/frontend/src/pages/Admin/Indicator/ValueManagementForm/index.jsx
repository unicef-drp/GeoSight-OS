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
import $ from "jquery";
import axios from "axios";
import TextField from "@mui/material/TextField";
import DatePicker from "react-datepicker";
import Moment from "moment";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Admin, { pageNames } from '../../index';
import {
  SaveButton,
  ThemeButton
} from "../../../../components/Elements/Button";
import { SelectWithList } from "../../../../components/Input/SelectWithList";
import InputFile from './InputFile'
import { axiosGet } from '../../../../utils/georepo'
import { jsonToXlsx } from '../../../../utils/main'
import {
  Notification,
  NotificationStatus
} from "../../../../components/Notification";
import { RefererenceLayerUrls } from "../../../../utils/referenceLayer";

import './style.scss';
import DatasetViewSelector
  from "../../../../components/ResourceSelector/DatasetViewSelector";

export function InputForm({ type, placeholder, name, initValue }) {
  const [value, setValue] = useState(initValue)

  useEffect(() => {
    setValue(initValue)
  }, [initValue])
  return <TextField
    value={value} type={type} placeholder={placeholder} name={name}
    onChange={(evt) => {
      setValue(evt.target.value)
    }
    }
  />
}

/**
 * ValueManagementMap Form App
 */
export default function ValueManagement() {
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState(null)
  const [level, setLevel] = useState(null)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [date, setDate] = useState(new Date())

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity)
  }

  const fetchData = (level, page) => {
    axiosGet(level.url, { page: page }).then(response => {
      const data = response.data
      if (!level.layer) {
        level.layer = []
      }
      level.layer = level.layer.concat(data.results)
      page += 1
      if (page > data.total_page) {
        level.finished = true
      }
      level.page = page
      setReference({ ...reference })
    });
  }

  // When reference changed
  useEffect(() => {
    setError('')
    setData(null)
    if (reference) {
      const referenceLayer = reference
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
          if (referenceLayer.data[0]) {
            setLevel(referenceLayer.data[0].value)
          }
          setReference({ ...referenceLayer })
        });
      } else {
        // Check levels
        const referenceLayerLevel = referenceLayer.data.filter(refLevel => {
          return refLevel.level === level
        })[0]
        if (referenceLayerLevel === undefined) {
          return
        }
        if (!referenceLayerLevel.finished) {
          fetchData(referenceLayerLevel, !referenceLayerLevel.page ? 1 : referenceLayerLevel.page)
        } else {
          if (referenceLayerLevel.layer) {
            const featureData = {}
            referenceLayerLevel.layer.map(feature => {
              const identifier = feature?.ucode;
              if (!identifier) {
                return
              }
              featureData[identifier] = {
                name: feature.name,
                lastValue: valueDataList[identifier],
                ext_codes: feature.ext_codes
              }
            })

            let sortedData = Object.keys(featureData).map(function (key) {
              return [key, featureData[key]];
            });
            sortedData.sort(function (a, b) {
              if (b[1].name > a[1].name) {
                return -1;
              } else if (b[1].name < a[1].name) {
                return 1;
              }
              return 0;
            });
            setData(sortedData)
          }
        }
      }
    } else {
      setReference(reference)
    }
  }, [reference, level])

  // Check reference layer
  let referenceLayer = null
  let levelData = null
  if (reference) {
    referenceLayer = reference
    if (referenceLayer?.data) {
      levelData = referenceLayer.data.find(row => {
        return row.level === level
      })
    }
  }

  // Download template
  const downloadTemplate = () => {
    if (levelData?.finished && data) {
      const templateData = []
      data.map(row => {
        templateData.push(
          Object.assign({}, {
            GeographyCode: row[0],
            GeographyName: row[1].name,
            Value: "",
            ExtraName1: "",
            ExtraName2: "",
            ucode: row[0],
          }, row[1].ext_codes)
        )
      })
      jsonToXlsx(templateData, referenceLayer?.name + "." + levelData?.level_name + ".Template.xls")
    }
  }

  /*** Submit **/
  const submit = () => {
    event.preventDefault();
    var form = $('#form')[0]; // You need to use standard javascript object here
    var formData = new FormData(form);
    axios.post(document.location.href, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfmiddlewaretoken
      }
    }).then(response => {
      notify('Data already saved!', NotificationStatus.SUCCESS)
      setTimeout(() => {
        window.location = document.location.href;
      }, 500);
    }).catch(error => {
      notify(error.response.data, NotificationStatus.ERROR)
    })
  }

  return (
    <form id='form' className="BasicForm" method="post"
          encType="multipart/form-data">
      <input type="hidden" name="csrfmiddlewaretoken"
             value={csrfmiddlewaretoken}/>
      <Admin
        className='Indicator'
        pageName={pageNames.Indicators}
        rightHeader={
          <Fragment>
            <DatePicker
              name='date'
              dateFormat="yyyy-MM-dd"
              selected={date ? new Date(date) : ""}
              onChange={date => {
                setDate(Moment(date).format('YYYY-MM-DD'))
              }}
            />
            <SaveButton
              variant="primary"
              text="Submit"
              onClick={evt => {
                submit()
              }}
            />
          </Fragment>
        }>

        <div className='ManagementForm'>
          <div className='TopButtons'>

            <ThemeButton
              disabled={!levelData?.finished || !data}
              variant="primary"
              onClick={() => downloadTemplate()}
            >
              Download XLS template
            </ThemeButton>
            <ThemeButton variant="primary" onClick={() => setOpen(true)}>
              Use File to Refill Form
            </ThemeButton>
          </div>
          <div className='ReferenceLayerSelection'>
            <b className='light'>View</b>
          </div>
          <div className='ReferenceLayerSelection'>
            <input name={'reference_layer'}
                   type={'text'}
                   value={reference?.identifier ? reference.identifier : ''}
                   hidden/>
            <DatasetViewSelector
              initData={
                reference?.identifier ? [
                  {
                    id: reference.identifier,
                    uuid: reference.identifier, ...reference
                  }
                ] : []
              }
              dataSelected={(selectedData) => {
                const reference = selectedData[0]
                setReference(reference)
              }}
            />
          </div>
          <div className='ReferenceLayerSelection'>
            <b className='light'>Admin Level</b>
          </div>
          <div className='ReferenceLayerSelection'>
            <SelectWithList
              name='admin_level'
              list={referenceLayer && referenceLayer.data}
              value={level}
              onChange={evt => {
                setLevel(evt.value)
              }}
            />
          </div>
          <div className='ReferenceLayerSelection'>
            {error ? <div className='error'>{error}</div> : ''}
          </div>
          <div className='ReferenceLayerTable'>
            <table>
              <tbody>
              {
                data ?
                  data.map(row => {
                    return (
                      <tr key={row[0]}>
                        <td
                          valign='top'
                          className='ReferenceLayerTable-Name'>{row[1].name}</td>
                        <td>
                          <div>
                            <InputForm
                              initValue={row[1].value}
                              placeholder='New Value'
                              name={'geometry:' + row[0]}/>
                          </div>
                          <div className='ExtraValue'>
                            <div className='ExtraValueTitle form-helptext'>
                              <div>Attributes</div>
                              <div className='ExtraValueIcon MuiButtonLike'>
                                <AddCircleOutlineIcon onClick={() => {
                                  if (!row[1].extras) {
                                    row[1].extras = []
                                  }
                                  row[1].extras.push({
                                    name: "",
                                    value: ""
                                  })
                                  setData([...data])
                                }}/>
                              </div>
                            </div>
                            <div className='ExtraValueContent'>
                              {
                                row[1].extras ? row[1].extras.map((extra, idx) => {
                                  return (
                                    <div className='ExtraValueContentRow'
                                         key={idx}>
                                      <InputForm
                                        type='text'
                                        placeholder='Name'
                                        name={'attribute_name:' + idx + ':' + row[0]}
                                        initValue={extra.name}
                                      />
                                      <div className='ExtraValueContentEqual'>
                                        =
                                      </div>
                                      <InputForm
                                        type='text'
                                        placeholder='Value'
                                        name={'attribute_value:' + idx + ':' + row[0]}
                                        initValue={extra.value}
                                      />
                                      <CancelIcon
                                        className='MuiButtonLike'
                                        onClick={() => {
                                          row[1].extras.splice(idx, 1);
                                          setData([...data])
                                        }}/>
                                    </div>
                                  )
                                }) : ""
                              }
                            </div>
                          </div>
                        </td>
                        <td
                          valign='top'
                          className='ReferenceLayerTable-LastValue'>
                          {
                            row[1].lastValue ?
                              <Fragment>
                                Last value
                                : {row[1].lastValue.value} at {row[1].lastValue.date}
                              </Fragment>
                              : ''
                          }
                        </td>
                      </tr>
                    )
                  }) : referenceLayer ? <tr>
                    <td>Loading</td>
                  </tr> : null
              }
              </tbody>
            </table>
          </div>
        </div>
      </Admin>
      <InputFile
        data={data} apply={(newData) => {
        setData([...newData])
      }}
        open={open} setOpen={setOpen}
      />
      <Notification ref={notificationRef}/>
    </form>
  );
}

render(ValueManagement, store)