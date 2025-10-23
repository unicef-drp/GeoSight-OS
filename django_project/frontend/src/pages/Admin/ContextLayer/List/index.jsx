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

import React, { useState } from "react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { render } from "../../../../app";
import { store } from "../../../../store/admin";
import { pageNames } from "../../index";
import { COLUMNS, COLUMNS_ACTION } from "../../Components/List";
import PermissionModal from "../../Permission";
import AdminList, { useResourceMeta } from "../../../../components/AdminList";
import { Variables } from "../../../../utils/Variables";
import { DownloadIcon } from "../../../../components/Icons";
import { useDisclosure } from "../../../../hooks";
import { CLOUD_NATIVE_DOWNLOAD_FORMATS } from "../../../Dashboard/Toolbars/DataDownloader/ContextLayer";

import "./style.scss";

export function resourceActions(params) {
  return COLUMNS_ACTION(params, urls.admin.contextLayerList);
}

export function CloudNativeDownload({ id }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { open, onOpen, onClose } = useDisclosure();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    onOpen();
    event.preventDefault();
  };

  const handleClose = () => {
    setAnchorEl(null);
    onClose();
  };

  return (
    <>
      <a href="" onClick={handleClick}>
        <div className="ButtonIcon">
          <DownloadIcon />
        </div>
      </a>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem>
          <a
            href={urls.api.download.replace("/0", `/${id}`)}
            target="_blank"
            rel="noreferrer"
          >
            original
          </a>
        </MenuItem>
        {Object.keys(CLOUD_NATIVE_DOWNLOAD_FORMATS).map((format) => (
          <MenuItem>
            <a
              href={
                urls.api.download.replace("/0", `/${id}`) +
                "?file_format=" +
                format
              }
              target="_blank"
              rel="noreferrer"
            >
              {CLOUD_NATIVE_DOWNLOAD_FORMATS[format]}
            </a>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/**
 * Indicator List App
 */
export default function ContextLayerList() {
  const pageName = pageNames.ContextLayer;
  let columns = COLUMNS(pageName, urls.admin.contextLayerList);
  columns.pop();
  columns = columns.concat(
    [
      {
        field: "layer_type",
        headerName: "Layer type",
        flex: 0.5,
      },
    ].concat(useResourceMeta()),
  );
  columns.push({
    field: "actions",
    type: "actions",
    cellClassName: "MuiDataGrid-ActionsColumn",
    width: 100,
    getActions: (params) => {
      const permission = params.row.permission;
      const actions = resourceActions(params);
      // Unshift before more & edit action
      if (permission.share) {
        actions.unshift(
          <GridActionsCellItem
            icon={
              <a>
                <PermissionModal
                  name={params.row.name}
                  urlData={urls.api.permission.replace("/0", `/${params.id}`)}
                />
              </a>
            }
            label="Change Share Configuration."
          />,
        );
      }

      if (
        params.row.layer_type === Variables.LAYER.TYPE.CLOUD_NATIVE_GIS &&
        permission.read
      ) {
        actions.unshift(
          <GridActionsCellItem
            icon={<CloudNativeDownload id={params.id} />}
            label="Download data."
          />,
        );
      }
      return actions;
    },
  });
  return (
    <AdminList
      url={{
        list: urls.api.list,
        batch: urls.api.batch,
        detail: urls.api.detail,
        edit: urls.api.edit,
        create: urls.api.create,
      }}
      title={contentTitle}
      columns={columns}
      pageName={pageName}
      multipleDelete={true}
      enableFilter={true}
      defaults={{
        sort: [{ field: "name", sort: "asc" }],
      }}
    />
  );
}

render(ContextLayerList, store);
