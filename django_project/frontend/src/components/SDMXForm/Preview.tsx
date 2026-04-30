import React, { useState } from "react";
import { FormControl } from "@mui/material";
import { MainDataGrid } from "../Table";
import { fetchSdmx } from "../../utils/sdmx";
import { arrayToOptions } from "../../utils/main";
import { ThemeButton } from "../Elements/Button";

import "./style.scss";

export interface Props {
  url: string;
  setAttributes: (attributes: any) => void;
}

/** SDMX Preview Component */
export const SDMXPreview = ({ url, setAttributes }: Props) => {
  const [request, setRequest] = useState({
    error: "",
    loading: false,
    requestData: null,
  });
  const { error, loading, requestData } = request;

  /** Read url **/
  const readUrl = () => {
    setRequest({ loading: true, error: "", requestData: null });
    fetchSdmx(url)
      .then(async (array) => {
        const headers = array[0];
        const json = array.slice(1).map((row, idx) => {
          const obj: any = { id: idx };
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        });
        setRequest({ loading: false, error: "", requestData: json });
        setAttributes(arrayToOptions(array));
      })
      .catch(() => {
        setRequest({
          loading: false,
          error: "The request is not csv format",
          requestData: null,
        });
      });
  };

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
          columns={
            requestData
              ? Object.keys(
                  requestData && requestData[0] ? requestData[0] : {},
                ).map((key) => {
                  return {
                    field: key,
                    headerName: key,
                    flex: 1,
                    minWidth: 200,
                  };
                })
              : []
          }
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
