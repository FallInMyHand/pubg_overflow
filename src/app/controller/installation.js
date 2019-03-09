define(function() {
    return {
        install
    };

    function install() {
        overwolf.io.readFileContents('/src/manifest.json', 'UTF8', (result) => { // /src/config/defaults/config.json
            console.log(result);
        });
    }
});