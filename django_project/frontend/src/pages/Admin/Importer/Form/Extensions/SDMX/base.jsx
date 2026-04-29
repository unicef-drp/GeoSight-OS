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

import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { updateDataWithSetState } from "../../utils";
import { delay } from "../../../../../../utils/main";
import SDMXForm from "../../../../../../components/SDMXForm";
import { SDMXPreview } from "../../../../../../components/SDMXForm/Preview";

import "./style.scss";

let sdmxApiInput = null;
/**
 * Base Excel Form.
 * @param {dict} data .
 * @param {Function} setData Set data.
 * @param {dict} files .
 * @param {Function} setFiles Set files.
 * @param {dict} ready .
 * @param {Function} setReady Set is ready.
 * @param {Array} attributes Data attributes.
 * @param {Function} setAttributes Set data attribute.
 */
export const BaseSDMXForm = forwardRef(
  ({ data, setData, setAttributes, children }, ref) => {
    const [url, setUrl] = useState("");
    console.log(data);

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!data.url;
      },
    }));

    // Set default data
    useEffect(() => {
      updateDataWithSetState(data, setData, {
        row_number_for_header: 1,
        sheet_name: "",
        url: "",
      });
    }, []);

    // Set default data
    useEffect(() => {
      if (!data.row_number_for_header) {
        updateDataWithSetState(data, setData, {
          row_number_for_header: 1,
        });
      }
    }, [data]);

    // Set data when url changed
    useEffect(() => {
      data.url = url;
      if (url) {
        if (!data.date_time_data_field)
          data.date_time_data_field = "TIME_PERIOD";
        if (!data.key_value) data.key_value = "OBS_VALUE";
      } else {
        delete data.date_time_data_field;
        delete data.key_value;
      }
      setData({ ...data });
    }, [url]);

    return (
      <Fragment>
        <SDMXForm setCurrentUrl={setUrl} />
        {children}
        <SDMXPreview
          url={url}
          setAttributes={async (options) => {
            setAttributes(options);
            await delay(500);
            setData({ ...data });
          }}
        />
      </Fragment>
    );
  },
);
