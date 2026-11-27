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
 * __date__ = '24/11/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */

/* ==========================================================================
   AREA LINK
   Widgets that list areas (chart, summary table) can select an area on the
   map: the map zooms to it and outlines it. A second click clears it.
   ========================================================================== */

import { useDispatch, useSelector } from "react-redux";
import GeorepoRequest from "../../utils/GeorepoRequest";
import { Actions } from "../../store/dashboard";
import { Entity } from "../../types/Entity";

/** An area shown in a widget. */
export interface LinkedArea {
  geom_id: string;
  name: string;
  admin_level: number;
}

export interface AreaLink {
  /** Can areas be selected (enabled, and a reference layer to zoom with)? */
  active: boolean;
  /** Ucode of the area selected on the map, if any. */
  selectedUcode: string | null;
  /** Select the area on the map, or clear it when it is already selected. */
  toggle: (area: LinkedArea) => Promise<void>;
}

/** Select areas on the map from a widget. */
export function useAreaLink(enabled: boolean): AreaLink {
  const dispatch = useDispatch();
  const referenceLayer = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.referenceLayer,
  );
  const selectedEntity: Entity | undefined = useSelector(
    // @ts-ignore
    (state) => state.map?.selectedEntities,
  )?.[0];

  const toggle = async (area: LinkedArea) => {
    if (!enabled || !referenceLayer?.identifier || !area?.geom_id) {
      return;
    }
    if (selectedEntity?.ucode === area.geom_id) {
      dispatch(Actions.Map.updateSelectedEntities([]));
      return;
    }
    try {
      const bbox = await new GeorepoRequest(!referenceLayer.is_local).getBbox(
        referenceLayer.identifier,
        "ucode",
        [area.geom_id],
      );
      if (bbox?.length !== 4) {
        return;
      }
      dispatch(
        Actions.Map.updateSelectedEntities([
          {
            id: area.geom_id,
            name: area.name,
            ucode: area.geom_id,
            admin_level: area.admin_level,
            level_name: "",
            bbox: [bbox[0], bbox[1], bbox[2], bbox[3]],
            dataset: referenceLayer.identifier,
          },
        ]),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return {
    active: enabled && !!referenceLayer?.identifier,
    selectedUcode: selectedEntity?.ucode || null,
    toggle,
  };
}
