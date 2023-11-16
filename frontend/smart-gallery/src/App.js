import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import GalleryImages from './GalleryImages';
import Custom from './Custom'; // Remplacez CustomComponent par le nom de votre composant personnalisé

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Smart Gallery</h1>

        <Route path="/" exact component={GalleryImages} />
        <Route path="/custom" component={Custom} />
        {/* Ajoutez d'autres routes personnalisées ici si nécessaire */}
      </div>
    </Router>
  );
}

export default App;
