import React, {
  forwardRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import CircularProgress from "@mui/material/CircularProgress";
import { usePapaParse } from 'react-papaparse';

import { updateDataWithSetState } from "../../utils";
import { IconTextField } from "../../../../../../components/Elements/Input";
import { MainDataGrid } from "../../../../../../components/MainDataGrid";
import { SelectPlaceholder } from "../../../../../../components/Input/SelectPlaceHolder";
import { SelectWithList } from "../../../../../../components/Input/SelectWithList";
import SelectWithSearchQuickSelection from "../../../../../../components/Input/SelectWithSearchQuickSelection";
import { propagateAgencyOptions, restrictDataflowOptions, updateDimensions, updateDsd } from './update_dsd';

import './style.scss';

export const BaseSDMXForm = forwardRef(
  ({
    data, setData, files, setFiles, attributes, setAttributes, children
  }, ref) => {
    const { readString } = usePapaParse();
    const [url, setUrl] = useState('');
    const [request, setRequest] = useState({
      error: '',
      loading: false,
      requestData: null
    });
    const [agencyOptions, setAgencyOptions] = useState([]);
    const [dataflowOptions, setDataflowOptions] = useState([]);
    const [dimensionOptions, setDimensionOptions] = useState({});
    const [dimensionSelections, setDimensionSelections] = useState({});
    
    const { error, loading, requestData } = request;

    // Ready check
    useImperativeHandle(ref, () => ({
      isReady(data) {
        return !!(data.url && requestData)
      }
    }));

    // Initialize agency options on page load
    useEffect(() => {
      const initializeAgencyOptions = async () => {
        try {
          setRequest(prev => ({ ...prev, loading: true }));
          const agencies = await propagateAgencyOptions();
          if (agencies && Array.isArray(agencies)) {
            setAgencyOptions(agencies);
          }
        } catch (err) {
          setRequest(prev => ({
            ...prev,
            error: 'Failed to load agency options'
          }));
        } finally {
          setRequest(prev => ({ ...prev, loading: false }));
        }
      };
      initializeAgencyOptions();
    }, []); // Empty dependency array means this runs once on mount

    // Reset dataflow when agency changes
    useEffect(() => {
      if (data.agency) {
        // Reset dataflow to None/null when agency changes
        updateDataWithSetState(data, setData, {
          'dataflow': null,
          'url': '' // Also reset URL since it depends on dataflow
        });
        setDataflowOptions([]);
        setDimensionOptions({});
        setDimensionSelections({});
        
        // Fetch new dataflows for selected agency
        handleAgencyChange(data.agency);
      }
    }, [data.agency]); // Dependency on agency change

    // Set default data
    useEffect(() => {
      updateDataWithSetState(data, setData, {
        'row_number_for_header': 1,
        'sheet_name': '',
        'url': '',
        'agency': null,
        'dataflow': null,
        'dataflow_version': '1.0'
      });
      if (data.url) {
        handleUrlChange(data.url, true);
      }
    }, []);

    // Update dataflows when agency changes
    const handleAgencyChange = async (agency) => {
      try {
        setRequest(prev => ({ ...prev, loading: true }));
        const flows = await restrictDataflowOptions(agency);
        if (Array.isArray(flows)) {
          setDataflowOptions(flows);
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
    const handleDataflowChange = async (selectedDataflowId) => {
      try {
        setRequest(prev => ({ ...prev, loading: true }));
        const dataflowObj = dataflowOptions.find(df => df.id === selectedDataflowId);
        if (dataflowObj) {
          const result = await updateDimensions(dataflowObj, data.dataflow_version);
          if (result && !result.error) {
            setDimensionOptions(result.dimensionSelections || {});
            setDimensionSelections({});
            updateDataWithSetState(data, setData, { 'dataflow': selectedDataflowId });
          }
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
      try {
        const newSelections = {
          ...dimensionSelections,
          [dimension]: Array.isArray(values) ? values : [values]
        };
        setDimensionSelections(newSelections);

        const dataflowObj = dataflowOptions.find(df => df.id === data.dataflow);
        if (dataflowObj) {
          const result = await updateDsd(dataflowObj, newSelections, data.dataflow_version);
          if (result && !result.error) {
            handleUrlChange(result.apiUrl, true);
            setRequest(prev => ({
              ...prev,
              requestData: result.apiResponse
            }));
          }
        }
      } catch (err) {
        setRequest(prev => ({
          ...prev,
          error: 'Failed to update selections'
        }));
      }
    };

    // Handle URL changes
    const handleUrlChange = (newUrl, force = false) => {
      setUrl(newUrl);
      if (force || data.url !== newUrl) {
        const urls = newUrl.split('?');
        const formattedUrl = urls[1] ?
          [urls[0], 'format=csv'].join('?') :
          newUrl;

        updateDataWithSetState(data, setData, { 'url': formattedUrl });
      }
    };

    return (
      <Fragment>
        <div className="BasicFormSection">
          <label className="form-label required">SDMX Data Selection</label>

          <div className="form-group">
            <label className="form-label">Agency</label>
            <SelectPlaceholder
              placeholder="Select Agency"
              list={agencyOptions}
              initValue={data.agency}
              onChangeFn={(value) => updateDataWithSetState(data, setData, { 'agency': value })}
              disabled={loading}
              valueField="id"
              labelField="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dataflow</label>
            <SelectPlaceholder
              placeholder="Select Dataflow"
              list={dataflowOptions}
              initValue={data.dataflow}
              onChangeFn={handleDataflowChange}
              disabled={loading || !data.agency}
              valueField="id"
              labelField="name"
            />
          </div>

          {Object.entries(dimensionOptions).map(([dimension, values]) => (
            <div key={dimension} className="form-group">
              <label className="form-label">{dimension}</label>
              <div className="flex items-center">
                <SelectWithList
                  placeholder={`Select ${dimension}`}
                  list={values}
                  value={dimensionSelections[dimension] || []}
                  onChange={(selected) => handleDimensionChange(dimension, selected)}
                  isMulti
                  disabled={loading}
                  className="flex-grow"
                />
                <SelectWithSearchQuickSelection
                  value={dimensionSelections[dimension] || []}
                  options={values}
                  onChange={(selected) => handleDimensionChange(dimension, selected)}
                />
              </div>
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">API URL</label>
            <IconTextField
              iconEnd={loading ? <CircularProgress size={20} /> : null}
              value={url}
              onChange={evt => handleUrlChange(evt.target.value)}
            />
            <div className="form-helptext">
              The URL will be automatically generated based on your selections above
            </div>
            {error && <div className="error">{error}</div>}
          </div>
        </div>

        {children}

        <div className="RetrievedData">
          <label className="form-label">Retrieved Data Preview</label>
          <MainDataGrid
            style={{ height: "500px" }}
            rows={loading ? [] : requestData ? requestData : []}
            columns={requestData ? Object.keys(requestData[0] || {}).map(key => ({
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
    );
  }
);

export default BaseSDMXForm;