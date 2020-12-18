import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGesture } from 'react-use-gesture'
import moment from 'moment-timezone';

import { selectTime } from '../../../actions/timeline';
import { DATE_FORMAT } from '../../common/Util';

import Preview from './Preview';
import Ruler from './Ruler';
import Playhead from './Playhead';

import { ReactComponent as RewindIcon } from '../../icons/rewind.svg';
import { ReactComponent as PlayIcon } from '../../icons/play.svg';
import { ReactComponent as PauseIcon } from '../../icons/pause.svg';
import { ReactComponent as ForwardIcon } from '../../icons/forward.svg';

const MAX_TIME_DISPLAYED = 60 * 24; // 24 hours
const TICK_INTERVAL = 5; // 5 minutes
const NUM_OF_TICKS = MAX_TIME_DISPLAYED / TICK_INTERVAL;
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

const domain = Array.from({ length: NUM_OF_TICKS }).map((value, index) => {
  return index * TICK_INTERVAL;
});
const nearest = (percent) => {
  percent = Math.min(1, Math.max(percent, 0)); // percent should be [0, 1]
  const nearestIndex = Math.round(percent * (NUM_OF_TICKS - 1));
  return domain[nearestIndex];
};
const mapPointWithinBounds = (point, bounds) => {
  const [x, y] = point;
  const {width, height, top, left} = bounds;

  const xPercent = (x - left) / width;
  const yPercent = (y - top) / height;
  const isWithinX = xPercent >= 0 && xPercent <= 100;
  const isWithinY = yPercent >= 0 && yPercent <= 100;

  return {
    percent: [xPercent, yPercent],
    isWithin: isWithinX && isWithinY
  };
}

