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

import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from "@mui/material";
import { Entity } from "../../types/Entity";
import useInfiniteScroll from "react-infinite-scroll-hook";
import axios from "axios";

interface Props
  extends Omit<
    AutocompleteProps<Object, false, false, false>,
    "options" | "renderInput"
  > {
  onFetchData: (
    input: string,
    page: number,
  ) => Promise<{
    response: any;
    hasNextPage: boolean;
  }>;
  loadingState: { loading: boolean; setLoading: (val: boolean) => void };
  selectedState: { selected: Object; setSelected: (val: Object) => void };
  renderInput: (params: AutocompleteRenderInputParams) => ReactNode;
}

/** AsyncAutocomplete component. */
export const AsyncAutocomplete = forwardRef(
  (
    { onFetchData, loadingState, selectedState, ...autocompleteProps }: Props,
    ref,
  ) => {
    const [init, setInit] = useState(true);
    const [open, setOpen] = useState(false);
    const { loading, setLoading } = loadingState;
    const { selected, setSelected } = selectedState;

    const [page, setPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);

    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState<string>("");

    const skipFetchRef = useRef(false);

    // Ready check
    useImperativeHandle(ref, () => ({
      reload() {
        setOptions([]);
        setPage(1);
      },
      emptyInput(force: boolean) {
        if (force) {
          skipFetchRef.current = false;
        }
        setSelected(null);
        setInputValue("");
      },
    }));

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
      if (init && !open) {
        return;
      }
      setInit(false);
      setLoading(true);
      try {
        const { response, hasNextPage } = await onFetchData(input, pageNumber);
        setOptions((prev) =>
          pageNumber === 1 ? response : [...prev, ...response],
        );
        setHasNextPage(hasNextPage);
        setLoading(false);
      } catch (error) {
        if (axios.isCancel(error) || error.name === "CanceledError") {
        } else {
          setLoading(false);
        }
      }
    };

    const loadMore = useCallback(async () => {
      if (loading || !hasNextPage) return;
      setLoading(true);
      setPage(page + 1);
      await fetchData(inputValue, page + 1);
    }, [inputValue, page, loading, hasNextPage]);

    // When open
    useEffect(() => {
      if (open && options.length === 0) {
        fetchData(inputValue, 1);
      }
    }, [open]);

    const [sentryRef] = useInfiniteScroll({
      loading,
      hasNextPage,
      onLoadMore: loadMore,
      rootMargin: "0px 0px 400px 0px",
    });

    return (
      <Autocomplete
        {...autocompleteProps}
        freeSolo
        value={selected}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => setOpen(false)}
        loading={loading}
        filterOptions={(x: any) => x}
        options={options}
        onInputChange={(e: any, value: string, reason: string) => {
          if (reason === "input") {
            skipFetchRef.current = false;
            setInputValue(value);
          }
        }}
        onChange={(event, value: Entity) => {
          skipFetchRef.current = true;
          setSelected(value);
          setInputValue(value?.name || "");
        }}
        renderOption={(props, option, state) => (
          <>
            <li
              {...props}
              aria-selected={
                JSON.stringify(option) === JSON.stringify(selected)
              }
            >
              {typeof autocompleteProps.renderOption === "function" ? (
                (
                  autocompleteProps.renderOption as (
                    props: React.HTMLAttributes<HTMLLIElement>,
                    option: string,
                    state: AutocompleteRenderOptionState,
                  ) => React.ReactNode
                )(props, option, { ...state })
              ) : (
                <li {...props}>{option}</li>
              )}
            </li>
            {state.index === options.length - 1 && hasNextPage && (
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
    );
  },
);
