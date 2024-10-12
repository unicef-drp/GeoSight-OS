import React, { useEffect, useState } from "react";
import update_dsd from "./update_dsd"; // Adjust the path as necessary

import { getDataflows } from "./update_dsd";

// Delete once update_dsd is complete!
// This test does not support appending groups of values, though update_dsd does
// Currently a little broken
const TestComponent = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [dataflow, setDataflow] = useState({
    id: "AFG_CO",
    agencyId: "UNICEF.AFGHANISTAN_CO",
  }); // Set default dataflow
  const [geographicArea, setGeographicArea] = useState("");
  const [indicator, setIndicator] = useState("");
  const [sex, setSex] = useState("");
  const [subnationalLevel, setSubnationalLevel] = useState("");
  const [age, setAge] = useState("");

  const [dataflowOptions, setDataflowOptions] = useState([]);
  const [geographicAreaOptions, setGeographicAreaOptions] = useState([]);
  const [indicatorOptions, setIndicatorOptions] = useState([]);
  const [sexOptions, setSexOptions] = useState([]);
  const [subnationalLevelOptions, setSubnationalLevelOptions] = useState([]);
  const [ageOptions, setAgeOptions] = useState([]);

  useEffect(() => {
    const fetchDataflows = async () => {
      const dataflows = await getDataflows();
      setDataflowOptions(dataflows);
    };
    fetchDataflows();
  }, []);

  const fetchData = async () => {
    setLoading(true); // Set loading state to true when the button is clicked

    try {
      const data = await update_dsd(
        dataflow.agencyId,
        dataflow.id,
        1.0,
        geographicArea,
        indicator,
        sex,
        age,
        subnationalLevel
      );
      console.log("DSD Data:", data); // Log the result to the console
      setResult(data);
      setAgeOptions(data["AGE"]);
      setGeographicAreaOptions(data["REF_AREA"]);
      setIndicatorOptions(data["INDICATOR"]);
      setSexOptions(data["SEX"]);
      setSubnationalLevelOptions(data["SUBNATIONAL_LEVEL"]);
    } catch (err) {
      console.error("Error fetching DSD data:", err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const onValueChange = () => {
    fetchData();
  };

  useEffect(() => {
    onValueChange();
  }, []);

  return (
    <div>
      <div>
        <h2>Test Inputs</h2>

        <label>
          Dataflows:
          <select
            value={dataflow.id || ""}
            onChange={(e) => {
              const selectedDataflow = dataflowOptions.find(
                (df) => df.id === e.target.value
              );
              setDataflow(selectedDataflow || {});
            }}
          >
            <option value="">Select a dataflow</option>
            {dataflowOptions.map((dataflow, index) => (
              <option key={index} value={dataflow.id}>
                {dataflow.id} - {dataflow.agencyId}
              </option>
            ))}
          </select>
        </label>
        <div>
          <label>
            Reference Area:
            <select
              value={geographicArea}
              onChange={(e) => {
                setGeographicArea(e.target.value);
                onValueChange();
              }}
            >
              <option value="">Select a reference area</option>
              {geographicAreaOptions.map((area, index) => (
                <option key={index} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Indicator:
            <select
              value={indicator}
              onChange={(e) => {
                setIndicator(e.target.value);
                onValueChange();
              }}
            >
              <option value="">Select an indicator</option>
              {indicatorOptions.map((ind, index) => (
                <option key={index} value={ind.id}>
                  {ind.name} - {ind.description}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sex:
            <select
              value={sex}
              onChange={(e) => {
                setSex(e.target.value);
                onValueChange();
              }}
            >
              <option value="">Select sex</option>
              {sexOptions.map((sexOption, index) => (
                <option key={index} value={sexOption.id}>
                  {sexOption.name} - {sexOption.description}
                </option>
              ))}
            </select>
          </label>

          <label>
            Subnational Level:
            <select
              value={subnationalLevel}
              onChange={(e) => setSubnationalLevel(e.target.value)}
            >
              <option value="">Select a subnational level</option>
              {subnationalLevelOptions.map((level, index) => (
                <option key={index} value={level.id}>
                  {level.name} - {level.description}
                </option>
              ))}
            </select>
          </label>

          <label>
            Age:
            <select
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                onValueChange();
              }}
            >
              <option value="">Select age</option>
              {ageOptions.map((ageOption, index) => (
                <option key={index} value={ageOption.id}>
                  {ageOption.name} - {ageOption.description}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        result &&
        !result.error && (
          <div>
            <h2>Test Results</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )
      )}
    </div>
  );
};

export default TestComponent;
