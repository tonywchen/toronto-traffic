import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';

import { DATETIME_FORMAT, DATE_FORMAT, trafficToPreview } from '../common/Util';
import { ReactComponent as CloseIcon } from '../icons/close.svg';

import { resetPathDetail } from '../../actions/path';

// TODO: Make Preview common or create a more generic bar chart component?
import Preview from '../dashboard/timeline/Preview';

const getTrafficStatusText = (average) => {
  if (average === 0) {
    return 'as fast as';
  }

  const numberText = Math.abs(average).toFixed(0);
  const descriptor = (average > 0)? 'slower than' : 'faster than';

  return `${numberText} seconds ${descriptor}`;
};

const PathDetail = () => {
  const selectedPath = useSelector(store => store.path.selectedPath);

  const dispatch = useDispatch();

  const render = () => {
    const hiddenClassName = (selectedPath)? '' : 'hidden';

    return (
      <div className={`path-detail ${hiddenClassName} absolute z-40 top-4 right-4 bottom-60 w-1/4 max-w-xs bg-black bg-opacity-75 rounded overflow-hidden`}>
        { selectedPath && selectedPath.loading && renderEmptyState() }
        { selectedPath && !selectedPath.loading && renderDetail() }
      </div>
    );
  };

  const minimize = () => {
    dispatch(resetPathDetail());
  };

  const renderEmptyState = () => {
    return (
      <div>Loading...</div>
    );
  };

  const renderDetail = () => {
    return (
      <>
        { renderHeader() }
        { renderCurrentView() }
        { renderDaily() }
        { renderTrend() }
      </>
    )
  };

  const renderHeader = () => {
    return (
      <div className={`path-detail__section space-y-2 px-4 py-4 border-b border-white border-opacity-10 bg-blue-900`}>
        <button
          className="float-right w-10 h-10 p-2 bg-blue-900 text-white rounded-full hover-hover:hover:bg-blue-800"
          onClick={minimize}>
          <CloseIcon />
        </button>
        <div>
          <div className="text-xs text-white text-opacity-50">From</div>
          <div className="flex-grow text-sm font-bold text-white">{ selectedPath.fromStop && selectedPath.fromStop.title }</div>
        </div>
        <div>
          <div className="text-xs text-white text-opacity-50">To</div>
          <div className="flex-grow text-sm font-bold text-white">{ selectedPath.toStop && selectedPath.toStop.title }</div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    return (
      <div className={`path-detail__section space-y-1 px-4 py-4 border-b border-white border-opacity-10`}>
        { selectedPath.currentView && !isNaN(selectedPath.currentView.average) && (
          <>
            <div className="text-xs text-white  text-opacity-50">
              { moment(selectedPath.currentView.selectedTime).format(DATETIME_FORMAT) }
            </div>
            <div className="text-sm text-white">
              <span>The traffic is</span>&nbsp;
              <span className="font-bold">
                { getTrafficStatusText(selectedPath.currentView.average) }
              </span>&nbsp;
              <span>predicted</span>
            </div>
          </>
        )}
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

    const dailyPreview = trafficToPreview(selectedPath.daily);

    return (
      <div className={`path-detail__daily space-y-1 px-4 py-4 border-b border-white border-opacity-10`}>
        <div className="text-xs text-white text-opacity-50">
          { moment(selectedPath.daily[0].timestamp).format(DATE_FORMAT) }
        </div>

        { (dailyAverage === null) && (
          <div className="text-sm text-white">
            There is no activity found between these two stops today
          </div>
        )}

        { (dailyAverage !== null) && (
          <div className="text-sm text-white">
            <span>The traffic is on average</span>&nbsp;
            <span className="font-bold">
              { getTrafficStatusText(dailyAverage) }
            </span>&nbsp;
            <span>predicted on this day</span>
          </div>
        )}
      </div>
    );
  };

  const renderTrend = () => {

    return (
      <div className={`path-detail__trend space-y-1 px-4 py-4 border-b border-white border-opacity-10`}>
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
            <span className="font-bold">
              { getTrafficStatusText(selectedPath.trend.average) }
            </span>&nbsp;
            <span>predicted in the past month</span>
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
