const UIBundleFactory = {
    create() {
        return new UIBundle(
            new QuestionWrapperController(),
            new NavigationPanelController(),
            new IndexPanelController(),
            new ResultModalController()
        );
    },
};