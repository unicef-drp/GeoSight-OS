import React, { useEffect, useState } from "react";
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

  /** Read url **/
  const readUrl = () => {
    if (!url) return;
    setRequest({ loading: true, error: "", requestData: null });
    fetchSdmx(url)
      .then(async (array: Record<string, any>[]) => {
        setRequest({ loading: false, error: "", requestData: array });
      })
      .catch(() => {
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
      readUrl();
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
          onClick={readUrl}
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
