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

import React, { Fragment, useState } from 'react';
import $ from 'jquery';
import { store } from '../../store/admin';
import App, { render } from '../../app';
import AdminForm from "../Admin/Components/Form";
import { ThemeButton } from "../../components/Elements/Button";
import { useTranslation } from 'react-i18next';

import './style.scss';
import './style.small.scss';

/**
 * Home Page App
 */
export default function Login() {
  const [submitted, setSubmitted] = useState(false);
  const useAzureLogin = useAzureAuth

  const { t } = useTranslation();

  /** Render **/
  const login = () => {
    setSubmitted(true)
  }

  const loginWithAzure = () => {
    let _login_uri = urls.azure_login
    let _next = getRedirectNextUri()
    if (_next) {
      _login_uri = _login_uri + `?next=${_next}`
    }
    window.location.replace(_login_uri);
  }

  const getRedirectNextUri = () => {
    let _next_uri = $('#FormTemplate').find('.form-login-redirect-next-uri')
    if (_next_uri && _next_uri.length) {
      return $(_next_uri[0]).text()
    }
    return ''
  }

  const getNoLoginAccess = () => {
    let _element = $('#FormTemplate').find('.form-login-no-access')
    if (_element && _element.length) {
      return true
    }
    return false
  }

  const getLoginHelpText = () => {
    let _element = $('#FormTemplate').find('.form-login-help-text')
    if (_element && _element.length) {
      return $(_element[0]).text()
    }
    return ''
  }

  const loginHelpText = getLoginHelpText()

  /** Render **/
  return (
    <App className='Login'>
      <div className='Background'></div>
      <div className='Login'>
        <div className='LoginHeader'>{t('loginPage.welcome', { siteTitle: preferences.site_title })}</div>
        {!getNoLoginAccess() && loginHelpText && (
          <div className='HelpText'>
            <p>{loginHelpText}</p>
          </div>
        )}
        {
          !useAzureLogin && (
            <div>
              <AdminForm isSubmitted={submitted} submit={() => {
                setSubmitted(true)
              }} />

              <ThemeButton
                variant="primary"
                onClick={login}
                disabled={submitted ? true : false}
              >
                {t('loginPage.login')}
              </ThemeButton>
            </div>
          )
        }
        {
          useAzureLogin && getNoLoginAccess() && (
            <Fragment>
              <div style={{ marginBottom: '20px' }}>
                <p>
                  {t('loginPage.noAccessMessage')}
                </p>
              </div>
              <div>
                <a
                  href={urls.requestAccess}>
                  <ThemeButton variant="secondary Basic">
                    {t('loginPage.requestAccess')}
                  </ThemeButton>
                </a>
                <br />
                <br />
              </div>
            </Fragment>
          )
        }
        {
          useAzureLogin && (
            <div>
              <ThemeButton
                variant="primary"
                onClick={loginWithAzure}
              >
                LOG IN
              </ThemeButton>
            </div>
          )
        }
        <br />
      </div>
    </App>
  )
}

render(Login, store)