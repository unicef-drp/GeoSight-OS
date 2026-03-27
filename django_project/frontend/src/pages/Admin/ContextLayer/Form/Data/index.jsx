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
 * __date__ = '24/03/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useState } from "react";
import { fetchingData } from "../../../../../Requests";
import { capitalize, parseDateTime } from "../../../../../utils/main";
import { AdminListPagination } from "../../../AdminListPagination";
import { Variables } from "../../../../../utils/Variables";

export function ContextLayerDataTable({ data }) {
  const [columns, setColums] = useState([]);
  const [error, setError] = useState(null);
  const url = `/api/v1/context-layers/${data.id}/data/features/`;

  // Show modal when url changed
  useEffect(() => {
    setColums([]);
    setError(null);
    if (!data.id) {
      return;
    }
    (async () => {
      await fetchingData(
        `/api/v1/context-layers/${data.id}/attributes/?page=1&page_size=25`,
        {},
        {},
        (response, error) => {
          setError(error);
          if (response) {
            setColums(
              [
                {
                  field: "id",
                  headerName: "id",
                  minWidth: 200,
                },
              ].concat(
                response.map((fieldDefinition) => {
                  const field = fieldDefinition.attribute_name;
                  const isDate = fieldDefinition.attribute_type === "date";

                  return {
                    field: field,
                    headerName: fieldDefinition.attribute_label
                      ? fieldDefinition.attribute_label
                      : capitalize(field),
                    flex: 1,
                    minWidth: 200,
                    renderCell: (params) => {
                      if (isDate) {
                        return parseDateTime(params.value);
                      }
                      return (
                        <div
                          title={params.value}
                          className="MuiDataGrid-cellContent"
                        >
                          {params.value}
                        </div>
                      );
                    },
                  };
                }),
              ),
            );
          }
        },
      );
    })();
  }, [data.id]);

  if (
    data.layer_type === Variables.LAYER.TYPE.CLOUD_NATIVE_GIS &&
    !data.cloud_native_gis_layer_id
  ) {
    return (
      <div className="form-helptext" style={{ padding: "1rem" }}>
        This layer does not have a cloud-native layer. Please upload or save the
        context layer to apply the data.
      </div>
    );
  }

  if (
    data.layer_type === Variables.LAYER.TYPE.RELATED_TABLE &&
    !data.related_table
  ) {
    return (
      <div className="form-helptext" style={{ padding: "1rem" }}>
        This layer does not have a cloud-native layer configured. Please upload
        or save the context layer before applying the data.
      </div>
    );
  }
  return (
    <AdminListPagination
      urlData={url}
      columns={columns}
      disabledDelete={true}
      checkboxSelection={false}
      hideSearch={true}
      error={error}
      showIdColumn={true}
    />
  );
}
