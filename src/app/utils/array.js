define(function() {
    return {
        asyncForEach
    };

    async function asyncForEach(ar, cb) {
        let result = [];
        for (let i = 0; i < ar.length; i++) {
            result.push(await cb(ar[i]));
        }

        return result;
    }
});