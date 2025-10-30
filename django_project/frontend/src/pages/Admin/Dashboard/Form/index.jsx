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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";

import App, { render } from "../../../../app";
import { pageNames } from "../../index";
import { Actions, store } from "../../../../store/dashboard";
import SideNavigation from "../../Components/SideNavigation";
import Dashboard from "../../../Dashboard/index";
import {
  SaveButton,
  ThemeButton,
} from "../../../../components/Elements/Button";
import { dictDeepCopy, slugify } from "../../../../utils/main";
import {
  Notification,
  NotificationStatus,
} from "../../../../components/Notification";

// Dashboard Form
import GeorepoAuthorizationModal
  from "../../../../components/GeorepoAuthorizationModal";
import { resourceActions } from "../List";

// Dashboard Preview
import { postData } from "../../../../Requests";
import { dataFieldsDefault } from "../../../../utils/indicatorLayer";
import { MapActiveIcon } from "../../../../components/Icons";

import "../../../Dashboard/style.scss";
import "./style.scss";
import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "../../../../components/Modal";
import DashboardFormContent from "./DashboardContent";
import { PAGES } from "./types.d";
import DashboardFormHeader from "./DashboardFormHeader";
import Tooltip from "@mui/material/Tooltip";
import { IS_DEBUG } from "../../../../utils/logger";
import DashboardHistory from "./History";

/**
 * Dashboard history
 */

export function DashboardSaveAsForm({ submitted, onSaveAs }) {
  const [openSaveAs, setOpenSaveAs] = useState(false);
  const [nameData, setNameData] = useState("");
  const [slugInput, setSlugInput] = useState("");

  useEffect(() => {
    if (openSaveAs) {
      setNameData($("#GeneralName").val());
      setSlugInput($("#GeneralSlug").val());
    }
  }, [openSaveAs]);

  useEffect(() => {
    if (nameData) {
      $("#GeneralName").val(nameData);
    }
  }, [nameData]);

  useEffect(() => {
    if (slugInput) {
      $("#GeneralSlug").val(slugInput);
    }
  }, [slugInput]);

  return (
    <>
      <Modal
        className="SaveAsModal"
        open={openSaveAs}
        onClosed={() => {
          setOpenSaveAs(false);
        }}
      >
        <ModalHeader
          onClosed={() => {
            setOpenSaveAs(false);
          }}
        >
          <b>Save project as...</b>
        </ModalHeader>
        <ModalContent>
          <div className="BasicForm">
            <div className="BasicFormSection">
              <div>
                <label className="form-label required" htmlFor="name">
                  Name
                </label>
              </div>
              <div>
                <span className="form-input">
                  <input
                    id="GeneralName"
                    type="text"
                    name="name"
                    required={true}
                    placeholder="Example: Afghanistan Risk Dashboard"
                    value={nameData}
                    onChange={(event) => {
                      setNameData(event.target.value);
                      setSlugInput(slugify(event.target.value));
                    }}
                  />
                </span>
              </div>
              <br />
              <label className="form-label" htmlFor="name">
                URL Shortcode
              </label>
              <div>
                <span className="form-input">
                  <input
                    type="text"
                    name="name"
                    required={true}
                    value={slugInput}
                    onChange={(event) => {
                      setSlugInput(slugify(event.target.value));
                    }}
                  />
                </span>
              </div>
              <span className="form-helptext">
                Url of project in slug format. It will auto change space to "-"
                and to lowercase. It will be generated from name if empty.
                <br />
                Please change it if it is same with the origin one.
              </span>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <div style={{ display: "flex" }}>
            <div className="Separator" />
            <ThemeButton
              variant="Basic Reverse"
              onClick={() => {
                setOpenSaveAs(false);
              }}
            >
              Cancel
            </ThemeButton>
            <SaveButton
              variant="primary"
              text="Create"
              onClick={() => {
                onSaveAs();
              }}
            />
          </div>
        </ModalFooter>
      </Modal>
      <SaveButton
        variant="primary"
        text={submitted ? "Creating..." : "Save as"}
        onClick={() => {
          setOpenSaveAs(true);
        }}
        className={submitted ? "Submitted" : ""}
        disabled={submitted}
      />
    </>
  );
}

/**
 * Dashboard Save Form
 */
