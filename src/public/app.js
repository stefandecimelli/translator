// Get DOM elements
const sourceText = document.getElementById('sourceText');
const translateBtn = document.getElementById('translateBtn');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const translationResults = document.getElementById('translationResults');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const addLanguageBtn = document.getElementById('addLanguageBtn');
const languageContainer = document.getElementById('languageContainer');
const themeToggle = document.getElementById('themeToggle');

// Language options HTML
const languageOptions = `
    <option value="">-- Select Language --</option>
    <option value="es">Spanish</option>
    <option value="fr">French</option>
    <option value="de">German</option>
    <option value="it">Italian</option>
    <option value="pt">Portuguese</option>
    <option value="ru">Russian</option>
    <option value="ja">Japanese</option>
    <option value="ko">Korean</option>
    <option value="zh">Chinese (Simplified)</option>
    <option value="zh-TW">Chinese (Traditional)</option>
    <option value="ar">Arabic</option>
    <option value="hi">Hindi</option>
    <option value="nl">Dutch</option>
    <option value="pl">Polish</option>
    <option value="tr">Turkish</option>
    <option value="sv">Swedish</option>
    <option value="da">Danish</option>
    <option value="fi">Finnish</option>
    <option value="no">Norwegian</option>
    <option value="cs">Czech</option>
    <option value="el">Greek</option>
    <option value="he">Hebrew</option>
    <option value="th">Thai</option>
    <option value="vi">Vietnamese</option>
    <option value="id">Indonesian</option>
    <option value="ms">Malay</option>
    <option value="uk">Ukrainian</option>
    <option value="ro">Romanian</option>
    <option value="hu">Hungarian</option>
    <option value="bg">Bulgarian</option>
    <option value="hr">Croatian</option>
    <option value="sk">Slovak</option>
    <option value="sl">Slovenian</option>
    <option value="lt">Lithuanian</option>
    <option value="lv">Latvian</option>
    <option value="et">Estonian</option>
`;

let languageCount = 0;
const MAX_LANGUAGES = 4;

// Initialize with one language selector
function init() {
    addLanguageSelector();
}

// Add a new language selector
function addLanguageSelector() {
    if (languageCount >= MAX_LANGUAGES) {
        return;
    }

    languageCount++;
    const wrapper = document.createElement('div');
    wrapper.className = 'language-select-wrapper';
    wrapper.dataset.langId = languageCount;

    const label = document.createElement('label');
    label.htmlFor = `lang${languageCount}`;
    
    const labelText = document.createElement('span');
    labelText.textContent = `Language ${languageCount}:`;
    label.appendChild(labelText);

    // Add remove button if not the first language
    if (languageCount > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-language-btn';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Remove this language';
        removeBtn.onclick = () => removeLanguageSelector(languageCount);
        label.appendChild(removeBtn);
    }

    const select = document.createElement('select');
    select.id = `lang${languageCount}`;
    select.className = 'language-select';
    select.innerHTML = languageOptions;

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    languageContainer.appendChild(wrapper);

    updateAddButton();
}

// Remove a language selector
function removeLanguageSelector(langId) {
    const wrapper = languageContainer.querySelector(`[data-lang-id="${langId}"]`);
    if (wrapper) {
        wrapper.remove();
        languageCount--;
        renumberLanguages();
        updateAddButton();
    }
}

// Renumber remaining language selectors
function renumberLanguages() {
    const wrappers = languageContainer.querySelectorAll('.language-select-wrapper');
    languageCount = 0;
    
    wrappers.forEach((wrapper, index) => {
        languageCount++;
        wrapper.dataset.langId = languageCount;
        
        const label = wrapper.querySelector('label');
        const labelText = label.querySelector('span');
        labelText.textContent = `Language ${languageCount}:`;
        
        const select = wrapper.querySelector('select');
        select.id = `lang${languageCount}`;
        label.htmlFor = `lang${languageCount}`;
        
        // Update remove button visibility
        const removeBtn = label.querySelector('.remove-language-btn');
        if (languageCount === 1 && removeBtn) {
            removeBtn.remove();
        } else if (languageCount > 1 && !removeBtn) {
            const newRemoveBtn = document.createElement('button');
            newRemoveBtn.type = 'button';
            newRemoveBtn.className = 'remove-language-btn';
            newRemoveBtn.innerHTML = '×';
            newRemoveBtn.title = 'Remove this language';
            newRemoveBtn.onclick = () => removeLanguageSelector(languageCount);
            label.appendChild(newRemoveBtn);
        }
    });
}

// Update add button state
function updateAddButton() {
    if (languageCount >= MAX_LANGUAGES) {
        addLanguageBtn.disabled = true;
        addLanguageBtn.title = 'Maximum 4 languages reached';
    } else {
        addLanguageBtn.disabled = false;
        addLanguageBtn.title = 'Add another language';
    }
}

// Add language button click handler
addLanguageBtn.addEventListener('click', addLanguageSelector);

// Handle translation
translateBtn.addEventListener('click', async () => {
    // Clear previous results and errors
    errorDiv.style.display = 'none';
    resultsDiv.style.display = 'none';
    translationResults.innerHTML = '';

    // Get input text
    const text = sourceText.value.trim();
    if (!text) {
        showError('Please enter text to translate');
        return;
    }

    // Get selected languages
    const selects = languageContainer.querySelectorAll('.language-select');
    const targetLanguages = Array.from(selects)
        .map(select => select.value)
        .filter(lang => lang !== '');

    if (targetLanguages.length === 0) {
        showError('Please select at least one target language');
        return;
    }

    // Check for duplicate languages
    const uniqueLanguages = new Set(targetLanguages);
    if (uniqueLanguages.size !== targetLanguages.length) {
        showError('Please select different languages for each option');
        return;
    }

    // Show loading state
    setLoading(true);

    try {
        // Make API request
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                targetLanguages: targetLanguages
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Translation failed');
        }

        // Display results
        displayResults(data.translations);
    } catch (error) {
        showError(error.message || 'An error occurred during translation');
    } finally {
        setLoading(false);
    }
});

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Set loading state
function setLoading(isLoading) {
    translateBtn.disabled = isLoading;
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Display translation results
function displayResults(translations) {
    translationResults.innerHTML = '';
    
    translations.forEach(translation => {
        const card = document.createElement('div');
        card.className = 'translation-card';
        
        const title = document.createElement('h4');
        title.textContent = translation.languageName;
        
        const text = document.createElement('p');
        text.textContent = translation.text;
        
        card.appendChild(title);
        card.appendChild(text);
        translationResults.appendChild(card);
    });
    
    resultsDiv.style.display = 'block';
    
    // Smooth scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Enable Enter key to translate (with Ctrl/Cmd modifier)
sourceText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        translateBtn.click();
    }
});

// Clear results when text is cleared
sourceText.addEventListener('input', () => {
    if (sourceText.value.trim() === '') {
        resultsDiv.style.display = 'none';
        errorDiv.style.display = 'none';
    }
});

// Theme toggle functionality
function initTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
}

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
});

// Initialize the app
initTheme();
init();

// Made with Bob
