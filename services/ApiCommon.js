import { Interceptor } from '../utils/AxiosInterceptor/interceptor';

export const ApiCommon = {
  getReq: (url, headers, params) => {
    return ApiCommon.fetchReq(url, 'GET', null, headers, params, null);
  },

  postReq: (url, data, headers, formData) => {
    return ApiCommon.fetchReq(url, 'POST', data, headers, null, formData);
  },

  putReq: (url, data, headers, formData) => {
    return ApiCommon.fetchReq(url, 'PUT', data, headers, null, formData);
  },

  delReq: (url, data, headers) => {
    return ApiCommon.fetchReq(url, 'DELETE', data, headers, null, null);
  },

  fetchReq: async (url, method, data, headers, params, formData) => {
    const intercepted = await Interceptor.request(url, method, data, headers, params,formData);

    if (intercepted?.fromCache) {
      console.log('📦 Returning cached response from Interceptor', intercepted);
      return intercepted;
    }

    // Update values from interceptor
    url = intercepted.url;
    method = intercepted.method;
    data = intercepted.data;
    headers = intercepted.headers || {};

    const isFormData = formData instanceof FormData;

    let conf = {
      method: method,
      headers: { ...headers },
    };
    if (isFormData) {
      // Remove Content-Type so browser can auto-set boundary for multipart
      delete conf.headers['Content-Type'];
      conf.body = formData;
    } else if (method !== 'GET' && data) {
      conf.headers['Content-Type'] = 'application/json';
      conf.body = JSON.stringify(data);
    }

     const response = await fetch(url, conf);

    if (!response.ok) {
      console.error('❌ Error in response:', response.statusText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  },
};
