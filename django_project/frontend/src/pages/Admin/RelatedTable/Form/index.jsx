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
 * __date__ = '31/01/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useRef, useState } from "react";
import $ from "jquery";

import { render } from "../../../../app";
import { store } from "../../../../store/admin";
import { SaveButton } from "../../../../components/Elements/Button";
import Admin, { pageNames } from "../../index";
import { AdminForm } from "../../Components/AdminForm";
import DjangoTemplateForm from "../../Components/AdminForm/DjangoTemplateForm";
import { resourceActions } from "../List";
import FieldConfig from "./Field";
import { RelatedTableDataTable } from "../Data";

import "./style.scss";

/**
 * Related Table Form App
 */
export default function RelatedTableForm() {
  const formRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState([]);
  const selectableInput = batch !== null;

  /** On init **/
  useEffect(() => {
    try {
      setFields(JSON.parse($("#id_data_fields").val()));
    } catch (err) {}
  }, []);
  return (
    <Admin
      minifySideNavigation={true}
      pageName={pageNames.RelatedTables}
      rightHeader={
        <Fragment>
          {initialData.id
            ? resourceActions(
                {
                  id: initialData.id,
                  row: {
                    ...initialData,
                    permission,
                  },
                },
                true,
              )
            : null}
          <SaveButton
            variant="primary"
            text="Submit"
            onClick={() => {
              formRef.current.submit(true);
              setSubmitted(true);
            }}
            disabled={submitted ? true : false}
          />
        </Fragment>
      }
    >
      <AdminForm
        ref={formRef}
        selectableInput={selectableInput}
        forms={
          batch
            ? {
                General: (
                  <DjangoTemplateForm
                    selectableInput={selectableInput}
                    selectableInputExcluded={["name", "shortcode"]}
                  />
                ),
              }
            : {
                General: (
                  <DjangoTemplateForm
                    selectableInput={selectableInput}
                    selectableInputExcluded={["name", "shortcode"]}
                  />
                ),
                Fields: (
                  <FieldConfig
                    data_fields={fields}
                    update={(fields) => {
                      $("#id_data_fields").val(JSON.stringify(fields));
                    }}
                  />
                ),
                Data: (
                  <RelatedTableDataTable
                    url={urls.api.data}
                    urlDetail={urls.api.detail}
                  />
                ),
              }
        }
      />
    </Admin>
  );
}

render(RelatedTableForm, store);
