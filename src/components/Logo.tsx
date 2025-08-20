import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img 
        src="/blazing-social-logo.png" 
        alt="BlazingSocial Logo" 
        className="h-12 w-auto"
      />
    </div>
  );
};

export default Logo;
