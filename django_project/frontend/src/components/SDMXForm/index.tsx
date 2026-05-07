import React, { useEffect, useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button, Radio } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";
import {
  SMDXAgencySelector,
  SMDXConfigSelector,
  SMDXDataFlowSelector,
  SMDXDataFlowVersionSelector,
  SMDXDimensions,
} from "./DropdownInput";
import {
  SDMX_MODE_CONFIG,
  SDMX_MODE_URL,
  SDMX_MODES,
  SDMXConfig,
  SDMXDataForm,
} from "../../types/SDMX";
import { constructSDMXUrl } from "./utilities";
import { fetchSdmx } from "../../utils/sdmx";
import Separator from "../Admin/Separator";
import SDMXConfigUpdateButton from "./SDMXConfigUpdateButton";

import "./style.scss";

interface Props {
  initialData?: SDMXDataForm;
  dataChanged?: (data: SDMXDataForm) => void;
}

/** SMDX Form Component */
const SDMXForm = ({ initialData, dataChanged }: Props) => {
  const [data, setData] = useState<SDMXDataForm>(
    initialData ? initialData : { mode: "config" },
  );
  const [sdmxConfig, setSdmxConfig] = useState<SDMXConfig>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = data.mode ?? SDMX_MODE_CONFIG;
  const { url } = data;

  // When data changed
  useEffect(() => {
    if (dataChanged) {
      dataChanged(data);
    }
  }, [data]);

  const checkUrl = (url: string) => {
    if (!url) {
      setData((prev) => ({ ...prev, attributeKeys: [] }));
      return;
    }
    const requestedUrl = url;
    setLoading(true);
    setError(null);
    fetchSdmx(requestedUrl)
      .then(async (array: Record<string, any>[]) => {
        if (requestedUrl !== url) return;
        const headers = Object.keys(array[0]);
        setData((prev) => ({
          ...prev,
          attributeKeys: headers,
          example: array[0],
        }));
      })
      .catch((err) => setError(err?.message || "Failed to fetch URL"))
      .finally(() => setLoading(false));
  };
  // When url changed, fetch dimensions
  useEffect(() => {
    if (initialData?.url !== url) {
      checkUrl(url);
    }
  }, [url]);

  // When data changed
  useEffect(() => {
    if (mode === SDMX_MODE_URL) return;

    if (
      sdmxConfig?.urls &&
      data.smdxConfigId &&
      data.agencyId &&
      data.dataflowId &&
      data.dataflowVersionId
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
    <>
      <div className="FormAttribute SDMX-Config">
        <section className="BasicFormSection">
          <label className="form-label required">SDMX Mode</label>
          <RadioGroup
            row
            className="TypeSelector"
            value={mode}
            onChange={(evt) => {
              setData({ ...data, mode: evt.target.value });
            }}
          >
            {SDMX_MODES.map((opt) => (
              <FormControlLabel
                style={{ marginLeft: 0 }}
                value={opt}
                control={<Radio />}
                label={opt}
              />
            ))}
          </RadioGroup>
        </section>

        {/* SDMX URL */}
        <section className="BasicFormSection">
          <label className="form-label required">SDMX URL</label>
          <div style={{ display: "flex" }}>
            <input
              style={{ flexGrow: 1, width: "unset" }}
              type="text"
              disabled={mode === SDMX_MODE_CONFIG}
              className="form-control"
              value={url ?? ""}
              placeholder="https://..."
              onChange={(e) =>
                setData({
                  ...data,
                  url: e.target.value,
                })
              }
            />
            <Button
              // @ts-ignore
              variant="primary"
              disabled={!url || loading}
              onClick={() => checkUrl(url)}
            >
              {loading ? (
                <CircularProgress size="1rem" />
              ) : data.attributeKeys?.length ? (
                <>
                  <span>Check</span> <CheckIcon fontSize="small" />
                </>
              ) : (
                "Check"
              )}
            </Button>
          </div>
          {error && <span className="form-helptext error">{error}</span>}
        </section>
        {mode !== SDMX_MODE_URL && (
          <>
            <Separator>SDMX Config</Separator>
            <SMDXConfigSelector
              selectedValue={data.smdxConfigId}
              onChangeValue={(value) => {}}
              onChangeConfig={(value) => {
                setSdmxConfig(value);
                setData({
                  ...data,
                  url: null,
                  agencyId: value.config?.agencyId,
                  agencyName: value.config?.agencyName,
                  dataflowId: value.config?.dataflowId,
                  dataflowDsdId: value.config?.dataflowDsdId,
                  dataflowVersionId: value.config?.dataflowVersionId,

                  smdxConfigId: "" + value.id,
                });
              }}
            />
            <SMDXAgencySelector
              sdmxConfig={sdmxConfig}
              selectedValue={data.agencyId}
              onChangeValue={(value) => {}}
              onChangeAgency={(value, name) => {
                if (value === null) return;
                if (value === data.agencyId) return;
                setData({
                  ...data,
                  url: null,
                  agencyId: value,
                  agencyName: name,
                  dataflowId: null,
                  dataflowDsdId: null,
                  dataflowName: null,
                  dataflowVersionId: null,
                });
              }}
              disabled={!(sdmxConfig && data.smdxConfigId)}
            />
            <SMDXDataFlowSelector
              sdmxDataForm={data}
              sdmxConfig={sdmxConfig}
              selectedValue={data.dataflowId}
              onChangeValue={(value) => {}}
              onChangeDataFlow={(value, dsdId, name) => {
                if (value === null) return;
                if (value === data.dataflowId) return;
                setData({
                  ...data,
                  url: null,
                  dataflowId: value,
                  dataflowDsdId: dsdId,
                  dataflowName: name,
                  dataflowVersionId: null,
                });
              }}
              disabled={!(sdmxConfig && data.agencyId)}
            />
            <SMDXDataFlowVersionSelector
              sdmxDataForm={data}
              sdmxConfig={sdmxConfig}
              selectedValue={data.dataflowVersionId}
              onChangeValue={(value) => {
                if (value === null) return;
                if (value === data.dataflowVersionId) return;
                setData({
                  ...data,
                  url: null,
                  dataflowVersionId: value,
                });
              }}
              disabled={!(sdmxConfig && data.dataflowId)}
            />
            <SDMXConfigUpdateButton sdmxConfig={sdmxConfig} data={data} />
          </>
        )}
      </div>
      <div className="Filter-Dimensions">
        {sdmxConfig && data.dataflowVersionId && (
          <SMDXDimensions
            sdmxDataForm={data}
            sdmxConfig={sdmxConfig}
            selectedValue={data.dataflowVersionId}
            onChangeValue={() => {}}
            onChange={() => {
              if (data.dimensions === null) return;
              setData({ ...data, dimensions: data.dimensions });
            }}
          />
        )}
      </div>
    </>
  );
};

export default SDMXForm;
