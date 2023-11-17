import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import GalleryImages from './GalleryImages';
import Custom from './Custom';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Smart Gallery</h1>

        <Switch>
          <Route exact path="/custom" >
            <Custom />
          </Route>
          <Route exact path="/">
            <GalleryImages />  
          </Route>  
        </Switch>
      </div>
    </Router>
  );
}

export default App;
