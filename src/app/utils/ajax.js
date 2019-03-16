define(function() {
    function ajax(url, options, data) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 1) {
                    // option.beforeSend();
                }
                if (xhr.readyState == 4) {
                    // option.complete(xhr, xhr.status);
                    if (xhr.status == 200 || xhr.status == 0) {
                        //option.success(xhr.responseText);
                        resolve(xhr.responseText);
                    } else {
                        /*
                        option.error(xhr.status);
                        if (typeof(option.statusCode[xhr.status]) != "undefined") {
                            option.statusCode[xhr.status]();
                        }
                        */
                       reject(xhr.status);
                    }
                }
            };

            if (options.method === 'POST') {
                xhr.open('POST', url, true);
                //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                xhr.send(data);
            } else {
                xhr.open('GET', url, true);
                if (options.headers) {
                    for (let k in options.headers) {
                        xhr.setRequestHeader(k, options[k]);
                    }
                }
                xhr.send(null);
            }
        });
    }

    return ajax;
});