import React from "react";

import "./style.scss";
import { MainDataGrid } from "../Table";

export interface Props {
  onSelected: (entity: Object) => void;
}

/** SDMX Preview Component */
const SDMXForm = ({ url }: Props) => {
  // Render
  return (
    <MainDataGrid
      style={{ height: "500px" }}
      rows={loading ? [] : requestData ? requestData : []}
      columns={
        requestData
          ? Object.keys(requestData[0]).map((key) => {
              return {
                field: key,
                headerName: key,
                hide: key === "id" ? true : false,
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
  );
};

export default SDMXForm;
