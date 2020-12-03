import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTraffic, selectNextTraffic, selectTraffic } from '../../actions/traffic';
import moment from 'moment-timezone';

const TrafficDetail = () => {
  const trafficList = useSelector(store => store.traffic.trafficList);
  const selectedTrafficIndex = useSelector(store => store.traffic.selectedTrafficIndex);
  const dispatch = useDispatch();

  const animationFrameRef = React.useRef();
  const previousTimeRef = React.useRef();

  const [isPaused, setIsPaused] = React.useState(true);

  /**
   * Animation Control Functions
   */
  useEffect(() => {
    dispatch(fetchTraffic()).then(() => {
      if (!isPaused) {
        animationFrameRef.current = requestAnimationFrame(animateTraffic);
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const animateTraffic = (timestamp) => {
    if (previousTimeRef.current != undefined) {
      const timeDiff = timestamp - previousTimeRef.current;

      if (timeDiff > 1000) {
        previousTimeRef.current = timestamp;
        dispatch(selectNextTraffic());
      }
    } else {
      previousTimeRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(animateTraffic);
  };

  const toggleAnimateTraffic = () => {
    if (!isPaused) {
      cancelAnimationFrame(animationFrameRef.current);
    } else {
      animationFrameRef.current = requestAnimationFrame(animateTraffic);
    }

    setIsPaused(!isPaused);
  };

  /**
   * Traffic Selection Functions
   */
  const dispatchSelectTraffic = (index) => {
    dispatch(selectTraffic(index));
  };

  /**
   * Render Helper Functions
   */
  const renderTrafficDetail = () => {
    if (trafficList.length === 0) {
      return <h4>None!</h4>;
    } else {
      return (
        <h4>
          { moment(trafficList[selectedTrafficIndex].timestamp).format('YYYY/MM/DD HH:mm') }
        </h4>
      );
    }
  };
  const renderTrafficController = (trafficList) => {
    const trafficListSize = trafficList.length;

    if (trafficListSize === 0) {
      return null;
    }

    return (
      <div className="traffic-controller">
        <div className="traffic-playback">
          <button className="traffic-playback__toggle" onClick={toggleAnimateTraffic}>
            { (isPaused)? 'Play' : 'Pause'}
          </button>
        </div>
        <div className="traffic-selector">
          <input type="range" min="1" max={trafficListSize} value={selectedTrafficIndex} className="sliderr" onChange={e => dispatchSelectTraffic(e.target.value - 1)}></input>
        </div>
      </div>
    );
  };

  /**
   * Render Function
   */
  return (
    <div className="traffic-detail">
      { renderTrafficDetail() }
      <div className="traffic-selector">
        { renderTrafficController(trafficList) }
      </div>
    </div>
  );
};

export default TrafficDetail;
