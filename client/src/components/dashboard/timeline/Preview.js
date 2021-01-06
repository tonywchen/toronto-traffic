import React from 'react';
import moment from 'moment-timezone';

import { TIME_FORMAT } from '../../common/Util';

const Preview = ({ preview = {}, showTime = 0 }) => {
  const data = preview.data || [];

  const maxDataIndex = data.length - 1;
  const previewHeightClassName = (showTime)? 'h-8' : 'h-6';

  const renderTime = () => {
    if (!showTime) {
      return null;
    }

    const numOfDivisions = showTime + 1;
    const ticks = [];
    for (let counter = 0; counter < numOfDivisions; counter++) {
      const tick = Math.floor(counter * data.length / numOfDivisions);
      ticks.push(tick);
    }

    return (
      <div className={`relative h-2 w-full border-t border-white border-opacity-10`}>
        {
          ticks.map((tick, index) => {
            const timestamp = data[tick].data.timestamp

            let left = `${index / numOfDivisions * 100}%`;
            let style = {
              left,
              fontSize: '0.5rem',
              lineHeight: '0.75rem',
              transform: 'translateX(-50%)'
            };

            return (
              <div className="absolute top-1 text-white text-opacity-50" style={style} key={index}>
                { moment(timestamp).format(TIME_FORMAT) }
              </div>
            );
          })
        }
      </div>
    );
  };

  return (
    <div className={`timeline-preview absolute pt-1 ${previewHeightClassName} w-full z-20`}>
      <div className={`relative h-5 w-full`}>
        {
          data.map(({x, data}, index) => {
            let barLeft = `${index / maxDataIndex * 100}%`;
            let barHeight = `${x * 100.0}%`;
            let style = {
              left: barLeft,
              height: barHeight
            };

            if (data && data.color) {
              style.borderColor = data.color;
            }

            return (
              <div className="absolute bottom-0 border-r border-white opacity-50" style={style} key={index}>
              </div>
            );
          })
        }
      </div>
      { renderTime() }
    </div>
  );
};

export default Preview;
