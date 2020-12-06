import axios from 'axios';
import moment from 'moment-timezone';

const SERVER_URL = 'http://192.168.86.88:3000';

const connect = () => {
  return axios.create({
    baseUrl: SERVER_URL
  });
}

export default {
  fetchTraffic: (from, duration = 60) => {
    /* console.log(`resources.fetchTraffic: ${from}`);
    const params = {};
    if (from) {
      params.from = from;
      params.to = from + duration * 60 * 1000;
    }; */

    const adjustedFrom = moment(from).startOf('day').valueOf();
    const adjustedTo = moment(from).endOf('day').valueOf();
    const params = {
      from: adjustedFrom,
      to: adjustedTo
    };

    return connect().get(`${SERVER_URL}/traffic`, {
      params
    });
    // grab traffic from the past hour
  }
}
