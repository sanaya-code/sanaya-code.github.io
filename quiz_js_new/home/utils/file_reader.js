const FileReaderUtil = {
    readJson(file, onLoad, onError) {
        const reader = new FileReader();
        reader.onload = (event) => this.parse(event, onLoad, onError);
        reader.onerror = () => onError(new Error('File read failed'));
        reader.readAsText(file);
    },

    parse(event, onLoad, onError) {
        try {
            const jsonData = JSON.parse(event.target.result);
            onLoad(jsonData);
        } catch (error) {
            onError(error);
        }
    },
};