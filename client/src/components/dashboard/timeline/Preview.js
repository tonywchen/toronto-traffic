import React from 'react';

const Preview = ({ preview = {}, showTime = false }) => {
  const data = preview.data || [];

  /* return (
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
  ); */

  const maxDataIndex = data.length - 1;

  return (
    <div className={`timeline-preview absolute pt-1 h-6 w-full z-20`}>
      <div className={`timeline-preview-inner relative h-full w-full`}>
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
    </div>
  );
};

export default Preview;
