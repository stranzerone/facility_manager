// ApiCommon.js
import { Interceptor } from '../../utils/AxiosInterceptor/interceptor';

export const ApiCommon = {
  getReq: (url, headers,params) => {
    return ApiCommon.fetchReq(url, 'GET', null, headers,params);
  },
  postReq: (url, data, headers) => {
    return ApiCommon.fetchReq(url, 'POST', data, headers);
  },
  putReq: (url, data, headers) => {
    return ApiCommon.fetchReq(url, 'PUT', data, headers);
  },
  delReq: (url, data, headers) => {
    return ApiCommon.fetchReq(url, 'DELETE', data, headers);
  },

fetchReq: async (url, method, data, headers, params) => {
  // 🔄 Interceptor before request
  const intercepted = await Interceptor.request(url, method, data, headers, params);

  // ✅ Return mock data immediately if offline and cached data is available
  if (intercepted?.fromCache) {
    console.log('📦 Returning cached response from Interceptor');
    return intercepted;
  }

  // Update values from interceptor
  url = intercepted.url;
  method = intercepted.method;
  data = intercepted.data; // Fix: was incorrectly using intercepted.params
  headers = intercepted.headers;

  let conf = {
    method: method,
    headers: headers || {
      'Content-Type': 'application/json',
    },
  };

  if (method !== 'GET' && data) {
    conf.body =
      conf.headers && conf.headers['Content-Type'] === 'application/json'
        ? JSON.stringify(data)
        : data;
  }

  const response = await fetch(url, conf);

  if (!response.ok) {
    console.error('❌ Error in response:', response.statusText);
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const responseData = await response.json();
  return responseData;
}
}