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
 * * __date__ = '25/07/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import $ from 'jquery';
import App, { render } from '../../app';
import { store } from '../../store/admin';
import AdminForm from "../Admin/Components/Form";
import { ThemeButton } from "../../components/Elements/Button";


import './style.scss';
import './style.small.scss';

/**
 * Home Page App
 */
export default function SignUp() {
  const [submitted, setSubmitted] = useState(false);

  /** Render **/
  const signUp = () => {
    setSubmitted(true)
  }
  const refreshCaptcha = () => {
    var $form = $('form');
    var url = '/captcha/refresh/';

    // Make the AJAX-call
    $.getJSON(url, {}, function (json) {
      $form.find('img.captcha').attr('src', json.image_url);
      $form.find('#id_captcha_key').val(json.key);
    });
  }
  useEffect(() => {
    // Add refresh button after field (this can be done in the template as well)
    $('img.captcha').after(
      $('<a href="#void" class="captcha-refresh">Refresh</a>')
    );

    // Click-handler for the refresh-link
    $('.captcha-refresh').click(function () {
      refreshCaptcha();
      return false;
    });
    if (!submitted) {
      refreshCaptcha();
    }
  }, [])

  /** Render **/
  return (
    <App className='Login'>
      <div className='Background'></div>
      <div className='Login'>
        <div className='LoginHeader'>Welcome to {preferences.site_title}</div>
        <div>
          {
            success ? <p>Your request has been successfully submitted.</p> :
              <Fragment>
                <p>
                  You can submit a request for sign up to Geosight
                  Administrator. You will be notified via email once your
                  request has been approved/rejected.
                </p>
                <AdminForm isSubmitted={submitted} submit={() => {
                  setSubmitted(true)
                }}>
                  <div id="id_captcha" className="BasicFormSection">
                    <input type="hidden" name="captcha_0"
                           required=""
                           id="id_captcha_key"/>
                    <input
                      type="text" name="captcha_1" required=""
                      autoCapitalize="off"
                      autoComplete="off" autoCorrect="off"
                      spellCheck="false"/>
                  </div>
                </AdminForm>
                <ThemeButton
                  variant="primary"
                  onClick={signUp}
                  disabled={submitted ? true : false}
                >
                  REQUEST
                </ThemeButton>
              </Fragment>
          }
        </div>
      </div>
    </App>
  )
}

render(SignUp, store)