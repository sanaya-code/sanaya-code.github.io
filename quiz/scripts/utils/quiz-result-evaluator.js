// mcq(mcq-question), true_false(true-false), multi_select(multi-select)
// fill_in_blank(fill-in-blank), multi_fill_in_blank(multi-fill-in-blank)
// options_fill_in_blank(options-fill-in-blank)
// table_fill_in_the_blank(table-fill-in-the-blank)
// table_image_fill_in_the_blank(table-image-fill-in-the-blank)
// table_image_fill_in_the_blank_2_col(table-image-fill-in-the-blank-2-col)
// number_line_fill_in_blank(number-line-fill-in-blank)
// short_answer(short-answer),
// matching(matching-select), matching_drag_drop(matching-drag-drop)
// matching_connection(matching-connection)
// matching_connection_image(matching-connection-image)
// ordering(ordering-drag-drop)
// ordering_horizontal(ordering-horizontal-drag-click)
// compare_quantities(compare-quantities)
// image_compare_quantities_tick(compare-image-objects)

// change following methods
// checkAnswerCorrectness
// formatUserAnswer
// formatCorrectAnswer


class QuizResultEvaluator {
    constructor(queList, userAnswers) {
        this.queList = queList;
        this.userAnswers = userAnswers;
    }

    getResultJson() {
        let totalPoints = 0;
        let earnedPoints = 0;
        let correctCount = 0;
        const questionsAnalysis = [];

        this.queList.forEach((question, index) => {
            totalPoints += question.points || 1;
            const userAnswer = this.userAnswers[index]?.answer;
            const isCorrect = this.checkAnswerCorrectness(question, userAnswer);

            if (isCorrect) {
                earnedPoints += question.points || 1;
                correctCount++;
            }

            questionsAnalysis.push({
                number: index + 1,
                question: question.question,
                userAnswer: this.formatUserAnswer(question, userAnswer),
                correctAnswer: this.formatCorrectAnswer(question),
                explanation: question.explanation || '',
                isCorrect
            });
        });

        return {
            summary: {
                scorePercentage: Math.round((earnedPoints / totalPoints) * 100),
                correctAnswers: correctCount,
                totalQuestions: this.queList.length
            },
            questions: questionsAnalysis
        };
    }

    getWrongAnswersOnly() {
        return this.queList.filter((question, index) => {
            const userAnswer = this.userAnswers[index]?.answer;
            return !this.checkAnswerCorrectness(question, userAnswer);
        });
    }

    checkAnswerCorrectness(question, userAnswer) {
        if (userAnswer == null) return false;

        const checkers = {
            mcq: () => userAnswer === question.correct_answer,
            true_false: () => userAnswer === `${question.correct_answer}`,
            fill_in_blank: () => this.checkTextAnswer(
                [question.correct_answer, ...(question.acceptable_answers || [])],
                userAnswer,
                question.case_sensitive
            ),
            multi_fill_in_blank: () => this.checkMultiFillInBlank(question, userAnswer),
            options_fill_in_blank: () => this.checkOptionsFillInBlank(question, userAnswer),
            table_fill_in_the_blank: () => this.checkTableFillInBlank(question, userAnswer),
            table_image_fill_in_the_blank: () => this.checkTableImageFillInBlank(question, userAnswer),
            table_image_fill_in_the_blank_2_col: () => this.checkTableImage2ColFillInBlank(question, userAnswer),
            number_line_fill_in_blank: () => this.checkNumberLineFillInBlank(question, userAnswer),
            multi_select: () => this.checkMultiSelect(question, userAnswer),
            ordering: () => this.arraysEqual(userAnswer, question.correct_order),
            ordering_horizontal: () => this.arraysEqual(userAnswer, question.correct_order),
            matching: () => this.checkMatching(question, userAnswer, false),
            matching_drag_drop: () => this.checkMatching(question, userAnswer, true),
            matching_connection: () => this.checkMatching(question, userAnswer, true),
            matching_connection_image: () => this.checkImagePropertyMatching(question, userAnswer),
            short_answer: () => this.checkTextAnswer(
                [question.correct_answer, ...(question.acceptable_variations || [])],
                userAnswer,
                false
            ),
            compare_quantities: () => userAnswer === question.correct_answer,
            image_compare_quantities_tick: () => userAnswer === question.correct_answer,
            skip: () => true,
            default: () => false
        };

        return (checkers[question.type] || checkers.default)();
    }

