// DOM Elements
const modelSelect = document.getElementById('model-select');
const translationBox = document.getElementById('translation-box');
const promptBox = document.getElementById('prompt-box');
const fandomBox = document.getElementById('fandom-box');
const notesBox = document.getElementById('notes-box');
const outputBox = document.getElementById('output-box');
const translateBtn = document.getElementById('translate-btn');
const stopBtn = document.getElementById('stop-btn'); // Added stop button
const clearBtn = document.getElementById('clear-btn');
const saveAllBtn = document.getElementById('save-all-btn');
const statusMessage = document.getElementById('status-message');
const pricingDisplay = document.getElementById('pricing-display');
const copyOutputBtn = document.getElementById('copy-output-btn');
const saveButtons = document.querySelectorAll('.save-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const temperatureSlider = document.getElementById('temperature-slider');
const temperatureValueDisplay = document.getElementById('temperature-value');
const sourceLanguageInput = document.getElementById('source-language');
const targetLanguageInput = document.getElementById('target-language'); // Although disabled, might be useful
const streamToggle = document.getElementById('stream-toggle');
const clearInputBtn = document.getElementById('clear-input-btn');
const clearOutputAreaBtn = document.getElementById('clear-output-area-btn'); // New button for clearing output area
const generateSummaryBtn = document.getElementById('generate-summary-btn');
const summaryArea = document.querySelector('.summary-area');
const summaryBox = document.getElementById('summary-box');
const copySummaryBtn = document.getElementById('copy-summary-btn');
const useSummaryBtn = document.getElementById('use-summary-btn');
// const clearOutputBtn = document.getElementById('clear-output-btn'); // This is unused, replaced by clearOutputAreaBtn

// Word count display elements - to be initialized in DOMContentLoaded
let inputWordCountEl = null;
let outputWordCountEl = null;

// --- Constants ---
const CONSTANTS = {
    STATUS_TYPES: {
        INFO: 'info',
        SUCCESS: 'success',
        ERROR: 'error',
        PROCESSING: 'processing',
        WARNING: 'warning'
    },
    DEFAULT_VALUES: {
        FANDOM_CONTEXT: 'None provided.',
        NOTES: 'None provided.',
        SUMMARY: 'None provided.',
        SOURCE_LANGUAGE: 'Japanese',
        TEMPERATURE: 0.7,
        STREAM_ENABLED: false // Default for stream toggle if not in localStorage
    },
    TIMEOUTS: {
        AUTO_SAVE_DEBOUNCE: 1500,
        STATUS_MESSAGE_DEFAULT: 5000,
        STATUS_LOADED_SESSION: 3000
    },
    LOCAL_STORAGE_KEYS: {
        TRANSLATION_CONTENT: 'translationContent',
        PROMPT_CONTENT: 'promptContent',
        NOTES_CONTENT: 'notesContent',
        FANDOM_CONTENT: 'fandomContent',
        OUTPUT_CONTENT: 'outputContent',
        STREAM_ENABLED: 'streamEnabled',
        SELECTED_MODEL: 'selectedModel',
        SOURCE_LANGUAGE: 'sourceLanguage',
        TEMPERATURE: 'temperature',
        GROQ_API_KEY: 'groqApiKey',
        DEEPSEEK_API_KEY: 'deepseekApiKey'
        // DARK_MODE: 'darkMode' // Not actively used for setting, but was a key
    },
    API_KEY_PLACEHOLDERS: {
        GROQ: 'YOUR_GROQ_API_KEY',
        DEEPSEEK: 'YOUR_DEEPSEEK_API_KEY'
    },
    MODELS: {
        GROQ_PREFIX: 'grok-',
        DEEPSEEK_CHAT: 'deepseek-chat'
    },
    UI: {
        DEFAULT_STATUS_MESSAGE: 'Ready'
    }
};

// API Key (Replace with secure handling in production)
// These will be populated from localStorage by loadFromLocalStorage
let groqApiKey = ''; 
let deepseekApiKey = '';

// --- Default Prompt Template ---
const defaultPromptTemplate = `You are an expert fanfiction translator. Translate the following text from {source_language} to {target_language}.

**Fandom Context:**
{fandom_context}

**Previous Chapter Summary:**
{previous_chapter_summary}

**Translator Notes/Instructions:**
{notes}

**Source Text:**
"""
{source_text}
"""

**Translation Guidelines:**
- Maintain the original tone, style, character voices, and nuances.
- Adapt cultural references appropriately for an English-speaking audience while preserving the original meaning.
- Ensure accuracy and fluency in the target language ({target_language}).
- Pay attention to any specific instructions mentioned in the Translator Notes.

**Begin Translation:**`;

// Model Pricing Data (Example - Update with actual Groq pricing if available)
const modelPricing = {
    // Groq Prices (per million tokens, based on image)
    'grok-3':                   { input: '$3.00', completion: '$15.00', context: '131k' },
    'grok-3-latest':            { input: '$3.00', completion: '$15.00', context: '131k' },
    'grok-3-fast':              { input: '$5.00', completion: '$25.00', context: '131k' },
    'grok-3-fast-latest':       { input: '$5.00', completion: '$25.00', context: '131k' },
    'grok-3-mini':              { input: '$0.30', completion: '$0.50', context: '131k' },
    'grok-3-mini-latest':       { input: '$0.30', completion: '$0.50', context: '131k' },
    'grok-3-mini-fast':         { input: '$0.60', completion: '$4.00', context: '131k' },
    'grok-3-mini-fast-latest':  { input: '$0.60', completion: '$4.00', context: '131k' },
    // DeepSeek (Placeholder - update if you have real data)
    'deepseek-chat':            { input: '$0.27', completion: '$1.10', context: '64k' }, // Standard Price (Cache Miss)
};

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Load saved state first
        loadFromLocalStorage();
        
        // Check if keys are present
        checkApiKey();
        
        // Update pricing display
        updatePricingDisplay();

        // Add event listeners for buttons with null checks
        if (translateBtn) translateBtn.addEventListener('click', handleTranslation);
        if (clearBtn) clearBtn.addEventListener('click', clearAllFields);
        if (saveAllBtn) saveAllBtn.addEventListener('click', saveAllAsZip);
        if (modelSelect) {
            modelSelect.addEventListener('change', () => {
                updatePricingDisplay();
                saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.SELECTED_MODEL, modelSelect.value);
                checkApiKey();
            });
        }
        
        // Initialize word counters with null checks
        const sourceCounter = document.getElementById('source-counter');
        const outputCounter = document.getElementById('output-counter');
        
        if (sourceCounter && translationBox) {
            updateWordCount(translationBox, sourceCounter);
            translationBox.addEventListener('input', () => updateWordCount(translationBox, sourceCounter));
        }
        
        if (outputCounter && outputBox) {
            updateWordCount(outputBox, outputCounter);
            outputBox.addEventListener('input', () => updateWordCount(outputBox, outputCounter));
            outputBox.addEventListener('paste', () => {
                setTimeout(() => updateWordCount(outputBox, outputCounter), 100);
            });
        }
        
        // Add event listeners for save buttons with null checks
        document.querySelectorAll('.save-btn').forEach(button => {
            if (button) {
                button.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    if (targetId) {
                        const filename = targetId.replace('-box', '') + '.txt';
                        saveTextAsFile(targetId, filename);
                        updateStatus(`Saved ${filename}`, CONSTANTS.STATUS_TYPES.SUCCESS);
                    }
                });
            }
        });
        
        // Add event listener for copy button with null check
        if (copyOutputBtn) {
            copyOutputBtn.addEventListener('click', function() {
                const textToCopy = outputBox.innerText || outputBox.textContent;
                copyToClipboard(textToCopy);
                updateStatus('Copied to clipboard!', CONSTANTS.STATUS_TYPES.SUCCESS);
            });
        }
        
        // Add event listeners for summary generation with null checks
        if (generateSummaryBtn) generateSummaryBtn.addEventListener('click', handleSummaryGeneration);
        if (copySummaryBtn) copySummaryBtn.addEventListener('click', () => copyToClipboard(summaryBox.value, 'Summary copied!'));
        if (useSummaryBtn) {
            useSummaryBtn.addEventListener('click', () => {
                appendSummaryToTextarea(notesBox, summaryBox.value, CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT, 'Notes');
            });
        }

        // Event listener for the new clear output area button
        if (clearOutputAreaBtn) {
            clearOutputAreaBtn.addEventListener('click', () => {
                clearSpecificField('output-box', CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT, 'output-word-count');
            });
        }
    } catch (error) {
        console.error('Error initializing event listeners:', error);
        updateStatus('Error initializing application. Check console for details.', CONSTANTS.STATUS_TYPES.ERROR);
    }
});

