// src/components/CharacterAnimation.jsx
import React from 'react';

const BG_WALKING_GIF = '/images/work.gif'; 
const BG_SITTING_IMAGE = '/images/rest.gif'; 

function CharacterAnimation({ isWorking, isMoving }) {
  const currentBackground = (isWorking && isMoving) ? BG_WALKING_GIF : BG_SITTING_IMAGE;

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <img 
        src={currentBackground} 
        alt="Background" 
        className="w-full h-full object-cover transition-opacity duration-700"
      />
    </div>
  );
}

export default CharacterAnimation;
