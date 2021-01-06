import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';

const MODES = {
  'VIEW': 'VIEW',
  'LOOKUP': 'LOOKUP',
  'EDIT': 'EDIT'
};
const COLORS = {
  'VIEW': 'gray-300',
  'LOOKUP': 'gray-500',
  'EDIT': 'blue-500'
};

const getMode = (edit, lookup) => {
  if (edit) {
    return MODES.EDIT;
  }

  if (lookup) {
    return MODES.LOOKUP;
  }

  return MODES.VIEW;
};

const Playhead = (props) => {
  const timestamps = useSelector(store => store.timeline.timestamps);
  const selectedTime = useSelector(store => store.timeline.selected);
  const isTimelineLoading = useSelector(store => store.timeline.loading);

  const [lookupTime, setLookupTime] = useState(null);
  const [mode, setMode] = useState(MODES.VIEW);

  useEffect(() => {
    setLookupTime(props.lookupTime);

    const newMode = getMode(!!props.dragging, !!props.lookupTime);
    setMode(newMode);
  }, [props.lookupTime, props.dragging])

  const computeRenderAttributes = (time) => {
    if (!time) {
      switch (mode) {
        case MODES.VIEW:
          time = selectedTime;
          break;
        case MODES.LOOKUP:
        case MODES.EDIT:
          time = lookupTime;
          break;
        default:
          // do nothing
      }
    }

    let left = null;
    let timeString = null;
    let style = {};

    const timeIndex = timestamps.indexOf(time);
    if (timeIndex >= 0) {
      left = `${timeIndex / (timestamps.length - 1) * 100}%`;
      timeString = moment(time).format('HH:mm');
      style.left = left;
    }

    return {
      timeString,
      style
    };
  }

  const renderGuides = () => {
    return (
      <div className="timeline-playhead__guides relative h-10 w-full">
        { renderSelectedTimeGuide() }
        { renderLookupTimeGuide() }
      </div>
    );
  };
  const renderSelectedTimeGuide = () => {
    const { style } = computeRenderAttributes(selectedTime);

    return (
      <div className="absolute mt-6 h-4 border-r border-gray-400 border-opacity-100" style={style}>
      </div>
    );
  };
  const renderLookupTimeGuide = () => {
    if (mode === MODES.VIEW) {
      return null;
    }

    const { style } = computeRenderAttributes();

    const borderColorClass = `border-${COLORS[mode]}`;

    return (
      <div className={`absolute h-10 border-r ${borderColorClass} border-opacity-100`} style={style}>
      </div>
    );
  };

  const renderTimes = () => {
    return (
      <div className={`timeline-playhead__times relative h-4 pt-1 w-full`}>
        { renderSelectedTime() }
        { renderLookupTime() }
      </div>
    );
  };

  const renderSelectedTime = () => {
    const { timeString, style } = computeRenderAttributes(selectedTime);
    style.transform = 'translateX(-50%)';

    return (
      <div className="timeline-playhead__time timeline-playhead__time--selected absolute text-white text-xs" style={style}>
        { timeString }
      </div>
    );
  };
  const renderLookupTime = () => {
    if (mode === MODES.VIEW) {
      return null;
    }

    const { timeString, style } = computeRenderAttributes();
    style.transform = 'translateX(-50%)';

    const bgColorClass = `bg-${COLORS[mode]}`;

    return (
      <div className={`timeline-playhead__time timeline-playhead__time--lookup absolute text-white text-xs font-bold ${bgColorClass} px-1 rounded-sm`} style={style}>
        { timeString }
      </div>
    );
  };

  return (
    <div className="timeline-playhead relative z-30">
      { !isTimelineLoading && renderGuides() }
      { !isTimelineLoading && renderTimes() }
    </div>
  );
};

export default Playhead;