// ... other event listeners ...

// Add null checks before adding event listeners to prevent errors
if (promptBox) promptBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, promptBox.value));
if (fandomBox) fandomBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT, fandomBox.value));
if (notesBox) notesBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT, notesBox.value));
// No need for outputBox listener, saved after translation completes or when cleared

if (translationBox) translationBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT, translationBox.value));

if (sourceLanguageInput) sourceLanguageInput.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.SOURCE_LANGUAGE, sourceLanguageInput.value));
if (temperatureSlider) temperatureSlider.addEventListener('input', handleTemperatureChange);
if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
if (streamToggle) streamToggle.addEventListener('change', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.STREAM_ENABLED, streamToggle.checked));

if (clearInputBtn) clearInputBtn.addEventListener('click', () => clearSpecificField('translation-box', CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT, 'input-word-count'));
if (clearOutputAreaBtn) clearOutputAreaBtn.addEventListener('click', () => clearSpecificField('output-box', CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT, 'output-word-count'));

// Add event listener for the stop button
if (stopBtn) stopBtn.addEventListener('click', stopTranslation);

// --- Functions ---

// Word Counter Functionality
function updateWordCount(textElement, countElement) {
    if (!textElement || !countElement) return;
    
    let text = '';
    if (textElement.id === 'output-box') {
        // For rich text editor/contenteditable
        text = textElement.innerText || textElement.textContent || '';
    } else {
        // For regular textarea
        text = textElement.value || '';
    }
    
    // Count words and characters
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    // Update the counter display
    countElement.textContent = `${words.toLocaleString()} words | ${chars.toLocaleString()} chars`;
    
    // Add visual indicator for different word count ranges
    countElement.className = 'word-counter';
    if (words > 500) countElement.classList.add('words-500-plus');
    if (words > 1000) countElement.classList.add('words-1000-plus');
    if (words > 3000) countElement.classList.add('words-3000-plus');
    
    // Return the counts for potential other uses
    return { words, chars };
}

