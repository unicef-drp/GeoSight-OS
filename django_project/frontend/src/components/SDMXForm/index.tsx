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
  SDMXDataForm,
} from "../../types/SDMX";
import { constructSDMXUrl } from "./utilities";
import { fetchSdmx } from "../../utils/sdmx";

import "./style.scss";

interface Props {
  dataChanged?: (data: SDMXDataForm) => void;
}

/** SMDX Form Component */
const SDMXForm = ({ dataChanged }: Props) => {
  // @ts-ignore
  const sdmxConfigList: SDMXConfig[] = sdmxData;

  const [data, setData] = useState<SDMXDataForm>({ mode: "config" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = data.mode ?? SDMX_MODE_CONFIG;
  const { url } = data;

  const sdmxConfig = sdmxConfigList.find((_) => _.id === data.smdxConfigId);

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
      .then(async (array) => {
        if (requestedUrl !== url) return;
        const headers = array[0];
        setData((prev) => ({ ...prev, attributeKeys: headers }));
      })
      .catch((err) => setError(err?.message || "Failed to fetch URL"))
      .finally(() => setLoading(false));
  };
  // When url changed, fetch dimensions
  useEffect(() => {
    checkUrl(url);
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
    <div className="FormAttribute">
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
              setData((prev) => ({
                ...prev,
                url: e.target.value,
              }))
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
        </>
      )}
    </div>
  );
};

export default SDMXForm;
