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

import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Checkbox, Paper } from "@mui/material";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  findAllGroups,
  flattenTree,
  getDepth,
} from "../../SortableTreeForm/utilities";

import { dictDeepCopy } from "../../../utils/main";
import Highlighted from "./Highlighted";
import FilterLayer from "./FilterLayer";
import IndicatorLayer from "./IndicatorLayer";
import { GlobalIndicatorLayerTransparency } from "./IndicatorLayer/Transparency";
import CompositeIndexLayer from "../../IndicatorLayer/CompositeIndexLayer/Layer";
import { Actions } from "../../../store/dashboard";
import { useDispatch, useSelector } from "react-redux";
import { MaxSelectableLayersForCompositeIndexLayer } from "../../IndicatorLayer/CompositeIndexLayer/variable";

const TREE_INDENT_SPACE = 40;
let unexpandedGroups: any = [];

/**
 * SidePanelTreeView component
 * @param {array} data tree data, format = [{
 *   'id': 'group_id',
 *   'children': [{
 *     'id': 'data_id',
 *     'children': []
 *   }]
 * }]
 * @param {boolean} selectable whether this sidepanel is selectable or not
 * @param {Array} parentSelected parent selected
 * @param {number} maxSelect max selected item
 * @param {boolean} groupSelectable is group also selectable
 * @param {function} onChange callback function to call when selected data changed
 * @param {function} otherInfo Other info that will be rendered before info icon
 */
export interface Props {
  data: any;
  /**
   * @param {array} data tree data, format = [{
   *   'id': 'group_id',
   *   'children': [{
   *     'id': 'data_id',
   *     'children': []
   *   }]
   * }]
   */
  parentSelected: string[];
  maxSelect: number;
  onChange: (value: string[]) => void;

  otherInfo: ReactNode;
  resetSelection: boolean;

  placeholder: string;
  selectable: boolean;
  groupSelectable: boolean;
}

