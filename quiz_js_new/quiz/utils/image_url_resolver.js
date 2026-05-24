const ImageUrlResolver = {
    resolve(question, baseUrl) {
        if (!question.img_url)                   return question;
        if (question.img_url.startsWith('http')) return question;
        if (!baseUrl)                            return question;
        return { ...question, img_url: baseUrl + question.img_url };
    },
};