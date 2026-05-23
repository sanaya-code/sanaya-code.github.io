const BrowserEnvironment = {
    isLocal() {
        return (
            location.protocol === 'file:' ||
            location.hostname === 'localhost' ||
            location.hostname === '127.0.0.1'
        );
    },
};
