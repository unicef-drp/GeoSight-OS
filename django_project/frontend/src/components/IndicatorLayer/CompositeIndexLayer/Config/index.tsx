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
 * __date__ = '02/09/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
/**
 * TODO : Make this as references for other indicator layer *
 */
import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { GeneralForm } from "./General";
import { defaultCompositeIndexLayer } from "../variable";
import Modal, { ModalContent, ModalHeader } from "../../../Modal";
import { SaveButton } from "../../../Elements/Button";
import { useDisclosure } from "../../../../hooks";
import { AdminForm } from "../../../../pages/Admin/Components/AdminForm";

import StyleConfig from "../../../../pages/Admin/Style/Form/StyleConfig";
import LabelForm from "../../../../pages/Admin/Indicator/Form/LabelForm";
import PopupConfigForm
  from "../../../../pages/Admin/Dashboard/Form/IndicatorLayers/PopupConfigForm";
import { IndicatorLayerConfig } from "../../../../types/IndicatorLayer";
import { Logger } from "../../../../utils/logger";

import "./style.scss";

export interface Props {
  config: any;
  setConfig: (data: any) => void;
  icon?: ReactElement;
  showGeneral?: boolean;
}

export const CompositeIndexLayerConfig = forwardRef(
  ({ config, setConfig, icon, showGeneral }: Props, ref) => {
    const { t } = useTranslation();
    const { open, onOpen, onClose } = useDisclosure();

    const [data, setData] = useState<IndicatorLayerConfig>(
      defaultCompositeIndexLayer(),
    );

    // Ref functions
    useImperativeHandle(ref, () => ({
      open() {
        onOpen();
      },
      close() {
        onClose();
      },
    }));

    /** Update data **/
    const updateData = (newData: IndicatorLayerConfig) => {
      setData(JSON.parse(JSON.stringify(newData)));
    };

    /** Update data when opened **/
    useEffect(() => {
      if (!config) {
        setData(defaultCompositeIndexLayer());
      } else {
        setData(config);
      }
    }, [open]);

    /** Apply data **/
    const apply = () => {
      setConfig(data);
      onClose();
      Logger.log("COMPOSITE_INDEX_LAYER_CONFIG:", JSON.stringify(data));
    };

    return (
      <>
        <Modal
          className="IndicatorLayerConfig DynamicIndicator MuiBox-Large"
          open={open}
          onClosed={() => {
            onClose();
          }}
        >
          <ModalHeader
            onClosed={() => {
              onOpen();
            }}
          >
            {t("Composite index layer configuration")}
          </ModalHeader>
          <ModalContent className="Gray">
            <div
              className="SaveButton-Section"
              style={{
                marginBottom: "1rem",
                marginRight: "1rem",
                display: "flex",
                flexDirection: "row-reverse",
              }}
            >
              <SaveButton
                variant="primary"
                text={"Apply Changes"}
                onClick={apply}
              />
            </div>
            <div className="AdminForm Section">
              <AdminForm
                /* @ts-ignore */
                selectableInput={false}
                forms={{
                  ...(showGeneral && {
                    General: (
                      // @ts-ignore
                      <GeneralForm data={data} setData={updateData} />
                    ),
                  }),
                  Style: (
                    /* @ts-ignore */
                    <StyleConfig
                      data={data}
                      setData={(newData: any) => {
                        updateData(newData);
                      }}
                      defaultStyleRules={data.style ? data.style : []}
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
                      setIndicator={(newDataLayer: IndicatorLayerConfig) => {
                        data.popup_template = newDataLayer.popup_template;
                        data.popup_type = newDataLayer.popup_type;
                        data.data_fields = newDataLayer.data_fields;
                        updateData(data);
                      }}
                    />
                  ),
                }}
              />
            </div>
          </ModalContent>
        </Modal>
        {isValidElement(icon)
          ? cloneElement(icon as ReactElement, { onClick: onOpen })
          : null}
      </>
    );
  },
);

export default CompositeIndexLayerConfig;
