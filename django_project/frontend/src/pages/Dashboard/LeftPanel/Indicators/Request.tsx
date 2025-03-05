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
  country_geom_id?: string;
  version?: string;
}

interface Props {
  id: number;
  indicator: Indicator;
  datasetIdentifier: string;
  dashboardDatasetIdentifier: string;

  onLoading: (id: number, metadataId: string, totalPage: number) => void;
  onProgress: (id: number, metadataId: string, progress: any) => void;
  onResponse: (id: number, metadataId: string, datasetIdentifier: string, response: any, error: string | null) => void;
}


export const IndicatorRequest = memo(
  (
    {
      indicator,
      datasetIdentifier,
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

    // Params
    const params: Parameter = {
      date__lte: selectedGlobalTime.max ? selectedGlobalTime.max.split('T')[0] : null,
      version: indicatorLayerMetadata ? indicatorLayerMetadata.version : null,
      country_geom_id: referenceLayerData?.data?.countries?.map((country: CountryDatasetView) => country.ucode)
    }
    if (selectedGlobalTime.min) {
      params.date__gte = selectedGlobalTime.min.split('T')[0]
    }

    /** Change selected time when selected global time changed and correct. */
    useEffect(() => {
      let data = null
      if (response.data) {
        data = UpdateStyleData(response.data, indicator.indicator)
      }
      // @ts-ignore
      onResponse(indicator.id, metadataId, datasetIdentifier, data, response.error)
    }, [indicator, response]);

    /**
     * Change selected time when selected global time changed and correct.
     * */
    useEffect(() => {
      if (!params.date__lte || !params.country_geom_id || !params.version) {
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
      if (indicatorLayerMetadata) {
        onLoading(indicator.id, metadataId, indicatorLayerMetadata.total_page);
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
      onLoading(indicator.id, metadataId, indicatorLayerMetadata.total_page);
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
              setResponse({ data: null, error: error })
            }
          })
        }
      )()
    }
    return null
  }
)