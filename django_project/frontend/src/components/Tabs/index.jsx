import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import './style.scss';

export function tabProps(identifier) {
  return {
    id: `simple-tab-${identifier}`,
    'aria-controls': `simple-tabpanel-${identifier}`,
  };
}

export default function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}