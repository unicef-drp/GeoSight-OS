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
import React from "react";
import { AdminPage } from "../../pages/Admin";
import { AdminListProps } from "./types";
import { AdminListContent } from "./Content";

export const AdminList = (
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

    // Table props
    multipleDelete,

    // Styling
    className,

    // Parent selector
    selection,
    selectionChanged,

    // Children
    rightHeader,
    middleContent,
    ...props
  }: AdminListProps
) => {
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

        // Table props
        multipleDelete={multipleDelete}

        // Styling
        className={className}

        // Parent selector
        selection={selection}
        selectionChanged={selectionChanged}

        // Children
        rightHeader={rightHeader}
        middleContent={middleContent}
        {...props}
      />
    </AdminPage>
  );
}
export default AdminList;