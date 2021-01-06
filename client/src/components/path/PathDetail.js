import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';

import { DATE_FORMAT, TIME_FORMAT, trafficToColour, trafficToPreview } from '../common/Util';
import { ReactComponent as CloseIcon } from '../icons/close.svg';

import { resetPathDetail } from '../../actions/path';

// TODO: Make Preview common or create a more generic bar chart component?
import Preview from '../dashboard/timeline/Preview';

const getTrafficStatusText = (average) => {
  if (average === 0) {
    return 'as fast as';
  }

  const absAverage = Math.abs(average);
  const numberText = (absAverage > 100)
    ? absAverage.toFixed(0)
    : absAverage.toPrecision(2);

  const descriptor = (average > 0)? 'slower than' : 'faster than';

  return `${numberText} seconds ${descriptor}`;
};

const PathDetail = () => {
  const selectedPath = useSelector(store => store.path.selectedPath);
  const timestamps = useSelector(store => store.timeline.timestamps);

  const dispatch = useDispatch();

  const render = () => {
    const hiddenClassName = (selectedPath)? '' : 'hidden';

    return (
      <div className={`path-detail ${hiddenClassName} fixed z-50 inset-0 w-full md:top-4 md:bottom-64 md:left-auto md:right-4 md:w-1/3 lg:w-1/4 md:max-w-xs bg-gray-900 rounded overflow-hidden`}>
        { selectedPath && selectedPath.isLoading && renderEmptyState() }
        { selectedPath && !selectedPath.isLoading && renderDetail() }
      </div>
    );
  };

  const minimize = () => {
    dispatch(resetPathDetail());
  };

  const renderEmptyState = () => {
    return (
      <div className="w-full h-full relative flex items-center justify-center">
        <button
          className="absolute top-2 right-4 right-0 w-10 h-10 -mx-2 p-2 bg-gray-900 text-white rounded-full hover-hover:hover:bg-blue-800"
          onClick={minimize}>
          <CloseIcon />
        </button>
        <div className="w-3/4 text-white">
          Loading traffic information between Stops #{ selectedPath.fromStop.tag } and #{ selectedPath.toStop.tag }...
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    return (
      <div className="overflow-auto h-full">
        { renderHeader() }
        { renderDaily() }
        { renderTrend() }
      </div>
    )
  };

  const renderHeader = () => {
    return (
      <div className={`path-detail__section space-y-2 px-4 py-2 border-b border-white border-opacity-10 bg-blue-900`}>
        <button
          className="float-right w-10 h-10 -mx-2 p-2 bg-blue-900 text-white rounded-full hover-hover:hover:bg-blue-800"
          onClick={minimize}>
          <CloseIcon />
        </button>
        <div>
          <div className="text-xs text-white text-opacity-50">From Stop #{ selectedPath.fromStop.tag }</div>
          <div className="flex-grow text-sm font-bold text-white">{ selectedPath.fromStop && selectedPath.fromStop.title }</div>
        </div>
        <div>
        <div className="text-xs text-white text-opacity-50">To Stop #{ selectedPath.toStop.tag }</div>
          <div className="flex-grow text-sm font-bold text-white">{ selectedPath.toStop && selectedPath.toStop.title }</div>
        </div>
      </div>
    );
  };

  const renderDaily = () => {
    if (!selectedPath || !selectedPath.daily) {
      return null;
    }

    const total = selectedPath.daily.reduce((acc, pathStatus) => {
      acc.weight += pathStatus.weight;
      acc.score += pathStatus.score;

      return acc;
    }, {
      weight: 0,
      score: 0
    });
    const dailyAverage = (total.weight > 0)
      ? (total.score / total.weight)
      : null;

    const previewSource = {};
    selectedPath.daily.forEach(datum => {
      previewSource[datum.timestamp] = {
        data: [datum]
      };
    });

    const dailyPreview = {
      data: trafficToPreview(previewSource)(timestamps)
    };

    return (
      <div className={`path-detail__daily space-y-2 px-4 py-4 border-b border-white border-opacity-10`}>
        { selectedPath.currentView && !isNaN(selectedPath.currentView.average) && (
          <>
            <div className="text-xs text-white  text-opacity-50">
              { moment(selectedPath.currentView.selectedTime).format(DATE_FORMAT) }
            </div>
            <div className="text-sm text-white">
              <span>Between these two stops, the traffic is</span>&nbsp;
              <span className="font-bold" style={{color: trafficToColour(selectedPath.currentView.average)}}>
                { getTrafficStatusText(selectedPath.currentView.average) }
              </span>&nbsp;
              <span>predicted at { moment(selectedPath.currentView.selectedTime).format(TIME_FORMAT) }.</span>
            </div>
          </>
        )}

        { (dailyAverage === null) && (
          <div className="text-sm text-white">
            There is no activity found between these two stops today.
          </div>
        )}

        { (dailyAverage !== null) && (
          <>
            <div className={`h-16 py-4 mx-2 relative`}>
              <Preview preview={dailyPreview} showTime={3} />
            </div>
            <div className="text-sm text-white">
              <span>Thoughout the day, the traffic is on average</span>&nbsp;
              <span className="font-bold" style={{color: trafficToColour(dailyAverage)}}>
                { getTrafficStatusText(dailyAverage) }
              </span>&nbsp;
              <span>predicted.</span>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTrend = () => {

    return (
      <div className={`path-detail__trend space-y-2 px-4 py-4 border-b border-white border-opacity-10`}>
        <div className="text-xs text-white text-opacity-50">
          Monthly Trend
        </div>

        { selectedPath.trend && isNaN(selectedPath.trend.average) && (
          <div className="text-sm text-white">
            There is no activity found between these two stops in the past month
          </div>
        )}

        { selectedPath.trend && !isNaN(selectedPath.trend.average) && (
          <div className="text-sm text-white">
            <span>The traffic between these two stops is on average</span>&nbsp;
            <span className="font-bold" style={{color: trafficToColour(selectedPath.trend.average)}}>
              { getTrafficStatusText(selectedPath.trend.average) }
            </span>&nbsp;
            <span>predicted in the past month.</span>
          </div>
        )}
    </div>
    )
  };

  return (
    render()
  );
};

export default PathDetail;
