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
import { useDispatch, useSelector } from "react-redux";
import { memo, useEffect, useRef, useState } from "react";
import { Indicator } from "../../../../class/Indicator";
import { CountryDatasetView } from "../../../../types/DatasetView";
import {
  getIndicatorDataId,
  UpdateStyleData,
} from "../../../../utils/indicatorData";
import { Actions } from "../../../../store/dashboard";

interface Parameter {
  date__lte: string;
  date__gte?: string;
  country_geom_id__in?: string[];
  country_concept_uuid__in?: string[];
  admin_level?: number | null | undefined;
  version?: string;
  page_size: number;
}

interface Props {
  id: number;
  indicator: Indicator;
  datasetIdentifier: string;
  dashboardDatasetIdentifier: string;
  admin_level?: number | null | undefined;
  isRequest: boolean;
}

export const IndicatorRequest = memo(
  ({
    indicator,
    admin_level,
    datasetIdentifier,
    dashboardDatasetIdentifier,
    isRequest,
  }: Props) => {
    const dispatch = useDispatch();
    const geoField = useSelector(
      // @ts-ignore
      (state) => state.dashboard.data?.geoField,
    );
    const isUsingConceptUUID = geoField === "concept_uuid";

    // @ts-ignore
    const prevState = useRef();

    // Response state
    const [response, setResponse] = useState<{
      data: any | null;
      error: any | string;
    }>({
      data: null,
      error: null,
    });
    const [version, setVersion] = useState<string | null>(null);

    // get metadata and update progress
    let metadataId = indicator.metadataKey;
    if (dashboardDatasetIdentifier !== datasetIdentifier) {
      metadataId += "-" + datasetIdentifier;
    }
    const indicatorDataId = getIndicatorDataId(
      indicator.id,
      dashboardDatasetIdentifier,
      datasetIdentifier,
    );

    const referenceLayerData = useSelector(
      // @ts-ignore
      (state) => state.referenceLayerData[datasetIdentifier],
    );
    // @ts-ignore
    const selectedGlobalTime = useSelector((state) => state.selectedGlobalTime);
    const indicatorLayerMetadata = useSelector(
      // @ts-ignore
      (state) => state.indicatorLayerMetadata[metadataId],
    );
    const totalPage = indicatorLayerMetadata?.count
      ? Math.ceil(indicatorLayerMetadata.count / 100)
      : 0;

    const indicatorsIdsSelected = useSelector(
      // @ts-ignore
      (state) => state.selectionState.filter.indicatorIds,
    );
    const isBeingRequest =
      isRequest || indicatorsIdsSelected.includes(indicator.id);

    // Params
    const params: Parameter = {
      date__lte: selectedGlobalTime.max
        ? selectedGlobalTime.max.split("T")[0]
        : null,
      version: version,
      admin_level: admin_level,
      page_size: 500,
    };
    if (!isUsingConceptUUID) {
      params["country_geom_id__in"] = referenceLayerData?.data?.countries?.map(
        (country: CountryDatasetView) => country.ucode,
      );
    } else {
      params["country_concept_uuid__in"] =
        referenceLayerData?.data?.countries?.map(
          (country: CountryDatasetView) => country.concept_uuid,
        );
    }
    if (selectedGlobalTime.min) {
      params.date__gte = selectedGlobalTime.min.split("T")[0];
    }

    /** ------------ FUNCTIONS -------------- **/
    /** ------------ On loading ------------- **/
    const onLoading = () => {
      dispatch(Actions.IndicatorsData.request(indicatorDataId));
      dispatch(
        Actions.IndicatorsMetadata.progress(metadataId, {
          total_page: totalPage,
          page: 0,
        }),
      );
    };

    /** ------------ On progress ------------- **/
    const onProgress = (progress: any) => {
      dispatch(Actions.IndicatorsMetadata.progress(metadataId, progress));
    };

    /** ------------ On response ------------- **/
    const onResponse = (response: any, error: any) => {
      if (!error && !response) {
        return;
      }
      dispatch(
        Actions.IndicatorsMetadata.progress(metadataId, {
          total_page: 100,
          page: 100,
        }),
      );
      dispatch(
        Actions.IndicatorsData.receive(response, error, indicatorDataId),
      );
    };

    /** ------------ EFFECTS -------------- **/
    /** Change selected time when selected global time changed and correct. */
    useEffect(() => {
      let data = response?.data;
      if (data) {
        data = UpdateStyleData(data, indicator.indicator);
      }
      // @ts-ignore
      onResponse(data, response.error);
    }, [response]);

    /**
     * Change selected time when selected global time changed and correct.
     * */
    useEffect(() => {
      if (!isBeingRequest) {
        return;
      }
      if (
        !params.date__lte ||
        (!params.country_geom_id__in && !params.country_concept_uuid__in) ||
        !params.version ||
        [null, undefined].includes(params.admin_level)
      ) {
        return;
      }
      // @ts-ignore
      if (JSON.stringify(params) !== JSON.stringify(prevState.params)) {
        // @ts-ignore
        prevState.params = params;
        fetchData();
      }
    }, [params, isBeingRequest]);

    /** Loading when metadata fetched. */
    useEffect(() => {
      if (indicatorLayerMetadata) {
        if (version !== indicatorLayerMetadata.version) {
          setVersion(indicatorLayerMetadata.version);
        }
      }
    }, [indicatorLayerMetadata]);

    /** ------------ FETCHER FUNCTIONS -------------- **/
    /*** Get data of indicator */
    const getDataPromise = async () => {
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            resolve(
              await indicator.valueLatest({ ...params }, (progress: any) => {
                onProgress(progress);
              }),
            );
          } catch (error) {
            reject(error);
          }
        })();
      });
    };

    /** Fetch data of indicator* */
    const fetchData = () => {
      const session = new Date().getTime();
      // @ts-ignore
      prevState.session = session;

      setResponse({ data: null, error: null });
      onLoading();
      //   Fetch indicator data
      (async () => {
        getDataPromise()
          .then((response) => {
            // @ts-ignore
            if (prevState.session === session) {
              setResponse({ data: response, error: null });
            }
          })
          .catch((error) => {
            // @ts-ignore
            if (prevState.session === session) {
              setResponse({
                data: null,
                error: error.response?.data?.detail
                  ? error.response?.data?.detail
                  : error.message
                    ? error.message
                    : error,
              });
            }
          });
      })();
    };
    return null;
  },
);
