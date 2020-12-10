import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Ruler = (props) => {
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    setDragging(props.dragging);
  }, [props.dragging]);

  const isTimelineLoading = useSelector(store => store.timeline.loading);

  const draggingClass = (dragging)
    ? 'bg-yellow-500 bg-opacity-20'
    : ''
  ;

  console.log(`REFRESH_TIMELINE Received ${isTimelineLoading} ${window.performance.now()}`);

  return (
    <div className={`timeline-ruler absolute h-8 w-full flex items-end z-10 ${draggingClass}`}>
      {
        props.domain.map((value, index) => {
          const isHour = (value % 60) === 0;
          const isQuarter = (value % 15) === 0;

          let tickBaseClass = (isHour)
            ? 'h-6'
            : (isQuarter)
              ? 'h-3'
              : 'h-1'
          ;
          let borderBaseClass = 'border-r border-white border-opacity-30';
          let animationBaseClass = '';
          let style = {
            transition: 'height 0.15s, border 0.15s'
          }

          if (isTimelineLoading) {
            tickBaseClass = 'h-3'
            borderBaseClass = 'border-r border-yellow-500 border-opacity-30'
            animationBaseClass = 'animate-pulse';
            style.animationDelay = `${index / props.domain.length}s`;
            style.animationDuration = '1s';
          }

          return (
            <div className={`flex-grow ${tickBaseClass} ${borderBaseClass} ${animationBaseClass}`} style={style} key={index}>
            </div>
          );
        })
      }
    </div>
  );
};

export default Ruler;
