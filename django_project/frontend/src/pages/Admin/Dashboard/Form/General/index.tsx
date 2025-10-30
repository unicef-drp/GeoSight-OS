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

import React, { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl, Radio, RadioGroup } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useTranslation } from "react-i18next";

import MapConfig from "./MapConfig";
import { Actions } from "../../../../../store/dashboard";
import { slugify } from "../../../../../utils/main";
import { ViewLevelConfiguration } from "../../../Components/Input/ReferenceLayerLevelConfiguration";
import Grid from "@mui/material/Grid";
import { SelectWithSearch } from "../../../../../components/Input/SelectWithSearch";
import { ImageInput } from "../../../../../components/Input/ImageInput";
import { Creatable } from "../../../../../components/Input";

import { INTERVALS } from "../../../../../utils/Dates";
import { SelectWithList } from "../../../../../components/Input/SelectWithList";
import OverviewForm from "./Overview";
import DatasetViewSelector from "../../../../../components/ResourceSelector/DatasetViewSelector";
import { DefaultTimeMode, ReferenceLayer } from "../../../../../types/Project";
import TransparencySlider from "../../../../../components/TransparencySlider";

import "./style.scss";
import { debounce } from "@mui/material/utils";

export interface Props {}

export interface TransparencyConfiguration {
  indicatorLayer: number;
  contextLayer: number;
}

export interface GeneralData {
  id: string;
  slug: string;
  icon: string;
  name?: string;
  description: string;
  group: string;
  referenceLayer: ReferenceLayer;
  geoField: string;
  levelConfig: string;
  default_time_mode: DefaultTimeMode;

  // Configurations
  show_splash_first_open: boolean;
  truncate_indicator_layer_name: boolean;
  layer_tabs_visibility: string;
  show_map_toolbar: boolean;
  transparency_config: TransparencyConfiguration;
}

const geoFields = [
  { value: "concept_uuid", label: "Concept uuid" },
  { value: "geometry_code", label: "Latest ucode" },
];

