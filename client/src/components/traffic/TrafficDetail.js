import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTraffic, selectNextTraffic, selectTraffic } from '../../actions/traffic';
import moment from 'moment-timezone';

const TrafficDetail = () => {
  const trafficList = useSelector(store => store.traffic.trafficList);
  const selectedTrafficIndex = useSelector(store => store.traffic.selectedTrafficIndex);
  const dispatch = useDispatch();

  const animationFrameRef = React.useRef();
  const previousTimeRef = React.useRef();
  const isPausedRef = React.useRef(false);

  /**
   * Animation Control Functions
   */
  useEffect(() => {
    dispatch(fetchTraffic()).then(() => {
      animationFrameRef.current = requestAnimationFrame(animateTraffic);
    });

    const handleKeyupListener = window.addEventListener('keyup', (event) => {
      if (event.code === 'KeyP') {
        toggleAnimateTraffic();
      }
    })

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('keyup', handleKeyupListener);
    }
  }, []);

  const animateTraffic = (timestamp) => {
    if (previousTimeRef.current != undefined) {
      const timeDiff = timestamp - previousTimeRef.current;

      if (timeDiff > 1000) {
        previousTimeRef.current = timestamp;
        dispatch(selectNextTraffic());

/*         setCurrentTrafficIndex(previousValue => {
          if (trafficList.length === 0) {
            return null;
          }

          if (Number.isInteger(previousValue)) {
            return (previousValue + 1) % trafficList.length;
          } else {
            return 0;
          }
        }); */
      }
    } else {
      previousTimeRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(animateTraffic);
  };

  const toggleAnimateTraffic = () => {
    isPausedRef.current = !isPausedRef.current;
    if (isPausedRef.current) {
      console.log('cancelAnimationFrame');
      cancelAnimationFrame(animationFrameRef.current);
    } else {
      animationFrameRef.current = requestAnimationFrame(animateTraffic);
    }
  };

  /**
   * Traffic Selection Functions
   */
  const dispatchSelectTraffic = (index) => {
    dispatch(selectTraffic(index));
  };

  /**
   * Render Helper Functions
   */
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
    return trafficList.map((traffic, index) => {
      return (
        <div key={traffic.timestamp} onClick={() => dispatchSelectTraffic(index)}>
          { moment(traffic.timestamp).format('YYYY/MM/DD HH:mm') }
        </div>
      );
    });
  };

  /**
   * Render Function
   */
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
