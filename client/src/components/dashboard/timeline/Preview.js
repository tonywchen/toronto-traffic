import React from 'react';
import { useSelector } from 'react-redux';

const Preview = () => {
  const preview = useSelector(store => store.timeline.preview);

  const data = preview.data || [];

  return (
    <div className={`timeline-preview absolute pt-1 h-6 w-full flex items-end z-20`}>
      {
        data.map(({x, data}, index) => {
          let barHeight = `${x * 100.0}%`;
          let style = {
            height: barHeight
          };

          if (data && data.color) {
            style.borderColor = data.color;
          }

          return (
            <div className="flex-grow border-r border-white opacity-50" style={style} key={index}>
            </div>
          );
        })
      }
    </div>
  );
};

export default Preview;
