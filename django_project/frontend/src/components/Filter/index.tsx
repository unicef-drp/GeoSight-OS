import React, {useState} from "react";
// @ts-ignore
import DatePicker from "react-datepicker";
import {FormControl} from "@mui/material";
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import { Input } from "@mui/material";
import CustomPopover from "../CustomPopover";
import {PluginChild} from "../../pages/Dashboard/MapLibre/Plugin";

import './style.scss';
import Moment from "moment/moment";

export interface DataGridFilterProps {
  fields: any[],
  filterModel: any,
  setFilterModel: (val: any) => void
}


export const DataGridFilter = (
  {
    fields=[], filterModel={}, setFilterModel
  }: DataGridFilterProps
) => {
  const [newFilterModel, setNewFilterModel] = useState<any>(filterModel)
  fields.forEach(item => {
    if (!item.serverKey) {
      item.serverKey = item.field; // Set c to be the same as a
    }
  });

  const handleApplyFilters = () => {
    setFilterModel({
      ...newFilterModel
    })
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
        <div className='Active'>
          <PluginChild title={'DataGrid-Filter'} disabled={false} active={true}>
            <a>
              <Button variant="text">Filter</Button>
            </a>
          </PluginChild>
        </div>
      }>
      <div className='DataGridFilter-Container'>
        <Grid container direction='column' className='Body'>
          {
            fields.filter(field => !['actions', 'id'].includes(field.field)).map((field: any, idx: number)=> (
              <Grid container direction='row' className={'FilterRow'}>
                <Grid item md={4} lg={4} className='FieldName'>
                  <b>{field.headerName}</b>
                </Grid>
                <Grid item md={8} lg={8}>
                  {
                    field.type == 'date' ?
                      <Grid container>
                        <Grid container>
                          <Grid item md={2} className={'date-text'}>Start</Grid>
                          <Grid item md={10}>
                            <DatePicker
                              portalId={`${field.field}-start-datepicker`}
                              selected={newFilterModel[`${field.serverKey}__gte`] ? new Date(newFilterModel[`${field.serverKey}__gte`]) : ""}
                              dateFormat="yyyy-MM-dd"
                              onChange={(date: any) => {
                                const key = `${field.serverKey}__gte`;
                                const selectedDate = date ? Moment(date).format('YYYY-MM-DD') : null;
                                const value = selectedDate ? `${selectedDate}T00:00:00` : null;
                                setNewFilterModel({
                                  ...newFilterModel,
                                  [key]: value
                                })
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Grid container>
                          <Grid item md={2} className={'date-text'}>End</Grid>
                          <Grid item md={10}>
                            <DatePicker
                              portalId={`${field.field}-start-datepicker`}
                              selected={newFilterModel[`${field.serverKey}__lte`] ? new Date(newFilterModel[`${field.serverKey}__lte`]) : ""}
                              dateFormat="yyyy-MM-dd"
                              onChange={(date: any) => {
                                const key = `${field.serverKey}__lte`;
                                const selectedDate = date ? Moment(date).format('YYYY-MM-DD') : null;
                                const value = selectedDate ? `${selectedDate}T23:59:59` : null;
                                setNewFilterModel({
                                  ...newFilterModel,
                                  [key]: value
                                })
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid> :
                      <Input
                        type='text'
                        onChange={(event) => {
                          const key = `${field.serverKey ? field.serverKey : field.field }__icontains`;
                          const value = event.target.value ? event.target.value : null
                          setNewFilterModel({
                            ...newFilterModel,
                            [key]: value
                          })
                        }}
                      />
                  }
                </Grid>
              </Grid>
            ))
          }
        </Grid>
        <div className='Footer'>
          <Button variant='contained' onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </div>
    </CustomPopover>
  )
}

export default DataGridFilter;