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
 * __date__ = '29/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import { useDispatch, useSelector } from "react-redux";
import { Actions } from "../../../../../store/dashboard";
import React, { memo, useEffect } from "react";
import UndoIcon from "@mui/icons-material/Undo";
import ReplayIcon from "@mui/icons-material/Replay";
import RedoIcon from "@mui/icons-material/Redo";
import { ThemeButton } from "../../../../../components/Elements/Button";
import { dictDeepCopy } from "../../../../../utils/main";
import { isDashboardDataSame } from "../../../../../utils/dashboard";

let forceChangedData: any = null;

export interface Props {
  page: string;
  setPage: (page: string) => void;
}


/** Dashboard Form Section Content */
export const DashboardHistory = memo(
  (
    {
      page, setPage
    }: Props
  ) => {
    const dispatch = useDispatch();
    // @ts-ignore
    const { data } = useSelector(state => state.dashboard);
    // @ts-ignore
    const {
      currentIdx,
      histories
      // @ts-ignore
    } = useSelector(state => state.dashboardHistory);

    const applyHistory = (targetIdx: number, page: string) => {
      const history = histories[targetIdx]
      if (!history) {
        return
      }
      const data = history.history
      forceChangedData = data
      dispatch(
        Actions.DashboardHistory.applyHistory(targetIdx)
      )
      dispatch(
        Actions.Dashboard.update(dictDeepCopy(data))
      )
      setPage(page)
    }

    const undo = () => {
      const currentHistory = histories[currentIdx]
      applyHistory(currentIdx - 1, currentHistory.page)
    }

    const redo = () => {
      const history = histories[currentIdx + 1]
      applyHistory(currentIdx + 1, history.page)
    }

    const reset = () => {
      const history = histories[0]
      applyHistory(0, history.page)
    }

    // Add history
    useEffect(() => {
      if (isDashboardDataSame(forceChangedData, data)) {
        return
      }
      if (data.extent) {
        dispatch(
          Actions.DashboardHistory.addHistory(page, dictDeepCopy(data))
        )
      }
    }, [data]);

    const redoDisabled = (
      histories.length <= 1 || histories.length - 1 === currentIdx
    )

    return <>
      <ThemeButton
        variant='primary Reverse JustIcon'
        className='UndoRedo'
        onClick={undo}
        disabled={currentIdx <= 0}
      >
        <UndoIcon/>
      </ThemeButton>
      <ThemeButton
        variant='primary Reverse JustIcon'
        className='UndoRedo'
        onClick={reset}
        disabled={currentIdx <= 0}
      >
        <ReplayIcon/>
      </ThemeButton>
      <ThemeButton
        variant='primary Reverse JustIcon'
        className='UndoRedo'
        onClick={redo}
        disabled={redoDisabled}
      >
        <RedoIcon/>
      </ThemeButton>
    </>
  }
)

export default DashboardHistory;
