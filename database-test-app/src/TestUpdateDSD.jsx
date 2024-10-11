import React, { useState } from 'react';
import update_dsd from './update_dsd';  // Adjust the path as necessary

const TestComponent = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);  // Set loading state to true when the button is clicked
    try {
      // Call update_dsd when the button is clicked with test values
      const data = await update_dsd('UNICEF', 'DSD_CME_2020', 1.0);
      console.log('DSD Data:', data);  // Log the result to the console
      setResult(data);
    } catch (err) {
      console.error('Error fetching DSD data:', err);
    } finally {
      setLoading(false);  // Reset loading state
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch DSD Data'}
      </button>
      {/* Display the data if available */}
      {result && Object.keys(result).map((key) => (
        <div key={key}>
          <h3>{key}</h3> {/* Display the key as a header */}
          <ul>
            {Array.isArray(result[key]) ? (
              result[key].map((item, index) => (
                <li key={index}>
                  {/* Check if item is an array before mapping */}
                  {Array.isArray(item) ? (
                    item.map((subItem, subIndex) => (
                      <span key={subIndex}>
                        {subItem}{subIndex < item.length - 1 ? ', ' : ''}
                      </span>
                    ))
                  ) : (
                    <span>{item}</span>  // If item is not an array, display it directly
                  )}
                </li>
              ))
            ) : (
              <li>{result[key]}</li>  // Handle cases where result[key] is not an array
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TestComponent;
