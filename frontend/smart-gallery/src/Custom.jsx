import React from 'react';
import { useLocation } from 'react-router-dom';

const Custom = () => {
  const location = useLocation();
  const imageUrl = location.state?.image;
  

  return (
    <div>
      {/* Première instance de l'image */}
      <img src={imageUrl} alt="Custom" style={{ width: '33.33%' }} />

      {/* Deuxième instance de l'image */}
      <img src={imageUrl} alt="Custom" style={{ width: '33.33%' }} />

      {/* Ajoute ici les boutons et le texte */}
      <div>
        <button>Mon bouton</button>
        <p>Mon texte</p>
      </div>
    </div>
  );
};

export default Custom;
