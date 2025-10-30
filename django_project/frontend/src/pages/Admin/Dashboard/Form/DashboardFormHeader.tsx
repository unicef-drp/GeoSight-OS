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

import React, { memo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { PAGES } from "./types.d";

export interface Props {
  page: string;
  setPage: (data: string) => void;
}

export interface ButtonProps extends Props {
  targetPage: string;
  title: string;
  disable?: boolean;
}

const DashboardFormHeaderButtonWithNoData = ({
  page,
  setPage,
  targetPage,
  title,
  disable,
}: ButtonProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={
        (page === targetPage ? "Selected" : "MuiButtonLike") +
        (disable ? " Disabled" : "")
      }
      title={disable ? t("You haven’t selected a view yet.") : ""}
      onClick={() => {
        if (!disable) {
          setPage(targetPage);
        }
      }}
    >
      {title}
    </div>
  );
};

export interface ButtonDataProps extends ButtonProps {
  dataKey: string;
}

const DashboardFormHeaderButtonWithData = ({
  page,
  setPage,
  targetPage,
  title,
  dataKey,
  disable,
}: ButtonDataProps) => {
  const { t } = useTranslation();
  // @ts-ignore
  const data = useSelector((state) => state.dashboard?.data[dataKey]);

  return (
    <div
      className={
        (page === targetPage ? "Selected" : "MuiButtonLike") +
        (disable ? " Disabled" : "")
      }
      title={disable ? t("You haven’t selected a view yet.") : ""}
      onClick={() => {
        if (!disable) {
          setPage(targetPage);
        }
      }}
    >
      {title} {data?.length ? `(${data?.length})` : null}
    </div>
  );
};
/** Dashboard Form Section Content */
export const DashboardFormHeader = memo(({ page, setPage }: Props) => {
  const referenceLayer = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.referenceLayer,
  );

  // Update Page callbacks
  const setPageCallback = useCallback((page: string) => {
    setPage(page);
  }, []);

  const user_permission = useSelector(
    // @ts-ignore
    (state) => state.dashboard?.data?.user_permission,
  );
  return (
    <div className="DashboardFormHeader TabPrimary">
      <DashboardFormHeaderButtonWithNoData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.GENERAL}
        title={"General"}
      />
      <DashboardFormHeaderButtonWithData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.BASEMAPS}
        title={"Basemaps"}
        dataKey={"basemapsLayers"}
      />
      <DashboardFormHeaderButtonWithData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.CONTEXT_LAYERS}
        title={"Context Layers"}
        dataKey={"contextLayers"}
      />
      <DashboardFormHeaderButtonWithData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.INDICATORS}
        title={"Indicators"}
        dataKey={"indicators"}
        disable={!referenceLayer?.identifier}
      />
      <DashboardFormHeaderButtonWithData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.INDICATOR_LAYERS}
        title={"Indicator Layers"}
        dataKey={"indicatorLayers"}
        disable={!referenceLayer?.identifier}
      />
      <DashboardFormHeaderButtonWithNoData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.FILTERS}
        title={"Filters"}
        disable={!referenceLayer?.identifier}
      />
      <DashboardFormHeaderButtonWithData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.WIDGETS}
        title={"Widgets"}
        dataKey={"widgets"}
        disable={!referenceLayer?.identifier}
      />
      <DashboardFormHeaderButtonWithData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.RELATED_TABLES}
        title={"Related Tables"}
        dataKey={"relatedTables"}
        disable={!referenceLayer?.identifier}
      />
      <DashboardFormHeaderButtonWithNoData
        page={page}
        setPage={setPageCallback}
        targetPage={PAGES.TOOLS}
        title={"Tools"}
      />
      {user_permission?.share && (
        <DashboardFormHeaderButtonWithNoData
          page={page}
          setPage={setPageCallback}
          targetPage={PAGES.SHARE}
          title={"Share"}
        />
      )}
    </div>
  );
});

export default DashboardFormHeader;
