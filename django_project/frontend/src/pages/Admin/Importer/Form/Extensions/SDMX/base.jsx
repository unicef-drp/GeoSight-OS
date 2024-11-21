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
import { propagateAgencyOptions, restrictDataflowOptions, updateDimensions, updateDsd } from './update_dsd';

import './style.scss';

// Basic Select Component
const SimpleSelect = ({ label, options, value, onChange, disabled = false }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', marginBottom: '5px' }}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc'
      }}
    >
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
);

// Basic Multi-Select Component
const SimpleMultiSelect = ({ label, options, value = [], onChange, disabled = false }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', marginBottom: '5px' }}>{label}</label>
    <select
      multiple
      value={value}
      onChange={(e) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        onChange(values);
      }}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        minHeight: '100px'
      }}
    >
      {options.map(option => (
        <option key={option.id} value={option.id}>
          {`${option.name} (${option.id})`}
        </option>
      ))}
    </select>
  </div>
);

export const BaseSDMXForm = forwardRef((props, ref) => {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agencyOptions, setAgencyOptions] = useState([]);
  const [dataflowOptions, setDataflowOptions] = useState([]);
  const [dimensionOptions, setDimensionOptions] = useState({});
  const [dimensionSelections, setDimensionSelections] = useState({});
  const [apiUrl, setApiUrl] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  // Form values
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedDataflow, setSelectedDataflow] = useState('');

  // Load agencies on mount
  useEffect(() => {
    const loadAgencies = async () => {
      try {
        setLoading(true);
        setError('');
        const agencies = await propagateAgencyOptions();
        if (agencies && Array.isArray(agencies)) {
          setAgencyOptions(agencies);
        }
      } catch (err) {
        setError('Failed to load agencies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAgencies();
  }, []);

  // Handle agency selection
  const handleAgencyChange = async (agencyId) => {
    try {
      setSelectedAgency(agencyId);
      setSelectedDataflow('');
      setDimensionOptions({});
      setDimensionSelections({});
      setApiUrl('');
      setApiResponse(null);

      if (!agencyId) {
        setDataflowOptions([]);
        return;
      }

      setLoading(true);
      setError('');
      const flows = await restrictDataflowOptions(agencyId);
      if (Array.isArray(flows)) {
        setDataflowOptions(flows);
      }
    } catch (err) {
      setError('Failed to load dataflows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle dataflow selection
  const handleDataflowChange = async (dataflowId) => {
    try {
      setSelectedDataflow(dataflowId);
      setDimensionOptions({});
      setDimensionSelections({});
      setApiUrl('');
      setApiResponse(null);

      if (!dataflowId) return;

      setLoading(true);
      setError('');
      const dataflowObj = dataflowOptions.find(df => df.id === dataflowId);
      if (dataflowObj) {
        // First get dimensions
        const result = await updateDimensions(dataflowObj);
        if (result && !result.error) {
          // Then immediately call updateDsd to get the actual dimension values
          const dsdResult = await updateDsd(dataflowObj, {});
          if (dsdResult && !dsdResult.error && dsdResult.updatedDimensions) {
            console.log('Dimension Details from updateDsd:', dsdResult.updatedDimensions);
            setDimensionOptions(dsdResult.updatedDimensions || {});
          }
        }
      }
    } catch (err) {
      setError('Failed to load dimensions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle dimension selection
  const handleDimensionChange = async (dimension, values) => {
    try {
      const newSelections = {
        ...dimensionSelections,
        [dimension]: values
      };
      setDimensionSelections(newSelections);

      console.log('Current Dimension Selections:', {
        dimension: dimension,
        selectedValues: values,
        allSelections: newSelections
      });

      const dataflowObj = dataflowOptions.find(df => df.id === selectedDataflow);
      if (dataflowObj) {
        setLoading(true);
        setError('');
        const result = await updateDsd(dataflowObj, newSelections);
        if (result && !result.error) {
          console.log('Updated Dimensions:', result.updatedDimensions);
          // Update dimension options with the new values
          setDimensionOptions(result.updatedDimensions);
          setApiUrl(result.apiUrl);
          setApiResponse(result.apiResponse);
        }
      }
    } catch (err) {
      setError('Failed to update selections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>SDMX Data Selection</h2>

      {loading && <div style={{ color: 'blue' }}>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <SimpleSelect
        label="Agency"
        options={agencyOptions}
        value={selectedAgency}
        onChange={handleAgencyChange}
        disabled={loading}
      />

      <SimpleSelect
        label="Dataflow"
        options={dataflowOptions}
        value={selectedDataflow}
        onChange={handleDataflowChange}
        disabled={loading || !selectedAgency}
      />

      {Object.entries(dimensionOptions).map(([dimensionId, dimensionValues]) => {
        // Transform the dimension values to include names
        const options = dimensionValues.map(value => ({
          id: value.id,
          name: value.name || value.id
        }));

        // Use the first option's name as the label, or fallback to dimensionId
        const dimensionLabel = dimensionValues[0]?.name || dimensionId;

        return (
          <SimpleMultiSelect
            key={dimensionId}
            label={dimensionLabel}  // Using only the name for the label
            options={options}
            value={dimensionSelections[dimensionId] || []}
            onChange={(values) => handleDimensionChange(dimensionId, values)}
            disabled={loading}
          />
        );
      })}

      {apiUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Generated API URL:</h3>
          <div style={{
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            wordBreak: 'break-all'
          }}>
            {apiUrl}
          </div>
        </div>
      )}

      {apiResponse && (
        <div style={{ marginTop: '20px' }}>
          <h3>API Response:</h3>
          <pre style={{
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
});

export default BaseSDMXForm;
