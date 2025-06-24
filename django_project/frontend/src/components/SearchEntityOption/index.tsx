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

import React, { memo, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { InputAdornment } from "@mui/material";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";

import { CloseIcon } from "../Icons";
import { AsyncAutocomplete } from "../AsyncAutocomplete";
import { axiosGet, GeorepoUrls } from "../../utils/georepo";
import { DjangoRequests } from "../../Requests";
import { ReferenceLayer } from "../../types/Project";

import "./style.scss";
import { Entity } from "../../types/Entity";

let lastAbortController: AbortController | null = null;

export interface Props {
  onSelected: (entity: Object) => void;
}

export interface PropsQueue {
  dataset: string | null;
  isGeorepo: boolean | null;
  admin_level: number;
  admin_level_name: string;
}

let queueConfig: {
  queue_idx: 0;
  page: number;
} = {
  queue_idx: 0,
  page: 1,
};

/** AsyncAutocomplete component. */
function SearchEntityOption({ onSelected }: Props) {
  const referenceLayerDataState = useSelector(
    // @ts-ignore
    (state) => state.referenceLayerData,
  );
  const { t } = useTranslation();

  const { referenceLayers } = useSelector(
    // @ts-ignore
    (state) => state.map,
  );
  const autocompleteRef = useRef(null);

  const [selected, setSelected] = useState<Object>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [queue, setQueue] = useState<PropsQueue[]>([]);

  // When selected changed
  useEffect(() => {
    onSelected(selected);
  }, [selected]);

  // When selected changed
  useEffect(() => {
    const queue: PropsQueue[] = [];
    referenceLayers.map((referenceLayer: ReferenceLayer) => {
      const isGeorepo = !referenceLayer.is_local;
      const dataset = referenceLayerDataState[referenceLayer.identifier]?.data;
      if (!dataset?.identifier) {
        return;
      }
      const levels = dataset.dataset_levels;
      levels.map((level: any) => {
        queue.push({
          dataset: referenceLayer.identifier,
          isGeorepo: isGeorepo,
          admin_level: level.level,
          admin_level_name: level.level_name,
        });
      });
    });
    setQueue(queue);
    autocompleteRef.current.reload();
  }, [referenceLayers, referenceLayerDataState]);

  const onFetchData = async (
    input: string,
    page: number,
    keepQueue: boolean = false,
  ): Promise<{ response: any; hasNextPage: boolean }> => {
    // Cancel the previous request if it's still pending
    if (lastAbortController) {
      lastAbortController.abort();
    }

    // Create a new AbortController
    const controller = new AbortController();
    lastAbortController = controller;

    // This is new one
    if (!keepQueue && page === 1) {
      queueConfig = {
        queue_idx: 0,
        page: 1,
      };
    }
    const currentQueue = queue[queueConfig.queue_idx];
    if (!currentQueue) {
      return {
        response: [],
        hasNextPage: false,
      };
    }

    const params: any = {
      page: queueConfig.page,
      admin_level: currentQueue.admin_level,
      page_size: 100,
    };
    if (input) {
      params["search"] = input;
    }

    try {
      let response = null;
      const dataset = currentQueue.dataset;
      if (currentQueue.isGeorepo) {
        response = await axiosGet(
          GeorepoUrls.WithDomain(
            `/search/view/${dataset}/entity/level/${params.admin_level}/`,
          ),
          params,
          controller.signal,
        );
      } else {
        response = await DjangoRequests.get(
          `/api/v1/reference-datasets/${dataset}/entity/`,
          { signal: controller.signal },
          { ...params, sort: "name" },
        );
        response.data.results.map((entity: Entity) => {
          entity.level_name = currentQueue.admin_level_name;
        });
      }
      const data = response.data;
      let hasNextPage = false;
      const hasNextPageFromRequest =
        data.page !== data.total_page && data.results.length > 0;
      if (!hasNextPageFromRequest) {
        if (!queue[queueConfig.queue_idx + 1]) {
          hasNextPage = false;
        } else {
          queueConfig.queue_idx++;
          queueConfig.page = 1;
          hasNextPage = true;
        }
      } else {
        queueConfig.page++;
        hasNextPage = true;
      }

      // If data length is zero
      if (page === 1 && data.results.length === 0 && hasNextPage) {
        return await onFetchData(input, page, true);
      }
      return {
        response: data.results,
        hasNextPage: hasNextPage,
      };
    } catch (error: any) {
      throw error; // rethrow other errors
    }
  };

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
        onFetchData={onFetchData}
        disabled={queue.length === 0}
        renderInput={(params: any) => (
          <TextField
            {...params}
            placeholder={t("dashboardPage.searchGeographyEntity")}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <InputAdornment
                  position="end"
                  className="MuiAutocomplete-endAdornment"
                >
                  <div className="CloseIcon">
                    <CloseIcon
                      onClick={(_: any) => {
                        setSelected(null);
                        autocompleteRef.current.emptyInput();
                      }}
                    />
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
        ref={autocompleteRef}
      />
    </div>
  );
}

export default memo(SearchEntityOption);
