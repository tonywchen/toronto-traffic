import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Ruler = (props) => {
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    setDragging(props.dragging);
  }, [props.dragging]);

  const isTimelineLoading = useSelector(store => store.timeline.loading);

  const draggingClass = (dragging)
    ? 'bg-white bg-opacity-5'
    : ''
  ;

  const maxDomainIndex = props.domain.length - 1;

  return (
    <div className={`timeline-ruler absolute pt-6 h-10 w-full flex items-start z-10 rounded ${draggingClass}`}>
      <div className={`timeline-ruler-inner relative h-full w-full`}>
        {
          props.domain.map((value, index) => {
            const isHour = (value % 60) === 0;
            const isQuarter = (value % 15) === 0;
            const leftPercentage = index / maxDomainIndex * 100;

            let tickBaseClass = (isHour)
              ? 'h-3'
              : (isQuarter)
                ? 'h-2'
                : 'h-1'
            ;
            let borderBaseClass = 'border-r border-gray-500 border-opacity-50';
            let animationBaseClass = '';
            let style = {
              left: `${leftPercentage}%`,
              transition: 'height 0.15s, border 0.15s'
            }

            if (isTimelineLoading) {
              borderBaseClass = 'border-r border-gray-500 border-opacity-50'
              animationBaseClass = 'animate-pulse';
              style.animationDelay = `${index / props.domain.length}s`;
              style.animationDuration = '1s';
            }

            return (
              <div className={`absolute top-0 ${tickBaseClass} ${borderBaseClass} ${animationBaseClass}`} style={style} key={index}>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

export default Ruler;
