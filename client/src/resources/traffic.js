import axios from 'axios';
import moment from 'moment-timezone';

import { SERVER_URL } from '../config';

const connect = () => {
  return axios.create({
    baseUrl: SERVER_URL
  });
}

const traffic = {
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
  },
  fetchPaths: () => {
    return connect().get(`${SERVER_URL}/paths`);
  }
};

export default traffic;