function checkApiKey() {
    let selectedModelValue = '';
    if (modelSelect) {
        selectedModelValue = modelSelect.value;
    }

    let keyForSelectedModelMissing = false;
    let missingKeyMessage = '';

    if (selectedModelValue.startsWith(CONSTANTS.MODELS.GROQ_PREFIX)) {
        if (!groqApiKey || groqApiKey === CONSTANTS.API_KEY_PLACEHOLDERS.GROQ) {
            keyForSelectedModelMissing = true;
            missingKeyMessage = 'Groq API key is not set or is a placeholder. Translation with Groq models will fail.';
        }
    } else if (selectedModelValue === CONSTANTS.MODELS.DEEPSEEK_CHAT) {
        if (!deepseekApiKey || deepseekApiKey === CONSTANTS.API_KEY_PLACEHOLDERS.DEEPSEEK) {
            keyForSelectedModelMissing = true;
            missingKeyMessage = 'DeepSeek API key is not set or is a placeholder. Translation with DeepSeek model will fail.';
        }
    } else if (selectedModelValue) { // A model is selected but doesn't match known types that have key checks
        // This case implies a new model might have been added without updating key logic, or it needs no key.
        // For now, assume it's okay if not Groq or DeepSeek for this specific check.
        // updateStatus(`API key check not configured for model: ${selectedModelValue}`, CONSTANTS.STATUS_TYPES.INFO);
    }

    if (keyForSelectedModelMissing) {
        updateStatus(missingKeyMessage, CONSTANTS.STATUS_TYPES.ERROR, 0); // 0 timeout = persistent error
        if (translateBtn && !translationInProgress) {
            translateBtn.disabled = true;
            translateBtn.title = missingKeyMessage; // Add tooltip explaining why it's disabled
        }
    } else {
        // If we passed the specific key check for the selected model, or no key check applies to it,
        // ensure the translate button is enabled (if not already translating).
        // Also, clear any persistent error status potentially set by this function.
        if (translateBtn && !translationInProgress) {
            translateBtn.disabled = false;
            translateBtn.title = 'Translate the source text'; // Reset tooltip
        }
        // Clear a persistent error if it was specifically set due to API key issues from this function.
        // This is a bit simplistic; a more robust way would be to only clear if the current status message *is* the missingKeyMessage.
        // For now, if keys are okay for the selected model, we assume any API key error status can be cleared to 'Ready' or a general info.
        if (statusMessage && statusMessage.textContent.includes('API key is not set')) {
             updateStatus(CONSTANTS.UI.DEFAULT_STATUS_MESSAGE, CONSTANTS.STATUS_TYPES.INFO);
        }
    }

    // General checks for any unset keys (these provide informational status updates)
    if (!groqApiKey) {
        updateStatus('Groq API key is not set. Configure in settings if using Groq models.', CONSTANTS.STATUS_TYPES.INFO, CONSTANTS.TIMEOUTS.STATUS_MESSAGE_DEFAULT + 2000);
    } else if (groqApiKey === CONSTANTS.API_KEY_PLACEHOLDERS.GROQ) {
        updateStatus('Groq API key is a placeholder. Please update it in settings.', CONSTANTS.STATUS_TYPES.WARNING, CONSTANTS.TIMEOUTS.STATUS_MESSAGE_DEFAULT + 2000);
    }

    if (!deepseekApiKey) {
        updateStatus('DeepSeek API key is not set. Configure in settings if using DeepSeek.', CONSTANTS.STATUS_TYPES.INFO, CONSTANTS.TIMEOUTS.STATUS_MESSAGE_DEFAULT + 2000);
    } else if (deepseekApiKey === CONSTANTS.API_KEY_PLACEHOLDERS.DEEPSEEK) {
        updateStatus('DeepSeek API key is a placeholder. Please update it in settings.', CONSTANTS.STATUS_TYPES.WARNING, CONSTANTS.TIMEOUTS.STATUS_MESSAGE_DEFAULT + 2000);
    }
}

// Helper function to append summary to a textarea
function appendSummaryToTextarea(textareaElement, summaryText, storageKey, fieldName) {
    if (!textareaElement) {
        console.error(`${fieldName} textarea element not found.`);
        // updateStatus(`Cannot find ${fieldName} input area.`, CONSTANTS.STATUS_TYPES.ERROR);
        return false;
    }
    if (!summaryText || !summaryText.trim()) {
        updateStatus(`No summary text available to add to ${fieldName}.`, CONSTANTS.STATUS_TYPES.INFO);
        return false;
    }

    const currentText = textareaElement.value.trim();
    const summaryHeader = "--- Previous Chapter Summary ---";
    
    // Normalize summaryText to ensure it doesn't already start with the header we are about to add
    let cleanSummaryText = summaryText.trim();
    if (cleanSummaryText.startsWith(summaryHeader)) {
        cleanSummaryText = cleanSummaryText.substring(summaryHeader.length).trim();
    }

    let newTextValue;
    const summaryBlock = `\n\n${summaryHeader}\n${cleanSummaryText}`;

    if (currentText) {
        // If current text already contains a summary block, replace the old summary content.
        const headerIndex = currentText.lastIndexOf(summaryHeader);
        if (headerIndex !== -1) {
            // Assumes the summary is the last major block starting with this header.
            newTextValue = currentText.substring(0, headerIndex).trim() + summaryBlock;
        } else {
            newTextValue = currentText + summaryBlock;
        }
    } else {
        // If textarea is empty, just add the new summary block (trim leading newlines)
        newTextValue = summaryBlock.trimStart(); 
    }
    
    textareaElement.value = newTextValue;

    if (storageKey) {
        saveToLocalStorage(storageKey, textareaElement.value);
    }
    updateStatus(`Summary added/updated in ${fieldName}.`, CONSTANTS.STATUS_TYPES.SUCCESS);
    return true;
}

// Update pricing display based on selected model
function updatePricingDisplay() {
    const selectedModelValue = modelSelect.value;
    const pricing = modelPricing[selectedModelValue] || { input: 'N/A', completion: 'N/A', context: 'N/A' };
    if (pricing) {
        pricingDisplay.innerHTML =
            `<strong>Input:</strong> ${pricing.input} / 1M tok | 
            <strong>Output:</strong> ${pricing.completion} / 1M tok | 
            <strong>Context:</strong> ${pricing.context}`; // Adjusted labels slightly
    } else {
        pricingDisplay.textContent = 'Pricing details not available for this model.';
    }
}

// Handle Temperature Slider Change
function handleTemperatureChange() {
    const tempValue = temperatureSlider.value;
    // Update the temperature display
    if (temperatureValueDisplay) {
        temperatureValueDisplay.textContent = tempValue;
    }
    saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.TEMPERATURE, tempValue);
}

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    saveToLocalStorage('darkMode', isDarkMode);
    // Update icon
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    darkModeToggle.title = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
}

// Variables for managing translation state
let translationInProgress = false;
let abortController = null;

// Stop translation function
function stopTranslation() {
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
    updateTranslationState(false);
    updateStatus('Translation stopped.', CONSTANTS.STATUS_TYPES.INFO);
}

