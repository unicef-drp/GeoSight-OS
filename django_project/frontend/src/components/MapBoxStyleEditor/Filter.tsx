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
 * __date__ = '01/10/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

/* ==========================================================================
   Mapbox style editor
   ========================================================================== */

import React, { useEffect } from "react";
import { FilterSpecification } from "maplibre-gl";
import { FieldAttribute } from "../../types/Field";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import WhereInput from "../SqlQueryGenerator/WhereQueryGenerator/WhereInput";
import { AddIcon } from "../Icons";

export function Filter({
  layerType,
  filter,
  setFilter,
  fields,
  onAdd,
}: {
  layerType: string;
  filter: FilterSpecification;
  setFilter: (filter: FilterSpecification) => void;
  fields: FieldAttribute[];
  onAdd: () => void;
}) {
  // When selected changed
  useEffect(() => {
    if (!filter) {
      switch (layerType) {
        case "fill":
          setFilter(["all", ["==", "$type", "Polygon"]]);
          return;
        case "symbol":
          setFilter(["all", ["==", "$type", "Point"]]);
          return;
        case "circle":
          setFilter(["all", ["==", "$type", "Point"]]);
          return;
        case "line":
          setFilter(["all", ["==", "$type", "LineString"]]);
          return;
      }
    }
  }, [filter]);

  if (!filter || !fields?.length) return <></>;

  // @ts-ignore
  if (["all", "any"].includes(filter[0])) {
    return (
      <div className="FilterStyle">
        <label>Filter</label>
        <div className="FilterStyleContent">
          <ToggleButtonGroup
            /* @ts-ignore*/
            value={filter[0]}
            exclusive
            onChange={(evt) => {
              /* @ts-ignore*/
              filter[0] = evt.target.value;
              /* @ts-ignore*/
              setFilter([...filter]);
            }}
            aria-label="text alignment"
          >
            <ToggleButton value="all" aria-label="left aligned">
              all
            </ToggleButton>
            <ToggleButton value="any" aria-label="right aligned">
              any
            </ToggleButton>
          </ToggleButtonGroup>
          <div className="FilterStyles">
            {/* @ts-ignore*/}
            {filter.map((f, idx) => {
              if (idx === 0) return <></>;
              if (
                f.length === 3 &&
                f.every((item: any) =>
                  ["string", "number"].includes(typeof item),
                )
              ) {
                if (f[1] === "$type") {
                  return null;
                }
                const where = {
                  // @ts-ignore
                  value: f[2],
                  // @ts-ignore
                  field: f[1],
                  // @ts-ignore
                  operator: f[0] === "==" ? "=" : f[0],
                };
                return (
                  // @ts-ignore
                  <WhereInput
                    where={where}
                    fields={fields}
                    key={idx}
                    updateWhere={() => {
                      // @ts-ignore
                      filter[idx] = [
                        where.operator === "=" ? "==" : where.operator,
                        where.field,
                        where.value,
                      ];
                      setFilter(filter);
                    }}
                    onDelete={() => {
                      // @ts-ignore
                      filter = filter.filter((item, index) => index !== idx);
                      setFilter(filter);
                    }}
                  />
                );
              }
              return (
                <div style={{ paddingTop: "0.5rem" }}>{JSON.stringify(f)}</div>
              );
            })}
            <div className="ActionButton" onClick={onAdd}>
              <AddIcon />
              Add filter
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <></>;
}
