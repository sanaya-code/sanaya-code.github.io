class ResultModalController {
    show(resultJson) {
        const modal = document.createElement('result-modal');
        document.body.appendChild(modal);
        modal.setAttribute('config', JSON.stringify(resultJson));
    }
}