export default function SidePanelTreeView({
  data,
  selectable = false,
  parentSelected = null,
  maxSelect = 0,
  groupSelectable = false,
  onChange = null,
  otherInfo = null,
  ...props
}: Props) {
  const dispatch = useDispatch();
  const [nodes, setNodes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filterText, setFilterText] = useState("");
  const layerGroupListRef = useRef(null);
  const [width, setWidth] = useState(25);

  // @ts-ignore
  const compositeIndicatorLayerIds = useSelector((state) => {
    // @ts-ignore
    if (!state.compositeIndicatorLayer.data?.config?.indicatorLayers) {
      return [];
    } else {
      // @ts-ignore
      return state.compositeIndicatorLayer.data?.config?.indicatorLayers.map(
        (layer: any) => layer.id,
      );
    }
  });

  useEffect(() => {
    setNodes(data);
    setGroups(getGroups(data));
    // TODO:
    //  We need to fix this
    //  Appending selected is done because of context layer unselected at first time
    const newSelected = props.resetSelection ? [] : dictDeepCopy(selected);
    for (const item of flattenTree(data)) {
      if (!item.isGroup && item.data?.visible_by_default) {
        newSelected.push(item.data?.id + "");
      }
    }
    if (maxSelect <= 2 && newSelected.length > 0) {
      setSelected(Array.from(new Set(newSelected)));
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
    dispatch(
      // @ts-ignore
      Actions.CompositeIndicatorLayer.updateIndicatorLayers(selected),
    );
  }, [selected]);

  /** COMPOSITE INDEX LAYER
   * Update composite index layer when selected changed
   */
  useEffect(() => {
    if (maxSelect === MaxSelectableLayersForCompositeIndexLayer) {
      if (
        JSON.stringify(selected) !== JSON.stringify(compositeIndicatorLayerIds)
      ) {
        setSelected(compositeIndicatorLayerIds);
      }
    }
  }, [compositeIndicatorLayerIds, maxSelect]);

  /** Parent selected */
  useLayoutEffect(() => {
    if (parentSelected !== null) {
      if (JSON.stringify(selected) !== JSON.stringify(parentSelected)) {
        setSelected(parentSelected);
      }
    }
  }, [parentSelected]);

  useEffect(() => {
    const filterResults = filterData(
      JSON.parse(JSON.stringify(data)),
      filterText,
    );
    setNodes(filterResults);
  }, [filterText]);

  useEffect(() => {
    if (selected.length > maxSelect) {
      if (maxSelect === 1) {
        setSelected([selected[0]]);
      } else {
        setSelected([...selected.slice(-(maxSelect - 1))]);
      }
    }
  }, [maxSelect]);

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
    const checked = e.target.checked;
    const nodeId = e.target.value;
    let _selectedIds = [];
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
    if (!checked && selectedGroups.length > 0) {
      const layers = flattenTree(data);
      for (const layer of layers) {
        if (!layer.isGroup && layer.data) {
          if ("" + layer.data.id === nodeId) {
            const group = layer.data.group;
            setSelectedGroups([...selectedGroups.filter((id) => id !== group)]);
          }
        }
      }
    }
    onChange(_selectedIds);
    setSelected(_selectedIds);
  };

  const getChildIds = (_data: any) => {
    const _selectedIds: any[] = [];
    for (const item of _data.children) {
      if (!item.data || item.isGroup) {
        if (item.children) {
          _selectedIds.push(...getChildIds(item));
        }
        continue;
      }
      if (!item.data.error) {
        _selectedIds.push("" + item.data.id);
      }
    }
    return _selectedIds;
  };

  const selectGroup = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const checked = e.target.checked;
    let _selectedIds: any[] = [];
    let _selectedGroups = [e.target.value];
    const allGroups = findAllGroups(data);
    let parentGroup = e.target.value;
    for (const _data of allGroups) {
      if (_data.isGroup && _data.id === e.target.value) {
        _selectedIds.push(...getChildIds(_data));
      }
      if (_data.parentId === parentGroup) {
        _selectedGroups.push(_data.id);
        parentGroup = _data.id;
      }
    }
    if (checked) {
      _selectedIds = [
        ...selected,
        ..._selectedIds.filter((id) => selected.indexOf(id) >= -1),
      ];
      _selectedGroups = [
        ...selectedGroups,
        ..._selectedGroups.filter((id) => selectedGroups.indexOf(id) >= -1),
      ];
    } else {
      _selectedIds = [
        ...selected.filter((id) => _selectedIds.indexOf(id) === -1),
      ];
      _selectedGroups = [
        ...selectedGroups.filter((id) => _selectedGroups.indexOf(id) === -1),
      ];
    }
    setSelectedGroups([..._selectedGroups]);
    onChange(_selectedIds);
    setSelected(_selectedIds);
  };

  const handleToggle = (
    event: React.ChangeEvent<HTMLInputElement>,
    nodeIds: string[],
  ) => {
    setGroups(nodeIds);
    unexpandedGroups = getGroups(data).filter(
      (id: string) => !nodeIds.includes(id),
    );
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
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
      return false;
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
          !treeData.isGroup && selectable ? (
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
          ) : groupSelectable ? (
            <FormControlLabel
              className="GroupSelectable Group"
              onClick={(e) => e.stopPropagation()}
              control={
                <Checkbox
                  checked={
                    selectedGroups.length > 0 &&
                    selectedGroups.indexOf(treeData.id) >= 0
                  }
                  onClick={(e) => e.stopPropagation()}
                  onChange={selectGroup}
                  className="PanelCheckbox"
                  size="small"
                  value={treeData.id}
                />
              }
              label={
                // @ts-ignore
                <Highlighted
                  text={treeData.name ? treeData.name : "No Name"}
                  highlight={filterText}
                  isGroup={true}
                />
              }
            />
          ) : (
            // @ts-ignore
            <Highlighted
              text={treeData.name ? treeData.name : "No Name"}
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
          placeholder={props.placeholder}
          inputChanged={(input) => setFilterText(input)}
        />
      </Paper>
      <TreeView
        aria-label="rich object"
        ref={layerGroupListRef}
        defaultCollapseIcon={<ExpandMoreIcon />}
        expanded={groups.filter((group) => !unexpandedGroups.includes(group))}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        defaultExpandIcon={<ExpandLessIcon />}
        sx={{ flexGrow: 1, maxWidth: "100%", paddingRight: "1em" }}
      >
        <CompositeIndexLayer />
        {nodes.length > 0 ? (
          nodes.map((treeData) => renderTree(treeData))
        ) : (
          <div style={{ margin: "1rem 0" }}>No data</div>
        )}
      </TreeView>
      <GlobalIndicatorLayerTransparency />
    </div>
  );
}
