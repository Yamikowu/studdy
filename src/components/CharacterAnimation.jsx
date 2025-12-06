// src/components/CharacterAnimation.jsx
import React from 'react';

const BG_WALKING_GIF = '/images/work.gif'; 
const BG_SITTING_IMAGE = '/images/rest.gif'; 

function CharacterAnimation({ isWorking, isMoving }) {
  const currentBackground = (isWorking && isMoving) ? BG_WALKING_GIF : BG_SITTING_IMAGE;

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <img 
        src={currentBackground} 
        alt="Background" 
        className="w-full h-full object-contain transition-opacity duration-700"
      />
      {/* 保留輕量漸層，提升文字可讀性 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
    </div>
  );
}

export default CharacterAnimation;