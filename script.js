const categories = [
    {
        name: "RED ______",
        words: ["CARD", "DEVIL", "SHIRT", "ZONE"],
        difficulty: "green"
    },
    {
        name: "FIRST 4 LETTERS OF FACULTY LAST NAMES",
        words: ["BANG", "BARN", "JUST", "MASS"],
        difficulty: "purple"
    },
    {
        name: "THINGS FOUND UNDER A CLASSROOM TABLE",
        words: ["DRAWINGS", "GUM", "LEGS", "ZYN"],
        difficulty: "blue"
    },
    {
        name: "TYPES OF BOARDS",
        words: ["CHALK", "SMART", "VIEW", "WHITE"],
        difficulty: "yellow"
    }
];

let allWords = [];
let selectedWords = [];
let foundCategories = [];
let mistakes = 0;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initGame() {
    allWords = [];
    categories.forEach(cat => {
        allWords = allWords.concat(cat.words);
    });
    allWords = shuffle(allWords);
    selectedWords = [];
    foundCategories = [];
    mistakes = 0;
    renderGrid();
    updateMistakes();
    updateSubmitButton();
    document.getElementById('message').textContent = '';
    document.getElementById('found-categories').innerHTML = '';
}

function renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    allWords.forEach(word => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordDiv.textContent = word;
        wordDiv.onclick = () => toggleWord(word);
        grid.appendChild(wordDiv);
    });
}

function toggleWord(word) {
    const index = selectedWords.indexOf(word);
    if (index > -1) {
        selectedWords.splice(index, 1);
    } else if (selectedWords.length < 4) {
        selectedWords.push(word);
    }
    updateGridSelection();
    updateSubmitButton();
}

function updateGridSelection() {
    const wordElements = document.querySelectorAll('.word');
    wordElements.forEach(el => {
        if (selectedWords.includes(el.textContent)) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('submit');
    submitBtn.disabled = selectedWords.length !== 4;
}

function updateMistakes() {
    for (let i = 1; i <= 4; i++) {
        const mistakeEl = document.getElementById(`mistake${i}`);
        if (i <= mistakes) {
            mistakeEl.style.backgroundColor = '#dc3545';
        } else {
            mistakeEl.style.backgroundColor = '#ddd';
        }
    }
}

function addFoundCategory(category) {
    const foundCategoriesDiv = document.getElementById('found-categories');
    const categoryDiv = document.createElement('div');
    categoryDiv.className = `category-group ${category.difficulty}`;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'category-name';
    nameDiv.textContent = category.name;
    categoryDiv.appendChild(nameDiv);
    
    const wordsDiv = document.createElement('div');
    wordsDiv.className = 'category-words';
    category.words.forEach(word => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'category-word';
        wordSpan.textContent = word;
        wordsDiv.appendChild(wordSpan);
    });
    categoryDiv.appendChild(wordsDiv);
    
    foundCategoriesDiv.appendChild(categoryDiv);
}

function submitGuess() {
    const selected = [...selectedWords].sort();
    let found = false;
    let foundCategory = null;
    categories.forEach(cat => {
        if (!foundCategories.includes(cat.name)) {
            const catWords = cat.words.sort();
            if (JSON.stringify(selected) === JSON.stringify(catWords)) {
                found = true;
                foundCategory = cat;
                foundCategories.push(cat.name);
                // Remove words from grid
                const wordElements = document.querySelectorAll('.word');
                wordElements.forEach(el => {
                    if (selectedWords.includes(el.textContent)) {
                        el.remove();
                    }
                });
                // Remove from allWords
                allWords = allWords.filter(w => !selectedWords.includes(w));
                selectedWords = [];
                addFoundCategory(foundCategory);
                document.getElementById('message').textContent = `Correct! ${cat.name}`;
                if (foundCategories.length === 4) {
                    document.getElementById('message').textContent = 'Congratulations! You solved all categories! This connections game was created by Will Kanafani.';
                    // Change shuffle button to restart
                    const shuffleBtn = document.getElementById('shuffle');
                    shuffleBtn.textContent = 'Restart';
                    shuffleBtn.onclick = () => location.reload();
                    // Hide submit button
                    document.getElementById('submit').style.display = 'none';
                }
            }
        }
    });
    if (!found) {
        mistakes++;
        updateMistakes();
        
        // Calculate how many words belong to the same unsolved category
        let maxCommonWords = 0;
        categories.forEach(cat => {
            if (!foundCategories.includes(cat.name)) {
                let commonCount = 0;
                selectedWords.forEach(word => {
                    if (cat.words.includes(word)) {
                        commonCount++;
                    }
                });
                if (commonCount > maxCommonWords) {
                    maxCommonWords = commonCount;
                }
            }
        });
        
        let feedbackMessage = '';
        if (maxCommonWords === 0) {
            feedbackMessage = 'None of these words belong together.';
        } else {
            feedbackMessage = `${maxCommonWords} of these words belong to the same category.`;
        }
        
        // Flash incorrect
        const wordElements = document.querySelectorAll('.word');
        wordElements.forEach(el => {
            if (selectedWords.includes(el.textContent)) {
                el.classList.add('incorrect');
            }
        });
        setTimeout(() => {
            wordElements.forEach(el => {
                el.classList.remove('incorrect');
            });
        }, 1000);
        // Keep words selected instead of clearing them
        updateGridSelection();
        updateSubmitButton();
        if (mistakes >= 4) {
            document.getElementById('message').textContent = 'Game Over! Too many mistakes.';
            // Disable all remaining words
            const wordElements = document.querySelectorAll('.word');
            wordElements.forEach(el => {
                el.onclick = null;
            });
            // Clear selections
            selectedWords = [];
            updateGridSelection();
            // Hide submit button and change shuffle to restart
            document.getElementById('submit').style.display = 'none';
            const shuffleBtn = document.getElementById('shuffle');
            shuffleBtn.textContent = 'Restart';
            shuffleBtn.onclick = () => location.reload();
        } else {
            document.getElementById('message').textContent = feedbackMessage;
        }
    }
}

function shuffleRemaining() {
    allWords = shuffle(allWords);
    selectedWords = [];
    renderGrid();
    updateGridSelection();
    updateSubmitButton();
}

document.getElementById('submit').onclick = submitGuess;
document.getElementById('shuffle').onclick = shuffleRemaining;

// Initialize game
initGame();