class ResultModalController {
    bindEvents(onGoHome, onRestartWrong) {
        document.addEventListener('goHome',                    onGoHome);
        document.addEventListener('restartWithWrongQuestions', onRestartWrong);
    }

    show(resultJson) {
        const modal = document.createElement('result-modal');
        document.body.appendChild(modal);
        modal.setAttribute('config', JSON.stringify(resultJson));
    }
}