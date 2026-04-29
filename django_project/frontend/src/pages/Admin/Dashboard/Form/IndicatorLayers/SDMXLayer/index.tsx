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

import "./style.scss";
import { useTranslation } from "react-i18next";
import StyleConfig from "../../../../Style/Form/StyleConfig";
import LayerNameDescription from "../LayerNameDescription";
import OverrideAdminLevelConfiguration from "../OverrideAdminLevelConfiguration";
import { useSelector } from "react-redux";

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

    const disabled = false;

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
            <div className="AdminForm Section">
              <AdminForm
                // @ts-ignore
                forms={{
                  General: (
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
