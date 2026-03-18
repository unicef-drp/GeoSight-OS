import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormControl, TextField } from "@mui/material";
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

import { Select } from "../Input";

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
  const { t } = useTranslation();
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

  const fieldsFilter = fields.filter(field => !field.disabledFilter).filter(field => !['actions', 'id'].includes(field.field))
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
            title={'Filter'} disabled={false}
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
            fieldsFilter.map((field: any, idx: number) => (
              <Grid container direction='row' className={'FilterRow'}>
                {
                  field.type == 'boolean' ?
                    <div style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      width: "100%",
                      flexGrow: 1,
                      paddingLeft: "1rem"
                    }}>
                      <div><b>{field.headerName}</b></div>
                      <Select
                        className={"form-control " + field.headerName + "Filter"}
                        menuPlacement={[fieldsFilter.length-1, fieldsFilter.length-2].includes(idx) ?  "top" : "auto"}
                        options={[
                          { label: "Both", value: "" },
                          { label: "True", value: "True" },
                          { label: "False", value: "False" },
                        ]}
                        value={
                          [null, undefined].includes(
                            newFilterModel[
                              `${field.serverKey ? field.serverKey : field.field}`
                            ],
                          )
                            ? {
                                label: "Both",
                                value: "",
                              }
                            : newFilterModel[
                                  `${field.serverKey ? field.serverKey : field.field}`
                                ] === "True"
                              ? {
                                  label: "True",
                                  value: "True",
                                }
                              : { label: "False", value: "False" }
                        }
                        onChange={(event: any) => {
                          const key = `${field.serverKey ? field.serverKey : field.field}`;
                          if (event.value) {
                            setNewFilterModel({
                              ...newFilterModel,
                              [key]: event.value,
                            });
                          } else {
                            setNewFilterModel({
                              ...newFilterModel,
                              [key]: null,
                            });
                          }
                        }}
                      />
                    </div>:
                  field.type == 'select' ?
                    <div
                      className={field.headerName + "Filter"}
                      style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      width: "100%",
                      flexGrow: 1,
                      paddingLeft: "1rem"
                    }}>
                      <div><b>{field.headerName}</b></div>
                      <Select
                        className="form-control"
                        menuPlacement={idx == fieldsFilter.length-1 ?  "top" : "auto"}
                        options={field.options}
                        value={
                          field.options.find((option : {value: string}) => option.value === newFilterModel[`${field.serverKey ? field.serverKey : field.field}`])
                        }
                        onChange={(event: any) => {
                          const key = `${field.serverKey ? field.serverKey : field.field}`;
                          if (event.value) {
                            setNewFilterModel({
                              ...newFilterModel,
                              [key]: event.value,
                            });
                          } else {
                            setNewFilterModel({
                              ...newFilterModel,
                              [key]: null,
                            });
                          }
                        }}
                      />
                    </div> :
                    field.type == 'date' ?
                      <LocalizationProvider dateAdapter={AdapterMoment}>
                        <Grid container direction='row' className='FilterDate'>
                          <DesktopDatePicker
                            className={'Filter-DateStart'}
                            value={newFilterModel[`${field.serverKey}__gte`] ? new Date(newFilterModel[`${field.serverKey}__gte`]) : null}
                            label={`${field.headerName} `+ t('(from)')}
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
                            renderInput={(params) => <TextField {...params} onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }} />}
                          />
                          <DesktopDatePicker
                            value={newFilterModel[`${field.serverKey}__lte`] ? new Date(newFilterModel[`${field.serverKey}__lte`]) : null}
                            label={`${field.headerName} `+ t('(to)')}
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
                            renderInput={(params) => <TextField {...params} onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }} />}
                          />
                        </Grid>
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
                        onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                      />
                }
              </Grid>
            ))
          }
        </Grid>
        <div className='Footer'>
          <Button
            variant='contained' id={'ListFilter-Btn'}
            onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </div>
    </CustomPopover>
  )
}

export default DataGridFilter;