// Update UI based on translation state
function updateTranslationState(isTranslating) {
    translationInProgress = isTranslating;
    
    // Update button states
    translateBtn.disabled = isTranslating;
    if (isTranslating) {
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
        stopBtn.style.display = 'inline-block';
    } else {
        translateBtn.innerHTML = '<i class="fas fa-magic"></i> Translate';
        stopBtn.style.display = 'none';
    }
    
    // Optionally disable other controls during translation
    modelSelect.disabled = isTranslating;
    temperatureSlider.disabled = isTranslating;
    streamToggle.disabled = isTranslating;
}

// Helper function to construct the detailed fallback prompt
function constructFallbackPrompt(sourceLanguage, targetLanguage, fandomContext, currentSummary, notes, textToTranslate) {
    let finalPrompt = `You are an expert fanfiction translator performing translation from ${sourceLanguage} to ${targetLanguage}.`;
    let userPromptSections = [
        `Faithfully translate the following text from ${sourceLanguage} into ${targetLanguage}, ensuring the result reads naturally and authentically in the target language while preserving the spirit of the original.`
    ];

    if (fandomContext && fandomContext !== CONSTANTS.DEFAULT_VALUES.FANDOM_CONTEXT) {
        userPromptSections.push(`--- Fandom Context ---\n${fandomContext}`);
    }

    if (currentSummary && currentSummary !== CONSTANTS.DEFAULT_VALUES.SUMMARY) {
        userPromptSections.push(`--- Previous Chapter Summary ---\n${currentSummary}`);
    }

    if (notes && notes !== CONSTANTS.DEFAULT_VALUES.NOTES) {
        userPromptSections.push(`--- Translator Notes & Special Instructions ---\n${notes}`);
    }

    userPromptSections.push(`--- Source Text (${sourceLanguage}) ---\n${textToTranslate}`);
    userPromptSections.push(`--- Translation Guidelines ---
- Preserve the original tone, narrative style, character voices, and subtle nuances.
- Adapt cultural references thoughtfully to ensure clarity and resonance for an ${targetLanguage}-speaking audience, without distorting the original intent.
- Ensure the translation is both accurate and fluent in ${targetLanguage}.
- Carefully follow any specific instructions provided in the Translator Notes.
- Begin the translation now.`);

    finalPrompt += '\n\n' + userPromptSections.join('\n\n');
    return finalPrompt;
}

// Main Translation Handler
async function handleTranslation() {
    // If translation is already in progress, don't start another
    if (translationInProgress) {
        return;
    }

    const textToTranslate = translationBox.value.trim();
    const userPromptTemplate = promptBox.value.trim();
    const fandomContext = fandomBox.value.trim() || CONSTANTS.DEFAULT_VALUES.FANDOM_CONTEXT;
    const notes = notesBox.value.trim() || CONSTANTS.DEFAULT_VALUES.NOTES;
    const selectedModel = modelSelect.value;
    const sourceLanguage = sourceLanguageInput.value.trim() || CONSTANTS.DEFAULT_VALUES.SOURCE_LANGUAGE;
    // targetLanguageInput is a span element, not an input, so use textContent instead of value
    const targetLanguage = targetLanguageInput ? (targetLanguageInput.textContent || 'English') : 'English';
    const temperature = parseFloat(temperatureSlider.value);
    const enableStream = streamToggle.checked;
    const currentSummary = summaryBox ? summaryBox.value.trim() || CONSTANTS.DEFAULT_VALUES.SUMMARY : CONSTANTS.DEFAULT_VALUES.SUMMARY;

    if (!textToTranslate) {
        updateStatus('Please enter text to translate.', CONSTANTS.STATUS_TYPES.WARNING);
        return;
    }

    // Process prompt template variables
    let processedPrompt = userPromptTemplate
        .replace(/{source_language}/g, sourceLanguage)
        .replace(/{target_language}/g, targetLanguage)
        .replace(/{fandom_context}/g, fandomContext)
        .replace(/{notes}/g, notes)
        .replace(/{source_text}/g, textToTranslate)
        .replace(/{previous_chapter_summary}/g, currentSummary);
    
    // If using a custom prompt template without {source_text}, or if it was removed, construct a fallback prompt.
    if (!userPromptTemplate.includes('{source_text}') || !processedPrompt.includes(textToTranslate)) {
        console.warn('Fallback prompt constructed because {source_text} was missing or removed from processed user template.');
        processedPrompt = constructFallbackPrompt(sourceLanguage, targetLanguage, fandomContext, currentSummary, notes, textToTranslate);
    }

    updateStatus('Translating...', CONSTANTS.STATUS_TYPES.PROCESSING);
    // Update UI state
    updateTranslationState(true);
    // Clear previous output
    if (outputBox) {
        if (typeof outputBox.innerHTML !== 'undefined') {
            outputBox.innerHTML = '';
        } else if (typeof outputBox.value !== 'undefined') {
            outputBox.value = '';
        }
    }

    // Create a new AbortController for this translation
    abortController = new AbortController();
    
    try {
        // If streaming, we need to set up a callback to handle chunks of text
        let streamCallback = null;
        if (enableStream) {
            streamCallback = (text) => {
                if (outputBox) {
                    // Format the text and append it to the output box
                    const formattedText = formatMarkdown(text);
                    // Check if we have innerHTML (for contenteditable divs) or value (for textareas)
                    if (typeof outputBox.innerHTML !== 'undefined') {
                        // For contenteditable elements, accumulate HTML content
                        outputBox.innerHTML += formattedText;
                    } else if (typeof outputBox.value !== 'undefined') {
                        // For textareas, accumulate plain text
                        outputBox.value += text;
                    }
                    
                    // Auto-scroll to the bottom as content is added
                    if (outputBox.scrollHeight) {
                        outputBox.scrollTop = outputBox.scrollHeight;
                    }
                }
            };
        }
        
        const translation = await getTranslation(processedPrompt, selectedModel, temperature, enableStream, streamCallback, abortController.signal);
        
        if (!enableStream) { // If not streaming, update now with the complete translation
            if (outputBox) {
                const formattedTranslation = formatMarkdown(translation);
                if (typeof outputBox.innerHTML !== 'undefined') {
                    outputBox.innerHTML = formattedTranslation;
                } else if (typeof outputBox.value !== 'undefined') {
                    outputBox.value = translation;
                }
            }
        }
        
        updateStatus('Translation complete!', CONSTANTS.STATUS_TYPES.SUCCESS);
        
        // Auto-save output to localStorage
        if (outputBox) {
            const outputContent = typeof outputBox.innerHTML !== 'undefined' ? outputBox.innerHTML : outputBox.value;
            saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT, outputContent);
        }
        
        // Enable summary button after successful translation
        if (generateSummaryBtn) generateSummaryBtn.disabled = false;
        
        // Update word count
        const outputCounter = document.getElementById('output-word-count');
        if (outputCounter && outputBox) {
            updateWordCount(outputBox, outputCounter);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            updateStatus('Translation stopped.', CONSTANTS.STATUS_TYPES.INFO);
        } else {
            console.error('Translation Error:', error);
            updateStatus('Error: ' + error.message, CONSTANTS.STATUS_TYPES.ERROR);
        }
    } finally {
        // Reset UI state when done or on error
        updateTranslationState(false);
        abortController = null;
    }
}

