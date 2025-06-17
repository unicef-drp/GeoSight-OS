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
 * __date__ = '08/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { ServerTableProps } from "./types";
import { dictDeepCopy } from "../../utils/main";
import { DeleteButton, ThemeButton } from "../Elements/Button";
import { MainDataGrid } from "./index";
import { constructUrl, DjangoRequests } from "../../Requests";
import { Notification, NotificationStatus } from "../Notification";
import { useConfirmDialog } from "../../providers/ConfirmDialog";
import DataGridFilter from "../Filter";
import { useTranslation } from "react-i18next";
import CancelIcon from "@mui/icons-material/Cancel";

import "./ServerTable.scss";

/** Server Table */
const ServerTable = forwardRef(
  (
    {
      url,
      urlHeader,
      dataName,
      columns,

      // Selection model with ids
      selectionModel,
      setSelectionModel,

      // Selection model with data
      selectionModelData = [],
      setSelectionModelData,

      getParameters = null,
      defaults = {
        sort: [],
        search: null,
        filters: {},
      },
      leftHeader = null,
      rightHeader = null,
      enable = {
        select: true,
        delete: true,
        singleSelection: false,
        filter: false,
      },
      rowIdKey = "id",
      className = "",
      disableSelectionOnClick = true,
      ...props
    }: ServerTableProps,
    ref,
  ) => {
    // Last controller
    const [lastController, setLastController] = useState(null);
    const [paginationMode, setPaginationMode] = useState<string>("server");
    const [showSelected, setShowSelected] = useState<boolean>(false);

    // Confirm dialog
    const { openConfirmDialog } = useConfirmDialog();
    const { t } = useTranslation();
    if (enable.filter) {
      const [filterModel, setFilterModel] = useState(defaults.filters);
      columns.forEach((column) => {
        if (column.type === "actions") {
          if (!column.headerName) {
            // @ts-ignore
            column.headerName = (
              <DataGridFilter
                fields={columns}
                filterModel={filterModel}
                setFilterModel={setFilterModel}
              />
            );
            column.headerAlign = "right";
          }
        }
      });
      useEffect(() => {
        // @ts-ignore
        let newParameters: any = {
          ...parameters,
          ...filterModel,
          ...defaults.filters,
        };
        newParameters = Object.fromEntries(
          Object.entries(newParameters).filter(([_, value]) => value != null),
        );
        setParameters(newParameters);
      }, [filterModel, defaults.filters]);
    }

    // Notification
    const notificationRef = useRef(null);
    const notify = (
      newMessage: string,
      newSeverity: string = NotificationStatus.INFO,
    ) => {
      notificationRef?.current?.notify(newMessage, newSeverity);
    };

    const prev = useRef({
      url: null,
    });
    const pageSize = 25;

    const getSort = (_sortModel: any[]) => {
      const sort: string[] = [];
      _sortModel.map((model) => {
        const column = columns.find((column) => column.field == model.field);
        if (column) {
          // @ts-ignore
          const field = column.serverKey ? column.serverKey : column.field;
          sort.push(model.sort === "asc" ? field : `-${field}`);
        }
      });
      return sort;
    };

    // Other parameters
    const [parameters, setParameters] = useState({
      page: 0,
      page_size: pageSize,
      sort: getSort(defaults.sort),
      ...defaults.filters,
    });

    // Sort model
    const [sortModel, setSortModel] = useState<any[]>(defaults.sort);

    // Data states
    const [data, setData] = useState<any[]>(null);
    const [dataCount, setDataCount] = useState<number>(0);
    const [error, setError] = useState<string>(null);

    /** Refresh data **/
    useImperativeHandle(ref, () => ({
      refresh(force: boolean = true) {
        parametersChanged();
        loadData(force);
      },
      /** Update data from outside **/
      updateData(fn: (data: any[]) => any[]) {
        setData([...fn(data)]);
      },
      /** Emptying data from outside **/
      loading() {
        setData(null);
        setError(null);
      },
    }));

    /*** Parameters Changed */
    const parametersChanged = () => {
      const params = getParameters ? getParameters(parameters) : {};
      setParameters({ ...parameters, ...params });
    };

    /*** Load data */
    const loadData = (force: boolean) => {
      let _parameters = dictDeepCopy(parameters);
      _parameters = dictDeepCopy(
        getParameters ? getParameters(_parameters) : _parameters,
      );
      _parameters.page += 1;

      // Construct url
      const _url = constructUrl(url, _parameters);

      // not force and the url are same
      if (!force && _url === prev.current.url) {
        return;
      }
      setData(null);
      setError(null);
      prev.current.url = _url;

      // ---------- USING SAVED selectionModelData -----
      if (
        showSelected &&
        selectionModelData?.length &&
        selectionModelData?.length === selectionModel?.length
      ) {
        setPaginationMode("client");
        setDataCount(selectionModelData.length);
        setData(selectionModelData);
        return;
      }
      setPaginationMode("server");

      // ---------- USING API ---------
      // Get last request
      if (lastController) {
        lastController.abort();
      }
      const controller = new AbortController();
      const { signal } = controller;
      setLastController(controller);
      axios
        .get(_url, {
          headers: urlHeader,
          signal,
        })
        .then((data) => {
          if (prev.current.url === _url) {
            if (data.data.count !== undefined) {
              setDataCount(data.data.count);
            } else {
              // This is for if no data.data.count
              setDataCount(data.data.page_size * data.data.total_page);
            }
            setData(data.data.results);
          }
        })
        .catch((error) => {
          // Ignore if it is cancelled
          if (error.name === "CanceledError") {
            return;
          }

          // Check error
          let errorString = error.toString();
          if (error?.response?.data?.detail) {
            errorString = error?.response?.data?.detail;
          } else if (error.message) {
            errorString = error.message;
          }
          if (errorString === "Invalid page.") {
            setParameters({ ...parameters, page: 0 });
          } else {
            setError(errorString);
          }
        });
    };
    /*** When parameters changed */
    useEffect(() => {
      loadData(false);
    }, [parameters]);

    /*** When page size and filter changed */
    useEffect(() => {
      parameters.page = 0;
      setDataCount(0);
      parametersChanged();
    }, [pageSize]);

    const updateShowSelected = (showSelected: boolean) => {
      const key = props.rowIdKeyParameter ? props.rowIdKeyParameter : rowIdKey;
      // Add parameters
      if (!showSelected) {
        // @ts-ignore
        delete parameters[`${key}__in`];
        parametersChanged();
      } else {
        // @ts-ignore
        parameters[`${key}__in`] = selectionModel;
        parametersChanged();
      }
    };

    /*** When selectionModel */
    useEffect(() => {
      if (setSelectionModelData) {
        let newSelectedModelData = [];
        let existedId: any[] = [];
        if (selectionModelData) {
          newSelectedModelData = selectionModelData.filter((row) => {
            const selected = selectionModel.includes(row[rowIdKey]);
            if (selected) {
              existedId.push(row[rowIdKey]);
            }
            return selected;
          });
        }
        if (data) {
          newSelectedModelData = newSelectedModelData.concat(
            data.filter((row) => {
              return (
                selectionModel.includes(row[rowIdKey]) &&
                !existedId.includes(row[rowIdKey])
              );
            }),
          );
        }
        newSelectedModelData = Array.from(new Set(newSelectedModelData));
        if (
          JSON.stringify(newSelectedModelData) !==
          JSON.stringify(selectionModelData)
        ) {
          setSelectionModelData(newSelectedModelData);
        }
      }
      // Add for show selected
      let newShowSelected: boolean = showSelected;
      if (!selectionModel.length) {
        newShowSelected = false;
        setShowSelected(newShowSelected);
      }
      updateShowSelected(newShowSelected);
    }, [selectionModel, showSelected]);

    /*** When sortmodel changed */
    useEffect(() => {
      setParameters({ ...parameters, sort: getSort(sortModel) });
    }, [sortModel]);

    return (
      <Fragment>
        {enable.singleSelection || selectionModel === undefined ? null : (
          <div className="AdminListHeader">
            <div
              className={
                "AdminListHeader-Count " +
                (!selectionModel.length ? "Empty" : "")
              }
            >
              {selectionModel.length === 1
                ? t("admin.oneItemSelected")
                : t("admin.numberOfItemsSelected", {
                    numberOfItems: selectionModel.length,
                  })}
              {/* Clear selection button */}
              {selectionModel.length ? (
                <ThemeButton
                  variant="primary Reverse"
                  onClick={() => {
                    setSelectionModel([]);
                  }}
                >
                  {t("admin.clearSelection")}
                </ThemeButton>
              ) : null}
              {selectionModel.length ? (
                <ThemeButton
                  variant={showSelected ? "primary" : "primary Reverse"}
                  className="ShowSelected"
                  onClick={() => {
                    setShowSelected(!showSelected);
                  }}
                >
                  {t("admin.showSelected")}{" "}
                  {showSelected ? <CancelIcon /> : null}
                </ThemeButton>
              ) : null}
              {leftHeader}
            </div>
            <div className="Separator" />
            <div className="AdminListHeader-Right">
              {rightHeader}
              {enable.delete ? (
                <DeleteButton
                  disabled={!selectionModel.length}
                  variant="Error Reverse"
                  text={t("admin.delete")}
                  onClick={() => {
                    openConfirmDialog({
                      header: t("admin.deleteConfirmation"),
                      onConfirmed: async () => {
                        const deletingIds = selectionModel.map((model) => {
                          if (typeof model === "object") {
                            return model.id;
                          } else {
                            return model;
                          }
                        });
                        await DjangoRequests.delete(url, {
                          ids: deletingIds,
                        })
                          .then((response) => {
                            loadData(true);
                            setSelectionModel([]);
                          })
                          .catch((error) => {
                            notify(
                              "Failed to delete data",
                              NotificationStatus.ERROR,
                            );
                          });
                      },
                      onRejected: () => {},
                      children: (
                        <div>
                          {t("admin.deleteMultipleConfirmationMessage", {
                            numberOfItems: selectionModel.length,
                            dataName:
                              selectionModel.length > 1
                                ? t(
                                    "admin.pageNameFormats.plural." + dataName,
                                  ).toLowerCase()
                                : t(
                                    "admin.pageNameFormats.singular." +
                                      dataName,
                                  ).toLowerCase(),
                          })}
                        </div>
                      ),
                    });
                  }}
                />
              ) : null}
            </div>
          </div>
        )}
        <div className="AdminTable">
          <MainDataGrid
            className={className}
            columns={columns}
            rows={data ? data : []}
            rowCount={dataCount}
            page={parameters.page}
            getCellClassName={(params: any) => {
              let className = "";
              if (params.row.updated) {
                className = "Updated ";
              }
              if (params.row.updating) {
                className = "Updating ";
              }
              if (["__check__", "actions"].includes(params.field)) {
                if (params.row.permission && !params.row.permission.delete) {
                  className += "Hide";
                }
              }
              return className;
            }}
            pagination
            loading={!data}
            pageSize={parameters.page_size}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageSizeChange={(newPageSize: number) => {
              parameters.page_size = newPageSize;
              parametersChanged();
            }}
            paginationMode={paginationMode}
            onPageChange={(newPage: number) => {
              parameters.page = newPage;
              parametersChanged();
            }}
            disableColumnFilter
            onSelectionModelChange={(newSelectionModel: any[]) => {
              if (enable.singleSelection) {
                let selected = undefined;
                newSelectionModel.map((id) => {
                  if (!selectionModel.includes(id)) {
                    selected = id;
                  }
                });
                if (selected) {
                  setSelectionModel([selected]);
                }
              } else {
                if (
                  JSON.stringify(newSelectionModel) !==
                  JSON.stringify(selectionModel)
                ) {
                  setSelectionModel(newSelectionModel);
                }
              }
            }}
            selectionModel={selectionModel}
            error={error}
            disableSelectionOnClick={disableSelectionOnClick}
            /*Multisort just enabled for PRO */
            sortModel={sortModel}
            onSortModelChange={(newSortModel: any[]) =>
              setSortModel(newSortModel)
            }
            getRowId={(row: any) => row[rowIdKey]}
            localeText={{
              noRowsLabel: t("admin.noDataTable"),
              errorOverlayDefaultLabel: t("admin.tableError"),
            }}
            {...props}
          />
        </div>
        <Notification ref={notificationRef} />
      </Fragment>
    );
  },
);
export default ServerTable;
