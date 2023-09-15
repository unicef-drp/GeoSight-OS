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
 * __author__ = 'zakki@kartoza.com'
 * __date__ = '14/09/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";
import * as Sentry from "@sentry/browser";

Sentry.init({
    dsn: window.SENTRY_DSN,
});


export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.setErrorPage = props.setErrorPage
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(_) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidMount() {
        // Intercept console.error, then exception to be catched by Sentry
        console.error = err => {
            Sentry.withScope(scope => {
                Sentry.captureException(err);
            });
        };
        // Intercept console.warn, then mute it
        console.warn = warning => {}
    }

    componentDidCatch(error, errorInfo) {
        Sentry.withScope(scope => {
            scope.setExtras(errorInfo);
            Sentry.captureException(error);
        });
    }

    render() {
        if (this.state.hasError && this.setErrorPage) {
            // You can render any custom fallback UI
            return <div className="FormContainer">
                <h2>Something went wrong...</h2>
              </div>;

        }

        return this.props.children;
    }
}