import React from 'react';
import $ from 'jquery';
import { store } from '../../store/admin';
import App, { render } from '../../app';
import { ThemeButton } from "../../components/Elements/Button";


import '../Login/style.scss';
import '../Login/style.small.scss';

/**
 * GeoRepoAuthFailed Page App
 */
export default function GeoRepoAuthFailed() {

    const backOnClick = () => {
        let _prev_uri = '/'
        let _next = getRedirectNextUri()
        if (_next) {
            _prev_uri = _next
        }
        window.location.replace(_prev_uri);
    }

    const getRedirectNextUri = () => {
        let _next_uri = $('#FormTemplate').find('.form-login-redirect-next-uri')
        if (_next_uri && _next_uri.length) {
          return $(_next_uri[0]).text()
        }
        return ''
    }

  /** Render **/
  return (
    <App className='Login'>
      <div className='Background'></div>
      <div className='Login'>
        <div className='LoginHeader'>Failed to authorize to GeoRepo!</div>
        <div>
            <p>
                You are not allowed to access GeoRepo, please go to GeoRepo and create new account!
            </p>
        </div>
        <div>
            <ThemeButton
              variant="secondary"
              onClick={backOnClick}
            >
              BACK
            </ThemeButton>
        </div>
      </div>
    </App>
  )
}

render(GeoRepoAuthFailed, store)