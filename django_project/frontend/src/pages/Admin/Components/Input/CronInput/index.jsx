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

/** Cron input */

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { FormControl } from '@mui/material';
import TimezoneSelect from 'react-timezone-select'
import Cron from 'react-js-cron'

import InputIcon from "@mui/icons-material/Input";
import { ModalInput } from '../../../../../components/Modal/ModalInput'
import {
  DeleteButton,
  SaveButton
} from "../../../../../components/Elements/Button";
import { IconTextField } from "../../../../../components/Elements/Input";
import { ModalContent } from "../../../../../components/Modal";
import { getScheduleText } from "../../../../../utils/cron";

import './styles.scss';

/**
 * Reference layer specified input
 * @param {string} data .
 * @param {Function} setData .
 */
export const CronInput = forwardRef(
  ({
     data, setData
   }, ref
  ) => {
    const childRef = useRef(null);
    const scheduleDataArr = data.schedule ? data.schedule.split(' ') : []
    const scheduleData = scheduleDataArr.length ? scheduleDataArr.slice(0, -1).join(' ') : '0 0 * * *';
    const scheduleDataTimezone = scheduleDataArr[scheduleDataArr.length - 1]

    const [selectedTimezone, setSelectedTimezone] = useState(
      scheduleDataTimezone ? scheduleDataTimezone : Intl.DateTimeFormat().resolvedOptions().timeZone
    )

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return true
      }
    }));

    const [schedule, setSchedule] = useState(scheduleData);
    useEffect(
      () => {
        setSchedule(scheduleData)
      }, [scheduleData]
    )

    const parseSchedule = () => {
      if (schedule) {
        const newSchedule = schedule.split(' ')
        newSchedule.push(selectedTimezone)
        return newSchedule.join(' ')
      } else {
        return null
      }
    }

    return (
      <ModalInput
        className={'CronBuilder MuiBox-Large MuiBox-Tall'}
        Input={
          <IconTextField
            iconEnd={<InputIcon/>}
            value={data?.schedule ? getScheduleText(data.schedule) : ''}
            inputProps={
              { readOnly: true, }
            }
          />
        }
        ModalInputContent={
          <ModalContent>
            <div className="BasicForm">
              <div className="BasicFormSection ">
                <FormControl
                  className="BasicFormSection InputControl">
                  <TimezoneSelect
                    className='TimezoneInput'
                    value={selectedTimezone}
                    onChange={evt => {
                      setSelectedTimezone(evt.value)
                    }}
                  />
                  <label className="MuiFormLabel-root" data-shrink="true">
                    Timezone
                  </label>
                </FormControl>
              </div>
              <Cron
                allowedPeriods={[
                  'year',
                  'month',
                  'week',
                  'day',
                  'hour'
                ]}
                value={schedule}
                setValue={(newValue) => {
                  setSchedule(newValue)
                }}
                clearButton={false}
              />
            </div>
            <div className='Result-Row'>
              {`${schedule} ${selectedTimezone}` ? getScheduleText(`${schedule} ${selectedTimezone}`) : ''}
            </div>
            <div className='Button-Row'>
              <div className='Clear-Button'>
                <DeleteButton
                  variant="primary"
                  text={"Clear"}
                  onClick={() => {
                    setSchedule('* * * * *')
                  }}
                />
              </div>
              <div className='Save-Button'>
                <SaveButton
                  disabled={!schedule}
                  variant="primary"
                  text={"Update Schedule"}
                  onClick={() => {
                    data.schedule = parseSchedule()
                    setData({ ...data })
                    childRef?.current?.close()
                  }}
                />
              </div>
            </div>
          </ModalContent>
        }
        ref={childRef}
      />
    );
  }
)