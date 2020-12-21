import axios from 'axios';

import { SERVER_URL } from '../config';

const connect = () => {
  return axios.create({
    baseUrl: SERVER_URL
  });
}

const routes = {
  fetchSubroutes: () => {
    return connect().get(`${SERVER_URL}/subroutes`);
  }
};

export default routes;
