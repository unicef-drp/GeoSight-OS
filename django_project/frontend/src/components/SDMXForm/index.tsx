import React, { useEffect, useState } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button, Radio } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";
import { SMDXConfigSelector, SMDXDimensions } from "./DropdownInput";
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
import SDMXConfigFields from "./SDMXConfigFields";

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
  const [configRefreshKey, setConfigRefreshKey] = useState(0);
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
              onChangeValue={() => {}}
              refreshKey={configRefreshKey}
              onChangeConfig={(value: SDMXConfig) => {
                setSdmxConfig(value);
                setData({
                  ...data,
                  url: null,
                  smdxConfigId: "" + value.id,
                  agencyId: value.agency_id,
                  agencyName: value.agency_name,
                  dataflowId: value.dataflow_id,
                  dataflowName: value.dataflow_name,
                  dataflowDsdId: value.dataflow_dsd_id,
                  dataflowVersionId: value.dataflow_version_id,
                });
              }}
            />
            <SDMXConfigFields
              sdmxConfig={sdmxConfig}
              data={data}
              onChange={setData}
            />
            <SDMXConfigUpdateButton
              sdmxConfig={sdmxConfig}
              data={data}
              onSaved={() => {
                setConfigRefreshKey((k) => k + 1);
                if (sdmxConfig) {
                  setSdmxConfig({
                    ...sdmxConfig,
                    agency_id: data.agencyId,
                    agency_name: data.agencyName,
                    dataflow_id: data.dataflowId,
                    dataflow_name: data.dataflowName,
                    dataflow_dsd_id: data.dataflowDsdId,
                    dataflow_version_id: data.dataflowVersionId,
                  });
                }
              }}
            />
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
