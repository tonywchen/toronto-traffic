import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectNextTime, selectPreviousTime } from '../../actions/timeline';
import moment from 'moment-timezone';
import _ from 'lodash';

import { ReactComponent as PreviousIcon } from '../icons/previous.svg';
import { ReactComponent as NextIcon } from '../icons/next.svg';

import Timeline from './timeline/Timeline';

const SPEED = {
  FAST: {
    value: 250,
    text: '0.5x'
  },
  NORMAL: {
    value: 500,
    text: '1x'
  },
  SLOW: {
    value: 1000,
    text: '2x'
  }
};

const Dashboard = ({ onDayChanged }) => {
  const timestamps = useSelector(store => store.timeline.timestamps);

  const dispatch = useDispatch();

  const animationFrameRef = React.useRef(null);
  const previousTimeRef = React.useRef(null);

  const [isPaused, setPaused] = React.useState(true);
  const [animationSpeed, setAnimationSpeed] = React.useState(SPEED.NORMAL.value);

  /**
   * Animation Control Functions
   */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const animateTimeline = (timestamp) => {
    if (previousTimeRef.current != null) {
      const timeDiff = timestamp - previousTimeRef.current;

      let currentAnimationSpeed;
      setAnimationSpeed((currentValue) => {
        currentAnimationSpeed = currentValue;
        return currentValue;
      });

      if (timeDiff > currentAnimationSpeed) {
        previousTimeRef.current = timestamp;
        dispatch(selectNextTime());
      }
    } else {
      previousTimeRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(animateTimeline);
  };

  const stopAnimateTimeline = () => {
    previousTimeRef.current = null;

    setPaused(true);
  };

  const toggleAnimateTimeline = () => {
    const newValue = !isPaused;
    setPaused(newValue);

    if (newValue) {
      cancelAnimationFrame(animationFrameRef.current);
      previousTimeRef.current = null;
    } else {
      animationFrameRef.current = requestAnimationFrame(animateTimeline);
    }
  };

  /**
   * Traffic Selection Functions
   */
  const dispatchSelectNextTime = () => {
    dispatch(selectNextTime());
  };
  const dispatchSelectPreviousTime = () => {
    dispatch(selectPreviousTime());
  };

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
  const renderDateControls = () => {
    return (
      <div className="dashboard-controls py-1 flex justify-center">
        <div className="dashboard__select flex justify-center space-x-2">
          <button
            className="dashboard__timeline-toggle align-middle rounded-full bg-black bg-opacity-50 text-gray-500 hover:text-white px-2 py-2 hover:bg-blue-500 disabled:opacity-0"
            onClick={() => { handleDayChange(-1) }}
            disabled={!isPaused}>
            <div className="dashboard__timeline-toggle-inner w-6 h-6">
              <PreviousIcon />
            </div>
          </button>
          <div className="dashboard-detail text-sm text-center text-white leading-10 font-bold w-28">
          <h4>{moment(timestamps[0]).format('YYYY/MM/DD')}</h4>
        </div>
          <button
            className="dashboard__timeline-toggle align-middle rounded-full bg-black bg-opacity-50 text-gray-500 hover:text-white px-2 py-2 hover:bg-blue-500 disabled:opacity-0"
            onClick={() => { handleDayChange(1) }}
            disabled={!isPaused}>
            <div className="dashboard__timeline-toggle-inner w-6 h-6">
              <NextIcon />
            </div>
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render Function
   */
  return (
    <div className="dashboard absolute inset-x-0 bottom-0 py-10 px-2 lg:px-4 z-50 flex flex-col items-center space-y-2">
      <div className="bg-black bg-opacity-75 w-min rounded-lg py-2 px-4">
        {renderDateControls()}
      </div>
      <div className="bg-black bg-opacity-75 rounded-lg w-full py-4 px-3 lg:px-8">
        <Timeline
          handleDayChange={handleDayChange}
          forward={dispatchSelectNextTime}
          rewind={dispatchSelectPreviousTime}
          toggle={toggleAnimateTimeline}
          speed={animationSpeed}
          changeSpeed={setAnimationSpeed}
          paused={isPaused}
        />
      </div>
    </div>
  );
};

export default Dashboard;
