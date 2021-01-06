import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';

import { DATETIME_FORMAT, DATE_FORMAT, TIME_FORMAT, trafficToPreview } from '../common/Util';
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
      <div className="overflow-auto h-full">
        { renderHeader() }
        { renderDaily() }
        { renderTrend() }
      </div>
    )
  };

  const renderHeader = () => {
    return (
      <div className={`path-detail__section space-y-2 px-4 py-4 border-b border-white border-opacity-10 bg-blue-900`}>
        <button
          className="float-right w-10 h-10 -mx-2 p-2 bg-blue-900 text-white rounded-full hover-hover:hover:bg-blue-800"
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
              <span className="font-bold">
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
              <span className="font-bold">
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
            <span className="font-bold">
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
