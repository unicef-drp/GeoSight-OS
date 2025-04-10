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
import { useSelector } from "react-redux";
import { memo, useEffect, useRef, useState } from "react";
import { Indicator } from "../../../../class/Indicator";
import { CountryDatasetView } from "../../../../types/DatasetView";
import { UpdateStyleData } from "../../../../utils/indicatorData";

interface Parameter {
  date__lte: string;
  date__gte?: string;
  country_geom_id__in?: string[];
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

  onLoading: (id: number, metadataId: string, datasetIdentifier: string, totalPage: number) => void;
  onProgress: (id: number, metadataId: string, progress: any) => void;
  onResponse: (id: number, metadataId: string, datasetIdentifier: string, response: any, error: string | null) => void;
}


export const IndicatorRequest = memo(
  (
    {
      indicator,
      datasetIdentifier,
      admin_level,
      onLoading,
      onResponse,
      onProgress,

      dashboardDatasetIdentifier
    }: Props
  ) => {
    // @ts-ignore
    const prevState = useRef();

    // Response state
    const [response, setResponse] = useState<
      {
        data: any | null,
        error: any | string
      }
    >({
      data: null,
      error: null
    });
    const [version, setVersion] = useState<string | null>(null);

    // get metadata and update progress
    let metadataId = indicator.metadataKey
    if (dashboardDatasetIdentifier !== datasetIdentifier) {
      metadataId += '-' + datasetIdentifier
    }

    // @ts-ignore
    const referenceLayerData = useSelector(state => state.referenceLayerData[datasetIdentifier]);
    // @ts-ignore
    const selectedGlobalTime = useSelector(state => state.selectedGlobalTime);
    // @ts-ignore
    const indicatorLayerMetadata = useSelector(state => state.indicatorLayerMetadata[metadataId]);
    const totalPage = indicatorLayerMetadata?.count ? Math.ceil(indicatorLayerMetadata.count / 100) : 0

    // Params
    const params: Parameter = {
      date__lte: selectedGlobalTime.max ? selectedGlobalTime.max.split('T')[0] : null,
      version: version,
      admin_level: admin_level,
      country_geom_id__in: referenceLayerData?.data?.countries?.map((country: CountryDatasetView) => country.ucode),
      page_size: 500
    }
    if (selectedGlobalTime.min) {
      params.date__gte = selectedGlobalTime.min.split('T')[0]
    }

    /** Change selected time when selected global time changed and correct. */
    useEffect(() => {
      let data = response?.data
      if (data) {
        data = UpdateStyleData(data, indicator.indicator)
      }
      // @ts-ignore
      onResponse(indicator.id, metadataId, datasetIdentifier, data, response.error)
    }, [response]);

    /**
     * Change selected time when selected global time changed and correct.
     * */
    useEffect(() => {
      if (!params.date__lte || !params.country_geom_id__in || !params.version || [null, undefined].includes(params.admin_level)) {
        return
      }
      // @ts-ignore
      if (JSON.stringify(params) !== JSON.stringify(prevState.params)) {
        // @ts-ignore
        prevState.params = params;
        fetchData()
      }
    }, [params]);

    /** Loading when metadata fetched. */
    useEffect(() => {
      if (version) {
        onLoading(indicator.id, metadataId, datasetIdentifier, totalPage);
      }
    }, [version]);

    /** Loading when metadata fetched. */
    useEffect(() => {
      if (indicatorLayerMetadata) {
        if (version !== indicatorLayerMetadata.version) {
          setVersion(indicatorLayerMetadata.version);
        }
      }
    }, [indicatorLayerMetadata]);

    /*** Get data of indicator */
    const getDataPromise = async () => {
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            resolve(
              await indicator.valueLatest({ ...params }, (progress: any) => {
                onProgress(indicator.id, metadataId, progress)
              })
            )
          } catch (error) {
            reject(error)
          }
        })()
      });
    }

    /** Fetch data of indicator* */
    const fetchData = () => {
      const session = new Date().getTime()
      // @ts-ignore
      prevState.session = session

      setResponse({ data: null, error: null })
      onLoading(indicator.id, metadataId, datasetIdentifier, totalPage);
      //   Fetch indicator data
      (
        async () => {
          getDataPromise().then(response => {
            // @ts-ignore
            if (prevState.session === session) {
              setResponse({ data: response, error: null })
            }
          }).catch(error => {
            // @ts-ignore
            if (prevState.session === session) {
              setResponse({
                data: null,
                error: error.response?.data?.detail ? error.response?.data?.detail : error.message ? error.message : error
              })
            }
          })
        }
      )()
    }
    return null
  }
)