const Timeline = ({handleDayChange, forward, rewind, toggle, speed, changeSpeed, paused}) => {
  const dispatch = useDispatch();
  const initialized = useSelector(store => store.timeline.initialized);
  const timestamps = useSelector(store => store.timeline.timestamps);
  const dataStatus = useSelector(store => store.timeline.dataStatus);

  const [lookupTime, setLookupTime] = useState(null);
  const [dragging, setDragging] = useState(false);
  const timelineRef = useRef();

  const bind = useGesture({
    onDrag: (state) => {
      const bounds = timelineRef.current.getBoundingClientRect();
      const e = state.event;
      const { percent, isWithin } = mapPointWithinBounds([e.clientX, e.clientY], bounds)
      const xPercent = percent[0];

      const newTimeOffset = nearest(xPercent);
      const newLookupTime = moment(timestamps[0]).startOf('day').add(newTimeOffset, 'minutes').valueOf();

      setLookupTime(newLookupTime);
      setDragging(isWithin);
    },
    onDragEnd: (state) => {
      const bounds = timelineRef.current.getBoundingClientRect();
      const e = state.event;
      const { isWithin } = mapPointWithinBounds([e.clientX, e.clientY], bounds)

      if (isWithin) {
        dispatch(selectTime(lookupTime));
      }

      setLookupTime(null);
      setDragging(false);
    }
  });

  const jumpToDate = (to) => {
    const currentDate = moment(timestamps[0]);
    const toDate = moment(to).startOf('days');
    const daysChanged = toDate.diff(currentDate, 'days');

    handleDayChange(daysChanged);
  };

  const renderTimelineControls = () => {
    return (
      <div className={`dashboard-controls flex`}>
        <div className="hidden lg:block lg:w-1/4"></div>
        <div className="w-full lg:w-1/2">
          <div className="dashboard__select flex justify-center space-x-4">
            <button
              className="dashboard__timeline-toggle align-middle rounded-full bg-black bg-opacity-50 text-gray-500 hover-hover:hover:text-white px-2 py-2 hover-hover:hover:bg-blue-500 disabled:opacity-25"
              onClick={rewind}
              disabled={dragging}>
              <div className="dashboard__timeline-toggle-inner w-4 h-4 lg:w-6 lg:h-6">
                <RewindIcon />
              </div>
            </button>
            <button
              className="dashboard__timeline-toggle align-middle rounded-full bg-black bg-opacity-50 text-gray-300 px-0 py-0 hover-hover:hover:bg-blue-500 disabled:opacity-25"
              onClick={toggle}
              disabled={dragging}>
              <div className="dashboard__timeline-toggle-inner w-8 h-8 lg:w-10 lg:h-10">
                {(paused) ? <PlayIcon /> : <PauseIcon />}
              </div>
            </button>
            <button
              className="dashboard__timeline-toggle align-middle rounded-full bg-black bg-opacity-50 text-gray-500 hover-hover:hover:text-white px-2 py-2 hover-hover:hover:bg-blue-500 disabled:opacity-25"
              onClick={forward}
              disabled={dragging}>
              <div className="dashboard__timeline-toggle-inner w-4 h-4 lg:w-6 lg:h-6">
                <ForwardIcon />
              </div>
            </button>
          </div>
        </div>
        <div className="hidden lg:block lg:w-1/4">
          <div className="flex justify-end">
            <div className="dashboard__select rounded-md overflow-hidden grid grid-cols-3 divide-x divide-black">
              {
                !paused &&
                [SPEED.FAST, SPEED.NORMAL, SPEED.SLOW].map((s, index) => {
                  const bgColorClass = (s.value === speed) ? 'bg-blue-800' : 'bg-gray-900';
                  const textClass = (s.value === speed) ? 'text-xs text-white font-bold' : 'text-xs text-gray-300 font-bold';

                  return (
                    <button
                      className={`align-middle ${textClass} w-12 h-8 ${bgColorClass} hover-hover:hover:bg-blue-500`}
                      key={s.value}
                      onClick={() => changeSpeed(s.value)}
                    >
                      {s.text}
                    </button>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div
        className={`timeline h-24 flex justify-center items-center`}>
        <div className={`timeline-info flex h-12 w-full max-w-screen-sm rounded bg-blue-500 bg-opacity-25 text-gray-300 text-xs lg:text-sm justify-center items-center`}>
          Initializing data...
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    const isCompletelyEmpty = !dataStatus.first && !dataStatus.last;
    const isBeforeFirst = timestamps[0] < dataStatus.first;
    const isAfterLast = timestamps[0] > dataStatus.last;
    const toTimestamp = (isBeforeFirst && dataStatus.first) || (isAfterLast && dataStatus.last);
    const toDateString = moment(toTimestamp).format(DATE_FORMAT);

    const canJumpToDate = isBeforeFirst || isAfterLast;
    const justifyClass = (canJumpToDate)? 'justify-between' : 'justify-center';
    const hiddenClass = (canJumpToDate)? '' : 'hidden';

    const message = (isCompletelyEmpty)
      ? `No historical traffic data can be found. `
      : `No traffic data today. `;
    const offer = (isBeforeFirst && `Fast forward to first available date?`) || (isAfterLast && `Rewind back to last available date?`) || ``;
    const action = `Jump to ${toDateString}`;

    return (
      <div
        className={`timeline py-6 lg:py-7 px-2 lg:px-3 flex justify-center`}>
        <div className={`timeline-info flex h-12 w-full max-w-screen-sm rounded bg-blue-500 bg-opacity-25 text-gray-300 ${justifyClass} items-center`}>
          <div className={`px-4 lg:px-6 text-xs lg:text-sm`}>
            { message }
            { offer }
          </div>
          <button
            onClick={() => jumpToDate(dataStatus.last)}
            className={`h-full px-4 lg:px-6 rounded bg-blue-500 text-white text-xs lg:text-sm font-bold justify-center items-center ${hiddenClass}`}>
            { action }
          </button>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    return (
      <div
        className={`timeline relative`}
        ref={timelineRef}>
        <div className="timeline__track relative h-16 w-full" {...bind()}>
          <Preview />
          <Ruler domain={domain} dragging={dragging}/>
          <Playhead domain={domain} lookupTime={lookupTime} dragging={dragging} />
        </div>
        { renderTimelineControls() }
      </div>
    );
  };

  if (!initialized) {
    return renderLoadingState();
  }

  if (dataStatus.available) {
    return renderTimeline();
  } else {
    return renderEmptyState();
  }
};

export default Timeline;
