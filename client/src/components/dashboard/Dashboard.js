import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTime, selectNextTime } from '../../actions/timeline';
import moment from 'moment-timezone';
import _ from 'lodash';

import { ReactComponent as PlayIcon } from '../icons/play.svg';
import { ReactComponent as StopIcon } from '../icons/stop.svg';

const Dashboard = ({ onDayChanged }) => {
  const selectedTime = useSelector(store => store.timeline.selected);
  const timestamps = useSelector(store => store.timeline.timestamps);

  const dispatch = useDispatch();

  const animationFrameRef = React.useRef(null);
  const previousTimeRef = React.useRef(null);

  const [isPaused, setIsPaused] = React.useState(true);

  /**
   * Animation Control Functions
   */
  useEffect(() => {
    if (!isPaused) {
      animationFrameRef.current = requestAnimationFrame(animateTimeline);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const animateTimeline = (timestamp) => {
    if (previousTimeRef.current != null) {
      const timeDiff = timestamp - previousTimeRef.current;

      if (timeDiff > 2000) {
        previousTimeRef.current = timestamp;
        dispatch(selectNextTime());
      }
    } else {
      previousTimeRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(animateTimeline);
  };

  const stopAnimateTimeline = () => {
    cancelAnimationFrame(animationFrameRef.current);
    previousTimeRef.current = null;

    setIsPaused(true);
  };

  const toggleAnimateTimeline = () => {
    if (!isPaused) {
      cancelAnimationFrame(animationFrameRef.current);
      previousTimeRef.current = null;
    } else {
      animationFrameRef.current = requestAnimationFrame(animateTimeline);
    }

    setIsPaused(!isPaused);
  };

  /**
   * Traffic Selection Functions
   */
  const dispatchSelectTime = (time) => {
    dispatch(selectTime(time));
  };
  const debouncedDispatchSelectTime = _.debounce((index) => {
    const time = timestamps[index];
    dispatchSelectTime(time);
  });

  const handleDayChange = (amount) => {
    stopAnimateTimeline();
    if (amount) {
      const newTime = moment(timestamps[0]).add(amount, 'days').valueOf();

      if (onDayChanged) {
        onDayChanged(newTime);
      }
    }
  };

  /**
   * Render Helper Functions
   */
  const renderDetail = () => {
    return (
      <div className="dashboard-detail text-sm text-white">
        {
          (!selectedTime)
          ? (<h4>No data available for {moment(timestamps[0]).format('YYYY/MM/DD')} </h4>)
          : (
            <h4>{ moment(selectedTime).format('YYYY/MM/DD HH:mm') }</h4>
          )
        }
      </div>
    );
  };
  const renderControls = () => {
    let rangeIndex = (timestamps.length)
      ? timestamps.indexOf(selectedTime)
      : -1;
    rangeIndex = Math.max(rangeIndex, 0);

    return (
      <div className="dashboard-controls">
        <div className="dashboard__select flex justify-end space-x-2">
          <button
            className="dashboard__previous-unit flex items-center justify-center rounded-md text-sm text-white border border-gray-500 px-4 py-2 hover:bg-primary"
            disabled={!timestamps[0]}
            onClick={() => handleDayChange(-1, 'days')}>
            &lt; Previous Day
          </button>
          <button
            className="dashboard__next-unit flex items-center justify-center rounded-md text-sm text-white border border-gray-500 px-4 py-2 hover:bg-primary"
            disabled={!timestamps[0]}
            onClick={() => handleDayChange(1, 'days')}>
            Next Day &gt;
          </button>
        </div>
        <div className="dashboard__timeline flex space-x-2">
          <div className="dashboard__timeline-control flex-grow-0">
            <button
              className="dashboard__timeline-toggle align-middle rounded-md text-sm text-white  border border-gray-500 px-2 py-2 hover:bg-primary"
              onClick={toggleAnimateTimeline}>
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
            <input type="range" min="0" max={timestamps.length - 1} value={rangeIndex} className="slider w-full align-middle" onChange={e => debouncedDispatchSelectTime(e.target.value)}></input>
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
        { renderControls() }
      </div>
    </div>
  );
};

export default Dashboard;
