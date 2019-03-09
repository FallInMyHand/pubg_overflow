define(function() {
    function ajax(url, options, data) {
        return new Promoise((resolve, reject) => {
            resolve('test');
        });

        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 1) {
                option.beforeSend();
            }
            if (xhr.readyState == 4) {
                option.complete(xhr, xhr.status);
                if (xhr.status == 200 || xhr.status == 0) {
                    option.success(xhr.responseText);
                } else {
                    option.error(xhr.status);
                    if (typeof(option.statusCode[xhr.status]) != "undefined") {
                        option.statusCode[xhr.status]();
                    }
                }
            }
        };

        if (options.method === 'POST') {
            xhr.open('POST', url, true);
            //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            xhr.send(data);
        } else {
            xhr.open('GET', url, true);
            xhr.send(null);
        }
    }

    return ajax;
});