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
 * __date__ = '09/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Paper } from "@mui/material";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { flattenTree, getDepth } from "../../../SortableTreeForm/utilities";

import Highlighted from "../Highlighted";
import FilterLayer from "../FilterLayer";
import IndicatorLayer from "../IndicatorLayer/Selector";
import { GlobalIndicatorLayerTransparency } from "./Transparency";
import CompositeIndexLayer from "../../../IndicatorLayer/CompositeIndexLayer/Layer";
import { Actions } from "../../../../store/dashboard";
import { selectIndicatorLayerIds as selectIndicatorLayerIdsSelector } from "../../../../store/dashboard/selectors/SelectedIndicatorLayers";
import { MaxSelectableLayersForCompositeIndexLayer } from "../../../IndicatorLayer/CompositeIndexLayer/variable";

const TREE_INDENT_SPACE = 40;

export interface Props {
  data: any;
  maxSelect: number;
  onChange: (value: string[]) => void;
  placeholder: string;
}

export default function SidePanelTreeView({
  data,
  maxSelect = 0,
  onChange = null,
  placeholder = "",
}: Props) {
  const dispatch = useDispatch();
  const selectIndicatorLayerIds: string[] = useSelector(
    selectIndicatorLayerIdsSelector,
  ).map(String);
  // @ts-ignore
  const compositeMode = useSelector((state) => state.mapMode.compositeMode);

  const [nodes, setNodes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filterText, setFilterText] = useState("");
  const layerGroupListRef = useRef(null);
  const unexpandedGroupsRef = useRef<string[]>([]);
  const [width, setWidth] = useState(25);

  // @ts-ignore
  const compositeIndicatorLayerIds = useSelector((state) => {
    // @ts-ignore
    if (!state.compositeIndicatorLayer.data?.config?.indicatorLayers) {
      return [];
    } else {
      // @ts-ignore
      return state.compositeIndicatorLayer.data?.config?.indicatorLayers.map(
        (layer: any) => layer.id.toString(),
      );
    }
  });
  const selected: string[] = compositeMode
    ? compositeIndicatorLayerIds
    : selectIndicatorLayerIds;

  const updateCompositeIndicatorLayer = (selected: string[]) => {
    // Update composite index layer
    dispatch(
      // @ts-ignore
      Actions.CompositeIndicatorLayer.updateIndicatorLayers(selected),
    );
  };

  useEffect(() => {
    setNodes(data);
    setGroups(getGroups(data));
    // TODO:
    //  We need to fix this
    //  Appending selected is done because of context layer unselected at first time
    const newSelected = [];
    for (const item of flattenTree(data)) {
      if (!item.isGroup && item.data?.visible_by_default) {
        newSelected.push(item.data?.id + "");
      }
    }
    if (maxSelect <= 2 && newSelected.length > 0) {
      const selectedIds: string[] = Array.from(new Set(newSelected));
      updateCompositeIndicatorLayer(selectedIds);
    }
  }, [data]);

  useLayoutEffect(() => {
    if (layerGroupListRef?.current) {
      setWidth(layerGroupListRef.current.offsetWidth - 20);
    }
  }, []);

  /** COMPOSITE INDEX LAYER
   * Update composite index layer when selected changed
   */
  useEffect(() => {
    if (maxSelect === MaxSelectableLayersForCompositeIndexLayer) {
      if (
        JSON.stringify(selected) !== JSON.stringify(compositeIndicatorLayerIds)
      ) {
        onChange(compositeIndicatorLayerIds);
      }
    }
  }, [compositeIndicatorLayerIds, maxSelect]);

  useEffect(() => {
    const filterResults = filterData(
      JSON.parse(JSON.stringify(data)),
      filterText,
    );
    setNodes(filterResults);
  }, [filterText]);

  const getGroups = (groupData: any[]) => {
    const _groups: any[] = [];
    for (const _data of groupData) {
      if (_data.children.length > 0) {
        _groups.push(...getGroups(_data.children));
      }
      if (_data.isGroup) {
        if (_groups.indexOf(_data.id) === -1) {
          _groups.push(_data.id);
        }
      }
    }
    return _groups;
  };

  const selectItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const nodeId = e.target.value;
    let _selectedIds: string[];
    if (selected.indexOf(nodeId) >= 0) {
      _selectedIds = [...selected.filter((s) => s !== nodeId)];
    } else {
      if (maxSelect === 1) {
        _selectedIds = [nodeId];
      } else if (maxSelect === 0) {
        _selectedIds = [...selected, nodeId];
      } else {
        _selectedIds = [...selected.slice(0, maxSelect - 1), nodeId];
      }
    }
    onChange(_selectedIds);
    updateCompositeIndicatorLayer(_selectedIds);
  };

  const handleToggle = (
    event: React.ChangeEvent<HTMLInputElement>,
    nodeIds: string[],
  ) => {
    setGroups(nodeIds);
    unexpandedGroupsRef.current = getGroups(data).filter(
      (id: string) => !nodeIds.includes(id),
    );
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  function filterData(data: any, query: any) {
    try {
      return data.filter((node: any) => {
        if (node.name.toLowerCase().includes(query.toLowerCase())) {
          return true;
        }
        if (node.children.length > 0) {
          node.children = filterData(node.children, query);
          return node.children.length > 0;
        }
      });
    } catch (e) {
      return [];
    }
  }

  const renderTree = (treeData: any) => {
    const nodesDataId = treeData.data ? "" + treeData.data.id : treeData.id;
    const itemDeep = getDepth(data, treeData.id);
    const maxWord = parseInt("" + (width - TREE_INDENT_SPACE * itemDeep) / 9);
    if (!treeData.name) {
      return;
    }
    const checked = selected.indexOf(nodesDataId) >= 0;

    return (
      <TreeItem
        className={
          "TreeItem SidePanelTreeItem" + (checked ? " Mui-selected" : "")
        }
        key={nodesDataId}
        nodeId={nodesDataId}
        label={
          !treeData.isGroup ? (
            !treeData.data ? null : (
              <IndicatorLayer
                layer={treeData.data}
                nodesDataId={nodesDataId}
                checked={checked}
                selected={selected}
                filterText={filterText}
                selectItem={selectItem}
                maxWord={maxWord}
                maxSelect={maxSelect}
              />
            )
          ) : (
            // @ts-ignore
            <Highlighted
              text={treeData.name ?? "No Name"}
              highlight={filterText}
              isGroup={true}
            />
          )
        }
      >
        {Array.isArray(treeData.children)
          ? treeData.children.map((node: any) => renderTree(node))
          : null}
      </TreeItem>
    );
  };
  return (
    <div className="TreeView">
      <>
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <FilterLayer
            placeholder={placeholder}
            inputChanged={(input) => setFilterText(input)}
          />
        </Paper>
        {nodes.length > 0 ? (
          <>
            <TreeView
              aria-label="rich object"
              ref={layerGroupListRef}
              defaultCollapseIcon={<ExpandMoreIcon />}
              expanded={groups.filter(
                (group) => !unexpandedGroupsRef.current.includes(group),
              )}
              onNodeToggle={handleToggle}
              onNodeSelect={handleSelect}
              defaultExpandIcon={<ExpandLessIcon />}
              sx={{ flexGrow: 1, maxWidth: "100%", paddingRight: "1em" }}
            >
              <CompositeIndexLayer />
              {nodes.map((treeData) => renderTree(treeData))}
            </TreeView>
            <GlobalIndicatorLayerTransparency
              transparencyKey={"indicatorLayer"}
            />
          </>
        ) : (
          <div className="NoData">No indicators available</div>
        )}
      </>
    </div>
  );
}
