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
 * __date__ = '07/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { AdminPage } from "../../pages/Admin";
import { AdminListProps } from "./types";
import { AdminListContent } from "./Content";
import { useTranslation } from 'react-i18next';

import './style.scss';

export const useResourceMeta = () => {
  const { t } = useTranslation();
  return [
    { field: 'created_at', headerName: t('admin.columns.createdAt'), flex: 0.5, type: 'date' },
    {
      field: 'created_by',
      headerName: t('admin.columns.createdBy'),
      flex: 0.5,
      serverKey: 'creator__username'
    },
    { field: 'modified_at', headerName: t('admin.columns.modifiedAt'), flex: 0.5, type: 'date' },
    {
      field: 'modified_by',
      headerName: t('admin.columns.modifiedBy'),
      flex: 0.5,
      serverKey: 'modified_by__username'
    },
  ];
};

export const AdminList = forwardRef((
    {
      columns,
      pageName,
      title,
      url = {
        list: null,
        detail: null,
        create: null,
        edit: null,
        batch: null,
      },
      initData,
      defaults = {
        search: null,
        sort: null
      },
      useSearch = true,
      enableFilter = false,

      // Table props
      multipleDelete,
      parentGetParameters,

      // Styling
      className,

      // Parent selector
      selection,
      selectionChanged,

      // Children
      rightHeader,
      middleContent,
      ...props
    }: AdminListProps, ref
  ) => {
    const tableRef = useRef(null);

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      refresh(force: boolean) {
        tableRef?.current?.refresh(force)
      }
    }));
    return (
      // @ts-ignore
      <AdminPage pageName={pageName}>
        <AdminListContent
          columns={columns}
          pageName={pageName}
          title={title}
          url={url}
          initData={initData}
          defaults={defaults}
          useSearch={useSearch}
          enableFilter={enableFilter}

          // Table props
          multipleDelete={multipleDelete}
          parentGetParameters={parentGetParameters}

          // Styling
          className={className}

          // Parent selector
          selection={selection}
          selectionChanged={selectionChanged}

          // Children
          rightHeader={rightHeader}
          middleContent={middleContent}

          // Ref
          ref={tableRef}
          {...props}
        />
      </AdminPage>
    );
  }
)
export default AdminList;