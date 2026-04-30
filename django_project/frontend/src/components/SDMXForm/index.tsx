import React, { useEffect, useState } from "react";
import {
  SMDXAgencySelector,
  SMDXConfigSelector,
  SMDXDataFlowSelector,
  SMDXDataFlowVersionSelector,
  SMDXDimensions,
} from "./DropdownInput";
import { SDMXConfig, SDMXDataForm } from "../../types/SDMX";
import { constructSDMXUrl } from "./utilities";

import "./style.scss";

interface Props {
  urlChanged: (url: string) => void;
  dataChanged?: (data: SDMXDataForm) => void;
}

/** SMDX Form Component */
const SDMXForm = ({ urlChanged, dataChanged }: Props) => {
  // @ts-ignore
  const sdmxConfigList: SDMXConfig[] = sdmxData;

  const [data, setData] = useState<SDMXDataForm>({});
  const { url } = data;

  // When url changed
  useEffect(() => {
    urlChanged(url);
  }, [url]);

  // When data changed
  useEffect(() => {
    if (dataChanged) {
      dataChanged(data);
    }
  }, [data]);

  const sdmxConfig = sdmxConfigList.find((_) => _.id === data.smdxConfigId);

  // When data changed
  useEffect(() => {
    if (
      (data.smdxConfigId && data.agencyId && data.dataflowId,
      data.dimensionKeys)
    ) {
      const url =
        constructSDMXUrl(
          sdmxConfig.urls.data,
          data.agencyId,
          data.dataflowId,
          data.dataflowVersionId,
          data.dimensionKeys,
          data.dimensions || {},
        ).split("?")[0] + "?format=csv";
      if (data.url !== url) {
        setData({ ...data, url: url });
      }
    } else {
      if (data.url) {
        setData({ ...data, url: null });
      }
    }
  }, [data]);

  // Render
  return (
    <div className="FormAttribute">
      <SMDXConfigSelector
        selectedValue={data.smdxConfigId}
        onChangeValue={(value) => {
          setData((prev) => ({
            ...prev,
            url: null,
            agencyId: null,
            dataflowId: null,
            dataflowDsdId: null,
            dataflowVersionId: null,

            smdxConfigId: value,
          }));
        }}
      />
      {data.smdxConfigId && (
        <SMDXAgencySelector
          sdmxConfig={sdmxConfig}
          selectedValue={data.agencyId}
          onChangeValue={(value) => {
            setData((prev) => ({
              ...prev,
              url: null,
              agencyId: value,
              dataflowId: null,
              dataflowDsdId: null,
              dataflowVersionId: null,
            }));
          }}
        />
      )}
      {data.agencyId && (
        <SMDXDataFlowSelector
          sdmxDataForm={data}
          sdmxConfig={sdmxConfig}
          selectedValue={data.dataflowId}
          onChangeValue={(value) => {}}
          onChangeDataFlow={(value, dsdId) => {
            setData((prev) => ({
              ...prev,
              url: null,
              dataflowId: value,
              dataflowDsdId: dsdId,
              dataflowVersionId: null,
            }));
          }}
        />
      )}
      {data.dataflowId && (
        <SMDXDataFlowVersionSelector
          sdmxDataForm={data}
          sdmxConfig={sdmxConfig}
          selectedValue={data.dataflowVersionId}
          onChangeValue={(value) => {
            setData((prev) => ({
              ...prev,
              url: null,
              dataflowVersionId: value,
            }));
          }}
        />
      )}
      {data.dataflowVersionId && (
        <SMDXDimensions
          sdmxDataForm={data}
          sdmxConfig={sdmxConfig}
          selectedValue={data.dataflowVersionId}
          onChangeValue={() => {}}
          onChange={() => {
            setData({ ...data, dimensions: data.dimensions });
          }}
        />
      )}
    </div>
  );
};

export default SDMXForm;
