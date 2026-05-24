const ImageUrlResolver = {
    resolve(question, baseUrl) {
        if (!question.img_url)                   return question;
        if (question.img_url.startsWith('http')) return question;
        if (!baseUrl)                            return question;

        // Strip leading ./ if present
        const cleanImgUrl = question.img_url.replace(/^\.\//, '');
        return { ...question, img_url: baseUrl + cleanImgUrl };
    },
};