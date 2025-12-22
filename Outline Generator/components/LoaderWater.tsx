import React from "react";

interface LoaderWaterProps {
  loadingMessage: string;
}

const LoaderWater: React.FC<LoaderWaterProps> = ({ loadingMessage }) => {
  // Prevent body scrolling when loader is mounted
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-lg w-screen h-screen z-50 overflow-hidden">
      {/* Loading Animation Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="center">
          <div className="circle relative">
            <div className="wave wave2"></div>
            <div className="wave wave1"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">Loading</div>
          </div>
        </div>
      </div>
      
      {/* Loading Message - Fixed spacing for mobile/desktop */}
      <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-semibold text-white px-4 sm:px-0 text-lg sm:text-xl" 
         style={{ marginTop: 'clamp(9rem, 12vw, 10rem)' }}>
        {loadingMessage}
      </p>
    </div>
  );
};

export default LoaderWater;