// Summarization Function
async function handleSummaryGeneration() {
    const translatedText = outputBox.innerText; // Get plain text from the contenteditable div
    const model = modelSelect.value; // Use the same model for consistency, or choose another
    const temperature = 0.5; // Lower temperature for more focused summary

    if (!translatedText.trim()) {
        updateStatus('Nothing to summarize.', CONSTANTS.STATUS_TYPES.INFO);
        return;
    }

    updateStatus('Generating summary...', CONSTANTS.STATUS_TYPES.PROCESSING);
    summaryBox.value = ''; // Clear previous summary
    summaryArea.style.display = 'block'; // Show the summary area
    generateSummaryBtn.disabled = true; // Disable button during generation

    const systemPrompt = "You are an expert summarizer. Create a concise summary of the provided text, focusing on key plot points, character interactions, and context useful for translating the next chapter or section.";
    const userPrompt = `Please summarize the following text:

${translatedText}`;

    try {
        // Combine system prompt and user prompt into a single prompt string
        const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
        // Fix parameter order: prompt, model, temperature, stream, updateCallback
        const summary = await getTranslation(combinedPrompt, model, temperature, false);
        summaryBox.value = summary.trim();
        updateStatus('Summary generated.', CONSTANTS.STATUS_TYPES.SUCCESS);
    } catch (error) {
        console.error('Summary error:', error);
        summaryBox.value = `Error generating summary: ${error.message}`;
        updateStatus('Error generating summary: ' + error.message, CONSTANTS.STATUS_TYPES.ERROR);
    } finally {
        generateSummaryBtn.disabled = false; // Re-enable button
    }
}

// Helper function to get API configuration based on the model
function getApiConfig(model, prompt, temperature, stream) {
    let apiUrl = '';
    let apiKey = '';
    let requestBody = {};

    if (model.startsWith(CONSTANTS.MODELS.GROQ_PREFIX)) {
        apiUrl = 'https://api.x.ai/v1/chat/completions';
        apiKey = groqApiKey;
        requestBody = {
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: temperature,
            stream: stream,
            max_tokens: 131072 
        };
    } else if (model === CONSTANTS.MODELS.DEEPSEEK_CHAT) {
        apiUrl = 'https://api.deepseek.com/chat/completions';
        apiKey = deepseekApiKey;
        requestBody = {
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: temperature,
            stream: stream
        };
    } else {
        throw new Error(`Unsupported model selected: ${model}`);
    }
    return { apiUrl, apiKey, requestBody };
}

// Helper function to process streaming data from the API
async function processStream(response, updateCallback) {
    if (!response.body) {
        throw new Error('ReadableStream not supported in this browser or response body is null.');
    }
    if (typeof updateCallback !== 'function') {
        throw new Error('updateCallback must be a function to process stream data.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let completeTranslation = '';

    console.log('Starting to process streaming response');

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            console.log('Stream completed');
            break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop() || ''; 
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
            
            if (trimmedLine.startsWith('data:')) {
                try {
                    const jsonStr = trimmedLine.substring(5).trim();
                    if (jsonStr && jsonStr !== '[DONE]') {
                        const chunk = JSON.parse(jsonStr);
                        let textChunk = '';
                        if (chunk.choices && chunk.choices[0]) {
                            const choice = chunk.choices[0];
                            if (choice.delta && choice.delta.content) {
                                textChunk = choice.delta.content;
                            } else if (choice.text) {
                                textChunk = choice.text;
                            } else if (choice.message && choice.message.content) {
                                textChunk = choice.message.content;
                            }
                        }
                        if (textChunk) {
                            completeTranslation += textChunk;
                            updateCallback(textChunk);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing stream chunk:', e, 'Line:', trimmedLine);
                }
            }
        }
    }
    
    // Final decode for any remaining buffer content (should ideally be empty if stream ends cleanly)
    if (buffer) {
        const remainingText = decoder.decode(); // No arguments needed for final decode
        if (remainingText) {
            completeTranslation += remainingText;
            updateCallback(remainingText);
        }
    }
    return completeTranslation;
}

async function getTranslation(prompt, model, temperature, stream = false, updateCallback = null, signal = null) {
    // Basic check for prompt and model
    if (!prompt || !model) {
        throw new Error('Missing required parameters for getTranslation (prompt or model).');
    }

    const { apiUrl, apiKey, requestBody } = getApiConfig(model, prompt, temperature, stream);

    if (!apiKey || 
        (model.startsWith(CONSTANTS.MODELS.GROQ_PREFIX) && apiKey === CONSTANTS.API_KEY_PLACEHOLDERS.GROQ) || 
        (model === CONSTANTS.MODELS.DEEPSEEK_CHAT && apiKey === CONSTANTS.API_KEY_PLACEHOLDERS.DEEPSEEK)) {
        const specificKeyError = model.startsWith(CONSTANTS.MODELS.GROQ_PREFIX) ? "Groq API key not set." : "DeepSeek API key not set.";
        throw new Error(`API key is not set properly. ${specificKeyError} Please check the API key configuration.`);
    }

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };

    console.log(`Sending ${stream ? 'streaming' : 'non-streaming'} request to ${apiUrl} for model ${model}. Body hidden for brevity if large.`);
    // To log the full body for debugging, uncomment the next line and comment out the one above.
    // console.log(`Sending ${stream ? 'streaming' : 'non-streaming'} request to ${apiUrl} for model ${model} with body:`, requestBody);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            signal: signal
        });

        if (!response.ok) {
            // Use handleApiError to process and throw a formatted error
            await handleApiError(response, model); // Pass model for context in error message
            // handleApiError should throw, so this next line might not be reached,
            // but as a fallback if it were to return an error message instead:
            // throw new Error('API request failed after processing with handleApiError.'); 
        }

        if (stream && updateCallback) {
            return await processStream(response, updateCallback);
        } else {
            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message && typeof data.choices[0].message.content !== 'undefined') {
                return data.choices[0].message.content;
            } else {
                console.error("Invalid API response format for non-streaming:", data);
                throw new Error('Invalid API response format for non-streaming translation.');
            }
        }
    } catch (error) {
        console.error(`Error in getTranslation for model ${model}:`, error.message);
        if (error.name === 'AbortError') {
            throw error; // Re-throw AbortError to be handled specifically by the caller
        }
        // Re-throw other errors, potentially already formatted by handleApiError or new ones from this function
        throw new Error(`Translation attempt failed for model ${model}. Reason: ${error.message}`);
    }
}

