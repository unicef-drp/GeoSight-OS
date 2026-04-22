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

import React, { forwardRef, Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControlLabel, FormGroup } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import {
  SaveButton,
  ThemeButton,
} from "../../../../../../components/Elements/Button";
import { Actions } from "../../../../../../store/dashboard";
import Modal, {
  ModalContent,
  ModalHeader,
} from "../../../../../../components/Modal";
import { ViewLevelConfiguration } from "../../../../Components/Input/ReferenceLayerLevelConfiguration";
import LabelForm from "../../../../Indicator/Form/LabelForm";
import { AdminForm } from "../../../../Components/AdminForm";
import { dictDeepCopy } from "../../../../../../utils/main";
import PopupConfigForm from "../PopupConfigForm";
import StyleConfig from "../../../../Style/Form/StyleConfig";
import { CogIcon } from "../../../../../../components/Icons";

import "./style.scss";

export const IndicatorStyle = forwardRef(
  (
    {
      indicator,
      indicatorLayer,
      alwaysOverride = false,
      Button = false,
      header = null,
      onUpdate,
      ...props
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const { referenceLayer } = useSelector((state) => state.dashboard.data);
    const [dataLayer, setDataLayer] = useState(indicatorLayer);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      if (open) {
        setDataLayer({ ...indicatorLayer });
      }
    }, [open]);

    const apply = () => {
      if (dataLayer.override_name) {
        dataLayer.name = dataLayer.layer_name;
      } else {
        dataLayer.name = indicator.name;
      }
      if (dataLayer.override_description) {
        dataLayer.description = dataLayer.layer_description;
      } else {
        dataLayer.description = indicator.description;
      }
      dispatch(Actions.IndicatorLayers.update(dataLayer));
      setOpen(false);
    };

    /** Update data **/
    const updateData = () => {
      setDataLayer(dictDeepCopy(dataLayer, true));
    };
    const disabled =
      dataLayer.style_type === "Style from library." && !dataLayer?.style;
    return (
      <Fragment>
        <Modal
          className="IndicatorLayerConfig IndicatorRuleForm MuiBox-Large"
          open={open}
          onClosed={() => {
            setOpen(false);
          }}
        >
          <ModalHeader
            onClosed={() => {
              setOpen(false);
            }}
          >
            {header ? header : "Style for " + dataLayer.name}
          </ModalHeader>
          <ModalContent className="Gray">
            <div className="SaveButton-Section">
              <SaveButton
                variant="primary"
                text={"Apply Changes"}
                disabled={disabled}
                onClick={apply}
              />
            </div>
            <div className="AdminForm Section">
              <AdminForm
                selectableInput={false}
                forms={{
                  General: (
                    <div>
                      <div className="BasicFormSection">
                        <div>
                          <label className="form-label">Indicator</label>
                        </div>
                        <div>
                          <input
                            className="IndicatorName"
                            type="text"
                            spellCheck="false"
                            value={indicator.name}
                            disabled
                          />
                        </div>
                        <br />
                        <textarea
                          className="IndicatorDescription"
                          value={indicator.description}
                          disabled
                        />
                      </div>
                      <div className="BasicFormSection">
                        <div>
                          <label className="form-label">Name</label>
                        </div>
                        <div style={{ display: "flex" }}>
                          <Checkbox
                            className="LayerNameInputCheckbox"
                            title={"Override the name of the layer."}
                            onClick={(evt) => {
                              dataLayer.override_name =
                                !!!dataLayer.override_name;
                              updateData();
                            }}
                            checked={dataLayer.override_name}
                          />
                          <input
                            className="LayerNameInput"
                            type="text"
                            spellCheck="false"
                            disabled={!dataLayer.override_name}
                            value={dataLayer.layer_name}
                            onChange={(evt) => {
                              dataLayer.layer_name = evt.target.value;
                              updateData();
                            }}
                          />
                        </div>
                      </div>
                      <div className="BasicFormSection">
                        <div>
                          <label className="form-label">Description</label>
                        </div>
                        <div style={{ display: "flex" }}>
                          <Checkbox
                            className="LayerDescriptionInputCheckbox"
                            title={"Override the description of the layer."}
                            onClick={(evt) => {
                              dataLayer.override_description =
                                !!!dataLayer.override_description;
                              updateData();
                            }}
                            checked={dataLayer.override_description}
                          />
                          <textarea
                            className="LayerDescriptionInput"
                            disabled={!dataLayer.override_description}
                            value={dataLayer.layer_description}
                            onChange={(evt) => {
                              dataLayer.layer_description = evt.target.value;
                              updateData();
                            }}
                          />
                        </div>
                      </div>

                      {/* ADMIN LEVEL CONFIGURATION*/}
                      <div className="OverrideAdminLevel">
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={
                                  !!(
                                    dataLayer.level_config &&
                                    Object.keys(dataLayer.level_config).length
                                  )
                                }
                                onChange={(evt) => {
                                  if (evt.target.checked) {
                                    dataLayer.level_config = {
                                      default_level: 0,
                                    };
                                  } else {
                                    dataLayer.level_config = {};
                                  }
                                  updateData();
                                }}
                              />
                            }
                            label={"Override admin level configuration"}
                          />
                        </FormGroup>
                        {dataLayer.level_config &&
                        Object.keys(dataLayer.level_config).length ? (
                          <ViewLevelConfiguration
                            data={dataLayer.level_config}
                            setData={(levelConfig) => {
                              dataLayer.level_config = levelConfig;
                              updateData();
                            }}
                            referenceLayer={referenceLayer}
                            ableToSelectReferenceLayer={true}
                          />
                        ) : null}
                      </div>
                    </div>
                  ),
                  Style: (
                    <div>
                      <div>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={dataLayer.override_style}
                                onChange={(evt) => {
                                  dataLayer.override_style = evt.target.checked;
                                  if (dataLayer.override_style) {
                                    dataLayer.style_id = indicator.style_id;
                                    dataLayer.style = indicator.style;
                                    dataLayer.style_config =
                                      indicator.style_config;
                                    dataLayer.style_type = indicator.style_type;
                                  }
                                  updateData();
                                }}
                              />
                            }
                            label={"Override style from indicator style"}
                          />
                        </FormGroup>
                      </div>
                      {dataLayer.override_style ? (
                        <StyleConfig
                          data={dataLayer}
                          setData={(newData) => {
                            setDataLayer({ ...newData });
                            updateData();
                          }}
                          valuesUrl={`/api/v1/data-browser/values_string/?indicator_id__in=${indicator.id}`}
                          defaultStyleRules={
                            dataLayer.style
                              ? dataLayer.style
                              : indicator?.style
                                ? indicator?.style
                                : []
                          }
                          selectableInput={batch !== null}
                        />
                      ) : null}
                    </div>
                  ),
                  Label: (
                    <div>
                      <div>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={dataLayer.override_label}
                                onChange={(evt) => {
                                  dataLayer.override_label = evt.target.checked;
                                  if (dataLayer.override_label) {
                                    dataLayer.label_config =
                                      indicator.label_config;
                                  }
                                  updateData();
                                }}
                              />
                            }
                            label={"Override label from indicator label"}
                          />
                        </FormGroup>
                      </div>
                      {dataLayer.override_label ? (
                        <LabelForm
                          indicator={dataLayer}
                          setIndicator={(newData) => {
                            setDataLayer({
                              ...dataLayer,
                              label_config: newData.label_config,
                            });
                          }}
                        />
                      ) : null}
                    </div>
                  ),
                  Popup: (
                    <PopupConfigForm
                      indicator={dataLayer}
                      setIndicator={(newDataLayer) => {
                        dataLayer.popup_template = newDataLayer.popup_template;
                        dataLayer.popup_type = newDataLayer.popup_type;
                        dataLayer.data_fields = newDataLayer.data_fields;
                        updateData();
                      }}
                    />
                  ),
                }}
              />
            </div>
          </ModalContent>
        </Modal>
        <ThemeButton
          className="IndicatorStyleButton"
          onClick={() => {
            setOpen(true);
          }}
        >
          <CogIcon /> Config
        </ThemeButton>
      </Fragment>
    );
  },
);
