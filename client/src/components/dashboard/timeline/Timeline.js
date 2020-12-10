import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';
import _ from 'lodash';

import { selectTime } from '../../../actions/timeline';

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

const Timeline = () => {
  const dispatch = useDispatch();
  const timestamps = useSelector(store => store.timeline.timestamps);

  const [lookupTime, setLookupTime] = useState(null);
  const [dragging, setDragging] = useState(false);
  const timelineRef = useRef();

  const { domain, nearest } = createDomain();

  const startDragging = () => {
    setDragging(true);
  };
  const stopDragging = (e, ignoreUpdate) => {
    if (!ignoreUpdate) {
      dispatch(selectTime(lookupTime));
    }

    setDragging(false);
  }
  const onTimelineMove = _.debounce((e) => {
    const bounds = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const width = bounds.width;
    const xPercent = x / width;

    const newTimeOffset = nearest(xPercent);
    const newLookupTime = moment(timestamps[0]).startOf('day').add(newTimeOffset, 'minutes').valueOf();
    setLookupTime(newLookupTime);
  }, 15);
  const onTimelineLeave = _.debounce((e) => {
    setLookupTime(null);
    stopDragging(e, true);
  }, 15);

  return (
    <div
      className={`timeline relative rounded-xl py-3`}
      onMouseDown={startDragging}
      onMouseOver={onTimelineMove}
      onMouseLeave={onTimelineLeave}
      onMouseUp={stopDragging}
      ref={timelineRef}>
      <div className="timeline__track relative h-12 w-full">
        <Ruler domain={domain} dragging={dragging}/>
        <Playhead domain={domain} lookupTime={lookupTime} dragging={dragging} />
      </div>
    </div>
  );
};

export default Timeline;