export function DashboardSaveForm() {
  const dispatch = useDispatch();
  const {
    id,
    referenceLayer,
    indicatorLayers,
    indicatorLayersStructure,
    indicators,
    basemapsLayers,
    basemapsLayersStructure,
    contextLayers,
    contextLayersStructure,
    relatedTables,
    widgets,
    widgetsStructure,
    extent,
    filters,
    filtersAllowModify,
    filtersBeingHidden,
    permission,
    geoField,
    levelConfig,
    default_time_mode,
    tools,
    transparency_config,

    // Configurations
    show_splash_first_open,
    truncate_indicator_layer_name,
    layer_tabs_visibility,
    show_map_toolbar,
  } = useSelector((state) => state.dashboard.data);
  const { data } = useSelector((state) => state.dashboard);
  const [submitted, setSubmitted] = useState(false);

  // Notification
  const notificationRef = useRef(null);
  const notify = (newMessage, newSeverity = NotificationStatus.INFO) => {
    notificationRef?.current?.notify(newMessage, newSeverity);
  };

  // Check histories
  const {
    checkpoint,
    currentIdx,
    // @ts-ignore
  } = useSelector((state) => state.dashboardHistory);

  /** On save **/
  const onSave = (targetUrl = document.location.href) => {
    setSubmitted(true);
    const errors = [];
    const name = $("#GeneralName").val();
    const slug = $("#GeneralSlug").val();
    const description = $("#GeneralDescription").val();
    const overview = $("#GeneralOverview").val();
    const icon = $("#GeneralIcon")[0].files[0];
    const category = $("#GeneralCategory .ReactSelect__single-value").text();

    if (!name) {
      errors.push("Name is empty, please fill it.");
    }
    if (!slug) {
      errors.push("Slug is empty, please fill it.");
    }
    if (basemapsLayers.length === 0) {
      errors.push("Basemap is empty, please select one or more basemap.");
    }

    // Submit dashboard
    if (errors.length === 0) {
      const dashboardData = {
        reference_layer: referenceLayer.identifier,
        level_config: levelConfig,
        indicator_layers: dictDeepCopy(indicatorLayers).map(
          (indicatorLayer) => {
            if (
              indicatorLayer.data_fields &&
              JSON.stringify(indicatorLayer.data_fields) ===
                JSON.stringify(dataFieldsDefault())
            ) {
              indicatorLayer.data_fields = null;
            }
            return indicatorLayer;
          },
        ),
        indicator_layers_structure: indicatorLayersStructure,
        context_layers: contextLayers.map(function (model) {
          return {
            id: model.id,
            order: model.order,
            visible_by_default: model.visible_by_default,
            data_fields: model.data_fields,
            styles: JSON.stringify(model.styles),
            label_styles: JSON.stringify(model.label_styles),
            override_style: model.override_style,
            override_label: model.override_label,
            override_field: model.override_field,
            configuration: model.configuration,
          };
        }),
        context_layers_structure: contextLayersStructure,
        indicators: indicators.map(function (model) {
          return {
            id: model.id,
            order: model.order,
            visible_by_default: model.visible_by_default,
            group: model.group,
            override_style: model.override_style,
            style: model.style,
            style_id: model.style_id,
            style_type: model.style_type,
            style_config: model.style_config,
            override_label: model.override_label,
            label_config: model.label_config,
          };
        }),
        basemaps_layers: basemapsLayers.map(function (model) {
          return {
            id: model.id,
            order: model.order,
            visible_by_default: model.visible_by_default,
            group: model.group,
            group_parent: model.group_parent,
          };
        }),
        basemaps_layers_structure: basemapsLayersStructure,
        related_tables: relatedTables.map(function (model) {
          return {
            id: model.id,
            selected_related_fields: model.selected_related_fields,
            geography_code_field_name: model.geography_code_field_name,
            geography_code_type: model.geography_code_type,
            order: model.order,
            query: model.query,
          };
        }),
        extent: extent,
        widgets: widgets,
        widgets_structure: widgetsStructure,
        filters: filters,
        filters_allow_modify: filtersAllowModify,
        filters_being_hidden: filtersBeingHidden,
        permission: permission,
        tools: tools,
      };

      // onOpen();
      var formData = new FormData();
      if (data.id) {
        formData.append("origin_id", data.id);
      }
      formData.append("slug", slug);
      formData.append("icon", icon);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("overview", overview);
      formData.append("group", category);
      formData.append("data", JSON.stringify(dashboardData));
      formData.append("geoField", geoField);

      // Configurations
      formData.append("show_splash_first_open", show_splash_first_open);
      formData.append(
        "truncate_indicator_layer_name",
        truncate_indicator_layer_name,
      );
      formData.append("layer_tabs_visibility", layer_tabs_visibility);
      formData.append("default_time_mode", JSON.stringify(default_time_mode));
      formData.append("show_map_toolbar", show_map_toolbar);
      formData.append(
        "transparency_config",
        JSON.stringify(transparency_config),
      );
      postData(targetUrl, formData, function (response, responseError) {
        setSubmitted(false);
        if (responseError) {
          notify("" + responseError, NotificationStatus.ERROR);
        } else {
          const currUrl = window.location.href.split("#")[0];
          if (!id) {
            window.location = response.url;
          } else if (currUrl !== response.url) {
            window.location = response.url;
          } else {
            notify("Configuration has been saved!", NotificationStatus.SUCCESS);
            dispatch(Actions.DashboardHistory.applyCheckpoint());
          }
        }
      });
    } else {
      notify(errors.join(" "), NotificationStatus.ERROR);
      setSubmitted(false);
    }
  };

  return (
    <>
      {id ? (
        <DashboardSaveAsForm
          submitted={submitted}
          onSaveAs={() => {
            onSave(urls.admin.dashboardCreate);
          }}
        />
      ) : null}
      <SaveButton
        variant="primary"
        text={submitted ? "Saving..." : "Save"}
        onClick={() => {
          onSave();
        }}
        className={submitted ? "Submitted" : ""}
        disabled={
          submitted || !Object.keys(data).length || checkpoint === currentIdx
        }
      />
      <Notification ref={notificationRef} />
    </>
  );
}

