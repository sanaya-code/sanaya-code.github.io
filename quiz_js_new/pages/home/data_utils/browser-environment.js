class BrowserEnvironment {
    isLocal() {
        return (
            window.location.protocol === "file:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
        );
    }
}