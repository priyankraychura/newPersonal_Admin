import React from 'react';
import { Toaster } from 'react-hot-toast';
import AuthWrapper from './components/AuthWrapper';

const App = () => {
  return (
    <React.Fragment>
      <AuthWrapper />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
      />
    </React.Fragment>
  );
};

export default App;