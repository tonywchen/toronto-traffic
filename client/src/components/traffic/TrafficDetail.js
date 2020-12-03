import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTraffic } from '../../actions/traffic';
import moment from 'moment-timezone';

const TrafficDetail = () => {
  const trafficList = useSelector(store => store.traffic.trafficList);
  const selectedTrafficIndex = useSelector(store => store.traffic.selectedTrafficIndex);
  const dispatch = useDispatch();

  const dispatchSelectTraffic = (index) => {
    dispatch(selectTraffic(index));
  };

  const renderTrafficDetail = () => {
    if (selectedTrafficIndex === null) {
      return <h4>None!</h4>;
    } else {
      return (
        <h4>
          { moment(trafficList[selectedTrafficIndex].timestamp).format('YYYY/MM/DD HH:mm') }
        </h4>
      );
    }
  };

  const renderTrafficSelector = (trafficList) => {
    console.log(`trafficList.length: ${trafficList.length}`);
    return trafficList.map((traffic, index) => {
      return (
        <div key={traffic.timestamp} onClick={() => dispatchSelectTraffic(index)}>
          { moment(traffic.timestamp).format('YYYY/MM/DD HH:mm') }
        </div>
      );
    });
  };

  return (
    <div className="traffic-detail">
      { renderTrafficDetail() }
      <div className="traffic-selector">
        { renderTrafficSelector(trafficList) }
      </div>
    </div>
  );
};

export default TrafficDetail;
