import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTraffic, selectNextTraffic, selectTraffic } from '../../actions/traffic';
import moment from 'moment-timezone';
import _ from 'lodash';

import TrafficControl from '../traffic/TrafficControl';

const NavigationControl = () => {
  const trafficList = useSelector(store => store.traffic.trafficList);
  const selectedTrafficIndex = useSelector(store => store.traffic.selectedTrafficIndex);
  const timestampFrom = useSelector(store => store.traffic.timestamp.from);
  const timestampTo = useSelector(store => store.traffic.timestamp.to);

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

      if (timeDiff > 2000) {
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
  const debouncedDispatchSelectTraffic = _.debounce((index) => {
    dispatchSelectTraffic(index);
  });

  const dispatchFetchTraffic = (amount, unit) => {
    setIsPaused(true);

    let newTimestampFrom;
    if (amount && unit) {
      newTimestampFrom = moment(timestampFrom).add(amount, unit).valueOf();
    }
    console.log(newTimestampFrom);

    dispatch(fetchTraffic(newTimestampFrom));
  };

  /**
   * Render Helper Functions
   */
  const renderDetail = () => {
    if (trafficList.length === 0) {
      return (
        <div className="navigation-detail">
          <h4>No data available</h4>
        </div>
      );
    } else {
      return (
        <div className="navigation-detail">
          <h4>{ moment(trafficList[selectedTrafficIndex].timestamp).format('YYYY/MM/DD HH:mm') }</h4>
        </div>
      );
    }
  };
  const renderControls = (trafficList) => {
    const trafficListSize = trafficList.length;

    return (
      <div className="navigation-control">
        <div className="navigation-playback">
          <button className="navigation-playback__toggle" onClick={toggleAnimateTraffic}>
            { (isPaused)? 'Play' : 'Pause'}
          </button>
          <button className="navigation__button" disabled={!timestampFrom}  onClick={() => dispatchFetchTraffic(-1, 'days')}>
            &lt; Previous Hour
          </button>
          <button className="navigation__button" disabled={!timestampTo}  onClick={() => dispatchFetchTraffic(1, 'days')}>
            Next Hour &gt;
          </button>
        </div>
        <div className="navigation-selector">
          <input type="range" min="1" max={trafficListSize} value={selectedTrafficIndex} className="slider" onChange={e => debouncedDispatchSelectTraffic(e.target.value - 1)}></input>
        </div>
      </div>
    );
  };

  /**
   * Render Function
   */
  return (
    <div className="navigation">
      { renderDetail() }
      { renderControls(trafficList) }
    </div>
  );
};

export default NavigationControl;
