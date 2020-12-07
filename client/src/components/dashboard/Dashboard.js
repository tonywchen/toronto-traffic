import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTraffic, selectNextTraffic, selectTraffic } from '../../actions/traffic';
import moment from 'moment-timezone';
import _ from 'lodash';

import { ReactComponent as PlayIcon } from '../icons/play.svg';
import { ReactComponent as StopIcon } from '../icons/stop.svg';

const Dashboard = () => {
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
    return (
      <div className="dashboard-detail text-sm text-white">
        {
          (trafficList.length === 0)
          ? (<h4>No data available for {moment(timestampFrom).format('YYYY/MM/DD')} </h4>)
          : (
            <h4>{ moment(trafficList[selectedTrafficIndex].timestamp).format('YYYY/MM/DD HH:mm') }</h4>
          )
        }
      </div>
    );
  };
  const renderControls = (trafficList) => {
    const trafficListSize = trafficList.length;

    return (
      <div className="dashboard-controls">
        <div className="dashboard__select flex justify-end space-x-2">
          <button
            className="dashboard__previous-unit flex items-center justify-center rounded-md text-sm text-white border border-gray-500 px-4 py-2 hover:bg-primary"
            disabled={!timestampFrom}
            onClick={() => dispatchFetchTraffic(-1, 'days')}>
            &lt; Previous Day
          </button>
          <button
            className="dashboard__next-unit flex items-center justify-center rounded-md text-sm text-white border border-gray-500 px-4 py-2 hover:bg-primary"
            disabled={!timestampTo}
            onClick={() => dispatchFetchTraffic(1, 'days')}>
            Next Day &gt;
          </button>
        </div>
        <div className="dashboard__timeline flex space-x-2">
          <div className="dashboard__timeline-control flex-grow-0">
            <button
              className="dashboard__timeline-toggle align-middle rounded-md text-sm text-white  border border-gray-500 px-2 py-2 hover:bg-primary"
              onClick={toggleAnimateTraffic}>
              <div className="dashboard__timeline-toggle-inner w-6 h-6">
                {
                  (isPaused)
                  ? <PlayIcon />
                  : <StopIcon />
                }
              </div>
            </button>
          </div>
          <div className="dashboard__timeline-progress flex flex-grow">
            <input type="range" min="1" max={trafficListSize} value={selectedTrafficIndex} className="slider w-full align-middle" onChange={e => debouncedDispatchSelectTraffic(e.target.value - 1)}></input>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Function
   */
  return (
    <div className="dashboard absolute inset-x-0 bottom-0 py-16 px-16">
      <div className="z-50 bg-gray-50 bg-opacity-10 rounded w-full py-4 px-4">
        { renderDetail() }
        { renderControls(trafficList) }
      </div>
    </div>
  );
};

export default Dashboard;
