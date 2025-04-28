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
   Bookmark
   ========================================================================== */

import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";

import Cookies from "js-cookie";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Checkbox from "@mui/material/Checkbox";
import { FormControlLabel } from "@mui/material";

import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader
} from "../../../../components/Modal";
import { Plugin, PluginChild } from "../../MapLibre/Plugin";
import { CloseButton } from "../../../../components/Elements/Button";
import { InfoFillIcon } from "../../../../components/Icons";

import './style.scss';
import { useTranslation } from 'react-i18next';

/**
 * ProjectOverview.
 */
export default function ProjectOverview() {
  const {
    id,
    overview,
    show_splash_first_open
  } = useSelector(state => state.dashboard.data);
  const { t } = useTranslation();

  // If overview does not match the one in the cookies, project is set to show splash screen
  // editMode is false, and overview is not empty, show splash screen.
  const showSplashScreen = Cookies.get(`overview-${id}`) !== overview;
  let isOpen = show_splash_first_open && showSplashScreen && !editMode && !["", undefined].includes(overview);

  const [open, setOpen] = useState(isOpen);

  //checkbox state
  const [showSplashScreenCheckbox, setShowSplashScreenCheckbox] = useState(showSplashScreen);

  useEffect(() => {
    // Only set Cookies when showSplashScreenCheckbox is set to false/unchecked, to reduce cookie size.
    if (!open && showSplashScreenCheckbox === false) {
      // Set current overview as cookies.
      Cookies.set(`overview-${id}`, overview)
    }
  }, [open]
  );

  return (
    <Plugin className='ProjectOverview-Toolbar'>
      <div className={open ? "Active" : "Inactive"}>
        <PluginChild title={'Project Overview'}>
          <InfoFillIcon onClick={_ => setOpen(true)} />
          <Modal
            className='ProjectOverview'
            open={open}
            onClosed={() => {
              setOpen(false)
            }}
          >
            <ModalHeader onClosed={() => {
              setOpen(false)
            }}>
              {t("dashboardPage.projectOverview")}
            </ModalHeader>
            <ModalContent>
              <div className='ProjectDescription'>
                <Markdown remarkPlugins={[remarkGfm]}>
                  {overview ? overview : '*There is no information for this project.*'}
                </Markdown>
              </div>
            </ModalContent>
            <ModalFooter>
              {
                isOpen ?
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!showSplashScreenCheckbox}
                        onChange={evt => {
                          setShowSplashScreenCheckbox((current) => !current)
                        }} />
                    }
                    label={t("dashboardPage.projectOverviewNoShow")} /> : null
              }
              <div className={'Separator'}></div>
              <CloseButton
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false);
                }
                }
                text={t("dashboardPage.projectOverviewClose")}
              />
            </ModalFooter>
          </Modal>
        </PluginChild>
      </div>
    </Plugin>
  )
}