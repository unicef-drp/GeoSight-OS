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

import React, { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import ListForm from "../ListForm";
import WidgetSelection from "../../../../../components/Widget/Selection";
import { WidgetType } from "../../../../../components/Widget/Definition";

/**
 * Widget dashboard
 */
export default function WidgetForm() {
  const dispatch = useDispatch();
  const { widgets, widgetsStructure } = useSelector(
    (state) => state.dashboard.data,
  );
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);

  /** Update data **/
  const updateData = (newData) => {
    if (newData) {
      if (!newData.id) {
        const maxId = Math.max(
          ...widgets.map((widget) => {
            return widget.id;
          }),
        );
        const newID = maxId ? maxId : widgets.length;
        const newOrder = Math.max(
          ...widgets.map((widget) => {
            return widget.order;
          }),
        )
          ? widgets.length
          : 0;
        newData.visible_by_default = true;
        newData.id = newID + 1;
        newData.group = groupName;
        newData.order = newOrder + 1;
        dispatch(Actions.Widgets.add(newData));
      } else {
        dispatch(Actions.Widgets.update(newData));
      }
    }
    setSelectedWidget(null);
  };

  const setOpenModal = (opened) => {
    if (!opened) {
      setSelectedWidget(null);
    }
    setOpen(opened);
  };

  return (
    <Fragment>
      <WidgetSelection
        initData={selectedWidget}
        open={open}
        setOpen={setOpenModal}
        updateData={updateData}
      />

      <ListForm
        pageName={"Widgets"}
        data={widgets}
        dataStructure={widgetsStructure}
        setDataStructure={(structure) => {
          dispatch(
            Actions.Dashboard.updateStructure("widgetsStructure", structure),
          );
        }}
        addLayerAction={(layer) => {
          dispatch(Actions.Widgets.add(layer));
        }}
        removeLayerAction={(layer) => {
          dispatch(Actions.Widgets.remove(layer));
        }}
        changeLayerAction={(layer) => {
          dispatch(Actions.Widgets.update(layer));
        }}
        addLayerInGroupAction={(groupName) => {
          // TODO:
          //  We need to remove this for multi widget form
          setSelectedWidget({
            type: WidgetType.GENERIC_SUMMARY_WIDGET,
            visible_by_default: true,
            config: {},
          });
          // setSelectedWidget(null);
          // setGroupName(groupName);
          // setOpen(true);
        }}
        editLayerInGroupAction={(data) => {
          console.log(data);
          setSelectedWidget(data);
        }}
        hasGroup={false}
        otherActionsFunction={(data) => {
          // render widget by the type
          switch (data?.type) {
            case WidgetType.SUMMARY_WIDGET:
              return (
                <div className="OtherActionIndicator">
                  Summary Widget (Legacy)
                </div>
              );
            case WidgetType.SUMMARY_GROUP_WIDGET:
              return (
                <div className="OtherActionIndicator">
                  Summary Group Widget (Legacy)
                </div>
              );
            case WidgetType.GENERIC_TIME_SERIES_WIDGET:
            case WidgetType.TIME_SERIES_CHART_WIDGET:
              return (
                <div className="OtherActionIndicator">Time Series Widget</div>
              );
            case WidgetType.GENERIC_SUMMARY_WIDGET:
              return <div className="OtherActionIndicator">Summary Widget</div>;
            default:
              throw null;
          }
        }}
      />
    </Fragment>
  );
}
