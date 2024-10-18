import React, { useEffect, useState } from "react";
import update_dsd from "./update_dsd"; // Adjust the path as necessary

// Delete once update_dsd is complete!
const TestComponent = () => {
  const [update_dsd_output, set_update_dsd_output] = useState(null);
  useEffect(() => {
    const fetchDataflows = async () => {
      const response = await update_dsd(
        "UNICEF.AFGHANISTAN_CO",
        "AFG_CO",
        1.0,
        {
          geographicArea: ["903763", "903775"],
          indicator: ["MNCH_SAB"],
          sex: [],
          age: [],
          subnationalLevel: [],
        }
      );

      set_update_dsd_output(response);
    };
    fetchDataflows();
  }, []);

  return (
    <main>
      <div>Rendered Component</div>
      <div>
        {update_dsd_output && (
          <pre>
            {JSON.stringify(
              Object.keys(update_dsd_output).reduce((acc, key) => {
                acc[key] = update_dsd_output[key];
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
