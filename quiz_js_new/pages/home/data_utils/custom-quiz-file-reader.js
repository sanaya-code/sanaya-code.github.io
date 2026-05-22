class CustomQuizFileReader {
    async readJsonFile(file) {
        const text = await file.text();
        return JSON.parse(text);
    }
}