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
 * __date__ = '07/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { AdminListContentProps } from "./types";
import EditIcon from "@mui/icons-material/Edit";
import { IconTextField } from "../Elements/Input";
import { MagnifyIcon } from "../Icons";
import { AddButton, ThemeButton } from "../Elements/Button";
import { ServerTable } from "../Table";
import { debounce } from "@mui/material/utils";
import { useTranslation } from "react-i18next";

/**
 * Admin List that contains content of list
 * @param {list} columns Columns setup.
 * @param {String} pageName Page Name.
 * @param {String} listUrl Url for list row.
 * @param {function} selectionChanged Function when selection changed.
 * @param {list} initData If there is init data.
 * @param {React.Component} rightHeader Right header.
 * @param {Array} defaults.sort Default for sorting.
 * @param {str} defaults.search Default for search.
 * @param {React.Component} children React component to be rendered
 */

export const AdminListContent = forwardRef(
  (
    {
      columns,
      pageName,
      title,
      url = {
        list: null,
        detail: null,
        create: null,
        edit: null,
        batch: null,
      },
      initData = null,
      defaults = {
        search: null,
        sort: null,
      },
      useSearch = true,
      searchKey = "q",
      enableFilter = false,

      // Table props
      multipleDelete,
      parentGetParameters,

      // Styling
      className,

      // Parent selector
      selection,
      selectionChanged,

      // Children
      rightHeader,
      middleContent,

      ...props
    }: AdminListContentProps,
    ref,
  ) => {
    // References
    const tableRef = useRef(null);
    const { t } = useTranslation();

    const [selectionModel, setSelectionModel] = useState([]);
    const [search, setSearch] = useState<string>(defaults.search);

    const dataName = pageName.replace(/s$/, "");

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      refresh(force: boolean) {
        tableRef?.current?.refresh(force);
      },
    }));

    // When inner selection changed
    useEffect(() => {
      if (selectionChanged) {
        if (JSON.stringify(selectionModel) !== JSON.stringify(selection)) {
          selectionChanged(selectionModel);
        }
      }
    }, [selectionModel]);

    // When selection changed
    useEffect(() => {
      if (selection) {
        setSelectionModel(selection);
      }
    }, [selection]);

    // When init data changed
    useEffect(() => {
      if (initData) {
        const selectableIds = initData
          .filter((row) => [null, undefined, true].includes(row.selectable))
          .map((row) => row.id);
        const newSelectionModel = selectionModel.filter((row) =>
          selectableIds.includes(row),
        );
        if (
          JSON.stringify(newSelectionModel) !== JSON.stringify(selectionModel)
        ) {
          setSelectionModel(newSelectionModel);
        }
      }
    }, [initData]);

    // Create selectable functions
    let selectableFunction: any = false;
    if (multipleDelete || url.batch) {
      selectableFunction = (params: any) => {
        const { permission } = params.row;
        if (!permission) {
          return true;
        }
        return (
          (url.batch && permission?.edit) ||
          (multipleDelete && permission?.delete)
        );
      };
    }
    if (props.selectableFunction) {
      selectableFunction = props.selectableFunction;
    }

    /** Create button **/
    const createButton = () => {
      // @ts-ignore
      if (user.is_creator && url.create) {
        return (
          <a href={url.create}>
            <AddButton
              variant="primary"
              text={t("admin.createNew", {
                pageName: t("admin.pageNameFormats.singular." + pageName),
              })}
            />
          </a>
        );
      }
    };

    /** Button for batch edit **/
    const batchEditButton = () => {
      // @ts-ignore
      if (user.is_creator && url.batch) {
        const selectedIds = selectionModel;
        return (
          <a href={url.batch + "?ids=" + selectedIds.join(",")}>
            <ThemeButton variant="primary Basic" disabled={!selectedIds.length}>
              <EditIcon />
              {t("admin.edit")}
            </ThemeButton>
          </a>
        );
      }
    };
    /** Search value changed, debouce **/
    const searchValueUpdate = useMemo(
      () =>
        debounce((newValue) => {
          setSelectionModel([]);
          tableRef?.current?.refresh(false);
        }, 400),
      [],
    );

    /** Search name value changed **/
    useEffect(() => {
      searchValueUpdate(search);
    }, [search]);

    /*** Parameters Changed */
    const getParameters = (parameters: any) => {
      if (search) {
        parameters[searchKey] = search;
      } else {
        delete parameters[searchKey];
      }

      if (parentGetParameters) {
        parameters = parentGetParameters(parameters);
      }
      return parameters;
    };

    columns.map((column) => {
      // @ts-ignore
      column.tableRef = tableRef;
    });

    /** Render **/
    return (
      <div className={"AdminContent " + className}>
        <div className="AdminContentHeader">
          <div className="AdminContentHeader-Left">
            <b className="light" dangerouslySetInnerHTML={{ __html: title }} />
          </div>
          <div>
            {!useSearch ? null : (
              <IconTextField
                // @ts-ignore
                placeholder={t("admin.searchPlaceholder", {
                  pageName: t(
                    "admin.pageNameFormats.singular." + pageName,
                  ).toLowerCase(),
                })}
                defaultValue={search ? search : ""}
                iconEnd={<MagnifyIcon />}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(evt.target.value.toLowerCase());
                }}
              />
            )}
          </div>
          <div className="AdminContentHeader-Right">
            {rightHeader ? rightHeader : null}
            {createButton()}
          </div>
        </div>
        <div className="AdminContentMiddle">{middleContent}</div>
        <div className="AdminList">
          <ServerTable
            url={url.list}
            dataName={dataName}
            columns={columns}
            selectionModel={selectionModel}
            setSelectionModel={setSelectionModel}
            getParameters={getParameters}
            checkboxSelection={true}
            rightHeader={<>{batchEditButton()}</>}
            defaults={defaults}
            enable={{
              delete: true,
              select: true,
              filter: enableFilter,
            }}
            isRowSelectable={selectableFunction}
            parentGetParameters={parentGetParameters}
            rowIdKey={props.rowIdKey}
            ref={tableRef}
          />
        </div>
      </div>
    );
  },
);
