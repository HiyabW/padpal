import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

function LoadingSpinner() {
  return (
    <div className="centeredDiv gradient-background2">
      <CircularProgress color="inherit" />
    </div>
  );
}

export default LoadingSpinner;
