export const ApiCommon = {
    getReq : (url, headers) => {
        return ApiCommon.fetchReq(url, 'GET', null, headers)
    },
    postReq : (url, data, headers) => {
       
        return ApiCommon.fetchReq(url, 'POST', data, headers)
    },
    putReq : (url, data, headers) => {
        return ApiCommon.fetchReq(url, 'PUT', data, headers)
    },
    delReq : (url, data, headers) => {
        return ApiCommon.fetchReq(url, 'DELETE', data, headers)
    },


    
    fetchReq : async(url, method, data, headers) => {
        let conf = {
            method: method,
            headers: headers ? headers : {
                "Content-Type": "application/json",
            },
        }
        if (method !== 'GET' && data) {
            conf.body = conf.headers && conf.headers['Content-Type']==="application/json" ? JSON.stringify(data) : data
        }

        // add auth params in headers / url
        const response = await fetch(url, conf);
        if (!response.ok) {
            // If the response status is not OK, throw an error
            console.error('Error in response:', response.statusText);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

       const responseData = await response.json();
       console.log("Response Data:", responseData);
        return responseData;
    }
}



