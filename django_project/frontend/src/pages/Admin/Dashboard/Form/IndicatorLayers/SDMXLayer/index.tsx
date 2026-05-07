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

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { FormControl } from "@mui/material";

import PopupConfigForm from "../PopupConfigForm";
import { dictDeepCopy } from "../../../../../../utils/main";
import { AdminForm } from "../../../../Components/AdminForm";
import { CogIcon } from "../../../../../../components/Icons";
import LabelForm from "../../../../Indicator/Form/LabelForm";
import { IndicatorLayer } from "../../../../../../types/IndicatorLayer";
import { SDMXIndicatorLayerType } from "../../../../../../utils/indicatorLayer";
import Modal, {
  ModalContent,
  ModalHeader,
} from "../../../../../../components/Modal";
import {
  SaveButton,
  ThemeButton,
} from "../../../../../../components/Elements/Button";

import { useTranslation } from "react-i18next";
import StyleConfig from "../../../../Style/Form/StyleConfig";
import LayerNameDescription from "../LayerNameDescription";
import OverrideAdminLevelConfiguration from "../OverrideAdminLevelConfiguration";
import { useSelector } from "react-redux";
import SDMXForm from "../../../../../../components/SDMXForm";
import SDMXPreview from "../../../../../../components/SDMXForm/Preview";
import { SelectWithList } from "../../../../../../components/Input/SelectWithList";
import { dateTimeFormats } from "../../../../Components/Input/DateTimeSettings";
import { TYPES } from "../../../../../../components/SqlQueryGenerator/Aggregation";

import "./style.scss";

export interface SDMXLayerConfigProps {
  indicatorLayer?: IndicatorLayer;
  onUpdate: (indicatorLayer: IndicatorLayer) => void;
}

export interface SDMXLayerConfigRef {
  open: () => void;
}

/**
 * SDMXLayer Config
 */
