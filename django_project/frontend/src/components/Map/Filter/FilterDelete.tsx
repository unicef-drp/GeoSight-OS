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
 * __date__ = '16/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React from "react";
import { DeleteProps } from "./types.d";
import { DeleteIcon } from "../../Icons";
import Tooltip from "@mui/material/Tooltip";
import { useConfirmDialog } from "../../../providers/ConfirmDialog";

/** Filter group delete button */
const DeleteFilter = ({ text, onDelete }: DeleteProps) => {
  const { openConfirmDialog } = useConfirmDialog();
  return <Tooltip title="Delete Group">
    <DeleteIcon
      className='MuiButtonLike FilterGroupDelete FilterDelete MuiButtonLike'
      onClick={
        (e: any) => {
          openConfirmDialog({
            header: 'Delete confirmation',
            onConfirmed: async () => {
              onDelete()
            },
            onRejected: () => {
            },
            children: <div>{text}</div>,
          })
          e.stopPropagation()
        }
      }/>
  </Tooltip>
}
export default DeleteFilter;