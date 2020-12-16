import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectNextTime, selectPreviousTime } from '../../actions/timeline';
import moment from 'moment-timezone';
import _ from 'lodash';

import { ReactComponent as PreviousIcon } from '../icons/previous.svg';
import { ReactComponent as RewindIcon } from '../icons/rewind.svg';
import { ReactComponent as PlayIcon } from '../icons/play.svg';
import { ReactComponent as StopIcon } from '../icons/stop.svg';
import { ReactComponent as ForwardIcon } from '../icons/forward.svg';
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
  const renderDetail = () => {
    return (
      <div className="dashboard-detail text-lg text-center text-white p-1">
        <h4>{moment(timestamps[0]).format('YYYY/MM/DD')}</h4>
      </div>
    );
  };
  const renderControls = () => {
    return (
      <div className="dashboard-controls py-1 flex">
        <div className="hidden lg:w-1/4"></div>
        <div className="w-full lg:w-1/2">
          <div className="dashboard__select flex justify-center space-x-2">
            <button
              className="dashboard__timeline-toggle align-middle rounded-md text-sm text-gray-300 border border-gray-500 px-2 py-2 hover:bg-primary disabled:opacity-25"
              onClick={() => { handleDayChange(-1) }}
              disabled={!isPaused}>
              <div className="dashboard__timeline-toggle-inner w-6 h-6">
                <PreviousIcon />
              </div>
            </button>
            <button
              className="dashboard__timeline-toggle align-middle rounded-md text-sm text-gray-300 border border-gray-500 px-2 py-2 hover:bg-primary disabled:opacity-25"
              onClick={dispatchSelectPreviousTime}
              disabled={!isPaused}>
              <div className="dashboard__timeline-toggle-inner w-6 h-6">
                <RewindIcon />
              </div>
            </button>
            <button
              className="dashboard__timeline-toggle align-middle rounded-md text-sm text-gray-300 border border-gray-500 px-2 py-2 hover:bg-primary"
              onClick={toggleAnimateTimeline}>
              <div className="dashboard__timeline-toggle-inner w-6 h-6">
                {(isPaused) ? <PlayIcon /> : <StopIcon />}
              </div>
            </button>
            <button
              className="dashboard__timeline-toggle align-middle rounded-md text-sm text-gray-300 border border-gray-500 px-2 py-2 hover:bg-primary disabled:opacity-25"
              onClick={dispatchSelectNextTime}
              disabled={!isPaused}>
              <div className="dashboard__timeline-toggle-inner w-6 h-6">
                <ForwardIcon />
              </div>
            </button>
            <button
              className="dashboard__timeline-toggle align-middle rounded-md text-sm text-gray-300 border border-gray-500 px-2 py-2 hover:bg-primary disabled:opacity-25"
              onClick={() => { handleDayChange(1) }}
              disabled={!isPaused}>
              <div className="dashboard__timeline-toggle-inner w-6 h-6">
                <NextIcon />
              </div>
            </button>
          </div>
        </div>
        <div className="hidden lg:w-1/4">
          <div className="dashboard__select flex justify-end space-x-2">
            {
              !isPaused &&
              [SPEED.FAST, SPEED.NORMAL, SPEED.SLOW].map((speed) => {
                const bgColorClass = (speed.value === animationSpeed) ? 'bg-primary' : '';
                const textClass = (speed.value === animationSpeed) ? 'text-xs text-white font-bold' : 'text-xs text-gray-300';

                return (
                  <button
                    className={`align-middle rounded-md ${textClass} border border-gray-500 w-10 h-10 ${bgColorClass} hover:bg-primary`}
                    key={speed.value}
                    onClick={() => setAnimationSpeed(speed.value)}
                  >
                    {speed.text}
                  </button>
                );
              })
            }
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Function
   */
  return (
    <div className="dashboard absolute inset-x-0 bottom-0 py-10 px-2 lg:px-4 z-50">
      <div className="bg-black bg-opacity-75 rounded-lg w-full py-4 px-3 lg:px-8">
        {renderControls()}
        {renderDetail()}
        <Timeline />
      </div>
    </div>
  );
};

export default Dashboard;