    formatUserAnswer(question, answer) {
        if (answer == null) return 'Not answered';

        const formatters = {
            mcq: () => this.formatMcqAnswer(question, answer),
            true_false: () => answer ? 'True' : 'False',
            multi_select: () => this.formatMultiSelectAnswer(question, answer),
            ordering: () => this.formatOrderingAnswer(question, answer),
            ordering_horizontal: () => answer.join(' → '),
            matching: () => this.formatMatchingAnswer(question, answer, false),
            matching_drag_drop: () => this.formatMatchingAnswer(question, answer, true),
            matching_connection: () => this.formatMatchingAnswer(question, answer, true),
            matching_connection_image: () => this.formatImagePropertyMatchingUserAnswer(question, answer),
            multi_fill_in_blank: () => answer.map(a => a || 'Not answered').join('; '),
            table_fill_in_the_blank: () => this.formatTableAnswer(answer),
            table_image_fill_in_the_blank: () => this.formatTableImageUserAnswer(question, answer),
            table_image_fill_in_the_blank_2_col: () => this.formatTableImage2ColUserAnswer(question, answer),
            number_line_fill_in_blank: () => this.formatNumberLineUserAnswer(question, answer),
            compare_quantities: () => answer,
            image_compare_quantities_tick: () => answer === 'left' ? 'Left side' : 'Right side',
            default: () => answer
        };

        return (formatters[question.type] || formatters.default)();
    }

    formatCorrectAnswer(question) {
        const formatters = {
            mcq: () => this.formatMcqCorrectAnswer(question),
            true_false: () => question.correct_answer ? 'True' : 'False',
            fill_in_blank: () => question.correct_answer,
            multi_fill_in_blank: () => this.formatMultiFillCorrectAnswer(question),
            options_fill_in_blank: () => question.options.map(opt => opt.correct_answer).join(', '),
            multi_select: () => question.options.filter(opt => opt.correct).map(opt => opt.text).join(', '),
            table_fill_in_the_blank: () => this.formatTableCorrectAnswer(question),
            table_image_fill_in_the_blank: () => this.formatTableImageCorrectAnswer(question),
            table_image_fill_in_the_blank_2_col: () => this.formatTableImage2ColCorrectAnswer(question),
            number_line_fill_in_blank: () => this.formatNumberLineCorrectAnswer(question),
            ordering: () => this.formatOrderingCorrectAnswer(question),
            ordering_horizontal: () => question.correct_order.join(' → '),
            matching: () => this.formatMatchingCorrectAnswer(question),
            matching_drag_drop: () => this.formatMatchingCorrectAnswer(question),
            matching_connection: () => this.formatMatchingCorrectAnswer(question),
            matching_connection_image: () => this.formatImagePropertyMatchingCorrectAnswer(question),
            short_answer: () => question.correct_answer,
            compare_quantities: () => question.correct_answer,
            image_compare_quantities_tick: () => question.correct_answer === 'left' ? 'Left side' : 'Right side',
            default: () => ''
        };

        return (formatters[question.type] || formatters.default)();
    }

    /* ========== HELPER METHODS ========== */

    // Checker Helpers
    checkTextAnswer(acceptableAnswers, userAnswer, caseSensitive) {
        return acceptableAnswers.some(ans =>
            caseSensitive
                ? ans === userAnswer
                : ans.toLowerCase() === userAnswer.toLowerCase()
        );
    }

