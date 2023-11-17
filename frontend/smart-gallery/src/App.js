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
          <Route path="/custom" exact component={Custom}></Route>
          <Route path="/" exact component={GalleryImages}></Route> 
          
          {/* Ajoutez d'autres routes personnalisées ici si nécessaire */}
         
        </Switch>
      </div>
    </Router>
  );
}

export default App;
