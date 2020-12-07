import React from 'react';

const TrafficControl = ({ toggleAnimateTraffic, isPaused }) => {

  return (
    <div className="traffic-control">
      <button className="traffic-control__button">
        &lt; Previous Hour
      </button>
      <button className="traffic-control__button">
        Next Hour &gt;
      </button>
      <div className="traffic-playback">
        <button className="traffic-playback__toggle" onClick={toggleAnimateTraffic}>
          { (isPaused)? 'Play' : 'Pause'}
        </button>
      </div>
    </div>
  );
};

export default TrafficControl;