// Helper function to handle API errors
async function handleApiError(response, modelName = 'selected') { // Added modelName for context
    let errorMsg = `Error from ${modelName} API: ${response.status} - ${response.statusText}`;
    try {
        const errorData = await response.json();
        const apiSpecificError = errorData.error?.message || errorData.message || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
        errorMsg += ` - Details: ${apiSpecificError}`;
    } catch (e) {
        // Could not parse error response as JSON, or other error during parsing
        errorMsg += ` - Could not parse error details from API response. Response text might be available in network tab.`;
        console.error('Failed to parse API error JSON:', e);
        // Optionally, try to get raw text if JSON parsing fails and it hasn't been read yet
        try {
            const rawText = await response.text(); // Be cautious if response body was already read
            console.error('Raw API error response:', rawText);
            errorMsg += ` Raw response snippet: ${rawText.substring(0, 100)}`;
        } catch (textErr) {
            console.error('Could not get raw text from error response:', textErr);
        }
    }
    throw new Error(errorMsg); // Throw the constructed error message
}

// Clear specific field, its local storage, and optionally update its word count
function clearSpecificField(elementId, storageKey, wordCountElementId = null) {
    const element = document.getElementById(elementId);
    if (element) {
        if (elementId === CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT.replace('Content', '-box')) { // e.g., 'output-box'
            element.innerHTML = '';
        } else {
            element.value = '';
        }
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
        updateStatus(`${elementId.replace('-box','').replace('-',' ')} cleared.`, CONSTANTS.STATUS_TYPES.INFO);

        if (wordCountElementId) {
            const wordCountElement = document.getElementById(wordCountElementId);
            const sourceElementForCount = document.getElementById(elementId); // Re-fetch to be safe, or pass element
            if (wordCountElement && sourceElementForCount) {
                updateWordCount(sourceElementForCount, wordCountElement);
            }
        }
    } else {
        console.warn(`Element with ID ${elementId} not found for clearing.`);
    }
}

// Clear Prompt, Fandom, Notes fields
function clearAllFields() {
    promptBox.value = '';
    fandomBox.value = '';
    notesBox.value = '';

    // Reset relevant local storage
    localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT);
    localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT);
    localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT);

    // For now, keep model, temp, source lang, theme
    promptBox.value = defaultPromptTemplate; // Reset prompt to default
    saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, defaultPromptTemplate);

    updateStatus('Prompt, Fandom, and Notes fields cleared.', CONSTANTS.STATUS_TYPES.INFO);
}

// Save content of a specific textarea or rich text editor to a .txt file
function saveTextAsFile(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID ${elementId} not found for saving.`);
        updateStatus(`Error: Could not find element ${elementId}`, CONSTANTS.STATUS_TYPES.ERROR);
        return;
    }
    
    // Get text content - handle both textareas and rich text editors
    let text;
    if (elementId === 'output-box') {
        // For rich text editor - get plain text
        text = element.innerText || element.textContent;
    } else {
        // For regular textareas
        text = element.value;
    }
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up
}

// Save all files as a ZIP file
async function saveAllAsZip() {
    // Check if JSZip is loaded
    if (typeof JSZip === 'undefined') {
        updateStatus('Error: JSZip library not loaded. Cannot save as ZIP.', CONSTANTS.STATUS_TYPES.ERROR);
        console.error('JSZip is not defined. Make sure the library is included in index.html.');
        return;
    }

    try {
        const zip = new JSZip();
        zip.file("source_text.txt", translationBox.value);
        zip.file("prompt_template.txt", promptBox.value);
        zip.file("fandom_context.txt", fandomBox.value);
        zip.file("notes.txt", notesBox.value);
        zip.file("translated_output.txt", outputBox.value);
        // Include settings
        const settings = {
            model: modelSelect.value,
            source_language: sourceLanguageInput.value,
            temperature: temperatureSlider.value,
            timestamp: new Date().toISOString()
        };
        zip.file("settings.json", JSON.stringify(settings, null, 2));

        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `fanfic_translation_${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                updateStatus('All files and settings saved as ZIP.', CONSTANTS.STATUS_TYPES.SUCCESS);
            })
            .catch(err => {
                console.error("Error generating ZIP blob:", err);
                updateStatus('Error generating ZIP file.', CONSTANTS.STATUS_TYPES.ERROR);
            });
    } catch (err) {
        console.error("Error creating ZIP object:", err);
        updateStatus('Error preparing ZIP file.', CONSTANTS.STATUS_TYPES.ERROR);
    }
}

