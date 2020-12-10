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
        <h4>{ moment(timestamps[0]).format('YYYY/MM/DD') }</h4>
      </div>
    );
  };
  const renderControls = () => {
    let rangeIndex = (timestamps.length)
      ? timestamps.indexOf(selectedTime)
      : -1;
    rangeIndex = Math.max(rangeIndex, 0);

    return (
      <div className="dashboard-controls p-1">
        <div className="dashboard__select flex justify-center space-x-2">
          <button
            className="dashboard__timeline-toggle align-middle rounded-md text-sm text-white border border-gray-500 px-2 py-2 hover:bg-primary disabled:opacity-25"
            onClick={() => { handleDayChange(-1) }}
            disabled={!isPaused}>
            <div className="dashboard__timeline-toggle-inner w-6 h-6">
              <PreviousIcon />
            </div>
          </button>
          <button
            className="dashboard__timeline-toggle align-middle rounded-md text-sm text-white border border-gray-500 px-2 py-2 hover:bg-primary disabled:opacity-25"
            onClick={dispatchSelectPreviousTime}
            disabled={!isPaused}>
            <div className="dashboard__timeline-toggle-inner w-6 h-6">
              <RewindIcon />
            </div>
          </button>
          <button
            className="dashboard__timeline-toggle align-middle rounded-md text-sm text-white border border-gray-500 px-2 py-2 hover:bg-primary"
            onClick={toggleAnimateTimeline}>
            <div className="dashboard__timeline-toggle-inner w-6 h-6">
              { (isPaused) ? <PlayIcon /> : <StopIcon /> }
            </div>
          </button>
          <button
            className="dashboard__timeline-toggle align-middle rounded-md text-sm text-white border border-gray-500 px-2 py-2 hover:bg-primary disabled:opacity-25"
            onClick={dispatchSelectNextTime}
            disabled={!isPaused}>
            <div className="dashboard__timeline-toggle-inner w-6 h-6">
              <ForwardIcon />
            </div>
          </button>
          <button
            className="dashboard__timeline-toggle align-middle rounded-md text-sm text-white border border-gray-500 px-2 py-2 hover:bg-primary disabled:opacity-25"
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
    <div className="dashboard absolute inset-x-0 bottom-0 py-16 px-16 z-50">
      <div className="bg-gray-50 bg-opacity-10 rounded-lg w-full py-4 px-4">
        { renderControls() }
        { renderDetail() }
        <Timeline />
      </div>
    </div>
  );
};

export default Dashboard;
