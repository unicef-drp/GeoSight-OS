import React, { useEffect, useRef, useState } from "react";
import { FormControl } from "@mui/material";
import { MainDataGrid } from "../Table";
import { fetchSdmx } from "../../utils/sdmx";
import { ThemeButton } from "../Elements/Button";

import "./style.scss";

export interface Props {
  url: string;
  autoFetch?: boolean;
}

/** SDMX Preview Component */
export const SDMXPreview = ({ url, autoFetch }: Props) => {
  const [request, setRequest] = useState({
    error: "",
    loading: false,
    requestData: null,
  });
  const { error, loading, requestData } = request;
  const latestUrl = useRef(url);
  latestUrl.current = url;

  /** Read url **/
  const readUrl = (currentUrl: string, force: boolean = false) => {
    if (!currentUrl) return;
    setRequest({ loading: true, error: "", requestData: null });
    fetchSdmx(currentUrl, force)
      .then(async (array: Record<string, any>[]) => {
        if (latestUrl.current !== currentUrl) return;
        setRequest({ loading: false, error: "", requestData: array });
      })
      .catch(() => {
        if (latestUrl.current !== currentUrl) return;
        setRequest({
          loading: false,
          error: "The request is not csv format",
          requestData: null,
        });
      });
  };

  // Set default data
  useEffect(() => {
    if (autoFetch) {
      readUrl(url);
    }
  }, [url]);

  const columns = requestData
    ? Object.keys(requestData && requestData[0] ? requestData[0] : {}).map(
        (key) => {
          return {
            field: key,
            headerName: key,
            flex: 1,
            minWidth: 200,
          };
        },
      )
    : [];

  // Render
  return (
    <FormControl className="BasicFormSection">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label className="form-label required" style={{ flexGrow: 1 }}>
          Retrieved data
        </label>
        <ThemeButton
          variant="primary Basic"
          className="LoadDataButton"
          disabled={!url || loading}
          onClick={() => readUrl(url, true)}
          style={{ width: "100px" }}
        >
          Load Data
        </ThemeButton>
      </div>
      {error && <h2 className="LoadDataError">{error}</h2>}
      <div className="RetrievedData">
        <MainDataGrid
          style={{ height: "500px" }}
          rows={loading ? [] : requestData ? requestData : []}
          columns={columns}
          columnVisibilityModel={{
            id: false,
          }}
          pageSize={20}
          rowsPerPageOptions={[20]}
          disableSelectionOnClick
          loading={loading}
        />
      </div>
    </FormControl>
  );
};

export default SDMXPreview;