// Copy text from output box to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Success feedback is handled by the caller
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        updateStatus('Failed to copy text', CONSTANTS.STATUS_TYPES.ERROR);
    });
}

// Save data to local storage
function saveToLocalStorage(key, value) {
    const valueToStore = typeof value === 'boolean' ? String(value) : value;
    try {
        localStorage.setItem(key, valueToStore);
    } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
        updateStatus('Warning: Could not save data to local storage. It might be full.', CONSTANTS.STATUS_TYPES.WARNING);
    }
}

function loadFromLocalStorage() {
    document.body.classList.add('dark-mode');

    let loadedGroqKey = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.GROQ_API_KEY) || ''; 
    let loadedDeepSeekKey = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.DEEPSEEK_API_KEY) || '';
    groqApiKey = loadedGroqKey;
    deepseekApiKey = loadedDeepSeekKey;

    // Modal Elements
    const apiSettingsModal = document.getElementById('api-settings-modal');
    const apiSettingsBtn = document.getElementById('api-settings-btn');
    const closeApiModalBtn = document.getElementById('close-api-modal');
    const saveApiKeysBtn = document.getElementById('save-api-keys');
    const groqApiKeyInput = document.getElementById('groq-api-key');
    const deepseekApiKeyInput = document.getElementById('deepseek-api-key');
    const headerApiBtn = document.getElementById('api-keys-btn');

    function initApiModalInternal() {
        if (groqApiKeyInput) groqApiKeyInput.value = groqApiKey;
        if (deepseekApiKeyInput) deepseekApiKeyInput.value = deepseekApiKey;
        
        const openModalButtons = [];
        if (apiSettingsBtn) openModalButtons.push(apiSettingsBtn);
        if (headerApiBtn) openModalButtons.push(headerApiBtn);

        openModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (apiSettingsModal) apiSettingsModal.style.display = 'flex';
            });
        });
        
        if (closeApiModalBtn) closeApiModalBtn.addEventListener('click', () => {
            if (apiSettingsModal) apiSettingsModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (apiSettingsModal && e.target === apiSettingsModal) {
                apiSettingsModal.style.display = 'none';
            }
        });
        
        if (saveApiKeysBtn) saveApiKeysBtn.addEventListener('click', () => {
            let currentGroqKey = groqApiKeyInput ? groqApiKeyInput.value.trim() : '';
            let currentDeepSeekKey = deepseekApiKeyInput ? deepseekApiKeyInput.value.trim() : '';
            
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.GROQ_API_KEY, currentGroqKey);
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.DEEPSEEK_API_KEY, currentDeepSeekKey);
            groqApiKey = currentGroqKey;
            deepseekApiKey = currentDeepSeekKey;
            
            if (apiSettingsModal) apiSettingsModal.style.display = 'none';
            updateStatus('API keys saved successfully', CONSTANTS.STATUS_TYPES.SUCCESS);
            checkApiKey(); 
        });
    }

    if (apiSettingsModal) { // Only initialize if the modal itself exists
        initApiModalInternal();
    }

    if (groqApiKeyInput) groqApiKeyInput.value = groqApiKey;
    if (deepseekApiKeyInput) deepseekApiKeyInput.value = deepseekApiKey;

    if (translationBox) translationBox.value = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT) || '';
    if (promptBox) promptBox.value = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT) || defaultPromptTemplate;
    if (notesBox) notesBox.value = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT) || '';
    if (fandomBox) fandomBox.value = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT) || '';
    
    const savedOutput = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT) || '';
    if (outputBox) outputBox.innerHTML = savedOutput || '';

    const savedStream = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.STREAM_ENABLED);
    if (streamToggle) streamToggle.checked = savedStream === 'true';

    const savedModel = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.SELECTED_MODEL);
    if (modelSelect && savedModel) modelSelect.value = savedModel;

    const savedSourceLang = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.SOURCE_LANGUAGE);
    if (sourceLanguageInput) {
        sourceLanguageInput.value = savedSourceLang || CONSTANTS.DEFAULT_VALUES.SOURCE_LANGUAGE;
    }

    const savedTemperature = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.TEMPERATURE);
    if (temperatureSlider) {
        temperatureSlider.value = savedTemperature || CONSTANTS.DEFAULT_VALUES.TEMPERATURE;
    }
    handleTemperatureChange();
    updatePricingDisplay();
    updateStatus('Loaded previous session from local storage.', CONSTANTS.STATUS_TYPES.INFO, CONSTANTS.TIMEOUTS.STATUS_LOADED_SESSION);
}

