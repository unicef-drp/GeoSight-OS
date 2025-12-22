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

import React, { Fragment, useRef, useState } from "react";
import $ from "jquery";
import { Checkbox } from "@mui/material";

import { render } from "../../../../app";
import { store } from "../../../../store/admin";
import { SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from "../../index";
import { AdminForm } from "../../Components/AdminForm";
import StyleConfig from "../StyleConfig";
import RelatedTableFields from "./RelatedTableFields";
import DjangoTemplateForm from "../../Components/AdminForm/DjangoTemplateForm";
import { resourceActions } from "../List";
import { dictDeepCopy } from "../../../../utils/main";
import { Variables } from "../../../../utils/Variables";
import CloudNativeGISFields from "./CloudNativeGIS";

import "./style.scss";

let currentArcGis = null;
let init = false;

/**
 * Context Layer Form App
 */
export default function ContextLayerForm() {
  const formRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({});
  const selectableInput = batch !== null;
  const isBatch = batch !== null;
  const [tab, setTab] = useState(null);

  /** Set Data Function **/
  const setDataFn = () => {
    const formData = data;
    $(".BasicForm")
      .find("input")
      .each(function () {
        const name = $(this).attr("name");
        if (["override_field", "override_style"].includes(name)) {
          return;
        }
        if (name) {
          formData[name] = $(this).val();
        }
      });

    // FIELDS
    let override_field = false;
    if (formData["data_fields"]) {
      formData["data_fields"] = JSON.parse(formData["data_fields"]);
      if (formData["data_fields"].length) {
        override_field = true;
      }
    }

    // STYLES
    let override_style = false;
    if (formData["styles"]) {
      formData["styles"] = JSON.parse(formData["styles"]);
      override_style = true;
    }
    if (formData["label_styles"]) {
      formData["label_styles"] = JSON.parse(formData["label_styles"]);
    }
    formData["parameters"] = formData["parameters"]
      ? formData["parameters"]
      : {};
    if (!init) {
      formData.override_field = override_field;
      formData.override_style = override_style;
      init = true;
    }
    if (formData["configuration"]) {
      try {
        formData["configuration"] = JSON.parse(formData["configuration"]);
      } catch (e) {
        formData["configuration"] = {};
      }
    }
    setData(dictDeepCopy(formData));
  };

  const updateData = (newData) => {
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      setData(newData);
      $('*[name="label_styles"]').val(JSON.stringify(newData["label_styles"]));
      $('*[name="data_fields"]').val(JSON.stringify(newData["data_fields"]));
      $('*[name="styles"]').val(JSON.stringify(newData["styles"]));
      $('*[name="related_table"]').val(newData["related_table"]);
      $('*[name="cloud_native_gis_layer_id"]').val(
        newData["cloud_native_gis_layer_id"],
      );
      $('*[name="configuration"]').val(
        JSON.stringify(newData["configuration"]),
      );
    }
  };

  const typeChange = (value) => {
    // Hide arcgis
    if (value === Variables.LAYER.TYPE.ARCGIS) {
      $('div[data-wrapper-name="arcgis_config"]').show();
    } else {
      $('div[data-wrapper-name="arcgis_config"]').hide();
    }

    // Hide authentication
    if (
      [
        Variables.LAYER.TYPE.RELATED_TABLE,
        Variables.LAYER.TYPE.CLOUD_NATIVE_GIS,
        Variables.LAYER.TYPE.RASTER_COG,
      ].includes(value)
    ) {
      $('div[data-wrapper-name="token"]').hide();
      $('div[data-wrapper-name="username"]').hide();
      $('div[data-wrapper-name="password"]').hide();
    } else {
      $('div[data-wrapper-name="token"]').show();
      $('div[data-wrapper-name="username"]').show();
      $('div[data-wrapper-name="password"]').show();
    }

    // Hide URL
    if (
      [
        Variables.LAYER.TYPE.RELATED_TABLE,
        Variables.LAYER.TYPE.CLOUD_NATIVE_GIS,
      ].includes(value)
    ) {
      $('div[data-wrapper-name="url"]').hide();
    } else {
      $('div[data-wrapper-name="url"]').show();
    }
    setData({ ...data, layer_type: value });
  };

  const arcGisConfigChange = (value) => {
    currentArcGis = value;
    if (!value && data.layer_type === Variables.LAYER.TYPE.ARCGIS) {
      $('div[data-wrapper-name="token"]').show();
      $('div[data-wrapper-name="username"]').show();
      $('div[data-wrapper-name="password"]').show();
    } else {
      $('div[data-wrapper-name="token"]').hide();
      $('div[data-wrapper-name="username"]').hide();
      $('div[data-wrapper-name="password"]').hide();

      setData({
        ...data,
        arcgis_config: value,
      });
    }
  };

  return (
    <Admin
      minifySideNavigation={true}
      pageName={pageNames.ContextLayer}
      rightHeader={
        <Fragment>
          {initialData.id
            ? resourceActions({
                id: initialData.id,
                row: {
                  ...initialData,
                  permission,
                },
              })
            : null}
          <SaveButton
            variant="primary"
            text="Save"
            onClick={() => {
              formRef.current.submit(true);
              setSubmitted(true);
            }}
            disabled={submitted ? true : false}
          />
        </Fragment>
      }
    >
      {isBatch ? (
        <AdminForm
          ref={formRef}
          selectableInput={selectableInput}
          onTabChanges={setTab}
          forms={{
            General: (
              <DjangoTemplateForm
                selectableInput={selectableInput}
                selectableInputExcluded={["name", "shortcode"]}
                onChange={(name, value) => {
                  if (["override_field", "override_style"].includes(name)) {
                    return;
                  }
                }}
              ></DjangoTemplateForm>
            ),
          }}
        />
      ) : (
        <AdminForm
          ref={formRef}
          selectableInput={selectableInput}
          onTabChanges={setTab}
          forms={{
            General: (
              <DjangoTemplateForm
                selectableInput={selectableInput}
                selectableInputExcluded={["name", "shortcode"]}
                onChange={(name, value) => {
                  if (["override_field", "override_style"].includes(name)) {
                    return;
                  }
                  if (name === "layer_type") {
                    typeChange(value);
                  } else if (name === "arcgis_config") {
                    arcGisConfigChange(value);
                    setDataFn();
                  } else if (["url", "url_legend"].includes(name)) {
                    setDataFn();
                  }
                }}
              >
                <Checkbox
                  name={"override_field"}
                  style={{ display: "none" }}
                  checked={data?.override_field ? data?.override_field : false}
                  onChange={(evt) => {}}
                />
                <Checkbox
                  name={"override_style"}
                  style={{ display: "none" }}
                  checked={data?.override_style ? data?.override_style : false}
                  onChange={(evt) => {}}
                />
                {data.layer_type === Variables.LAYER.TYPE.RELATED_TABLE ? (
                  <RelatedTableFields data={data} onSetData={updateData} />
                ) : undefined}
                {data.layer_type === Variables.LAYER.TYPE.CLOUD_NATIVE_GIS ? (
                  <CloudNativeGISFields data={data} onSetData={updateData} />
                ) : null}
              </DjangoTemplateForm>
            ),
            Preview: (
              <StyleConfig
                data={data}
                setData={updateData}
                defaultTab={tab}
                useOverride={Variables.LAYER.LIST.OVERRIDE_STYLES.includes(
                  data.layer_type,
                )}
                useOverrideLabel={false}
              />
            ),
            Fields: <div />,
            Label: <div />,
          }}
        />
      )}
    </Admin>
  );
}

render(ContextLayerForm, store);
