import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';
import DatePicker from "react-datepicker";

import { DATE_FORMAT, DAY_FORMAT } from '../common/Util';
import { selectNextTime, selectPreviousTime } from '../../actions/timeline';

import { ReactComponent as PreviousIcon } from '../icons/previous.svg';
import { ReactComponent as NextIcon } from '../icons/next.svg';
import Timeline from './timeline/Timeline';

import "react-datepicker/dist/react-datepicker.css";

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
  const dataStatus = useSelector(store => store.timeline.dataStatus);

  const dispatch = useDispatch();

  const animationFrameRef = React.useRef(null);
  const previousTimeRef = React.useRef(null);

  const [isPaused, setPaused] = React.useState(true);
  const [animationSpeed, setAnimationSpeed] = React.useState(SPEED.NORMAL.value);
  const [isDatePickerOpen, setDatePickerOpen] = React.useState(false);

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
  const handleDaySelect = (date) => {
    stopAnimateTimeline();
    if (date) {
      const newTime = moment(date).valueOf();

      if (onDayChanged) {
        onDayChanged(newTime);
      }
    }
  };

  /**
   * Render Helper Functions
   */
  const renderDateControls = () => {
    const isBeforeFirst = moment(timestamps[0]).isSameOrBefore(moment(dataStatus.first || 0), 'days');
    const isAfterToday = moment(timestamps[0]).isSameOrAfter(moment(), 'days');

    return (
      <div className="dashboard-controls py-1 flex justify-center">
        <div className="dashboard__select flex justify-center space-x-2">
          <button
            className="dashboard__timeline-toggle align-middle w-10 h-10 rounded-full bg-black bg-opacity-50 text-gray-500 hover-hover:hover:text-white hover-hover:hover:bg-blue-500 disabled:opacity-25"
            onClick={() => { handleDayChange(-1) }}
            disabled={isBeforeFirst || !isPaused}>
            <div className="dashboard__timeline-toggle-inner w-6 h-6 m-2">
              <PreviousIcon />
            </div>
          </button>
          <div className="dashboard-detail text-center font-bold w-28">
            { renderDayPickerAndInput() }
          </div>
          <button
            className="dashboard__timeline-toggle align-middle w-10 h-10 rounded-full bg-black bg-opacity-50 text-gray-500 hover-hover:hover:text-white hover-hover:hover:bg-blue-500 disabled:opacity-25 disabled:pointer-events-none"
            onClick={() => { handleDayChange(1) }}
            disabled={isAfterToday || !isPaused}>
            <div className="dashboard__timeline-toggle-inner w-6 h-6 m-2">
              <NextIcon />
            </div>
          </button>
        </div>
      </div>
    );
  };

  const DatePickerInput = ({ value, onClick }) => {
    const toggle = () => {
      if (!isDatePickerOpen) {
        onClick();
      }
    };

    return (
      <div className="px-2 rounded hover-hover:hover:bg-blue-500">
        <h4 className="text-white text-sm" onClick={toggle}>
          {moment(value).format(DATE_FORMAT)}
        </h4>
        <h6 className="text-gray-300 text-xs">{moment(timestamps[0]).format(DAY_FORMAT)}</h6>
      </div>
    );
  };

  const renderDayPickerAndInput = () => {
    const popperModifiers = {
      offset: {
        enabled: true,
        offset: "0px, 10px"
      }
    };

    const props = {
      selected: timestamps[0],
      disabled: !isPaused,
      onSelect: handleDaySelect,
      onChange: () => {},
      popperClassName: 'dashboard-datepicker',
      popperPlacement: 'bottom',
      popperModifiers: popperModifiers,
      minDate: moment(dataStatus.first).toDate(),
      maxDate: new Date(),
      onCalendarClose: () => { setDatePickerOpen(false) },
      onCalendarOpen: () => { setDatePickerOpen(true) }
    };

    return (
      <div className="datepicker cursor-pointer disabled:cursor-default" disabled={!isPaused}>
        <DatePicker
          {...props}
          customInput={<DatePickerInput />}
        />
      </div>
    );
  };

  /**
   * Render Function
   */
  return (
    <div className="dashboard absolute inset-x-0 bottom-0 py-10 px-2 lg:px-4 z-40 flex flex-col items-center space-y-2">

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
