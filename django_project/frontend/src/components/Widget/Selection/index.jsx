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

/* ==========================================================================
   WIDGET SELECTION
   ========================================================================== */

import React, { Fragment, useEffect, useState } from "react";

import Modal, { ModalContent, ModalHeader } from "../../Modal";

// Members
import GenericWidgetMember from "./GenericWidget";

// Editors
import { WidgetForm } from "../Form";
import SummaryWidgetEditor from "../WidgetLegacy/SummaryWidget/Editor";
import SummaryGroupWidgetEditor
  from "../WidgetLegacy/SummaryGroupWidget/Editor";
import { Logger } from "../../../utils/logger";
import { WidgetType } from "../Definition";

/**
 * Edit section for widget panel.
 * @param {dict} initData InitData.
 * @param {Function} setFormOpen On data updated.
 * @param {bool} open Is open or close.
 * @param {Function} setOpen Set Parent Open.
 */
export default function WidgetSelection({
  initData,
  updateData,
  open,
  setOpen,
}) {
  const [data, setData] = useState(initData);
  const [formOpen, setFormOpen] = useState(null);

  // onSubmitted
  useEffect(() => {
    setData(initData);
    if (initData) {
      setFormOpen(true);
    }
  }, [initData]);

  /**
   * Render edit by type
   * **/
  function renderEditByType() {
    switch (data.type) {
      case WidgetType.SUMMARY_WIDGET:
        return (
          <SummaryWidgetEditor
            open={formOpen}
            data={data}
            setData={onUpdateData}
          />
        );
      case WidgetType.SUMMARY_GROUP_WIDGET:
        return (
          <SummaryGroupWidgetEditor
            open={formOpen}
            data={data}
            setData={onUpdateData}
          />
        );
      case WidgetType.GENERIC_SUMMARY_WIDGET:
      case WidgetType.GENERIC_TIME_SERIES_WIDGET:
        return (
          <WidgetForm
            title={"Generic"}
            open={formOpen}
            data={data}
            setData={onUpdateData}
          />
        );
      case WidgetType.TIME_SERIES_CHART_WIDGET:
        return (
          <WidgetForm
            title={"Time Series"}
            open={formOpen}
            data={data}
            setData={onUpdateData}
          />
        );
      default:
        return null;
    }
  }

  const onClosed = () => {
    setOpen(false);
  };
  const onSelected = (newData) => {
    setOpen(false);
    setData({
      ...newData,
      config: {},
    });
    setFormOpen(true);
  };

  const onUpdateData = (newData) => {
    Logger.log("WIDGET_FINISH:", JSON.stringify(newData));
    setFormOpen(false);
    updateData(newData);
  };

  return (
    <Fragment>
      <Modal
        open={open}
        onClosed={onClosed}
        className="modal__widget__selection"
      >
        <ModalHeader onClosed={onClosed}>Add new widget</ModalHeader>
        <ModalContent>
          <GenericWidgetMember onClick={onSelected} />
        </ModalContent>
      </Modal>
      {data ? renderEditByType() : null}
    </Fragment>
  );
}
