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
   SUMMARY EDITOR
   ========================================================================== */

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import { Button, FormControl, InputLabel, Radio } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { DateFilterType, WidgetOperation } from "../../Definition";

import Modal, { ModalContent, ModalHeader } from "../../../Modal";
import { indicatorLayersLikeIndicator } from "../../../../utils/indicatorLayer";
import { RemoveIcon } from "../../../Icons";
import SummaryGroupWidgetView from "../SummaryGroupWidget/View";

import "../../Form/editor-layout.scss";

/**
 * Edit section for widget.
 * @param {bool} open Is open or close.
 * @param {Function} setData Set data function.
 * @param {object} data Widget Data.
 * @param {String} title Title widget.
 * @param {React.Component} children React component to be rendered
 */
export default function WidgetEditor({ open, setData, data, title, children }) {
  const { t } = useTranslation();
  const { indicators, indicatorLayers, default_time_mode } = useSelector(
    (state) => state.dashboard.data,
  );
  const { use_only_last_known_value } = default_time_mode;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [layerID, setLayerID] = useState("");
  const [layerType, setLayerType] = useState("");
  const [operation, setOperation] = useState("");
  const [unit, setUnit] = useState("");
  const [property, setProperty] = useState("");
  const [additionalData, setAdditionalData] = useState({});

  const [dateFilterType, setDateFilterType] = useState("");
  const [dateFilterValue, setDateFilterValue] = useState("");
  const [minDateFilter, setMinDateFilter] = useState(0);
  const [maxDateFilter, setMaxDateFilter] = useState(0);

  // On data Changed
  useEffect(() => {
    const { name, description, config } = data;
    const {
      layer_id,
      layer_used,
      operation,
      unit,
      property,
      date_filter_type,
      date_filter_value,
    } = config;
    setName(name ? name : "");
    setDescription(description ? description : "");
    setLayerID(layer_id ? layer_id : "");
    setLayerType(
      layer_used ? layer_used : definition.WidgetLayerUsed.INDICATOR,
    );
    setOperation(operation ? operation : WidgetOperation.SUM);
    setUnit(unit ? unit : "");
    setProperty(property ? property : "value");
    setDateFilterType(
      date_filter_type ? date_filter_type : DateFilterType.NO_FILTER,
    );
    const dateFilterValue = date_filter_value ? date_filter_value : "";
    setDateFilterValue(dateFilterValue);

    let [minDateFilter, maxDateFilter] = dateFilterValue.split(";");
    if (new Date(minDateFilter).toString() === "Invalid Date") {
      minDateFilter = new Date().toISOString();
    }
    if (new Date(maxDateFilter).toString() === "Invalid Date") {
      maxDateFilter = null;
    }
    setMinDateFilter(minDateFilter ? minDateFilter : new Date().toISOString());
    setMaxDateFilter(maxDateFilter);

    setAdditionalData({});
  }, [data]);

  /** On Closed modal **/
  const onClosed = () => {
    setData();
  };

  /** The widget with the settings of the form. */
  const formData = () => {
    const config = {
      ...(data.config || {}),
      ...additionalData,
      layer_id: layerID,
      layer_used: layerType,
      operation: operation,
      unit: unit,
      property: property,
      date_filter_type: dateFilterType,
      date_filter_value: [minDateFilter, maxDateFilter].join(";"),
    };
    return {
      ...data,
      ...{
        name: name,
        description: description,
        config: config,
      },
    };
  };

  // The preview gets a new object only when a data setting changes (not on
  // each keystroke in the name), so it doesn't fetch again for nothing.
  const previewData = useMemo(
    () => ({ ...formData(), name: data.name, description: "" }),
    [
      data,
      layerID,
      layerType,
      operation,
      unit,
      property,
      additionalData,
      dateFilterType,
      minDateFilter,
      maxDateFilter,
    ],
  );

  /** On apply **/
  const onApply = () => {
    if (!data.config) {
      data.config = {};
    }
    setData(formData());
  };

  // Format indicator list
  const indicatorList = indicators.map(function (indicator) {
    return [indicator.id, indicator.name];
  });
  const indicatorLayerList = indicatorLayersLikeIndicator(indicatorLayers)
    .map(function (indicator) {
      return [indicator.id, indicator.name];
    })
    .concat(
      indicatorLayers
        .filter((layer) => layer.indicators.length === 1)
        .map(function (indicator) {
          return [indicator.id, indicator.name];
        }),
    );

  let selectedData = {
    concept_uuid: "",
    date: "",
    geometry_code: "",
    value: "",
    label: "",
  };

  return (
    <Fragment>
      <Modal
        open={open}
        onClosed={onClosed}
        className="WidgetEditor MuiFormControl-Form MuiBox-Large WidgetEditor-Layout WidgetEditor-Legacy"
      >
        <ModalHeader onClosed={onClosed}>
          {name ? "Change " + name : "New " + title}
        </ModalHeader>
        <ModalContent>
          <div className="BasicForm WidgetLayout">
            <div className="WidgetLayout-Main">
              <div className="BasicFormSection">
                <div>
                  <label className="form-label">Widget name</label>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Widget name"
                    onChange={(event) => {
                      setName(event.target.value);
                    }}
                    value={name}
                  />
                </div>
              </div>
              <div className="BasicFormSection">
                <div>
                  <label className="form-label">Widget description</label>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Widget description"
                    onChange={(event) => {
                      setDescription(event.target.value);
                    }}
                    value={description}
                  />
                </div>
              </div>
              <div className="BasicFormSection">
                <div>
                  <label className="form-label">Unit</label>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Unit"
                    onChange={(event) => {
                      setUnit(event.target.value);
                    }}
                    value={unit}
                  />
                </div>
              </div>
            </div>
            <div className="WidgetLayout-Data">
              <FormControl className="MuiForm-RadioGroup WidgetLegacy-Source">
                <FormLabel className="MuiInputLabel-root">
                  {t("admin.widget.dataSection")}
                </FormLabel>
                <FormControl>
                  <InputLabel>Layer Type</InputLabel>
                  <Select
                    onChange={(event) => {
                      setLayerType(event.target.value);
                    }}
                    value={layerType}
                  >
                    {Object.keys(definition.WidgetLayerUsed).map(
                      (key, index) => (
                        <MenuItem
                          key={index}
                          value={definition.WidgetLayerUsed[key]}
                        >
                          {definition.WidgetLayerUsed[key]}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>Source Layer</InputLabel>
                  <Select
                    onChange={(event) => {
                      setLayerID(event.target.value);
                    }}
                    value={layerID}
                  >
                    {(layerType === definition.WidgetLayerUsed.INDICATOR
                      ? indicatorList
                      : indicatorLayerList
                    ).map(function (indicator, index) {
                      return (
                        <MenuItem key={index} value={indicator[0]}>
                          {indicator[1]}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>Operation</InputLabel>
                  <Select
                    onChange={(event) => {
                      setOperation(event.target.value);
                    }}
                    value={operation}
                  >
                    {Object.keys(WidgetOperation).map((key, index) => (
                      <MenuItem key={index} value={WidgetOperation[key]}>
                        {WidgetOperation[key]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>Source Value</InputLabel>
                  <Select
                    onChange={(event) => {
                      setProperty(event.target.value);
                    }}
                    value={property}
                  >
                    {["value"].map((key, index) => (
                      <MenuItem key={index} value={key}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {React.Children.map(children, (child) => {
                  return React.cloneElement(child, {
                    data,
                    selectedData,
                    setAdditionalData,
                  });
                })}
              </FormControl>

              <FormControl className="MuiForm-RadioGroup">
                <FormLabel className="MuiInputLabel-root">Datetime</FormLabel>
                <RadioGroup
                  value={dateFilterType}
                  onChange={(evt) => {
                    setDateFilterType(evt.target.value);
                  }}
                >
                  <FormControlLabel
                    disabled={use_only_last_known_value}
                    value={DateFilterType.NO_FILTER}
                    control={<Radio />}
                    label="No filter (global latest values will be used)"
                  />
                  <FormControlLabel
                    disabled={use_only_last_known_value}
                    value={DateFilterType.SYNC}
                    control={<Radio />}
                    label="Use datetime filter from Dashboard level."
                  />
                  <FormControlLabel
                    disabled={use_only_last_known_value}
                    value={DateFilterType.CUSTOM}
                    control={<Radio />}
                    label="Use custom datetime filter."
                  />
                </RadioGroup>

                {dateFilterType === DateFilterType.CUSTOM ? (
                  <div className="BasicForm">
                    <div className="CustomDateFilterValues BasicFormSection">
                      <DatePicker
                        showTimeSelect
                        popperProps={{ strategy: "fixed" }}
                        dateFormat="dd-MM-yyyy hh:mm:ss"
                        selected={
                          minDateFilter ? new Date(minDateFilter) : null
                        }
                        maxDate={new Date(maxDateFilter)}
                        onChange={(date) => {
                          setMinDateFilter(new Date(date).toISOString());
                        }}
                      />
                      <div className="Separator">
                        <RemoveIcon />
                      </div>
                      <DatePicker
                        showTimeSelect
                        popperProps={{ strategy: "fixed" }}
                        dateFormat="dd-MM-yyyy hh:mm:ss"
                        selected={
                          maxDateFilter ? new Date(maxDateFilter) : null
                        }
                        minDate={new Date(minDateFilter)}
                        onChange={(date) => {
                          if (date) {
                            setMaxDateFilter(new Date(date).toISOString());
                          } else {
                            setMaxDateFilter(null);
                          }
                        }}
                      />
                    </div>
                    <div className="helptext" style={{ width: "100%" }}>
                      Make the max date empty to make the data filtered up to
                      `today`.
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </FormControl>
            </div>
            <div className="WidgetLayout-Side">
              {open && (
                <div className="WidgetPreview" data-testid="widget-preview">
                  <div className="WidgetPreview-Title">
                    {t("admin.widget.chartPreview")}
                  </div>
                  <div className="widget WidgetPreview-Widget">
                    <div className="widget__content">
                      {layerID && layerType && operation && property && (
                        <SummaryGroupWidgetView data={previewData} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Apply stays in the lower right corner. */}
            <div className="WidgetLayout-Footer">
              <Button
                variant="primary"
                className="WidgetEditor-apply"
                onClick={onApply}
                disabled={!name || !layerType || !operation || !property}
              >
                Apply
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </Fragment>
  );
}
