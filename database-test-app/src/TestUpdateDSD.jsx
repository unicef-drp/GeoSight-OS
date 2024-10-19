import React, { useEffect, useState } from "react";
import update_dsd from "./update_dsd"; // Adjust the path as necessary

// Delete once update_dsd is complete!
const TestComponent = () => {
  const [update_dsd_options, set_update_dsd_options] = useState(null);
  const [codes, set_codes] = useState({});
  const [higher_level_dimensions, set_higher_level_dimensions] = useState({
    geographicArea: [],
    indicator: [],
    sex: [],
    age: [],
    subnationalLevel: [],
  });
  const [agency, set_agency] = useState("UNICEF.AFGHANISTAN_CO");
  const [dataflow, set_dataflow] = useState("AFG_CO");
  const [agency_options, set_agency_options] = useState(null);
  const [dataflow_options, set_dataflow_options] = useState(null);

  // TODO: Default testing, Tomas, you can delete this useEffect
  useEffect(() => {
    set_agency_options([
      "UNICEF.AFGHANISTAN_CO",
      "UNICEF.AFGHANISTAN_CO",
      "UNICEF.AFGHANISTAN_CO",
    ]);
    set_dataflow_options(["AFG_CO", "AFG_CO", "AFG_CO"]);

    set_higher_level_dimensions({
      geographicArea: [],
      indicator: [],
      sex: [],
      age: [],
      subnationalLevel: [],
    });
  }, []);

  // upon first render based on new higher level dimensions, fetch the codes
  useEffect(() => {
    const fetchCodes = async () => {
      const response = await update_dsd(
        agency,
        dataflow,
        1.0,
        higher_level_dimensions
      );

      set_update_dsd_options(response);
    };
    fetchCodes();
  }, [agency, dataflow, higher_level_dimensions]);

  // upon change of code selections, fetch the new codes
  useEffect(() => {
    const fetchCodes = async () => {
      const response = await update_dsd(agency, dataflow, 1.0, codes);

      set_update_dsd_options(response);
    };
    fetchCodes();
  }, [agency, dataflow, codes]);

  // when agency or dataflow changes, fetch the new agencies and dataflows
  useEffect(() => {}, [agency, dataflow]);

  return (
    <main>
      <div>Rendered Component</div>
      <div>Form Component</div>
      <select value={agency} onChange={(e) => set_agency(e.target.value)}>
        <option value="" disabled>
          Select agency
        </option>
        {agency_options &&
          agency_options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
      </select>
      <select value={dataflow} onChange={(e) => set_dataflow(e.target.value)}>
        <option value="" disabled>
          Select dataflow
        </option>
        {dataflow_options &&
          dataflow_options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
      </select>

      {update_dsd_options &&
        Object.keys(update_dsd_options.updated_dimensions).map((key) => (
          <div key={key}>
            <select>
              {update_dsd_options.updated_dimensions[key].map(
                (option, index) => (
                  <option key={index} value={option.id}>
                    {option.name}
                  </option>
                )
              )}
            </select>
          </div>
        ))}
      <div>
        {update_dsd_options && (
          <pre>
            {JSON.stringify(
              Object.keys(update_dsd_options).reduce((acc, key) => {
                acc[key] = update_dsd_options[key];
                return acc;
              }, {}),
              null,
              2
            )}
          </pre>
        )}
      </div>
    </main>
  );
};

export default TestComponent;