// Format markdown to HTML for rich text display
function formatMarkdown(text) {
    if (!text) return '';
    
    // First handle any literal HTML tags that might be in the response
    let formatted = text
        // Replace common literal HTML tags with placeholders
        .replace(/<br>/gi, '###LINEBREAK###')
        .replace(/<\/br>/gi, '###LINEBREAKEND###')
        .replace(/<b>/gi, '###BOLD###')
        .replace(/<\/b>/gi, '###BOLDEND###')
        .replace(/<i>/gi, '###ITALIC###')
        .replace(/<\/i>/gi, '###ITALICEND###')
        .replace(/<strong>/gi, '###STRONG###')
        .replace(/<\/strong>/gi, '###STRONGEND###')
        .replace(/<em>/gi, '###EM###')
        .replace(/<\/em>/gi, '###EMEND###')
        .replace(/<ul>/gi, '###UL###')
        .replace(/<\/ul>/gi, '###ULEND###')
        .replace(/<li>/gi, '###LI###')
        .replace(/<\/li>/gi, '###LIEND###')
        // Escape HTML tags for security
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Restore HTML tags from placeholders
        .replace(/###LINEBREAK###/gi, '<br>')
        .replace(/###LINEBREAKEND###/gi, '</br>')
        .replace(/###BOLD###/gi, '<b>')
        .replace(/###BOLDEND###/gi, '</b>')
        .replace(/###ITALIC###/gi, '<i>')
        .replace(/###ITALICEND###/gi, '</i>')
        .replace(/###STRONG###/gi, '<strong>')
        .replace(/###STRONGEND###/gi, '</strong>')
        .replace(/###EM###/gi, '<em>')
        .replace(/###EMEND###/gi, '</em>')
        .replace(/###UL###/gi, '<ul>')
        .replace(/###ULEND###/gi, '</ul>')
        .replace(/###LI###/gi, '<li>')
        .replace(/###LIEND###/gi, '</li>');
    
    // Process markdown formatting
    formatted = formatted
        // Convert markdown bold/italic
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/__(.*?)__/g, '<strong>$1</strong>') // Bold alternative
        .replace(/_(.*?)_/g, '<em>$1</em>') // Italic alternative
        
        // Headers
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        
        // Line breaks
        .replace(/\n/g, '<br>')
        
        // Lists
        .replace(/^\* (.*?)$/gm, '<li>$1</li>')
        .replace(/^\- (.*?)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
    
    // Wrap lists in <ul> or <ol> tags if needed
    // (This is a simplified approach)
    if (formatted.includes('<li>') && !formatted.includes('<ul>')) {
        formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    }
    
    return formatted;
}

// Update status message
function updateStatus(message, type = CONSTANTS.STATUS_TYPES.INFO, timeout = CONSTANTS.TIMEOUTS.STATUS_MESSAGE_DEFAULT) {
    if (statusMessage) { // Ensure statusMessage element exists
        statusMessage.textContent = message;
        statusMessage.classList.remove(CONSTANTS.STATUS_TYPES.INFO, CONSTANTS.STATUS_TYPES.SUCCESS, CONSTANTS.STATUS_TYPES.ERROR, CONSTANTS.STATUS_TYPES.PROCESSING);
        if (type) {
            statusMessage.classList.add(type);
        }

        if (type === CONSTANTS.STATUS_TYPES.SUCCESS || type === CONSTANTS.STATUS_TYPES.INFO) {
            setTimeout(() => {
                if (statusMessage.textContent === message) {
                    statusMessage.textContent = CONSTANTS.UI.DEFAULT_STATUS_MESSAGE;
                    statusMessage.classList.remove(type);
                    statusMessage.classList.add(CONSTANTS.STATUS_TYPES.INFO);
                }
            }, timeout);
        }
    }
}

// Automatically save changes in text areas to localStorage after a short delay
const textAreasForAutoSave = [translationBox, promptBox, notesBox]; // Output is saved after translation
let saveTimeout;

// Map textareas to their storage keys for auto-save
const textAreaStorageMap = {
    'translation-box': CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT,
    'prompt-box': CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT,
    'notes-box': CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT
};

textAreasForAutoSave.forEach(textarea => {
    if (textarea) { 
        textarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const storageKey = textAreaStorageMap[textarea.id];
                if (storageKey) {
                    saveToLocalStorage(storageKey, textarea.value);
                }
            }, CONSTANTS.TIMEOUTS.AUTO_SAVE_DEBOUNCE); 
        });
    }
});

// Save fandom content separately now
function saveFandomContent() {
    if (fandomBox) { // Add null check
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT, fandomBox.value);
    }
}

// --- Final Setup ---

// Add styling for status message types directly in JS
document.head.insertAdjacentHTML('beforeend', `
<style>
    #status-message.error { color: #dc3545; font-weight: bold; }
    #status-message.success { color: #198754; }
    #status-message.processing { color: #0d6efd; }
    #status-message.info { color: #6c757d; }
    /* Add a subtle transition for status changes */
    #status-message { transition: color 0.3s ease-in-out; }
</style>
`);

// Helper function to safely get DOM elements with logging
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID '${id}' not found`);
    }
    return element;
}

// Initialize the UI and event handlers when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize word count elements first so they are available globally if needed by other setup steps
        inputWordCountEl = document.getElementById('input-word-count');
        outputWordCountEl = document.getElementById('output-word-count');

        loadFromLocalStorage(); 
        checkApiKey(); 
        updatePricingDisplay(); 

        // ... (Button initializations) ...
        const clearAllAppBtn = document.getElementById('clear-all-btn');
        if (clearAllAppBtn) {
            clearAllAppBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings and content?')) {
                    // ... (clearing logic) ...
                    updateStatus('All settings and content have been reset.', CONSTANTS.STATUS_TYPES.SUCCESS);
                    // Refresh word counts using the globally available elements
                    if (translationBox && inputWordCountEl) updateWordCount(translationBox, inputWordCountEl);
                    if (outputBox && outputWordCountEl) updateWordCount(outputBox, outputWordCountEl);
                }
            });
        }

        // Word Counters & Text Area Input Listeners
        // const localInputWordCountEl = document.getElementById('input-word-count'); // No longer needed here
        // const localOutputWordCountEl = document.getElementById('output-word-count'); // No longer needed here

        if (translationBox && inputWordCountEl) {
            updateWordCount(translationBox, inputWordCountEl);
            translationBox.addEventListener('input', () => {
                updateWordCount(translationBox, inputWordCountEl);
            });
        }
        if (outputBox && outputWordCountEl) {
            updateWordCount(outputBox, outputWordCountEl);
            outputBox.addEventListener('input', () => updateWordCount(outputBox, outputWordCountEl));
        }

        // ... (rest of DOMContentLoaded) ...

        updateStatus('Application initialized and ready.', CONSTANTS.STATUS_TYPES.INFO);

    } catch (error) {
        console.error('Error initializing application:', error);
        updateStatus('Error initializing application. Check console for details.', CONSTANTS.STATUS_TYPES.ERROR);
    }
});
