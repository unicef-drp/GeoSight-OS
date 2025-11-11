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

/* ==========================================================================
   RELATED TABLE LAYER FILTER
   ========================================================================== */

import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Actions } from "../../../../store/dashboard";
import {
  getRelatedTableFields,
  updateWhereQuery,
} from "../../../../utils/relatedTable";
import { dictDeepCopy } from "../../../../utils/main";
import { WhereQueryGenerator } from "../../../../components/SqlQueryGenerator";
import { queryData } from "../../../../utils/queryExtraction";

/**
 * Related table layer filter.
 */
export default function RelatedTableLayerMapConfig() {
  const dispatch = useDispatch();
  const selectedRelatedTableLayer = useSelector(
    (state) => state.selectedRelatedTableLayer,
  );
  const relatedTableDataState = useSelector((state) => state.relatedTableData);
  const indicatorLayers = useSelector(
    (state) => state.dashboard.data.indicatorLayers,
  );
  const relatedTables = useSelector(
    (state) => state.dashboard.data.relatedTables,
  );

  const [open, setOpen] = useState(false);

  const [metadata, setMetadata] = useState({});

  /** When selected is changed **/
  useEffect(() => {
    setOpen(selectedRelatedTableLayer !== null);
  }, [selectedRelatedTableLayer]);

  let config;
  let relatedFields;
  let selectedRelatedTableLayerId = selectedRelatedTableLayer;
  const relatedTableLayer = indicatorLayers.find(
    (layer) => layer.id && layer.id === selectedRelatedTableLayerId,
  );
  const { sequenceFieldSelected } = metadata[relatedTableLayer?.id] || {};

  let relatedTableData = null;
  if (relatedTableLayer) {
    const relatedTable = relatedTableLayer.related_tables[0];
    relatedTableData =
      relatedTableDataState[relatedTableLayer.related_tables[0].id]?.data;
    const relatedTableConfig = relatedTables.find(
      (rt) => rt.id === relatedTable.id,
    );

    relatedFields = getRelatedTableFields(relatedTableConfig, relatedTableData);
    config = dictDeepCopy(relatedTableLayer.config);
  }

  /** Update fields to required fields **/
  const updateFields = (fields) => {
    if (!fields) {
      return fields;
    }
    const layerMetadata = metadata[relatedTableLayer.id];
    return fields.map((field) => {
      return {
        name: field.name,
        type: field.type ? field.type : "text",
        value: field.name,
        options: layerMetadata?.filteredOptions[field.name]
          ? layerMetadata.filteredOptions[field.name]
          : field?.options,
        isFiltered: sequenceFieldSelected?.includes(field.name),
      };
    });
  };

  // TODO:
  //  We need to fix by generated this before calculating map style
  useEffect(() => {
    if (relatedTableLayer?.id && relatedTableData) {
      if (!metadata[relatedTableLayer.id]) {
        metadata[relatedTableLayer.id] = {
          lastQuery: relatedTableLayer?.config?.where,
          sequenceFieldSelected: [],
          filteredOptions: {}, // by field name
        };
        setMetadata({ ...metadata });
      }
    }
  }, [
    relatedTableLayer?.id,
    relatedTableLayer?.config?.where,
    relatedTableData,
  ]);

  const updateOptions = (where) => {
    if (relatedTableData) {
      const layerMetadata = metadata[relatedTableLayer.id];
      const rows = queryData(relatedTableData, updateWhereQuery(where));
      relatedFields.map((field) => {
        if (sequenceFieldSelected.includes(field.name)) return;
        const options = Array.from(
          new Set(
            rows.map((data) =>
              data[field.name] !== null ? "" + data[field.name] : "",
            ),
          ),
        );
        layerMetadata.filteredOptions[field.name] = options;
      });
      metadata[relatedTableLayer.id] = layerMetadata;
      setMetadata({ ...metadata });
    }
  };

  const resetFilter = (field, isDelete) => {
    const layerMetadata = metadata[relatedTableLayer.id];
    let sequenceFieldSelected = layerMetadata.sequenceFieldSelected;
    if (sequenceFieldSelected.includes(field)) {
      sequenceFieldSelected = sequenceFieldSelected.slice(
        0,
        sequenceFieldSelected.indexOf(field) + 1,
      );
    } else {
      sequenceFieldSelected.push(field);
    }
    if (isDelete) {
      sequenceFieldSelected = sequenceFieldSelected.filter(
        (item) => item !== field,
      );
    }
    layerMetadata.sequenceFieldSelected = sequenceFieldSelected;
    Object.keys(layerMetadata.filteredOptions).map((key) => {
      if (!sequenceFieldSelected.includes(key)) {
        delete layerMetadata.filteredOptions[key];
      }
    });
    metadata[relatedTableLayer.id] = layerMetadata;
    setMetadata({ ...metadata });
  };

  return (
    <div className={"IndicatorLayerMiddleConfig " + (open ? "Open" : "")}>
      <Fragment>
        {relatedTableLayer && selectedRelatedTableLayer ? (
          <Fragment>
            <div
              id="RelatedTableLayerMiddleConfigReal"
              className="WhereConfigurationWrapper"
            >
              <WhereQueryGenerator
                fields={updateFields(relatedFields)}
                whereQuery={config.where}
                setWhereQuery={(where) => {
                  const indicatorLayer = indicatorLayers.find(
                    (layer) => layer.id === relatedTableLayer.id,
                  );
                  config.where = where;
                  updateOptions(where);
                  if (
                    JSON.stringify(indicatorLayer.config) !==
                    JSON.stringify(config)
                  ) {
                    indicatorLayer.config = config;
                    dispatch(Actions.IndicatorLayers.update(indicatorLayer));
                  }
                }}
                disabledChanges={{
                  add: true,
                  remove: true,
                  sql: true,
                  and_or: true,
                  field: true,
                  operator: true,
                }}
                isCompact={true}
                onValueInputChange={(field) => {
                  resetFilter(field);
                }}
                resetFilter={(field) => {
                  resetFilter(field, true);
                }}
              />
            </div>
          </Fragment>
        ) : null}
      </Fragment>
    </div>
  );
}
