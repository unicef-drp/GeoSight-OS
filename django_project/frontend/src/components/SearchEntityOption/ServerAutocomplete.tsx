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
 * __date__ = '23/06/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Search Geometry
   ========================================================================== */

import React, { memo, useState } from "react";
import { useTranslation } from "react-i18next";

import { InputAdornment } from "@mui/material";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";

import { CloseIcon } from "../Icons";
import { Entity } from "../../types/Entity";
import { axiosGet } from "../../utils/georepo";
import AsyncAutocomplete from "../AsyncAutocomplete";

export interface Props {
  url: string;
  pageSize: number;
}

/** AsyncAutocomplete component. */
function ServerAutocomplete({ url, pageSize }: Props) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<Entity>(null);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div
      className={
        "SelectWithSearchInput SearchEntityOption " +
        (selected ? "HasData " : "") +
        (loading ? "Loading " : "")
      }
    >
      <AsyncAutocomplete
        noOptionsText={"No entity found"}
        loadingState={{ loading, setLoading }}
        selectedState={{ selected, setSelected }}
        onFetchData={(input: string, page: number) => {
          const params = {
            page: page,
            page_size: pageSize,
          };
          if (input) {
            // @ts-ignore
            params["search"] = input;
          }
          return axiosGet(url, params);
        }}
        renderInput={(params: any) => (
          <TextField
            {...params}
            placeholder={
              loading
                ? t("dashboardPage.searchGeographyEntityLoading")
                : t("dashboardPage.searchGeographyEntity")
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <InputAdornment
                  position="end"
                  className="MuiAutocomplete-endAdornment"
                >
                  <div className="CloseIcon">
                    <CloseIcon onClick={(_: any) => {}} />
                  </div>
                  <SearchIcon />
                  <CircularProgress />
                </InputAdornment>
              ),
            }}
          />
        )}
        disableCloseOnSelect={true}
        className={"SelectWithSearch SearchGeometry"}
        /* @ts-ignore */
        getOptionLabel={(option) => `${option.name}`}
        renderOption={(props, option, state) => (
          <div className="SearchGeometryOption">
            {/* @ts-ignore */}
            {option.name}
            {/* @ts-ignore */}
            <i>{option.level_name}</i>
          </div>
        )}
      />
    </div>
  );
}

export default memo(ServerAutocomplete);