    checkMultiFillInBlank(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length !== question.blanks.length) return false;
        return question.blanks.every((blank, idx) => 
            this.checkTextAnswer(
                [blank.correct_answer, ...(blank.acceptable_answers || [])],
                userAnswer[idx] || '',
                question.case_sensitive
            )
        );
    }

    checkOptionsFillInBlank(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        return question.options.every((opt, idx) => 
            this.checkTextAnswer(
                [opt.correct_answer, ...(opt.acceptable_answers || [])],
                userAnswer[idx] || '',
                question.case_sensitive
            )
        );
    }

    checkTableFillInBlank(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        
        let total = 0, correct = 0;
        question.data.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                if (cell.value === '____') {
                    total++;
                    const userVal = (userAnswer[rowIdx]?.[colIdx] || '').trim();
                    if (this.checkTextAnswer(
                        [cell.correct_answer, ...(cell.acceptable_answers || [])],
                        userVal,
                        question.case_sensitive
                    )) correct++;
                }
            });
        });

        if (total === 0) return false;
        if (question.scoring_method === 'exact') return correct === total;
        if (question.scoring_method === 'partial') return correct > 0;
        return false;
    }

    checkTableImageFillInBlank(question, userAnswer) {
        if (!Array.isArray(userAnswer) || !Array.isArray(question.rows)) return false;
        
        let total = 0;
        let correct = 0;

        question.rows.forEach((row, rowIndex) => {
            // Check field1 (count)
            if (row.field1?.acceptable_answers) {
                total++;
                const userVal = (userAnswer[rowIndex]?.[0] || '').trim();
                if (this.checkTextAnswer(
                    row.field1.acceptable_answers,
                    userVal,
                    question.validation?.case_sensitive === true
                )) correct++;
            }

            // Check field2 (word)
            if (row.field2?.acceptable_answers) {
                total++;
                const userVal = (userAnswer[rowIndex]?.[1] || '').trim();
                if (this.checkTextAnswer(
                    row.field2.acceptable_answers,
                    userVal,
                    question.validation?.case_sensitive === true
                )) correct++;
            }
        });

        if (total === 0) return false;
        if (question.validation?.scoring_method === 'exact') return correct === total;
        if (question.validation?.scoring_method === 'partial') return correct > 0;
        return false;
    }

    checkMultiSelect(question, userAnswer) {
        const correctOptions = question.options
            .filter(opt => opt.correct)
            .map(opt => opt.id);
        return this.arraysEqual(userAnswer.sort(), correctOptions.sort());
    }

    checkMatching(question, userAnswer, requireExactOrder) {
        const correctAnswers = question.pairs.map(pair => pair.right);
        if (requireExactOrder) {
            return userAnswer.length === correctAnswers.length && 
                   userAnswer.every((val, idx) => val === correctAnswers[idx]);
        }
        return this.arraysEqual(userAnswer.sort(), correctAnswers.sort());
    }

    checkImagePropertyMatching(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        
        // Verify all required connections are present
        const requiredConnections = question.rows.filter(row => row.property).length;
        if (userAnswer.length !== requiredConnections) return false;
    
        // Convert user response to map
        const userMap = new Map();
        userAnswer.forEach(conn => {
            userMap.set(conn.image_index, conn.property);
        });
    
        // Check each image's connection
        let correct = 0;
        
        question.rows.forEach(row => {
            if (row.property && userMap.has(row.image_index)) {
                const userProperty = userMap.get(row.image_index);
                if (this.checkTextAnswer(
                    [row.property, ...(row.acceptable_properties || [])],
                    userProperty,
                    question.validation?.case_sensitive === true
                )) {
                    correct++;
                }
            }
        });
    
        if (question.validation?.scoring_method === 'exact') {
            return correct === requiredConnections;
        }
        if (question.validation?.scoring_method === 'partial') {
            return correct > 0;
        }
        return false;
    }

    checkNumberLineFillInBlank(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        
        let total = question.sequence.filter(item => item.value === '____').length;
        let correct = 0;
    
        userAnswer.forEach((response, idx) => {
            const acceptable = question.sequence.filter(item => item.value === '____')[idx]?.acceptable_answers || [];
            if (this.checkTextAnswer(acceptable, response.trim(), question.validation?.case_sensitive === true)) {
                correct++;
            }
        });
    
        if (total === 0) return false;
    
        if (question.validation?.scoring_method === 'exact') return correct === total;
        if (question.validation?.scoring_method === 'partial') return correct > 0;
        return false;
    }    

    // Formatter Helpers
    formatMcqAnswer(question, answer) {
        const option = question.options.find(opt => opt.id === answer);
        return option ? option.text : answer;
    }

    formatMultiSelectAnswer(question, answer) {
        return answer.map(id => {
            const opt = question.options.find(opt => opt.id === id);
            return opt ? opt.text : id;
        }).join(', ');
    }

    formatOrderingAnswer(question, answer) {
        return answer.map(id => {
            const item = question.items.find(it => it.id === id);
            return item ? item.text : id;
        }).join(' → ');
    }

    formatMatchingAnswer(question, answer, isIndexed) {
        return answer.map((right, idx) => {
            const left = isIndexed ? question.pairs[idx]?.left : question.pairs[idx]?.left || '?';
            const correctRight = question.pairs[idx]?.right;
            const isCorrect = right === correctRight;
            return `${left} → ${right || 'None'} ${isCorrect ? '✓' : '✗'}`;
        }).join('; ');
    }

    formatTableAnswer(answer) {
        const values = [];
        answer.forEach(row => {
            row.forEach(val => {
                if (val != null && val !== '') values.push(val.trim());
            });
        });
        return values.length ? values.join(', ') : 'Not answered';
    }

    formatImagePropertyMatchingUserAnswer(question, answer) {
        if (!Array.isArray(answer)) return 'Not answered';
        
        const connections = [];
        answer.forEach(conn => {
            const image = question.rows.find(r => r.image_index === conn.image_index);
            if (image) {
                connections.push(
                    `Image ${conn.image_index} → ${conn.property || 'Not connected'}`
                );
            }
        });
        
        return connections.length ? connections.join('; ') : 'No connections made';
    }

    formatTableImageUserAnswer(question, answer) {
        if (!Array.isArray(answer)) return 'Not answered';
        
        const responses = [];
        question.rows.forEach((row, index) => {
            const rowAnswer = answer[index] || ['', ''];
            responses.push(`Row ${index + 1}: ${rowAnswer[0] || 'Not answered'} (count), ${rowAnswer[1] || 'Not answered'} (word)`);
        });
        
        return responses.join('; ');
    }
    
    formatTableImage2ColUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return 'Not answered';
        
        return question.rows.map((row, index) => {
            const val = userAnswer[index] || '';
            return `Row ${index + 1}: ${val || 'Not answered'}`;
        }).join('; ');
    }

    formatNumberLineUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return 'Not answered';
        return userAnswer.map((ans, idx) => `Blank ${idx + 1}: ${ans || 'Not answered'}`).join('; ');
    }
    

    formatMcqCorrectAnswer(question) {
        const option = question.options.find(opt => opt.id === question.correct_answer);
        return option ? option.text : question.correct_answer;
    }

    formatMultiFillCorrectAnswer(question) {
        return question.blanks.map(blank => {
            const allAnswers = [blank.correct_answer, ...(blank.acceptable_answers || [])];
            return `(${[...new Set(allAnswers)].join(' / ')})`;
        }).join('; ');
    }

    formatTableCorrectAnswer(question) {
        const values = [];
        question.data.forEach(row => {
            row.forEach(cell => {
                if (cell.value === '____') values.push(cell.correct_answer);
            });
        });
        return values.join(', ');
    }

    formatTableImageCorrectAnswer(question) {
        if (!Array.isArray(question.rows)) return '';
        
        const answers = [];
        question.rows.forEach(row => {
            const countAnswers = row.field1?.acceptable_answers?.join(' or ') || '?';
            const wordAnswers = row.field2?.acceptable_answers?.join(' or ') || '?';
            answers.push(`${countAnswers} (count), ${wordAnswers} (word)`);
        });
        
        return answers.join('; ');
    }

    formatOrderingCorrectAnswer(question) {
        return question.correct_order.map(id => {
            const item = question.items.find(item => item.id === id);
            return item ? item.text : id;
        }).join(' → ');
    }

    formatMatchingCorrectAnswer(question) {
        return question.pairs.map(pair => `${pair.left} → ${pair.right}`).join('; ');
    }

    formatImagePropertyMatchingCorrectAnswer(question) {
        if (!Array.isArray(question.rows)) return '';
        
        const correctAnswers = [];
        question.rows.forEach(row => {
            if (row.property) {
                const allAnswers = [row.property, ...(row.acceptable_properties || [])];
                correctAnswers.push(
                    `Image ${row.image_index} → ${[...new Set(allAnswers)].join(' or ')}`
                );
            }
        });
        
        return correctAnswers.join('; ');
    }
    
    formatTableImage2ColCorrectAnswer(question) {
        if (!Array.isArray(question.rows)) return '';
        
        return question.rows.map((row, index) => {
            const countAnswers = row.field1?.acceptable_answers?.join(' or ') || '?';
            return `Row ${index + 1}: ${countAnswers}`;
        }).join('; ');
    }

    formatNumberLineCorrectAnswer(question) {
        return question.sequence
            .filter(item => item.value === '____')
            .map((blank, idx) => {
                return `Blank ${idx + 1}: ${blank.acceptable_answers.join(' or ')}`;
            })
            .join('; ');
    }

    checkTableImage2ColFillInBlank(question, userAnswer) {
        if (!Array.isArray(userAnswer) || !Array.isArray(question.rows)) return false;
        
        let total = 0;
        let correct = 0;
    
        question.rows.forEach((row, rowIndex) => {
            if (row.field1?.acceptable_answers) {
                total++;
                const userVal = (userAnswer[rowIndex] || '').trim();
                if (this.checkTextAnswer(
                    row.field1.acceptable_answers,
                    userVal,
                    question.validation?.case_sensitive === true
                )) correct++;
            }
        });
    
        if (total === 0) return false;
        if (question.validation?.scoring_method === 'exact') return correct === total;
        if (question.validation?.scoring_method === 'partial') return correct > 0;
        return false;
    }    

    // Utility Methods
    arraysEqual(a, b) {
        if (a === b) return true;
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        return a.every((val, idx) => val === b[idx]);
    }
}