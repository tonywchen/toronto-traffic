import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGesture } from 'react-use-gesture'
import moment from 'moment-timezone';
import _ from 'lodash';

import { selectTime } from '../../../actions/timeline';

import Preview from './Preview';
import Ruler from './Ruler';
import Playhead from './Playhead';

const MAX_TIME_DISPLAYED = 60 * 24; // 24 hours
const TICK_INTERVAL = 5; // 5 minutes
const NUM_OF_TICKS = MAX_TIME_DISPLAYED / TICK_INTERVAL;

const createDomain = () => {
  const domain = Array.from({ length: NUM_OF_TICKS }).map((value, index) => {
    return index * TICK_INTERVAL;
  });

  const nearest = (percent) => {
    percent = Math.min(1, Math.max(percent, 0)); // percent should be [0, 1]
    const nearestIndex = Math.round(percent * (NUM_OF_TICKS - 1));
    return domain[nearestIndex];
  };

  return {
    domain,
    nearest
  };
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

const Timeline = ({handleDayChange}) => {
  const dispatch = useDispatch();
  const timestamps = useSelector(store => store.timeline.timestamps);
  const dataStatus = useSelector(store => store.timeline.dataStatus);

  const [lookupTime, setLookupTime] = useState(null);
  const [dragging, setDragging] = useState(false);
  const timelineRef = useRef();

  const { domain, nearest } = createDomain();

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

  const jumpToDay = (to) => {
    const currentDate = moment(timestamps[0]);
    const toDate = moment(to).startOf('days');
    const daysChanged = toDate.diff(currentDate, 'days');

    handleDayChange(daysChanged);
  };

  const renderEmptyState = () => {
    const lastDateString = moment(dataStatus.last).format('YYYY/MM/DD');
    const message = `No data today. Jump to last available date?`
    const action = `Jump to ${lastDateString}`;

    return (
      <div
        className={`timeline py-2 lg:py-3 px-2 lg:px-3 flex justify-center`}>
        <div className={`timeline-info flex h-12 w-full max-w-screen-sm rounded bg-blue-500 bg-opacity-25 text-gray-300 justify-between items-center`}>
          <div className={`px-2 lg:px-8 text-xs lg:text-sm`}>{message}</div>
          <button
            onClick={() => jumpToDay(dataStatus.last)}
            className={`h-12 px-2 lg:px-8 rounded bg-blue-500 text-white text-xs lg:text-sm font-bold justify-center items-center`}>
            {action}
          </button>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    return (
      <div
        className={`timeline relative rounded-xl py-3`}
        {...bind()}
        ref={timelineRef}>
        <div className="timeline__track relative h-12 w-full">
          <Preview />
          <Ruler domain={domain} dragging={dragging}/>
          <Playhead domain={domain} lookupTime={lookupTime} dragging={dragging} />
        </div>
      </div>
    );
  };

  if (dataStatus.available) {
    return renderTimeline();
  } else {
    return renderEmptyState();
  }
};

export default Timeline;
