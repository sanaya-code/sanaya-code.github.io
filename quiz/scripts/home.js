document.addEventListener('DOMContentLoaded', function() {
    const loadQuizBtn = document.getElementById('loadQuizBtn');
    
    loadQuizBtn.addEventListener('click', function() {
        const fileInput = document.getElementById('quizFile');
        if (fileInput.files.length === 0) {
            alert('Please select a JSON file first');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const quizData = JSON.parse(e.target.result);
                // Store the quiz data in sessionStorage
                sessionStorage.setItem('customQuizData', JSON.stringify(quizData));
                window.location.href = 'quiz.html?source=custom';
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };
        
        reader.onerror = function() {
            alert('Error reading file');
        };
        
        reader.readAsText(file);
    });
});