/** General form of project component. */
const GeneralForm = memo(({}: Props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const projectData = useSelector((state: any) => state.dashboard.data);

  const [data, setData] = useState<GeneralData>({
    id: projectData.id,
    slug: projectData.slug,
    icon: projectData.icon,
    name: projectData.name,
    description: projectData.description,
    group: projectData.group,
    referenceLayer: projectData.referenceLayer,
    geoField: projectData.geoField,
    levelConfig: projectData.levelConfig,
    show_splash_first_open: projectData.show_splash_first_open,
    truncate_indicator_layer_name: projectData.truncate_indicator_layer_name,
    default_time_mode: projectData.default_time_mode,
    transparency_config: projectData.transparency_config,
    layer_tabs_visibility: projectData.layer_tabs_visibility,
    show_map_toolbar: projectData.show_map_toolbar,
  });

  /** referenceLayerProject changed **/
  useEffect(() => {
    const updates: any = {};
    [
      "id",
      "slug",
      "icon",
      "name",
      "description",
      "group",
      "referenceLayer",
      "geoField",
      "levelConfig",
      "show_splash_first_open",
      "default_time_mode",
      "transparency_config",
      "layer_tabs_visibility",
      "show_map_toolbar",
    ].map((key) => {
      if (projectData[key] instanceof Object) {
        // @ts-ignore
        if (JSON.stringify(projectData[key]) !== JSON.stringify(data[key])) {
          updates[key] = projectData[key];
        }
      } else {
        // @ts-ignore
        if (projectData[key] !== data[key]) {
          updates[key] = projectData[key];
        }
      }
    });
    if (Object.keys(updates).length > 0) {
      setData({ ...data, ...updates });
    }
  }, [projectData]);

  const update = useMemo(
    () =>
      debounce((key, newValue) => {
        if (projectData[key] !== newValue) {
          const props: any = {};
          props[key] = newValue;
          if (key === "name") {
            if (isCreate) {
              props["slug"] = slugify(newValue);
            }
          }
          console.log("CHANGE")
          dispatch(Actions.Dashboard.updateProps(props));
        }
      }, 400),
    [],
  );

  /** Name **/
  useEffect(() => {
    update("name", data.name);
  }, [data.name]);

  /** Name **/
  useEffect(() => {
    update("description", data.description);
  }, [data.description]);

  if (!data) {
    return null;
  }

  const {
    show_splash_first_open,
    truncate_indicator_layer_name,
    layer_tabs_visibility,
    show_map_toolbar,
  } = projectData;

  // TODO:
  //  We need to move using projectData
  const {
    id,
    name,
    slug,
    icon,
    description,
    group,
    referenceLayer,
    geoField,
    levelConfig,
    default_time_mode,
  } = data;

  const {
    default_interval,
    use_only_last_known_value,
    fit_to_current_indicator_range,
    show_last_known_value_in_range,
  } = default_time_mode;
  const isCreate = id === null;

  return (
    <div className="General">
      <div className="BasicForm AdminForm">
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <label className="form-label required" htmlFor="name">
                View
              </label>
              <div className="ReferenceDatasetSection">
                <DatasetViewSelector
                  initData={
                    referenceLayer?.identifier
                      ? [
                          {
                            id: referenceLayer.identifier,
                            uuid: referenceLayer.identifier,
                            ...referenceLayer,
                          },
                        ]
                      : []
                  }
                  dataSelected={(selectedData) => {
                    let selected = { identifier: "", detail_url: "" };
                    if (selectedData[0]) {
                      selected = selectedData[0];
                    }
                    dispatch(Actions.ReferenceLayer.update(selected));
                  }}
                  multipleSelection={false}
                  showSelected={false}
                />
              </div>
            </Grid>
            <Grid item xs={6} className="CodeMappingConfig">
              <label className="form-label required" htmlFor="name">
                {t("admin.dashboard.mappingIndicatorsUsing")}
              </label>
              <SelectWithSearch
                options={geoFields.map((field) => field.label)}
                value={
                  geoFields.find((field) => geoField === field.value).label
                }
                onChangeFn={(evt: any) => {
                  dispatch(
                    Actions.Dashboard.changeGeoField(
                      geoFields.find((field) => evt === field.label).value,
                    ),
                  );
                }}
                disableCloseOnSelect={false}
                fullWidth={true}
                smallHeight={true}
                className={null}
              />
            </Grid>
          </Grid>
        </div>
        <ViewLevelConfiguration
          // @ts-ignore
          data={levelConfig}
          setData={(data: any) =>
            dispatch(
              Actions.Dashboard.updateProps({
                levelConfig: data,
              }),
            )
          }
          referenceLayer={referenceLayer}
        />
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <div>
                <label className="form-label required" htmlFor="name">
                  {t("name")}
                </label>
              </div>
              <div>
                <span className="form-input">
                  <input
                    id="GeneralName"
                    type="text"
                    name="name"
                    required={true}
                    placeholder={t("admin.dashboard.nameExample")}
                    value={name}
                    onChange={(event) => {
                      if (isCreate) {
                        setData({
                          ...data,
                          name: event.target.value,
                          slug: slugify(event.target.value),
                        });
                      } else {
                        setData({ ...data, name: event.target.value });
                      }
                    }}
                  />
                </span>
              </div>
            </Grid>
            <Grid item xs={3}>
              <label className="form-label required" htmlFor="name">
                {t("category")}
              </label>
              <div>
                <span className="form-input">
                  <Creatable
                    id="GeneralCategory"
                    options={
                      // @ts-ignore
                      projectCategories.map((cat: string) => {
                        return { value: cat, label: cat };
                      })
                    }
                    value={{ value: group, label: group }}
                    onChange={(evt: any) => {
                      dispatch(
                        Actions.Dashboard.updateProps({
                          group: evt.value,
                        }),
                      );
                    }}
                    disableCloseOnSelect={false}
                    fullWidth={true}
                    smallHeight={true}
                  />
                </span>
              </div>
            </Grid>
            <Grid item xs={3}>
              <label className="form-label" htmlFor="name">
                {t("admin.dashboard.urlShortcode")}
              </label>
              <div>
                <span className="form-input">
                  <input
                    id="GeneralSlug"
                    type="text"
                    name="name"
                    required={true}
                    value={slug}
                    onChange={(event) => {
                      setData({ ...data, slug: slugify(event.target.value) });
                    }}
                  />
                </span>
              </div>
              <span className="form-helptext">
                {t("admin.dashboard.urlShortcodeDescription")}
              </span>
            </Grid>
          </Grid>
        </div>
        {/* DEFAULT TIME MODE */}
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <FormControl>
                    <label className="form-label" htmlFor="name">
                      Default time mode
                    </label>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={"use_only_last_known"}
                          checked={use_only_last_known_value}
                          onChange={(event) => {
                            dispatch(
                              Actions.Dashboard.updateProps({
                                default_time_mode: {
                                  ...default_time_mode,
                                  fit_to_current_indicator_range:
                                    !use_only_last_known_value
                                      ? false
                                      : fit_to_current_indicator_range,
                                  show_last_known_value_in_range:
                                    !use_only_last_known_value
                                      ? true
                                      : show_last_known_value_in_range,
                                  use_only_last_known_value:
                                    !use_only_last_known_value,
                                },
                              }),
                            );
                          }}
                        />
                      }
                      label={
                        "Use last know value for all indicators (disables time slider)"
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={"fit_to_current_indicator_range"}
                          checked={fit_to_current_indicator_range}
                          onChange={(event) => {
                            dispatch(
                              Actions.Dashboard.updateProps({
                                default_time_mode: {
                                  ...default_time_mode,
                                  fit_to_current_indicator_range:
                                    !fit_to_current_indicator_range,
                                },
                              }),
                            );
                          }}
                          disabled={use_only_last_known_value}
                        />
                      }
                      label={"Fit to current indicator range"}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={"show_last_known_value_in_range"}
                          checked={show_last_known_value_in_range}
                          onChange={(event) => {
                            dispatch(
                              Actions.Dashboard.updateProps({
                                default_time_mode: {
                                  ...default_time_mode,
                                  show_last_known_value_in_range:
                                    !show_last_known_value_in_range,
                                },
                              }),
                            );
                          }}
                          disabled={use_only_last_known_value}
                        />
                      }
                      label={"Show last known value in range"}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl>
                    <label className="form-label" htmlFor="name">
                      Default interval
                    </label>
                    <SelectWithList
                      id="default_interval"
                      tabIndex="-1"
                      list={[
                        INTERVALS.DAILY,
                        INTERVALS.MONTHLY,
                        INTERVALS.YEARLY,
                      ]}
                      required={true}
                      value={default_interval}
                      classNamePrefix={"ReactSelect"}
                      onChange={(evt: any) => {
                        dispatch(
                          Actions.Dashboard.updateProps({
                            default_time_mode: {
                              ...default_time_mode,
                              default_interval: evt.value,
                            },
                          }),
                        );
                      }}
                      isDisabled={use_only_last_known_value}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl className="IconInput">
                <label className="form-label" htmlFor="name">
                  Description
                </label>
                <textarea
                  id="GeneralDescription"
                  name="textarea"
                  value={description}
                  style={{ height: "200px" }}
                  onChange={(evt) => {
                    setData({ ...data, description: evt.target.value });
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className="IconInput">
                <label className="form-label" htmlFor="name">
                  Icon
                </label>
                <ImageInput
                  id="GeneralIcon"
                  name="icon"
                  image={icon}
                  onChange={() => {}}
                />
              </FormControl>
            </Grid>
          </Grid>
        </div>
        <div className="BasicFormSection">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={show_splash_first_open}
                      onChange={(event) => {
                        dispatch(
                          Actions.Dashboard.updateProps({
                            show_splash_first_open: !show_splash_first_open,
                          }),
                        );
                      }}
                    />
                  }
                  label={t("admin.dashboard.showSplashScreenOnFirstOpen")}
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={truncate_indicator_layer_name}
                      onChange={(event) => {
                        dispatch(
                          Actions.Dashboard.updateProps({
                            truncate_indicator_layer_name:
                              !truncate_indicator_layer_name,
                          }),
                        );
                      }}
                    />
                  }
                  label={t("admin.dashboard.truncateLongIndicatorLayerName")}
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={show_map_toolbar}
                      onChange={(event) => {
                        dispatch(
                          Actions.Dashboard.updateProps({
                            show_map_toolbar: !show_map_toolbar,
                          }),
                        );
                      }}
                    />
                  }
                  label={t("Show map toolbar")}
                />
              </FormGroup>
              <FormControl>
                <div>
                  <div style={{ marginTop: "0.5rem" }}>
                    {t("Context and indicator layer tabs visibility")}
                  </div>
                  <RadioGroup
                    style={{
                      marginLeft: "3rem",
                      marginTop: "1rem",
                      marginBottom: "1rem",
                    }}
                    className="tabs-visibility"
                    value={layer_tabs_visibility}
                    onChange={(value) => {
                      dispatch(
                        Actions.Dashboard.updateProps({
                          layer_tabs_visibility: value.target.value,
                        }),
                      );
                    }}
                  >
                    <FormControlLabel
                      style={{ marginTop: "1rem" }}
                      value={"indicator_layers,context_layers"}
                      control={<Radio />}
                      label={t("Show both tabs")}
                    />
                    <FormControlLabel
                      style={{ marginTop: "1rem" }}
                      value="context_layers"
                      control={<Radio />}
                      label={t("Context layers tab only")}
                    />
                    <FormControlLabel
                      style={{ marginTop: "1rem" }}
                      value={"indicator_layers"}
                      control={<Radio />}
                      label={t("Indicator layers tab only")}
                    />
                  </RadioGroup>
                </div>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className="transparency-indicator-layer">
                <label className="form-label">
                  {t("admin.dashboard.transparencyOfIndicatorLayers")}
                </label>
                <TransparencySlider
                  value={
                    projectData.transparency_config.indicatorLayer === undefined
                      ? 100
                      : projectData.transparency_config.indicatorLayer
                  }
                  onChangeCommitted={(val) => {
                    dispatch(
                      Actions.Dashboard.updateProps({
                        transparency_config: {
                          ...projectData.transparency_config,
                          indicatorLayer: val,
                        },
                      }),
                    );
                  }}
                />
              </FormControl>
              <FormControl className="transparency-context-layer">
                <label className="form-label">
                  {t("admin.dashboard.transparencyOfContextLayers")}
                </label>
                <TransparencySlider
                  value={
                    projectData.transparency_config.contextLayer === undefined
                      ? 100
                      : projectData.transparency_config.contextLayer
                  }
                  onChangeCommitted={(val) => {
                    dispatch(
                      Actions.Dashboard.updateProps({
                        transparency_config: {
                          ...projectData.transparency_config,
                          contextLayer: val,
                        },
                      }),
                    );
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </div>

        {/* EXTENT */}
        <div className="BasicFormSection">
          <div>
            <label className="form-label required" htmlFor="name">
              Extent
            </label>
          </div>
          <MapConfig />
        </div>

        {/* Project Overview */}
        <div className="BasicFormSection">
          <div>
            <label className="form-label required" htmlFor="name">
              Project overview
            </label>
          </div>
          <OverviewForm />
        </div>
      </div>
    </div>
  );
});
export default GeneralForm;
