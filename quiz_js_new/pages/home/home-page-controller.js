class HomePageController {
    constructor(homePage, config) {
        this.homePage = homePage;
        this.config = config;

        this.storage = new HomeQuizStorage(config.storage);
        this.remoteLoader = new RemoteJsonLoader(config.remote);
        this.environment = new BrowserEnvironment();

        this.quizBrowserController = null;
        this.customQuizLoaderController = null;
    }

    async init() {
        this.initCustomQuizLoader();
        await this.initQuizBrowser();
    }

    initCustomQuizLoader() {
        const customQuizLoader = this.homePage.getCustomQuizLoaderElement();

        this.customQuizLoaderController = new CustomQuizLoaderController(customQuizLoader, {
            fileReader: new CustomQuizFileReader(),
            storage: this.storage,
            quizPageUrl: this.config.navigation.quizPageUrl,
            messages: this.config.messages
        });

        this.customQuizLoaderController.init();
    }

    async initQuizBrowser() {
        const quizBrowser = this.homePage.getQuizBrowserElement();

        this.quizBrowserController = new QuizBrowserController(quizBrowser, {
            environment: this.environment,
            remoteLoader: this.remoteLoader,
            storage: this.storage,
            config: this.config
        });

        await this.quizBrowserController.init();
    }
}