/**
 * Dashboard Form Section
 */
export function DashboardForm({ onPreview }) {
  const id = useSelector((state) => state.dashboard.data?.id);
  const name = useSelector((state) => state.dashboard.data?.name);
  const view_url = useSelector((state) => state.dashboard.data?.view_url);
  const user_permission = useSelector(
    (state) => state.dashboard.data?.user_permission,
  );
  const [currentPage, setCurrentPage] = useState(PAGES.GENERAL);
  const className = currentPage.replaceAll(" ", "");

  // Callback for setCurrentPage
  const setCurrentPageCallback = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="Admin">
      <SideNavigation pageName={pageNames.Dashboard} minified={true} />
      <div className="AdminContent">
        <GeorepoAuthorizationModal />
        <div className="AdminContentHeader">
          <div className="AdminContentHeader-Left">
            <b
              className="light"
              dangerouslySetInnerHTML={{ __html: contentTitle }}
            ></b>
          </div>
          <div className="AdminContentHeader-Right">
            {id
              ? resourceActions({
                  id: id,
                  row: {
                    id,
                    name,
                    permission: user_permission,
                  },
                })
              : null}
            <DashboardHistory
              page={currentPage}
              setPage={setCurrentPageCallback}
            />
            {view_url && (
              <Tooltip
                title={
                  <p style={{ fontSize: "12px" }}>
                    To preview the project, please save your changes first and
                    refresh the preview page to see the updates.
                  </p>
                }
                className={"tooltip"}
              >
                <a href={view_url} target="_blank">
                  <ThemeButton variant="primary">
                    <MapActiveIcon />
                    Preview
                  </ThemeButton>
                </a>
              </Tooltip>
            )}
            {IS_DEBUG && (
              <ThemeButton variant="primary" onClick={onPreview}>
                <MapActiveIcon />
                Live Preview
              </ThemeButton>
            )}
            <DashboardSaveForm />
          </div>
        </div>

        {/* DASHBOARD FORM */}
        <div className="DashboardFormWrapper">
          <div className={"AdminForm DashboardForm " + className}>
            {/* FORM CONTENT */}
            <DashboardFormHeader page={currentPage} setPage={setCurrentPage} />

            {/* FORM CONTENT */}
            <DashboardFormContent page={currentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Form App
 */
export default function DashboardFormApp() {
  const dispatch = useDispatch();
  const [currentMode, setCurrentMode] = useState("FormMode");

  // Change current mode
  useEffect(() => {
    dispatch(
      Actions.GlobalState.update({ editMode: currentMode === "FormMode" }),
    );
  }, [currentMode]);

  return (
    <App className={currentMode}>
      {/* ADMIN SECTION */}
      <DashboardForm
        onPreview={() => {
          setCurrentMode("PreviewMode");
        }}
      />
      {/* DASHBOARD SECTION */}
      <Dashboard>
        <div className="BackToForm">
          <ThemeButton
            variant="primary"
            onClick={() => {
              setCurrentMode("FormMode");
            }}
          >
            <ViewHeadlineIcon />
            Back to Form
          </ThemeButton>
        </div>
      </Dashboard>
    </App>
  );
}

render(DashboardFormApp, store);
