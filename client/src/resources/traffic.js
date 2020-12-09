import axios from 'axios';
import moment from 'moment-timezone';

const SERVER_URL = 'http://192.168.86.88:3000';

const connect = () => {
  return axios.create({
    baseUrl: SERVER_URL
  });
}

export default {
  fetchTraffic: (from) => {
    const adjustedFrom = moment(from).startOf('day').valueOf();
    const adjustedTo = moment(from).endOf('day').valueOf();
    const params = {
      from: adjustedFrom,
      to: adjustedTo
    };

    return connect().get(`${SERVER_URL}/traffic`, {
      params
    });
  }
}
