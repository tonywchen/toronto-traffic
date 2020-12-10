import React, { useEffect, useState } from 'react';

const Ruler = (props) => {
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    setDragging(props.dragging);
  }, [props.dragging])

  const draggingClass = (dragging)
    ? 'bg-yellow-500 bg-opacity-5'
    : '';

  return (
    <div className={`timeline-ruler absolute h-8 w-full flex items-end z-10 ${draggingClass}`}>
      {
        props.domain.map((value, index) => {
          console.log(value);

          return (
            <div className="flex-grow h-8 border-r border-white border-opacity-20" key={index}>
            </div>
          );
        })
      }
    </div>
  );
};

export default Ruler;
