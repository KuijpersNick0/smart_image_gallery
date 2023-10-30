// Loading.jsx
import React from 'react';

const Loading = ({ text }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <p>{text}</p>
      <div>Loading...</div>
    </div>
  );
};

export default Loading;