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
   INDICATOR LAYER
   ========================================================================== */

import React, { Fragment, useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import AccordionDetails from "@mui/material/AccordionDetails";
import Accordion from "@mui/material/Accordion";
import sqlParser from "js-sql-parser";
import { useTranslation } from "react-i18next";

import { Actions } from "../../../../store/dashboard";
import {
  dataStructureToTreeData
} from "../../../../components/SortableTreeForm/utilities";
import SidePanelTreeView
  from "../../../../components/Map/SidePanelTree/IndicatorLayer";
import { returnWhereToDict } from "../../../../utils/queryExtraction";
import RelatedTableLayer from "./RelatedTableLayer";
import DynamicIndicatorLayer from "./DynamicIndicatorLayer";
import {
  DynamicIndicatorType,
  SDMXIndicatorLayerType,
} from "../../../../utils/indicatorLayer";
import {
  MaxSelectableLayersForCompositeIndexLayer,
  MaxSelectableLayersForSideBySideView,
} from "../../../../components/IndicatorLayer/CompositeIndexLayer/variable";
import SDMXIndicatorLayer from "./SDMXIndicatorLayer";
import {
  selectIndicatorLayerIds as selectIndicatorLayerIdsSelector
} from "../../../../selectors/indicatorLayers";

import "./style.scss";

/** Force indicator layer to update **/
export let indicatorLayersForcedUpdateIds = null;
export const changeIndicatorLayersForcedUpdate = (ids) => {
  indicatorLayersForcedUpdateIds = ids;
};

/**
 * Indicators selector.
 */
export function IndicatorLayers() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const indicators = useSelector((state) => state.dashboard.data.indicators);
  const indicatorLayers = useSelector(
    (state) => state.dashboard.data.indicatorLayers,
  );
  const indicatorLayersStructure = useSelector(
    (state) => state.dashboard.data.indicatorLayersStructure,
  );
  const relatedTables = useSelector(
    (state) => state.dashboard.data.relatedTables,
  );
  const selectIndicatorLayerIds = useSelector(selectIndicatorLayerIdsSelector);

  const { compareMode, sideBySideViewMode, compositeMode } = useSelector(
    (state) => state.mapMode,
    shallowEqual,
  );

  const [currentIndicatorLayers, setCurrentIndicatorLayers] = useState([0, 0]);
  const currentIndicatorLayer = currentIndicatorLayers[0];
  const currentIndicatorSecondLayer = sideBySideViewMode
    ? null
    : currentIndicatorLayers[1];

  const relatedTableData = useSelector((state) => state.relatedTableData);
  const [treeData, setTreeData] = useState([]);

  const updateDescription = (indicatorLayer, relatedTableConfig) => {
    const [aggrMethod, aggrField] = indicatorLayer.config.aggregation
      .replace(")", "")
      .split("(");

    let fields;
    try {
      const parsed = sqlParser.parse(
        `SELECT *
         FROM test
         WHERE ${relatedTableConfig.query}`,
      );
      const parsedQuery = returnWhereToDict(parsed.value.where);
      fields = Array.isArray(parsedQuery)
        ? parsedQuery.map((query) => query.field)
        : [parsedQuery.field];
    } catch (error) {
      fields = [];
    }

    return indicatorLayer.description
      .replace("{aggr-method-name}", aggrMethod)
      .replace("{aggr-field-name}", aggrField)
      .replace("{related-table-name}", relatedTableConfig.name)
      .replace("{sql-field-names}", fields.join(", "))
      .replace("{sql-query}", relatedTableConfig.query);
  };

  useEffect(() => {
    if (!compareMode && !sideBySideViewMode) {
      setCurrentIndicatorLayers([currentIndicatorLayers[0], 0]);
    } else {
      setCurrentIndicatorLayers([
        currentIndicatorLayers[0],
        currentIndicatorLayers[1],
      ]);
    }
  }, [compareMode, sideBySideViewMode]);

  /** Sync map indicator layers when selection or available layers change */
  useEffect(() => {
    if (!compositeMode) {
      if (selectIndicatorLayerIds[0]?.id === selectIndicatorLayerIds) {
        setCurrentIndicatorLayers([currentIndicatorLayers[0]]);
      }
    }
  }, [compositeMode]);

  useEffect(() => {
    if (!compositeMode && selectIndicatorLayerIds?.length) {
      if (selectIndicatorLayerIds[0] === -1000) return;
      if (
        JSON.stringify(selectIndicatorLayerIds) !==
        JSON.stringify(currentIndicatorLayers)
      ) {
        setCurrentIndicatorLayers(selectIndicatorLayerIds);
      }
    }
  }, [compositeMode, selectIndicatorLayerIds]);

  /** Sync map indicator layers when selection or available layers change */
  useEffect(() => {
    if (compositeMode) return;
    const layers = currentIndicatorLayers
      .filter((id) => id)
      .map((id) => indicatorLayers.find((l) => "" + l.id === "" + id))
      .filter(Boolean)
      .map((l) => {
        const layer = JSON.parse(JSON.stringify(l));
        if (!layer.style?.length) {
          layer.style = indicators.find(
            (ind) => ind.id === layer.indicators[0]?.id,
          )?.style;
        }
        return layer;
      });
    dispatch(Actions.Map.updateIndicatorLayers(layers));
  }, [currentIndicatorLayers, indicatorLayers]);

  const updateOtherLayers = (selectedData) => {
    if (compositeMode) return;
    // Check selected indicator layers
    const selectedIndicatorLayers = indicatorLayers.filter((layer) =>
      selectedData.includes("" + layer.id),
    );
    let relatedLayer = null;
    let dynamicLayer = null;
    selectedIndicatorLayers.map((layer) => {
      if (layer.related_tables?.length && layer.config.where) {
        relatedLayer = layer.id;
      } else if (layer.type === DynamicIndicatorType) {
        dynamicLayer = layer.id;
      }
    });
    dispatch(Actions.SelectedRelatedTableLayer.change(relatedLayer));
    dispatch(Actions.SelectedDynamicIndicatorLayer.change(dynamicLayer));
  };
  /**
   * Init the current indicator layer
   */
  useEffect(() => {
    let indicatorLayersTree = JSON.parse(JSON.stringify(indicatorLayers));
    let selectedIds = [currentIndicatorLayer, currentIndicatorSecondLayer];
    if (indicatorLayersTree && indicatorLayersTree.length) {
      // Indicator enabled
      const indicatorLayersIds = [];
      indicatorLayers.map((layer) => {
        indicatorLayersIds.push(layer.id);
        indicatorLayersIds.push("" + layer.id);
      });
      // Assign to selected ids
      if (!indicatorLayersIds.includes(currentIndicatorLayer)) {
        selectedIds[0] = null;
      }
      if (!indicatorLayersIds.includes(currentIndicatorSecondLayer)) {
        selectedIds[1] = null;
      }

      // Get the force update ids
      if (indicatorLayersForcedUpdateIds !== null) {
        selectedIds = indicatorLayersForcedUpdateIds;
      }
      indicatorLayersForcedUpdateIds = null;

      if (selectedIds[0] == null) {
        selectedIds = indicatorLayersTree
          .filter((indicator) => {
            return indicator.visible_by_default;
          })
          .map((indicator) => indicator.id);
      }

      // Check default indicator as turned one
      if (currentIndicatorLayer !== selectedIds[0]) {
        if (!selectedIds[0]) {
          indicatorLayersTree[0].visible_by_default = true;
          selectedIds[0] = indicatorLayersTree[0].id;
        }
      } else {
        // Change visible by default
        indicatorLayersTree.map((indicator) => {
          if (selectedIds.includes(indicator.id)) {
            indicator.visible_by_default = true;
          } else {
            indicator.visible_by_default = false;
          }
        });
      }

      // Check permission
      indicatorLayersTree.map((indicatorLayer) => {
        // Check indicators
        indicatorLayer.indicators.map((indLy) => {
          const indicator = indicators.find(
            (indicator) => indicator.id === indLy.id,
          );
          if (!indicator) {
            indicatorLayer.error = t("dashboardPage.indicatorLayerNotFound");
          } else if (!indicator.permission.read_data) {
            indicatorLayer.error = t(
              "dashboardPage.indicatorLayerErrorPermission",
            );
          }
        });

        // Check related tables
        indicatorLayer.related_tables.map((rt) => {
          const rtConfig = relatedTables.find(
            (rtConfig) => rtConfig.id === rt.id,
          );
          if (!rtConfig) {
            indicatorLayer.error = t("dashboardPage.relatedTableNotConfigured");
          } else {
            indicatorLayer.description = updateDescription(
              indicatorLayer,
              rtConfig,
            );
            if (!rtConfig.permission.read_data) {
              indicatorLayer.error = t(
                "dashboardPage.indicatorLayerErrorPermission",
              );
            }
            if (relatedTableData[rt.id]?.fetching) {
              indicatorLayer.loading = true;
            } else if (relatedTableData[rt.id]?.error) {
              indicatorLayer.error = relatedTableData[rt.id]?.error;
            }
          }
        });
      });
    } else {
      onChange([]);
    }
    setTreeData([
      ...dataStructureToTreeData(indicatorLayersTree, indicatorLayersStructure),
    ]);

    // Setup current indicator layer
    setCurrentIndicatorLayers(selectedIds);
    updateOtherLayers(["" + selectedIds[0], "" + selectedIds[1]]);
  }, [indicatorLayers, relatedTableData, indicatorLayersStructure]);

  const onChange = (selectedData) => {
    setTimeout(function () {
      if (selectedData.length === 0) {
        if (currentIndicatorLayer) {
          setCurrentIndicatorLayers([0, 0]);
        }
      }
      if (selectedData.length >= 1) {
        setCurrentIndicatorLayers(selectedData);
      }
      updateOtherLayers(selectedData);
    }, 100);
  };

  return (
    <Fragment>
      <SidePanelTreeView
        data={treeData}
        maxSelect={
          sideBySideViewMode
            ? MaxSelectableLayersForSideBySideView
            : compositeMode
              ? MaxSelectableLayersForCompositeIndexLayer
              : compareMode
                ? 2
                : 1
        }
        onChange={onChange}
        placeholder={t("dashboardPage.indicatorSearch")}
      />
      {indicatorLayers.map((indicatorLayer) => {
        if (indicatorLayer.type === SDMXIndicatorLayerType) {
          return (
            <SDMXIndicatorLayer
              key={indicatorLayer.id}
              indicatorLayer={indicatorLayer}
            />
          );
        } else if (indicatorLayer.related_tables?.length) {
          return (
            <RelatedTableLayer
              key={indicatorLayer.id}
              relatedTableLayer={indicatorLayer}
            />
          );
        } else if (indicatorLayer.type === DynamicIndicatorType) {
          return (
            <DynamicIndicatorLayer
              key={indicatorLayer.id}
              indicatorLayer={indicatorLayer}
            />
          );
        }
        return null;
      })}
    </Fragment>
  );
}

/**
 * Indicators selector
 * @param {bool} expanded Is the accordion expanded
 * @param {function} handleChange Function when the accordion show
 */
export default function IndicatorLayersAccordion({ expanded }) {
  return (
    <>
      <Accordion expanded={expanded} className={"IndicatorLayerList"}>
        <AccordionDetails>
          <IndicatorLayers />
        </AccordionDetails>
      </Accordion>
    </>
  );
}
