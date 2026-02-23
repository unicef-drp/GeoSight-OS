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
 * __date__ = '14/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

/** This is just a component for dataset selector. */

import React, { useEffect, useState } from "react";
import { fetchReferenceLayerList } from "../../utils/georepo";
import { SelectWithList } from "../Input/SelectWithList";

const VALUE_REMOTE = "Remote";

export interface Props {
  dataset: string;
  sourceType: string;
  onChanged: (dataset: string) => void;
}

/** For Georepo View selection. */
export default function DatasetSelector({
  dataset,
  sourceType,
  onChanged,
}: Props) {
  // @ts-ignore
  const { georepo_default_dataset_uuid } = preferences;

  const [datasets, setDatasets] = useState([]);
  const setDataset = (dataset: string) => {
    onChanged(dataset);
  };

  // @ts-ignore
  const isLocalEnabled = localReferenceDatasetEnabled;

  /** Get the datasets */
  useEffect(() => {
    (async () => {
      const responseData = await fetchReferenceLayerList();
      const datasets = responseData.map((row: any) => {
        row.value = row.identifier;
        return row;
      });
      setDatasets(datasets);
    })();
  }, []);

  /** On datasets loaded */
  useEffect(() => {
    if (!dataset && datasets[0]) {
      const defaultDataset =
        datasets.find(
          (dataset) => dataset.value === georepo_default_dataset_uuid,
        ) || datasets[0];
      setDataset(defaultDataset.value);
    }
  }, [datasets]);

  return (
    <>
      {(!isLocalEnabled || sourceType === VALUE_REMOTE) && (
        <SelectWithList
          placeholder={datasets ? "Select dataset" : "Loading"}
          list={datasets}
          value={dataset}
          onChange={(evt: any) => {
            setDataset(evt.value);
          }}
        />
      )}
    </>
  );
}
