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

import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormControl } from "@mui/material";
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
  enable_geometry_search: boolean;
  hide_context_layer_tab: boolean;
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

  const referenceLayerProject = useSelector(
    (state: any) => state.dashboard.data?.referenceLayer,
  );
  const geoFieldProject = useSelector(
    (state: any) => state.dashboard.data?.geoField,
  );
  const defaultTimeModeProject = useSelector(
    (state: any) => state.dashboard.data?.default_time_mode,
  );
  const levelConfigProject = useSelector(
    (state: any) => state.dashboard.data?.levelConfig,
  );
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
    enable_geometry_search: projectData.enable_geometry_search,
    default_time_mode: projectData.default_time_mode,
    transparency_config: projectData.transparency_config,
    hide_context_layer_tab: projectData.hide_context_layer_tab,
  });

  /** referenceLayerProject changed **/
  useEffect(() => {
    setData({ ...data, referenceLayer: referenceLayerProject });
  }, [referenceLayerProject]);

  /** geoFieldProject changed **/
  useEffect(() => {
    setData({ ...data, geoField: geoFieldProject });
  }, [geoFieldProject]);

  /** defaultTimeModeProject changed **/
  useEffect(() => {
    setData({ ...data, default_time_mode: defaultTimeModeProject });
  }, [defaultTimeModeProject]);

  /** levelConfigProject changed **/
  useEffect(() => {
    setData({ ...data, levelConfig: levelConfigProject });
  }, [levelConfigProject]);

  if (!data) {
    return null;
  }

  const {
    enable_geometry_search,
    show_splash_first_open,
    truncate_indicator_layer_name,
    hide_context_layer_tab,
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
                      setData({ ...data, group: evt.value });
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
                      checked={enable_geometry_search}
                      onChange={(event) => {
                        dispatch(
                          Actions.Dashboard.updateProps({
                            enable_geometry_search: !enable_geometry_search,
                          }),
                        );
                      }}
                    />
                  }
                  label={t("admin.dashboard.enableGeographyEntitySearchBox")}
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hide_context_layer_tab}
                      onChange={(event) => {
                        dispatch(
                          Actions.Dashboard.updateProps({
                            hide_context_layer_tab: !hide_context_layer_tab,
                          }),
                        );
                      }}
                    />
                  }
                  label={t("admin.dashboard.hideContextLayerTab")}
                />
              </FormGroup>
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
