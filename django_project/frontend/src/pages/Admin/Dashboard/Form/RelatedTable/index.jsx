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

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ListForm from "../ListForm";
import { Actions } from "../../../../../store/dashboard";
import { relatedTableColumns } from "../../../RelatedTable/List/Attributes";
import {
  MultipleSelectWithSearch,
  SelectWithSearch,
} from "../../../../../components/Input/SelectWithSearch";
import { getRelatedTableFields } from "../../../../../utils/relatedTable";
import WhereInputModal
  from "../../../../../components/SqlQueryGenerator/WhereInputModal";
import Match from "../../../../../utils/Match";
import { fetchingData } from "../../../../../Requests";
import { dictDeepCopy } from "../../../../../utils/main";
import { getCountryGeomIds } from "../../../../../utils/Dataset";
import RelatedTableSelector
  from "../../../../../components/ResourceSelector/RelatedTableSelector";

import "./style.scss";
import { useResourceMeta } from "../../../../../components/AdminList";

/**
 * Related table configuration
 */
function RelatedTableConfiguration({ data, referenceLayerData, codeTypes }) {
  const prevState = useRef();
  const dispatch = useDispatch();
  const [relatedTableData, setRelatedTableData] = useState(null);

  // Loading data
  useEffect(() => {
    if (!open) {
      return;
    }
    if (
      !referenceLayerData?.data?.name ||
      !data.geography_code_field_name ||
      !data.geography_code_type
    ) {
      return;
    }
    const params = {
      country_geom_ids: getCountryGeomIds(referenceLayerData.data).join(","),
      geography_code_field_name: data.geography_code_field_name,
      geography_code_type: data.geography_code_type,
    };
    const url = `/api/v1/related-tables/${data.id}/geo-data/`;
    if (
      JSON.stringify(params) !== JSON.stringify(prevState.params) ||
      JSON.stringify(url) !== JSON.stringify(prevState.url)
    ) {
      prevState.params = params;
      prevState.url = url;
      setRelatedTableData(null);
      fetchingData(url, params, {}, function (response, error) {
        setRelatedTableData(dictDeepCopy(response));
      });
    }
  }, [
    data,
    data.geography_code_field_name,
    data.geography_code_type,
    referenceLayerData,
  ]);

  const relatedFields = relatedTableData
    ? getRelatedTableFields(data, relatedTableData)
    : null;
  return (
    <div className="BasicForm">
      <div className="RelatedTableConfiguration">
        <div className="GeographyCodeField">
          <div>Geography Code Field</div>
          <SelectWithSearch
            value={data.geography_code_field_name}
            onChangeFn={(evt) => {
              data.geography_code_field_name = evt;
              dispatch(Actions.RelatedTable.update(data));
            }}
            options={data.related_fields}
            className="FilterInput"
          />
        </div>
        <div className="GeographyCodeField">
          <div>Type of Geo Code</div>
          <SelectWithSearch
            value={
              data.geography_code_type ? data.geography_code_type : "ucode"
            }
            onChangeFn={(evt) => {
              data.geography_code_type = evt;
              dispatch(Actions.RelatedTable.update(data));
            }}
            options={codeTypes ? codeTypes : []}
            className="FilterInput"
          />
        </div>
        <div className="GeographyCodeField">
          <div>Related Fields</div>
          <MultipleSelectWithSearch
            value={
              data.selected_related_fields
                ? data.selected_related_fields
                : data.related_fields
            }
            onChangeFn={(evt) => {
              if (evt === data.related_fields) {
                delete data.selected_related_fields;
              } else {
                data.selected_related_fields = evt;
              }
              dispatch(Actions.RelatedTable.update(data));
            }}
            options={data.related_fields}
            className="FilterInput"
          />
        </div>
      </div>

      <WhereInputModal
        value={data.query ? data.query : ""}
        fields={relatedFields}
        setValue={(val) => {
          data.query = val;
          dispatch(Actions.RelatedTable.update(data));
        }}
        title={"Filter the Data"}
      />
    </div>
  );
}

/**
 * Related table dashboard
 */
export default function RelatedTableForm() {
  const dispatch = useDispatch();
  const { relatedTables, referenceLayer } = useSelector(
    (state) => state.dashboard.data,
  );

  const referenceLayerData = useSelector(
    (state) => state.referenceLayerData[referenceLayer?.identifier],
  );
  const codeTypes = referenceLayerData?.data?.possible_id_types;
  let columns = dictDeepCopy(relatedTableColumns);
  columns = columns.concat(useResourceMeta());
  return (
    <ListForm
      pageName={"RelatedTables"}
      data={relatedTables}
      dataStructure={{
        group: "",
        children: relatedTables.map((row) => row.id),
      }}
      setDataStructure={(structure) => {}}
      listUrl={urls.api.relatedTableListAPI}
      addLayerAction={(layer) => {
        layer.geography_code_field_name = Match.inList.geocode(
          layer.related_fields,
        );
        layer.geography_code_type =
          codeTypes && codeTypes[0] ? codeTypes[0] : "ucode";
        dispatch(Actions.RelatedTable.add(layer));
      }}
      removeLayerAction={(layer) => {
        dispatch(Actions.RelatedTable.remove(layer));
      }}
      changeLayerAction={(layer) => {
        dispatch(Actions.RelatedTable.update(layer));
      }}
      initColumns={columns}
      hasGroup={false}
      otherActionsFunction={(data) => {
        return (
          <RelatedTableConfiguration
            data={data}
            referenceLayerData={referenceLayerData}
            codeTypes={codeTypes}
          />
        );
      }}
      resourceSelector={<RelatedTableSelector />}
    />
  );
}
