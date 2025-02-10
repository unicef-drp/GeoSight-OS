import React, { useState } from "react";
// @ts-ignore
import { TextField } from "@mui/material";
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CustomPopover from "../CustomPopover";
import { PluginChild } from "../../pages/Dashboard/MapLibre/Plugin";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

import Moment from "moment/moment";
import {
  LocalizationProvider
} from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";

import './style.scss';

export interface DataGridFilterProps {
  fields: any[],
  filterModel: any,
  setFilterModel: (val: any) => void
}


export const DataGridFilter = (
  {
    fields = [], filterModel = {}, setFilterModel
  }: DataGridFilterProps
) => {
  console.log(fields)
  const [newFilterModel, setNewFilterModel] = useState<any>(filterModel)
  const [isFiltered, setIsFiltered] = useState<boolean>(false)
  fields.forEach(item => {
    if (!item.serverKey) {
      item.serverKey = item.field; // Set c to be the same as a
    }
  });

  const handleApplyFilters = () => {
    if (!newFilterModel || Object.values(newFilterModel).every(value => value === null)) {
      setIsFiltered(false);
    } else {
      setIsFiltered(true);
    }
    setFilterModel({
      ...newFilterModel
    })
  }

  const handleClear = () => {
    setNewFilterModel({})
  }

  return (
    <CustomPopover
      className={'DataGridFilter-Popover'}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      Button={
        <div className='Popover-Btn'>
          <PluginChild
            title={'DataGrid-Filter'} disabled={false}
            active={true}>
            <a>
              <FilterAltIcon
                className={isFiltered ? 'Active' : null}
                fontSize={"small"}/>
            </a>
          </PluginChild>
        </div>
      }>
      <div className='DataGridFilter-Container'>
        <Grid container direction='column' className='Body'>
          {
            fields.filter(field => !field.disabledFilter).filter(field => !['actions', 'id'].includes(field.field)).map((field: any, idx: number) => (
              <Grid container direction='row' className={'FilterRow'}>
                {
                  field.type == 'date' ?
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                      <DesktopDatePicker
                        className={'Filter-DateStart'}
                        value={newFilterModel[`${field.serverKey}__gte`] ? new Date(newFilterModel[`${field.serverKey}__gte`]) : null}
                        label={`${field.headerName} (from)`}
                        inputFormat="YYYY-MM-DD"
                        onChange={(date: any) => {
                          const key = `${field.serverKey}__gte`;
                          const selectedDate = date ? Moment(date).format('YYYY-MM-DD') : null;
                          const value = selectedDate ? `${selectedDate}T00:00:00` : null;
                          setNewFilterModel({
                            ...newFilterModel,
                            [key]: value
                          })
                        }}
                        renderInput={(params) => <TextField {...params} />}
                      />
                      <DesktopDatePicker
                        value={newFilterModel[`${field.serverKey}__lte`] ? new Date(newFilterModel[`${field.serverKey}__lte`]) : null}
                        label={`${field.headerName} (to)`}
                        inputFormat="YYYY-MM-DD"
                        onChange={(date: any) => {
                          const key = `${field.serverKey}__lte`;
                          const selectedDate = date ? Moment(date).format('YYYY-MM-DD') : null;
                          const value = selectedDate ? `${selectedDate}T23:59:59` : null;
                          setNewFilterModel({
                            ...newFilterModel,
                            [key]: value
                          })
                        }}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                    :
                    <TextField
                      type='text'
                      label={field.headerName}
                      value={newFilterModel[`${field.serverKey ? field.serverKey : field.field}__icontains`]}
                      onChange={(event) => {
                        const key = `${field.serverKey ? field.serverKey : field.field}__icontains`;
                        const value = event.target.value ? event.target.value : null
                        setNewFilterModel({
                          ...newFilterModel,
                          [key]: value
                        })
                      }}
                    />
                }
              </Grid>
            ))
          }
        </Grid>
        <div className='Footer'>
          <Button variant='contained' id={'ListFilter-Btn'}
                  onClick={handleApplyFilters}>Apply Filters</Button>
          {/*/!*<div style={{flexGrow: 0.1}}></div>*!/*/}
          {/*<Button variant='contained' onClick={handleClear} color="success">Reset</Button>*/}
        </div>
      </div>
    </CustomPopover>
  )
}

export default DataGridFilter;