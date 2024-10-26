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
  useState
} from 'react';
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { usePapaParse } from 'react-papaparse';

import { updateDataWithSetState } from "../../utils";
import { IconTextField } from "../../../../../../components/Elements/Input";
import { MainDataGrid } from "../../../../../../components/MainDataGrid";
import { arrayToOptions, delay } from "../../../../../../utils/main";
import { SelectPlaceholder } from "../../../../../../components/Input/SelectPlaceHolder";
import { SelectWithList } from "../../../../../../components/Input/SelectWithList";
import SelectWithSearchQuickSelection from "../../../../../../components/Input/SelectWithSearchQuickSelection";
import { update_agency_dataflow, update_dimensions, update_dsd } from './update_dsd'; // replace with real back end file later

import './style.scss';


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
  ({
     data, setData, files, setFiles, attributes, setAttributes, children
   }, ref
  ) => {
    const { readString } = usePapaParse();
    const [url, setUrl] = useState('');
    const [request, setRequest] = useState({
      error: '',
      loading: false,
      requestData: null
    });
    const { error, loading, requestData } = request

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(data.url && requestData)
      }
    }));

    // Initialize SDMX options on mount
    useEffect(() => {
      // this effect runs once when the component mounts (empty dependency array [])
      const initializeSDMXOptions = async () => {
        try {
          // set loading state to true while fetching data
          setRequest(prev => ({ ...prev, loading: true }));

          // call the backend function with empty parameters to get all available agencies
          // empty strings mean "get all available options"
          const result = await update_agency_dataflow("", "");
          if (result) {
            setAgencyOptions(result.agencyOptions.map(agency => ({
              id: agency,
              name: agency
            })));
          }
        } catch (err) {
          // if there's an error, update the error state while preserving other request state
          setRequest(prev => ({
            ...prev,
            error: 'Failed to load SDMX options'
          }));
        } finally {
          // whether successful or not, set loading back to false
          setRequest(prev => ({ ...prev, loading: false }));
        }
      };
      initializeSDMXOptions();
    }, []);

    // Set default data
    useEffect(() => {
      updateDataWithSetState(data, setData, {
        'row_number_for_header': 1,
        'sheet_name': '',
        'url': '',
        'agency': '',
        'dataflow': '',
        'dataflow_version': '1.0'
      });
      if (data.url) {
        handleUrlChange(data.url, true);
      }
    }, []);

    // Update dataflows when agency changes
    const handleAgencyChange = async (agency) => {
      // This function is called when user selects a new agency from dropdown
      // 'agency' parameter is the ID of the selected agency (e.g., 'UNICEF', 'WHO')
      try {
        setRequest(prev => ({ ...prev, loading: true }));
        // Call backend function with selected agency and empty dataflow
        const result = await update_agency_dataflow(agency, "");
        if (result) {
          // Transform dataflow options for the dropdown component
          setDataflowOptions(result.dataflowOptions.map(flow => ({
            id: flow,
            name: flow
          })));
          // Example transformation:
          // From: ['Health_Data', 'Education_Stats']
          // To: [
          //   { id: 'Health_Data', name: 'Health_Data' },
          //   { id: 'Education_Stats', name: 'Education_Stats' }
          // ]

          // Update the main form data with selected agency
          updateDataWithSetState(data, setData, { 'agency': agency });
        }
      } catch (err) {
        setRequest(prev => ({
          ...prev,
          error: 'Failed to update dataflows'
        }));
      } finally {
        setRequest(prev => ({ ...prev, loading: false }));
      }
    };

    // Update dimensions when dataflow changes
    const handleDataflowChange = async (dataflow) => {
      // Called when user selects a new dataflow from dropdown
      // 'dataflow' parameter is the ID of selected dataflow
      try {
        setRequest(prev => ({ ...prev, loading: true }));
        // Call update_dimensions with selected dataflow and version
        const result = await update_dimensions(dataflow, data.dataflow_version);
        if (result && !result.error) {
          setDimensionOptions(result.dimensionSelections || {}); // Dimension dropdowns enable with new options
          setDimensionSelections({}); // All dimension selections are cleared
          updateDataWithSetState(data, setData, { 'dataflow': dataflow }); // Dataflow selection is saved
        }
      } catch (err) {
        setRequest(prev => ({
          ...prev,
          error: 'Failed to update dimensions'
        }));
      } finally {
        setRequest(prev => ({ ...prev, loading: false }));
      }
    };

    // Handle dimension selections
    const handleDimensionChange = async (dimension, values) => {
      // Called when user selects values in any dimension dropdown
      // Parameters:
      // - dimension: The type of dimension (e.g., 'time', 'geography', 'indicator')
      // - values: Selected value(s) from the dropdown
      try {
        const newSelections = {
          ...dimensionSelections,
          [dimension]: Array.isArray(values) ? values : [values]
        };
        setDimensionSelections(newSelections);
        // Call update_dsd with current selections
        const result = await update_dsd(
          data.dataflow,
          data.dataflow_version,
          newSelections
        );
        
        // Example result might look like:
        /* const exampleResult = {
          api_url: 'https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/...',
          api_response: {
            Data returned from the API
            data: [...],
            metadata: {...}
          },
          updated_dimensions: {
            Updated available options based on current selections
          }
        }; */

        if (result && !result.error) {
          handleUrlChange(result.api_url, true); // force=true means update immediately without delay
          setRequest(prev => ({
            ...prev,
            requestData: result.api_response
          }));
        }
      } catch (err) {
        setRequest(prev => ({
          ...prev,
          error: 'Failed to update selections'
        }));
      }
    };

    // Handle URL changes and data fetching
    const handleUrlChange = (newUrl, force = false) => {
      setUrl(newUrl);
      if (force || data.url !== newUrl) {
        const urls = newUrl.split('?');
        const formattedUrl = urls[1] ? 
          [urls[0], 'format=csv'].join('?') : 
          newUrl;
        
        data.url = formattedUrl;
        setData({ ...data });
      }
    };

    // Set default data
    useEffect(
      () => {
        if (!data.row_number_for_header) {
          updateDataWithSetState(data, setData, {
            'row_number_for_header': 1
          })
        }
      }, [data]
    )

    // /** Read url **/
    // const readUrl = async (url) => {
    //   if (!url || url !== sdmxApiInput) {
    //     return
    //   }
    //   setRequest({ loading: true, error: '', requestData: null })
    //   const options = { url }
    //   let axiosResponse = await axios(options);
    //   try {
    //     readString(axiosResponse.data, {
    //       header: true,
    //       worker: true,
    //       complete: async (result) => {
    //         if (result.errors.length <= 1) {
    //           const json = result.data.map((row, idx) => {
    //             row.id = idx
    //             return row
    //           })
    //           const headers = Object.keys(json[0])
    //           const array = [headers]
    //           json.slice(1).map(_ => {
    //             const row = []
    //             headers.map(header => {
    //               row.push(_[header])
    //             })
    //             array.push(row)
    //           })

    //           if (!data.date_time_data_field) {
    //             data.date_time_data_field = 'TIME_PERIOD'
    //           }
    //           if (!data.key_value) {
    //             data.key_value = 'OBS_VALUE'
    //           }
    //           setRequest({ loading: false, error: '', requestData: json })
    //           setAttributes(arrayToOptions(array))
    //           await delay(500);
    //           setData({ ...data })
    //         } else {
    //           setRequest({
    //             loading: false,
    //             error: 'The request is not csv format',
    //             requestData: null
    //           })
    //         }
    //       },
    //     })
    //   } catch (error) {
    //     setRequest({
    //       loading: false,
    //       error: 'The request is not csv format',
    //       requestData: null
    //     })

    //   }
    // }

    // When file changed
    const urlChanged = (newUrl, force = false) => {
      setUrl(newUrl)
      sdmxApiInput = newUrl
      setTimeout(function () {
        if (force || newUrl === sdmxApiInput) {
          const urls = newUrl.split('?')
          if (urls[1]) {
            newUrl = [urls[0], 'format=csv'].join('?')
          }
          sdmxApiInput = newUrl
          if (force || data.url !== newUrl) {
            data.url = newUrl
            setData({ ...data })
            readUrl(newUrl)
          }
          setUrl(newUrl)
        }
      }, 500);
    }

    return <Fragment>
      <div className="BasicFormSection">
          <label className="form-label required">SDMX Data Selection</label>
          
          {/* Agency Selection */}
          <div className="form-group">
            <label className="form-label">Agency</label>
            <SelectPlaceholder
              placeholder="Select Agency"
              list={agencyOptions}
              initValue={data.agency}
              onChangeFn={handleAgencyChange}
              disabled={loading}
            />
          </div>

          {/* Dataflow Selection */}
          <div className="form-group">
            <label className="form-label">Dataflow</label>
            <SelectPlaceholder
              placeholder="Select Dataflow"
              list={dataflowOptions}
              initValue={data.dataflow}
              onChangeFn={handleDataflowChange}
              disabled={loading || !data.agency}
            />
          </div>

          {/* Dimension Selections */}
          {Object.entries(dimensionOptions).map(([dimension, options]) => (
            <div key={dimension} className="form-group">
              <label className="form-label">{dimension}</label>
              <div className="flex items-center">
                <SelectWithList
                  placeholder={`Select ${dimension}`}
                  list={options}
                  value={dimensionSelections[dimension] || []}
                  onChange={(selected) => handleDimensionChange(dimension, selected)}
                  isMulti
                  disabled={loading}
                  className="flex-grow"
                />
                <SelectWithSearchQuickSelection
                  value={dimensionSelections[dimension] || []}
                  options={options}
                  onChange={(selected) => handleDimensionChange(dimension, selected)}
                />
              </div>
            </div>
          ))}

          {/* Manual URL Override */}
          <div className="form-group">
            {/* allows users to manually enter a URL, bypassing the dropdown selections, in case needed for testing */}
            <label className="form-label">Manual URL Override (Optional)</label>
            <IconTextField
              iconEnd={loading ? <CircularProgress size={20} /> : null}
              value={url}
              onChange={evt => handleUrlChange(evt.target.value)}
            />
            <div className="form-helptext">
              Sample URL: https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/data/BRAZIL_CO,BRAZIL_CO,1.0/all?format=csv
            </div>
            {error && <div className="error">{error}</div>}
          </div>
        </div>

        {children}

        {/* Data Preview */}
        <div className="RetrievedData">
          <label className="form-label">Retrieved Data Preview</label>
          <MainDataGrid
            style={{ height: "500px" }}
            rows={loading ? [] : requestData ? requestData : []}
            columns={requestData ? Object.keys(requestData[0]).map(key => ({
              field: key,
              headerName: key,
              hide: key === 'id',
              flex: 1,
              minWidth: 200
            })) : []}
            pageSize={20}
            rowsPerPageOptions={[20]}
            disableSelectionOnClick
            loading={loading}
          />
        </div>
      </Fragment>
  }
)
