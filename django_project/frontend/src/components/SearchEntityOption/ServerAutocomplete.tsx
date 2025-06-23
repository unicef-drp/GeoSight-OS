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

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { Autocomplete, InputAdornment } from "@mui/material";
import { axiosGet } from "../../utils/georepo";
import { CloseIcon } from "../Icons";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { Entity } from "../../types/Entity";
import useInfiniteScroll from "react-infinite-scroll-hook";

export interface Props {
  url: string;
  pageSize: number;
}

/** ServerAutocomplete component. */
function ServerAutocomplete({ url, pageSize }: Props) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<Entity>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const skipFetchRef = useRef(false);

  // Effect for typing
  useEffect(() => {
    if (skipFetchRef.current) return;

    const delayDebounce = setTimeout(() => {
      setOptions([]);
      setPage(1);
      fetchData(inputValue, 1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [inputValue]);

  /*** Fetch data from server **/
  const fetchData = async (input: string, pageNumber: number) => {
    setLoading(true);
    try {
      const params = {
        page: pageNumber,
        page_size: pageSize,
      };
      if (input) {
        // @ts-ignore
        params["search"] = input;
      }
      const response = await axiosGet(url, params);
      const data = await response.data;
      setOptions((prev) =>
        pageNumber === 1 ? data.results : [...prev, ...data.results],
      );
      setHasNextPage(data.page !== data.total_page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasNextPage) return;
    setLoading(true);
    await fetchData(inputValue, page + 1);
  }, [inputValue, page, loading, hasNextPage]);

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    rootMargin: "0px 0px 400px 0px",
  });

  return (
    <div
      className={
        "SelectWithSearchInput SearchEntityOption " +
        (selected ? "HasData " : "") +
        (loading ? "Loading " : "")
      }
    >
      <Autocomplete
        /* @ts-ignore */
        freeSolo
        open
        openOnFocus
        loading={loading}
        filterOptions={(x: any) => x} // disable client-side filtering
        options={options}
        onInputChange={(e: any, value: string, reason: string) => {
          if (reason === "input") {
            skipFetchRef.current = false;
            setInputValue(value);
          }
        }}
        ListboxProps={{
          style: { maxHeight: 300, overflow: "auto" },
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
        /* TODO: */
        /*  Specific, we move this after being used by others */
        disableCloseOnSelect={true}
        className={"SelectWithSearch SearchGeometry"}
        getOptionLabel={(option) => `${option.name}`}
        onChange={(event, value: Entity) => {
          skipFetchRef.current = true;
          setSelected(value);
          setInputValue(value?.name || "");
        }}
        renderOption={(props, option, { index }) => (
          <>
            <li {...props} aria-selected={option.ucode === selected?.ucode}>
              <div className="SearchGeometryOption">
                {option.name}
                <i>{option.level_name}</i>
              </div>
            </li>

            {index === options.length - 1 && hasNextPage && (
              <li>
                <div
                  ref={sentryRef}
                  style={{
                    display: "flex",
                    height: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    fontStyle: "italic",
                    opacity: 0.5,
                    fontSize: "0.8em",
                  }}
                >
                  Next page
                </div>
              </li>
            )}
          </>
        )}
      />
    </div>
  );
}

export default memo(ServerAutocomplete);