const SDMXLayerConfig = forwardRef<SDMXLayerConfigRef, SDMXLayerConfigProps>(
  function SDMXLayerConfig({ indicatorLayer, onUpdate }, ref) {
    const { t } = useTranslation();
    const defaultData: IndicatorLayer = {
      id: 0,
      name: "",
      description: "",
      source: "",
      type: SDMXIndicatorLayerType,
      visible_by_default: false,
      last_update: "",
      indicators: [],
      related_tables: [],
      error: "",
      config: undefined,
    };

    const referenceLayer = useSelector(
      // @ts-ignore
      (state) => state.dashboard.data?.referenceLayer,
    );

    const [data, setData] = useState<IndicatorLayer>(defaultData);
    const [open, setOpen] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));
    const disabled =
      !data.name ||
      !data.config?.url?.length ||
      !data.config?.geomCodeField ||
      !data.config?.valueField ||
      !data.config?.aggregationType ||
      !data.config?.dateTimeField ||
      !data.config?.dateTimeFormat;

    // Open data selection when the props true
    useEffect(() => {
      if (!indicatorLayer) {
        setData(defaultData);
      } else {
        setData(indicatorLayer);
      }
    }, [open]);

    /** Update data **/
    const updateData = () => {
      setData(dictDeepCopy(data, true));
    };

    /** Apply data **/
    const apply = () => {
      onUpdate(data);
      setOpen(false);
    };

    // Open data selection when the props true
    useEffect(() => {
      if (!data?.config) return;
      const attributesKeys = data.config?.attributeKeys;
      const example = data.config?.example;
      let updated = false;
      if (attributesKeys.length > 0) {
        if (
          !data?.config?.geomCodeField &&
          attributesKeys.includes("REF_AREA")
        ) {
          data.config.geomCodeField = "REF_AREA";
          updated = true;
        }
        if (!data?.config?.valueField && attributesKeys.includes("OBS_VALUE")) {
          data.config.valueField = "OBS_VALUE";
        }
        if (
          !data?.config?.dateTimeField &&
          attributesKeys.includes("TIME_PERIOD")
        ) {
          data.config.dateTimeField = "TIME_PERIOD";
          updated = true;
        }
        const value = example[data.config.dateTimeField];
        if (value) {
          const detectFormat = (val: string): string => {
            if (/^\d+(\.\d+)?$/.test(val)) return "timestamp";
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val))
              return "%Y-%m-%dT%H:%M:%S";
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return "%Y-%m-%d";
            if (/^\d{4}-\d{2}$/.test(val)) return "%Y-%m";
            if (/^\d{4}$/.test(val)) return "%Y";
            return null;
          };
          const newValue = detectFormat(String(value));
          if (newValue && newValue !== data.config.dateTimeFormat) {
            data.config.dateTimeFormat = newValue;
            updated = true;
          }
        }
        if (!data?.config?.aggregationType) {
          data.config.aggregationType = "SUM";
          updated = true;
        }
      }
      if (updated) {
        updateData();
      }
    }, [data?.config?.attributeKeys]);

    // Agency name as source
    useEffect(() => {
      if (data.source) return;
      if (!data?.config?.agencyName) return;
      if (data.source !== data?.config?.agencyName) {
        data.source = data?.config?.agencyName;
      }
    }, [data?.config?.agencyName]);

    // Agency name as source
    useEffect(() => {
      if (data.name) return;
      if (!data?.config?.dataflowName) return;
      if (data.name !== data?.config?.dataflowName) {
        data.name = data?.config?.dataflowName;
      }
    }, [data?.config?.dataflowName]);

    return (
      <Fragment>
        <Modal
          className="IndicatorLayerConfig SDMXIndicatorLayerConfig MuiBox-Large"
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
            {t("SDMX Indicators Layer Configurations")}
          </ModalHeader>
          <ModalContent className="Gray">
            <div className="SaveButton-Section">
              <SaveButton
                variant="primary"
                text={t("Apply Changes")}
                disabled={disabled}
                onClick={apply}
              />
            </div>
            <div className="AdminForm Section SDMX-Indicator-Layer-Config">
              <AdminForm
                // @ts-ignore
                defaultTab={"Layer-Metadata"}
                // @ts-ignore
                forms={{
                  "Layer-Metadata": (
                    <>
                      {open && (
                        <div>
                          <LayerNameDescription
                            name={data.name}
                            description={data.description}
                            onChangeName={(name) => {
                              data.name = name;
                              updateData();
                            }}
                            onChangeDescription={(description) => {
                              data.description = description;
                              updateData();
                            }}
                          />
                          <div className="BasicFormSection">
                            <div>
                              <label className="form-label">Source</label>
                            </div>
                            <div className="ContextLayerConfig-IconSize">
                              <textarea
                                className="LayerDescriptionInput"
                                value={data.source}
                                onChange={(evt) => {
                                  data.source = evt.target.value;
                                  updateData();
                                }}
                              />
                            </div>
                          </div>

                          {/* ADMIN LEVEL CONFIGURATION*/}
                          <OverrideAdminLevelConfiguration
                            levelConfig={data.level_config}
                            onChange={(levelConfig) => {
                              data.level_config = levelConfig;
                              updateData();
                            }}
                            referenceLayer={referenceLayer}
                          />
                        </div>
                      )}
                    </>
                  ),
                  "SDMX-Config": (
                    <>
                      <SDMXForm
                        initialData={data.config}
                        dataChanged={(config) => {
                          data.config = config;
                          updateData();
                        }}
                      />
                    </>
                  ),
                  "Filter-Dimensions": <></>,
                  "Data-Config": (
                    <div className="BasicForm">
                      <FormControl className="BasicFormSection">
                        <label className="form-label required">
                          Column Geograph Code
                        </label>
                        {
                          <SelectWithList
                            list={data?.config?.attributeKeys || []}
                            value={data?.config?.geomCodeField}
                            onChange={(evt: any) => {
                              data.config.geomCodeField = evt.value;
                              updateData();
                            }}
                          />
                        }
                      </FormControl>
                      <FormControl className="BasicFormSection">
                        <label className="form-label required">
                          Value Column
                        </label>
                        <SelectWithList
                          list={data?.config?.attributeKeys || []}
                          value={data?.config?.valueField}
                          onChange={(evt: any) => {
                            data.config.valueField = evt.value;
                            updateData();
                          }}
                        />
                      </FormControl>
                      <FormControl className="BasicFormSection">
                        <label className={"form-label required"}>
                          Aggregation
                        </label>
                        <SelectWithList
                          list={Object.keys(TYPES)}
                          value={data?.config?.aggregationType}
                          onChange={(evt: any) => {
                            data.config.aggregationType = evt.value;
                            updateData();
                          }}
                        />
                      </FormControl>
                      <FormControl className="BasicFormSection">
                        <label className="form-label required" htmlFor="group">
                          Date Time Column/Field
                        </label>
                        {
                          <SelectWithList
                            menuPlacement={"top"}
                            placeholder={"Date Time Column/Field"}
                            list={data?.config?.attributeKeys || []}
                            value={data?.config?.dateTimeField}
                            showFloatingLabel={true}
                            onChange={(evt: any) => {
                              data.config.dateTimeField = evt.value;
                              updateData();
                            }}
                          />
                        }
                      </FormControl>
                      <FormControl className="BasicFormSection">
                        <label className="form-label required" htmlFor="group">
                          Date Time Format
                        </label>
                        <SelectWithList
                          menuPlacement={"top"}
                          list={dateTimeFormats}
                          value={data?.config?.dateTimeFormat}
                          showFloatingLabel={true}
                          onChange={(evt: any) => {
                            data.config.dateTimeFormat = evt.value;
                            updateData();
                          }}
                        />
                        <span className="form-helptext">
                          Specify input date/time format (e.g: YYYY-MM-DD or
                          YYYY-MM). Excel usually converts time to timestamp
                          format.
                        </span>
                      </FormControl>
                    </div>
                  ),
                  "Data Preview": (
                    <SDMXPreview url={data.config?.url} autoFetch={true} />
                  ),
                  Style: (
                    <StyleConfig
                      data={data}
                      setData={(newIndicatorLayer: IndicatorLayer) => {
                        setData({ ...newIndicatorLayer });
                        updateData();
                      }}
                      defaultStyleRules={data?.style ? data?.style : []}
                      defaultCodes={undefined}
                      selectableInput={undefined}
                      valuesUrl={undefined}
                    />
                  ),
                  Label: (
                    <LabelForm
                      indicator={data}
                      setIndicator={(newData: any) => {
                        setData({
                          ...data,
                          label_config: newData.label_config,
                        });
                      }}
                    />
                  ),
                  Popup: (
                    <PopupConfigForm
                      indicator={data}
                      setIndicator={(newDataLayer: IndicatorLayer) => {
                        data.popup_template = newDataLayer.popup_template;
                        data.popup_type = newDataLayer.popup_type;
                        data.data_fields = newDataLayer.data_fields;
                        updateData();
                      }}
                    />
                  ),
                }}
              />
            </div>
          </ModalContent>
        </Modal>
        {indicatorLayer && (
          <ThemeButton
            className="IndicatorStyleButton"
            onClick={() => {
              setOpen(true);
            }}
          >
            <CogIcon /> {t("Config")}
          </ThemeButton>
        )}
      </Fragment>
    );
  },
);

export default SDMXLayerConfig;
