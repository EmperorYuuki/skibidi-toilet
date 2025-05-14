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
const progressIndicatorContainer = document.getElementById('progress-indicator-container'); // New progress container

// Prompt Template Management DOM Elements
const promptTemplateNameInput = document.getElementById('prompt-template-name');
const savePromptAsBtn = document.getElementById('save-prompt-as-btn');
const savedPromptsSelect = document.getElementById('saved-prompts-select');
const loadPromptBtn = document.getElementById('load-prompt-btn');
const deletePromptBtn = document.getElementById('delete-prompt-btn');

// Word count display elements - to be initialized in DOMContentLoaded
let inputWordCountEl = null;
let outputWordCountEl = null;

// Clear All button from the main app controls
const clearAllAppBtn = document.getElementById('clear-all-btn'); 

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
        STREAM_ENABLED: false, // Default for stream toggle if not in localStorage
        INTER_CHUNK_SUMMARY_ENABLED: false // Default for inter-chunk summary toggle
    },
    TIMEOUTS: {
        AUTO_SAVE_DEBOUNCE: 1500,
        STATUS_MESSAGE_DEFAULT: 5000,
        STATUS_LOADED_SESSION: 3000,
        STREAM_BUFFER_FLUSH_INTERVAL: 100 // ms, for flushing buffered stream content to DOM
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
        DEEPSEEK_API_KEY: 'deepseekApiKey',
        SAVED_PROMPTS: 'fanficTranslatorSavedPrompts',
        INTER_CHUNK_SUMMARY_ENABLED: 'interChunkSummaryEnabled' // New key
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

// Add a global variable for the tokenizer server URL
let tokenizerServerUrl = null; // Default to null, to be set by config

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// --- Default Prompt Template ---
const defaultPromptTemplate = `Translate the following text from {source_language} into {target_language}. Provide ONLY the translated text itself, without any introductory phrases, concluding remarks, explanations, or any other conversational text. The output must be exclusively the direct translation.

Fandom Context (if provided, use to inform translation nuances):{fandom_context}

Previous Chapter Summary (for continuity, if provided):{previous_chapter_summary}

Previous Chunk Summaries (for context, if provided):{previous_chunk_summaries}

Translator Notes & Special Instructions (if provided, follow strictly):{notes}

Source Text to Translate:

{source_text}`;

// Model Pricing Data (Example - Update with actual Groq pricing if available)
const modelPricing = {
    // Groq Prices (per million tokens, based on image)
    'grok-3-latest':            { input: '$3.00', completion: '$15.00', context: '131k' },
    'grok-3-fast-latest':       { input: '$5.00', completion: '$25.00', context: '131k' },
    'grok-3-mini-latest':       { input: '$0.30', completion: '$0.50', context: '131k' },
    'grok-3-mini-fast-latest':  { input: '$0.60', completion: '$4.00', context: '131k' },
    // DeepSeek (Placeholder - update if you have real data)
    'deepseek-chat':            { input: '$0.27', completion: '$1.10', context: '64k' }, // Standard Price (Cache Miss)
};

// Function to load tunnel configuration
async function loadTunnelConfig() {
    try {
        const response = await fetch('tunnel_config.json');
        if (response.ok) {
            const config = await response.json();
            if (config && config.tokenizer_url) {
                tokenizerServerUrl = config.tokenizer_url;
                console.log(`[Config] Using tokenizer server URL from tunnel_config.json: ${tokenizerServerUrl}`);
            } else {
                tokenizerServerUrl = null; // Ensure it's null if key is missing
                console.warn('[Config] tunnel_config.json found but tokenizer_url is missing or empty.');
            }
        } else {
            tokenizerServerUrl = null; // Ensure it's null if file not found
            console.warn('[Config] tunnel_config.json not found or not accessible.');
        }
    } catch (error) {
        tokenizerServerUrl = null; // Ensure it's null on error
        console.error('[Config] Error loading tunnel_config.json:', error);
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => { // Make DOMContentLoaded async
    console.info('DOM fully loaded and parsed. Initializing application...');
    try {
        // Load tunnel config first
        console.log('[DOMReady] Attempting to load tunnel configuration...');
        await loadTunnelConfig(); // Await the loading of the tunnel config

        // Load saved state first
        console.log('[DOMReady] Attempting to load from local storage...');
        loadFromLocalStorage();
        
        // Check if keys are present
        console.log('[DOMReady] Checking API keys...');
        checkApiKey();
        
        // Update pricing display
        console.log('[DOMReady] Updating pricing display...');
        updatePricingDisplay();

        // Add event listeners for buttons with null checks
        if (translateBtn) translateBtn.addEventListener('click', handleTranslation);
        if (clearBtn) clearBtn.addEventListener('click', clearContextualFields); // Renamed function call
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
            const debouncedUpdateInputWordCount = debounce(() => updateWordCount(translationBox, sourceCounter), 250);
            // updateWordCount(translationBox, sourceCounter); // Initial call
            translationBox.addEventListener('input', debouncedUpdateInputWordCount);
        }
        
        if (outputCounter && outputBox) {
            const debouncedUpdateOutputWordCount = debounce(() => updateWordCount(outputBox, outputCounter), 250);
            // updateWordCount(outputBox, outputCounter); // Initial call
            // outputBox.addEventListener('input', debouncedUpdateOutputWordCount); // Output box is contenteditable, so its content changes programmatically or via paste
            // For contenteditable, MutationObserver is more robust for all changes.
            // However, simple paste and programmatic changes will be handled by calling updateWordCount manually after those operations.
            // Let's keep the input listener for direct typing, though it might be less common for outputBox.
            outputBox.addEventListener('input', debouncedUpdateOutputWordCount); 
            outputBox.addEventListener('paste', () => {
                setTimeout(debouncedUpdateOutputWordCount, 100); // Allow paste to settle
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

        // Event listeners for Prompt Template Management
        if (savePromptAsBtn) savePromptAsBtn.addEventListener('click', handleSavePromptAs);
        if (loadPromptBtn) loadPromptBtn.addEventListener('click', handleLoadSelectedPrompt);
        if (deletePromptBtn) deletePromptBtn.addEventListener('click', handleDeleteSelectedPrompt);

        // Load saved prompt templates into dropdown
        loadSavedPromptTemplatesToSelect();

        // Event listener for the new clear output area button
        if (clearOutputAreaBtn) {
            clearOutputAreaBtn.addEventListener('click', () => {
                clearSpecificField('output-box', CONSTANTS.LOCAL_STORAGE_KEYS.OUTPUT_CONTENT, 'output-word-count');
            });
        }

        // Event listener for the main "Reset All" button
        if (clearAllAppBtn) {
            clearAllAppBtn.addEventListener('click', handleResetAllApplicationData);
        }
    } catch (error) {
        console.error('Error initializing event listeners:', error);
        updateStatus('Error initializing application. Check console for details.', CONSTANTS.STATUS_TYPES.ERROR);
    }
    console.info('Application initialization complete.');
});

// ... other event listeners ...

// Add null checks before adding event listeners to prevent errors
if (promptBox) promptBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, promptBox.value));
// The direct listener for fandomBox will be removed as it's handled by the debounced textAreasForAutoSave loop.
// if (fandomBox) fandomBox.addEventListener('input', () => saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT, fandomBox.value));
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
    
    // Count words and characters using the CJK-aware getWordCount function
    const words = text.trim() ? getWordCount(text.trim()) : 0;
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
    console.log(`[APIKeyCheck] Checking API keys. Selected model: ${selectedModelValue || 'None'}`);

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
        console.warn(`[APIKeyCheck] Key missing for selected model '${selectedModelValue}'. Message: ${missingKeyMessage}`);
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
        console.log(`[APIKeyCheck] API key check passed for selected model '${selectedModelValue}' or no key required by current logic.`);
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
    const selectedModel = modelSelect.value;
    if (modelPricing[selectedModel]) {
        const price = modelPricing[selectedModel];
        pricingDisplay.innerHTML = `Input: ${price.input}/1M tokens, Completion: ${price.completion}/1M tokens, Context: ${price.context}`;
    } else {
        pricingDisplay.innerHTML = 'Pricing info not available.';
    }
}

// Handle Temperature Slider Change
function handleTemperatureChange() {
    const tempValue = parseFloat(temperatureSlider.value).toFixed(1);
        temperatureValueDisplay.textContent = tempValue;
    saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.TEMPERATURE, tempValue);
    console.log(`[Settings] Temperature changed to: ${tempValue}`);
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
        console.log('[Translate] AbortController found, aborting translation...');
        abortController.abort();
        abortController = null;
    }
    updateTranslationState(false);
    updateStatus('Translation stopped.', CONSTANTS.STATUS_TYPES.INFO);
    console.info('[Translate] Translation process stopped by user.');
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
    // streamToggle.disabled = isTranslating; // Keep stream toggle enabled for chunk-wise decision if needed, or disable too.
}

// Helper function to count words, more accurately for CJK-like languages
function getWordCount(text) {
    if (!text || text.trim() === '') return 0;
    const chineseRegex = /[\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/; // Basic CJK, Full-width punctuation
    const hasChinese = chineseRegex.test(text);

    if (hasChinese) {
        // For text with Chinese characters, count non-whitespace characters.
        // This treats each Chinese character as a word and ignores spaces.
        return text.replace(/\s+/g, '').length;
    } else {
        // For non-Chinese text, split by spaces and filter out empty strings
        // that might result from multiple spaces.
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
}

// Function to split text into chunks
async function createTextChunks(text, modelName) {
    console.log(`[Chunker] Creating text chunks for model: ${modelName}`);
    const DEFAULT_GROK_TOKENS = 22000; // For Grok models
    const DEFAULT_DEEPSEEK_TOKENS = 6000; // For DeepSeek models
    let chunks = []; // Ensure chunks is declared here
    let usedTokenizerServer = false;

    let maxTokens;

    if (modelName.startsWith(CONSTANTS.MODELS.GROQ_PREFIX)) {
        maxTokens = DEFAULT_GROK_TOKENS;
        console.log(`[Chunker] Using Grok model, setting max tokens to ${maxTokens}`);
    } else if (modelName === CONSTANTS.MODELS.DEEPSEEK_CHAT) {
        maxTokens = DEFAULT_DEEPSEEK_TOKENS;
        console.log(`[Chunker] Using DeepSeek model, setting max tokens to ${maxTokens}`);
    } else {
        console.error('[Chunker] Unknown model type for chunking:', modelName);
        // For unknown models, return the original text as a single chunk if it's not empty.
        const trimmedText = text.trim();
        return trimmedText ? [trimmedText] : [];
    }

    if (tokenizerServerUrl) { // Attempt to use server only if URL is configured
        try {
            // Attempt to use the tokenizer server for chunking
            console.log(`[Chunker] Attempting to use tokenizer server at ${tokenizerServerUrl} with max_tokens: ${maxTokens}`);
            const healthResponse = await fetch(`${tokenizerServerUrl}/health`, { 
                method: 'GET' 
            }).catch(error => {
                console.error('[Chunker] Error connecting to tokenizer server (during health check):', error);
                throw new Error('Tokenizer server not reachable or health check fetch failed');
            });

            if (!healthResponse.ok) {
                throw new Error(`Tokenizer server health check failed: ${healthResponse.status} ${await healthResponse.text()}`);
            }

            // If server is available, use it for chunking
            console.log('[Chunker] Tokenizer server is available. Requesting chunking...');
            const chunkResponse = await fetch(`${tokenizerServerUrl}/chunk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    max_tokens: maxTokens
                })
            });

            if (!chunkResponse.ok) {
                const errorData = await chunkResponse.json().catch(() => ({ error: 'Server returned non-OK status and failed to parse error JSON.' }));
                throw new Error(`Server chunking failed: ${chunkResponse.status} - ${errorData.error || 'Unknown server error'}`);
            }

            const chunkData = await chunkResponse.json();
            chunks = chunkData.chunks; // Assign to the function-scoped chunks variable
            usedTokenizerServer = true;
            
            console.log("[Chunker] Server response summary:", {
                chunks_count: chunkData.chunk_count,
                max_tokens_setting: chunkData.max_tokens_setting,
                actual_tokens: chunkData.actual_total_tokens_in_chunks
            });
            console.log(`[Chunker] Received ${chunks.length} chunks from server`);
            
            if (chunks.length > 0) {
                chunks.forEach((chunk, i) => {
                    console.log(`[Chunker] Chunk ${i+1} preview: ${chunk.substring(0, 50)}... (${chunk.length} chars)`);
                });
            }
        } catch (error) {
            console.error('[Chunker] Tokenizer server error (URL was configured, or health/chunk call failed):', error.message);
            // usedTokenizerServer remains false, will fall through to character-based chunking.
        }
    } else {
        console.warn('[Chunker] Tokenizer server URL not configured. Will use character-based fallback.');
    }

    if (!usedTokenizerServer) {
        console.warn('[Chunker] Falling back to character-based chunking. This is a rough approximation!');
        
        // Fallback: Use character-based approximation
        chunks = []; // Ensure chunks is reset for fallback logic
        const CHARS_PER_TOKEN_ESTIMATE = 4; // General estimate
        const maxCharsFallback = maxTokens * CHARS_PER_TOKEN_ESTIMATE;
        let currentChunk = '';
        let accumulatedCharsInCurrentChunk = 0;

        const textLines = text.split(/\r?\n/);
        let paragraphBuffer = [];

        function finalizeCurrentChunk() {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
                accumulatedCharsInCurrentChunk = 0;
            }
        }

        function addParagraphToChunk(pText) {
            if (currentChunk.length > 0) { 
                currentChunk += '\n\n'; 
                accumulatedCharsInCurrentChunk += 2; 
            }
            currentChunk += pText;
            accumulatedCharsInCurrentChunk += pText.length;
        }

        for (const line of textLines) {
            if (line.trim() === '') { 
                if (paragraphBuffer.length > 0) {
                    let currentParagraph = paragraphBuffer.join('\n');
                    paragraphBuffer = [];

                    if (accumulatedCharsInCurrentChunk + currentParagraph.length + (currentChunk.length > 0 ? 2 : 0) > maxCharsFallback && accumulatedCharsInCurrentChunk > 0) {
                        finalizeCurrentChunk();
                    }

                    if (currentParagraph.length > maxCharsFallback && accumulatedCharsInCurrentChunk === 0) {
                        let pToSplit = currentParagraph;
                        while (pToSplit.length > 0) {
                            let subP = pToSplit.substring(0, maxCharsFallback);
                            chunks.push(subP.trim()); 
                            pToSplit = pToSplit.substring(subP.length);
                        }
                    } else if (currentParagraph.length + accumulatedCharsInCurrentChunk + (currentChunk.length > 0 ? 2:0) <= maxCharsFallback) {
                         addParagraphToChunk(currentParagraph);
                    } else {
                         finalizeCurrentChunk();
                         if (currentParagraph.length <= maxCharsFallback) {
                             addParagraphToChunk(currentParagraph);
                         } else { 
                            let pToSplit = currentParagraph;
                            while (pToSplit.length > 0) {
                                let subP = pToSplit.substring(0, maxCharsFallback);
                                chunks.push(subP.trim());
                                pToSplit = pToSplit.substring(subP.length);
                            }
                         }
                    }
                }
            } else {
                paragraphBuffer.push(line);
            }
        }
        
        if (paragraphBuffer.length > 0) {
            let currentParagraph = paragraphBuffer.join('\n');
            if (accumulatedCharsInCurrentChunk + currentParagraph.length + (currentChunk.length > 0 ? 2 : 0) > maxCharsFallback && accumulatedCharsInCurrentChunk > 0) {
                finalizeCurrentChunk();
            }
            if (currentParagraph.length > maxCharsFallback && accumulatedCharsInCurrentChunk === 0) {
                let pToSplit = currentParagraph;
                while (pToSplit.length > 0) {
                    let subP = pToSplit.substring(0, maxCharsFallback);
                    chunks.push(subP.trim()); 
                    pToSplit = pToSplit.substring(subP.length);
                }
            } else if (currentParagraph.length + accumulatedCharsInCurrentChunk + (currentChunk.length > 0 ? 2:0) <= maxCharsFallback) {
                    addParagraphToChunk(currentParagraph);
            } else {
                    finalizeCurrentChunk();
                    if (currentParagraph.length <= maxCharsFallback) {
                        addParagraphToChunk(currentParagraph);
                    } else { 
                    let pToSplit = currentParagraph;
                    while (pToSplit.length > 0) {
                        let subP = pToSplit.substring(0, maxCharsFallback);
                        chunks.push(subP.trim());
                        pToSplit = pToSplit.substring(subP.length);
                    }
                    }
            }
        }

        finalizeCurrentChunk(); 
        console.log(`[Chunker] Fallback created ${chunks.length} chunks based on ~${maxCharsFallback} chars.`);
    }
    
    // Ensure no empty chunks are returned, which can happen if input text is very short or just newlines.
    chunks = chunks.filter(chunk => chunk.trim().length > 0);
    if (chunks.length === 0 && text.trim().length > 0) { // If filtering made chunks empty but original text wasn't
        chunks.push(text.trim()); // Add the original text as one chunk
    }

    // Log chunk stats
    let totalChars = 0;
    let totalWords = 0;
    chunks.forEach((chunk, index) => {
        const chunkWords = getWordCount(chunk);
        totalWords += chunkWords;
        totalChars += chunk.length;
        console.log(`[Chunker] Chunk ${index+1}: ${chunkWords} words, ${chunk.length} chars`);
    });
    console.log(`[Chunker] Total: ${chunks.length} chunks, ${totalWords} words, ${totalChars} chars`);

    return chunks;
}

// Main Translation Handler
async function handleTranslation() {
    console.info('[Translate] Initiating translation process...');
    if (translationInProgress) {
        console.warn('[Translate] Translation already in progress. New request ignored.');
        return;
    }

    const originalSourceText = translationBox.value.trim();
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

    if (!originalSourceText) {
        updateStatus('Please enter text to translate.', CONSTANTS.STATUS_TYPES.WARNING);
        console.warn('[Translate] No text to translate.');
        return;
    }

    updateTranslationState(true); // Set initial translating state for the whole batch
    console.log(`[Translate] Batch translation starting. Model: ${selectedModel}, Source: ${sourceLanguage}, Target: ${targetLanguage}, Temp: ${temperature}, Streaming: ${enableStream}`);
    
    // Clear previous output for the new batch
    if (outputBox) {
        outputBox.innerHTML = ''; // Clear for rich text editor
        if (typeof outputBox.value !== 'undefined') outputBox.value = ''; // Clear for textarea fallback
    }
    if (progressIndicatorContainer) progressIndicatorContainer.innerHTML = ''; // Clear previous progress

    // Create progress indicator - No longer creating a new element, using the container
    // const progressIndicator = document.createElement('div');
    // progressIndicator.className = 'translation-progress';
    // progressIndicator.style.cssText = 'background: #313244; padding: 10px; margin-bottom: 15px; border-radius: 5px; text-align: center; font-weight: bold;';
    // outputBox.appendChild(progressIndicator); // No longer appending to outputBox

    abortController = new AbortController(); // One controller for the whole batch
    let overallSuccess = true;

    try {
        const textChunks = await createTextChunks(originalSourceText, selectedModel);
        if (textChunks.length === 0) {
            updateStatus('No text to translate after processing.', CONSTANTS.STATUS_TYPES.INFO);
            console.warn('[Translate] No translatable chunks found.');
            overallSuccess = false; // Or handle as an error if appropriate
            return; // Exit if no chunks
        }

        console.log(`[Translate] Text split into ${textChunks.length} chunks for batch processing.`);
        
        // Update progress indicator with total chunks
        if (progressIndicatorContainer) {
            progressIndicatorContainer.innerHTML = `<div>Preparing to translate ${textChunks.length} chunks</div>
                                         <div class="progress-bar-bg" style="height: 10px; background: var(--input-bg); border-radius: 5px; margin-top: 8px; overflow: hidden;">
                                            <div class="progress-bar-fg" style="width: 0%; height: 100%; background: var(--primary); border-radius: 5px; transition: width 0.3s ease;"></div>
                                         </div>`;
        }
        
        let chunkSummaries = []; // To store summaries for inter-chunk context (future feature)
        // Check if inter-chunk summaries are enabled
        const interChunkSummaryToggle = document.getElementById('inter-chunk-summary-toggle');
        const enableInterChunkSummaries = interChunkSummaryToggle ? interChunkSummaryToggle.checked : false;

        for (let i = 0; i < textChunks.length; i++) {
            if (abortController.signal.aborted) {
                console.info('[Translate] Batch translation aborted by user during chunk processing.');
                overallSuccess = false;
                break;
            }

            const chunkTextToTranslate = textChunks[i];
            const chunkNumber = i + 1;
            
            // Update progress indicator
            const progressPercent = ((i) / textChunks.length * 100).toFixed(1);
            if (progressIndicatorContainer) {
                 progressIndicatorContainer.innerHTML = `<div>Translating chunk ${chunkNumber} of ${textChunks.length} (${progressPercent}% complete)</div>
                                             <div class="progress-bar-bg" style="height: 10px; background: var(--input-bg); border-radius: 5px; margin-top: 8px; overflow: hidden;">
                                                <div class="progress-bar-fg" style="width: ${progressPercent}%; height: 100%; background: var(--primary); border-radius: 5px; transition: width 0.3s ease;"></div>
                                             </div>`;
            }
            
            updateStatus(`Translating chunk ${chunkNumber} of ${textChunks.length}...`, CONSTANTS.STATUS_TYPES.PROCESSING, 0);
            console.log(`[Translate] Processing chunk ${chunkNumber}/${textChunks.length}. Size: ${chunkTextToTranslate.length} chars.`);

            // Add chunk header to output (except for first chunk)
            if (i > 0 || outputBox.innerHTML.length > 0) {
                const chunkDivider = document.createElement('div');
                chunkDivider.className = 'chunk-divider';
                chunkDivider.style.cssText = 'border-top: 2px dashed #45475a; margin: 20px 0; padding-top: 10px;';
                chunkDivider.innerHTML = `<div style="color: #89b4fa; font-weight: bold; margin-bottom: 10px;">Chunk ${chunkNumber} of ${textChunks.length}</div>`;
                outputBox.appendChild(chunkDivider);
            }

            // Process prompt template variables for the current chunk
            let processedChunkPrompt = userPromptTemplate
        .replace(/{source_language}/g, sourceLanguage)
        .replace(/{target_language}/g, targetLanguage)
        .replace(/{fandom_context}/g, fandomContext)
        .replace(/{notes}/g, notes)
                .replace(/{source_text}/g, chunkTextToTranslate) // Use current chunk text
                .replace(/{previous_chapter_summary}/g, currentSummary); // Summary applies to the whole work

            // Add previous chunk summaries if available (for future inter-chunk summary feature)
            if (chunkSummaries.length > 0 && processedChunkPrompt.includes('{previous_chunk_summaries}')) {
                const formattedSummaries = chunkSummaries.map((summary, idx) => 
                    `Chunk ${idx + 1} Summary: ${summary}`
                ).join('\n\n');
                processedChunkPrompt = processedChunkPrompt.replace(/{previous_chunk_summaries}/g, formattedSummaries);
            } else if (processedChunkPrompt.includes('{previous_chunk_summaries}')) {
                processedChunkPrompt = processedChunkPrompt.replace(/{previous_chunk_summaries}/g, 'No previous chunks translated yet.');
            }

            if (!userPromptTemplate.includes('{source_text}') || !processedChunkPrompt.includes(chunkTextToTranslate)) {
                console.warn(`[Translate Chunk ${chunkNumber}] Fallback prompt constructed.`);
    }

            // Create a chunk container for this translation
            const chunkContainer = document.createElement('div');
            chunkContainer.className = 'translation-chunk';
            chunkContainer.dataset.chunkNumber = chunkNumber;
            outputBox.appendChild(chunkContainer);

            let chunkStreamCallback = null;
            let streamBuffer = '';
            let streamUpdateTimer = null;

            function flushStreamBuffer() {
                if (streamBuffer.length > 0) {
                    const formattedText = formatMarkdown(streamBuffer);
                    if (chunkContainer) {
                        chunkContainer.innerHTML += formattedText;
                    } else if (outputBox) { // Fallback if chunkContainer somehow not available
                        outputBox.innerHTML += formattedText;
                    }
                    streamBuffer = ''; // Clear buffer after flushing
                    if (outputBox && outputBox.scrollHeight) {
                        outputBox.scrollTop = outputBox.scrollHeight; // Scroll to bottom
                    }
                }
            }

            if (enableStream) {
                chunkStreamCallback = (text) => {
                    streamBuffer += text;
                    clearTimeout(streamUpdateTimer);
                    streamUpdateTimer = setTimeout(flushStreamBuffer, CONSTANTS.TIMEOUTS.STREAM_BUFFER_FLUSH_INTERVAL);
                };
            }
        
            try {
                const translation = await getTranslation(processedChunkPrompt, selectedModel, temperature, enableStream, chunkStreamCallback, abortController.signal);
                
                // After stream ends (or if not streaming), ensure any remaining buffer is flushed
                if (enableStream) {
                    clearTimeout(streamUpdateTimer); // Clear any pending timer
                    flushStreamBuffer(); // Flush any remaining content
                }

                if (abortController.signal.aborted) {
                    overallSuccess = false;
                    break; 
                }

                if (!enableStream) {
                    console.log(`[Translate Chunk ${chunkNumber}] Non-streaming translation received.`);
                    if (chunkContainer) {
                        const formattedTranslation = formatMarkdown(translation);
                        chunkContainer.innerHTML = formattedTranslation;
                    } else if (outputBox) {
                const formattedTranslation = formatMarkdown(translation);
                if (typeof outputBox.innerHTML !== 'undefined') {
                            outputBox.innerHTML += (outputBox.innerHTML.length > 0 ? '<br><br>' : '') + formattedTranslation;
                } else if (typeof outputBox.value !== 'undefined') {
                            outputBox.value += (outputBox.value.length > 0 ? '\n\n' : '') + translation;
                }
            }
        }
        
                console.info(`[Translate Chunk ${chunkNumber}] Translation successful.`);
                 // Update word count after each chunk if not streaming, or finally after all chunks if streaming
                if (!enableStream) {
                    const currentOutputCounter = document.getElementById('output-word-count');
                    if (currentOutputCounter && outputBox) updateWordCount(outputBox, currentOutputCounter);
                }

                // Generate and store summary for inter-chunk context
                if (enableInterChunkSummaries && textChunks.length > 1 && i < textChunks.length -1) { // Only generate if enabled and more chunks to come
                    try {
                        console.log(`[Translate Chunk ${chunkNumber}] Generating summary for inter-chunk context...`);
                        const chunkSummary = await generateChunkSummary(translation, selectedModel, temperature);
                        if (chunkSummary) {
                            chunkSummaries.push(chunkSummary);
                            console.log(`[Translate Chunk ${chunkNumber}] Inter-chunk summary generated and stored: "${chunkSummary}"`);
                        } else {
                            console.warn(`[Translate Chunk ${chunkNumber}] Inter-chunk summary was empty.`);
                        }
                    } catch (summaryError) {
                        console.error(`[Translate Chunk ${chunkNumber}] Failed to generate inter-chunk summary:`, summaryError);
                        // Continue without this summary
                    }
                }

            } catch (chunkError) {
                overallSuccess = false;
                if (chunkError.name === 'AbortError') {
                    console.info(`[Translate Chunk ${chunkNumber}] Aborted by user.`);
                } else {
                    console.error(`[Translate Chunk ${chunkNumber}] Error:`, chunkError);
                    updateStatus(`Error on chunk ${chunkNumber}: ${chunkError.message}`, CONSTANTS.STATUS_TYPES.ERROR, 10000);
                    // Optionally, ask user if they want to continue with next chunk or stop all
                    if (!confirm(`Error translating chunk ${chunkNumber}. Continue with next chunk?`)) {
                        console.warn('[Translate] Batch translation stopped by user after chunk error.');
                        if (abortController) abortController.abort(); // Ensure abort is called
                    }
                }
                if (abortController.signal.aborted) break; // Break outer loop if user chose to stop
            }
        } // End of chunks loop

        // Update final progress
        const finalProgressPercent = overallSuccess && !abortController.signal.aborted ? 100 : ((textChunks.length - 1) / textChunks.length * 100).toFixed(1);
        if (progressIndicatorContainer) {
            const barColor = overallSuccess && !abortController.signal.aborted ? 'var(--success)' : 'var(--danger)';
            progressIndicatorContainer.innerHTML = `<div>Translation ${overallSuccess && !abortController.signal.aborted ? 'completed' : 'stopped'}</div>
                                         <div class="progress-bar-bg" style="height: 10px; background: var(--input-bg); border-radius: 5px; margin-top: 8px; overflow: hidden;">
                                            <div class="progress-bar-fg" style="width: ${finalProgressPercent}%; height: 100%; background: ${barColor}; border-radius: 5px; transition: width 0.3s ease;"></div>
                                         </div>`;
        }

        if (overallSuccess && !abortController.signal.aborted) {
            updateStatus('All chunks translated successfully!', CONSTANTS.STATUS_TYPES.SUCCESS);
            console.info('[Translate] Batch translation fully successful.');
        } else if (abortController.signal.aborted) {
            updateStatus('Batch translation stopped by user.', CONSTANTS.STATUS_TYPES.INFO);
            // Logged by stopTranslation or within loop
        } else {
            updateStatus('Batch translation completed with some errors.', CONSTANTS.STATUS_TYPES.WARNING);
            console.warn('[Translate] Batch translation completed with errors.');
        }

    } catch (error) {
        // This catch is for errors in createTextChunks or other setup before the loop
        console.error('[Translate] General batch translation error:', error);
        updateStatus('Error in batch translation setup: ' + error.message, CONSTANTS.STATUS_TYPES.ERROR);
        overallSuccess = false;
    } finally {
        console.log('[Translate] Batch translation process finished (finally block).');
        updateTranslationState(false); // Reset UI state for the whole batch process
        // Update final word count for the entire output
        const finalOutputCounter = document.getElementById('output-word-count');
        if (finalOutputCounter && outputBox) updateWordCount(outputBox, finalOutputCounter);
        
        // Clear progress indicator after a short delay if successful, or keep if stopped/error
        setTimeout(() => {
            if (progressIndicatorContainer && overallSuccess && !abortController.signal.aborted) {
                progressIndicatorContainer.innerHTML = '';
            }
        }, overallSuccess && !abortController.signal.aborted ? 3000 : 0); // Clear after 3s on success, keep if error/stopped or clear immediately if not needed

        if (overallSuccess && !abortController.signal.aborted) {
             if (generateSummaryBtn) generateSummaryBtn.disabled = false;
        } else {
            if (generateSummaryBtn) generateSummaryBtn.disabled = true; // Keep disabled if batch had issues or was stopped
        }
        abortController = null; // Clear the controller
    }
}

// New function to generate a summary for a given chunk of text
async function generateChunkSummary(textToSummarize, model, originalTemperature) {
    if (!textToSummarize || !textToSummarize.trim()) {
        console.warn('[ChunkSummary] No text provided to summarize for inter-chunk context.');
        return null;
    }

    console.log(`[ChunkSummary] Requesting summary for chunk. Model: ${model}`);
    const summaryPrompt = `Based on the following text, provide a very concise summary (1-2 sentences) focusing on key events, characters, and information that would be essential for maintaining context if translating the *next* part of this story. Output only the summary itself:

Text:
${textToSummarize}`;
    
    const summaryTemperature = Math.max(0.1, Math.min(originalTemperature - 0.2, 0.5)); // Lower temp for summary, but not too low

    try {
        // Using the existing getTranslation function for the API call
        const summary = await getTranslation(summaryPrompt, model, summaryTemperature, false, null, abortController ? abortController.signal : null);
        if (summary && summary.trim()) {
            return summary.trim();
        } else {
            console.warn('[ChunkSummary] Received empty summary from AI.');
            return null;
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.info('[ChunkSummary] Summary generation aborted.');
        } else {
            console.error('[ChunkSummary] Error during inter-chunk summary generation:', error);
        }
        return null; // Return null if summarization fails or is aborted
    }
}

// Summarization Function
async function handleSummaryGeneration() {
    console.info('[Summary] Initiating summary generation...');
    const translatedText = outputBox.innerText; // Get plain text from the contenteditable div
    const model = modelSelect.value; // Use the same model for consistency, or choose another
    const temperature = 0.5; // Lower temperature for more focused summary

    if (!translatedText.trim()) {
        updateStatus('Nothing to summarize.', CONSTANTS.STATUS_TYPES.INFO);
        console.warn('[Summary] No text to summarize.');
        return;
    }
    console.log(`[Summary] Generating summary using model: ${model}, Temp: ${temperature}`);

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
        console.info('[Summary] Summary generation successful.');
    } catch (error) {
        console.error('[Summary] Summary error:', error);
        summaryBox.value = `Error generating summary: ${error.message}`;
        updateStatus('Error generating summary: ' + error.message, CONSTANTS.STATUS_TYPES.ERROR);
    } finally {
        generateSummaryBtn.disabled = false; // Re-enable button
        console.log('[Summary] Summary generation finished (finally block).');
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
            stream: stream,
            max_tokens: 8000 // Set max_tokens for DeepSeek
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

    console.log('[Stream] Starting to process streaming response');

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            console.log('[Stream] Stream completed');
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
                                // console.log('[Stream] Received chunk:', textChunk); // Can be too spammy
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
        console.log(`[API] Request to ${apiUrl} for model ${model} returned status: ${response.status}`);

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
    let errorData;
    let errorMessage;
    try {
        errorData = await response.json();
        errorMessage = errorData?.error?.message || errorData?.detail || response.statusText || 'Unknown API error';
    } catch (e) {
        // If parsing JSON fails, use the raw text
        const rawText = await response.text().catch(() => response.statusText); // Fallback for text() error
        errorMessage = rawText || response.statusText || 'Unknown error and failed to get details';
        updateStatus(`API Error (${response.status}) with ${modelName} model. Response: ${errorMessage}`, CONSTANTS.STATUS_TYPES.ERROR, 10000);
        console.error(`API Error (${response.status}) with ${modelName} model. Raw response:`, rawText);
        throw new Error(`API Error (${response.status}) with ${modelName} model: ${errorMessage}`); // Throw after logging
    }
    
    updateStatus(`API Error (${response.status}) with ${modelName} model: ${errorMessage}`, CONSTANTS.STATUS_TYPES.ERROR, 10000);
    console.error('API Error Data:', errorData);
    throw new Error(`API Error (${response.status}) with ${modelName} model: ${errorMessage}`); // Ensure an error is thrown
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
            console.log(`[ClearField] Cleared ${elementId} and removed ${storageKey} from localStorage.`);
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
function clearContextualFields() { // Renamed function
    console.info('[ClearContextual] Clearing prompt, fandom, and notes fields.');
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
    // Corrected console log to match the function name
    console.log('[ClearContextual] Prompt, Fandom, Notes fields cleared and prompt reset to default.'); 

    updateStatus('Prompt, Fandom, and Notes fields cleared.', CONSTANTS.STATUS_TYPES.INFO);
}

function handleResetAllApplicationData() {
    console.warn('[ResetAllApp] User initiated full application data reset.');
    if (confirm('Are you sure you want to reset ALL application data? This includes text, settings, and API keys.')) {
        console.log('[ResetAllApp] User confirmed full reset.');
        // Clear all known local storage items for this app
        for (const key in CONSTANTS.LOCAL_STORAGE_KEYS) {
            if (CONSTANTS.LOCAL_STORAGE_KEYS.hasOwnProperty(key)) {
                localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS[key]);
                console.log(`[ResetAllApp] Removed ${CONSTANTS.LOCAL_STORAGE_KEYS[key]} from localStorage.`);
            }
        }

        // Also clear API keys from memory
        groqApiKey = '';
        deepseekApiKey = '';

        // Reload the page to apply defaults and clear state thoroughly
        updateStatus('Application data reset. Reloading page...', CONSTANTS.STATUS_TYPES.SUCCESS, 2000);
        console.log('[ResetAllApp] Reloading page to apply reset.');
        setTimeout(() => {
            window.location.reload();
        }, 2000); // Give user time to see the status message
    } else {
        console.info('[ResetAllApp] Full application data reset cancelled by user.');
        updateStatus('Application reset cancelled.', CONSTANTS.STATUS_TYPES.INFO);
    }
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
        console.error('[ZIP] JSZip is not defined. Make sure the library is included in index.html.');
        return;
    }
    console.info('[ZIP] Initiating save all as ZIP...');

    try {
        const zip = new JSZip();
        zip.file("source_text.txt", translationBox.value);
        zip.file("prompt_template.txt", promptBox.value);
        zip.file("fandom_context.txt", fandomBox.value);
        zip.file("notes.txt", notesBox.value);
        zip.file("translated_output.txt", outputBox.innerText); // Changed from outputBox.value
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
                console.info('[ZIP] Successfully generated and downloaded ZIP file.');
            })
            .catch(err => {
                console.error("[ZIP] Error generating ZIP blob:", err);
                updateStatus('Error generating ZIP file.', CONSTANTS.STATUS_TYPES.ERROR);
            });
    } catch (err) {
        console.error("[ZIP] Error creating ZIP object:", err);
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
        // Avoid logging the actual value for potentially large content like promptContent or translationContent
        if (key === CONSTANTS.LOCAL_STORAGE_KEYS.GROQ_API_KEY || key === CONSTANTS.LOCAL_STORAGE_KEYS.DEEPSEEK_API_KEY) {
            console.log(`[LocalStorage] Saved ${key}: (API key - value not logged)`);
        } else if (valueToStore && valueToStore.length > 100) { // Heuristic for large content
            console.log(`[LocalStorage] Saved ${key}: (large content - value not logged, length: ${valueToStore.length})`);
        } else {
            console.log(`[LocalStorage] Saved ${key}: ${valueToStore}`);
        }
    } catch (e) {
        console.error(`[LocalStorage] Error saving ${key} to localStorage:`, e);
        updateStatus('Warning: Could not save data to local storage. It might be full.', CONSTANTS.STATUS_TYPES.WARNING);
    }
}

function loadFromLocalStorage() {
    console.info('[LocalStorage] Starting to load data from local storage.');
    document.body.classList.add('dark-mode');

    let loadedGroqKey = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.GROQ_API_KEY) || ''; 
    let loadedDeepSeekKey = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.DEEPSEEK_API_KEY) || '';
    groqApiKey = loadedGroqKey;
    deepseekApiKey = loadedDeepSeekKey;
    console.log('[LocalStorage] API Keys loaded (values not displayed).');

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
            console.log('[APIKeys] API keys saved via modal.');
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

    const savedInterChunkSummaryEnabled = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.INTER_CHUNK_SUMMARY_ENABLED);
    const interChunkSummaryToggle = document.getElementById('inter-chunk-summary-toggle');
    if (interChunkSummaryToggle) interChunkSummaryToggle.checked = savedInterChunkSummaryEnabled === 'true'; // Default to false if not found

    const savedSourceLang = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.SOURCE_LANGUAGE);
    if (sourceLanguageInput) {
        sourceLanguageInput.value = savedSourceLang || CONSTANTS.DEFAULT_VALUES.SOURCE_LANGUAGE;
    }

    const savedTemperature = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.TEMPERATURE);
    if (temperatureSlider) {
        temperatureSlider.value = savedTemperature || CONSTANTS.DEFAULT_VALUES.TEMPERATURE;
    }
    handleTemperatureChange(); // This will also log the temperature change
    updatePricingDisplay();
    console.info('[LocalStorage] Finished loading data from local storage.');
    updateStatus('Loaded previous session from local storage.', CONSTANTS.STATUS_TYPES.INFO, CONSTANTS.TIMEOUTS.STATUS_LOADED_SESSION);
    
    // Initial word counts after loading from local storage
    if (translationBox && document.getElementById('input-word-count')) {
        updateWordCount(translationBox, document.getElementById('input-word-count'));
    }
    if (outputBox && document.getElementById('output-word-count')) {
        updateWordCount(outputBox, document.getElementById('output-word-count'));
    }
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
// Ensure fandomBox is part of this array for debounced auto-save
const textAreasForAutoSave = [translationBox, promptBox, notesBox, fandomBox]; 
let saveTimeout;

// Map textareas to their storage keys for auto-save
const textAreaStorageMap = {
    'translation-box': CONSTANTS.LOCAL_STORAGE_KEYS.TRANSLATION_CONTENT,
    'prompt-box': CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT,
    'notes-box': CONSTANTS.LOCAL_STORAGE_KEYS.NOTES_CONTENT,
    'fandom-box': CONSTANTS.LOCAL_STORAGE_KEYS.FANDOM_CONTENT 
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

// The redundant saveFandomContent() function was removed in a previous step.

// --- Prompt Template Management Functions ---
function getSavedPrompts() {
    const promptsJson = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.SAVED_PROMPTS);
    return promptsJson ? JSON.parse(promptsJson) : {};
}

function savePromptsToStorage(prompts) {
    localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(prompts));
}

function loadSavedPromptTemplatesToSelect() {
    if (!savedPromptsSelect) return;
    const savedPrompts = getSavedPrompts();
    savedPromptsSelect.innerHTML = '<option value="">-- Select a saved prompt --</option>'; // Clear existing options but keep placeholder

    for (const name in savedPrompts) {
        if (savedPrompts.hasOwnProperty(name)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            savedPromptsSelect.appendChild(option);
        }
    }
}

function handleSavePromptAs() {
    const name = promptTemplateNameInput.value.trim();
    if (!name) {
        updateStatus('Please enter a name for the prompt template.', CONSTANTS.STATUS_TYPES.WARNING);
        promptTemplateNameInput.focus();
        console.warn('[PromptTemplate] Save failed: No name provided.');
        return;
    }
    if (!promptBox) return;
    const templateContent = promptBox.value;
    if (!templateContent.trim()) {
        updateStatus('Prompt content cannot be empty.', CONSTANTS.STATUS_TYPES.WARNING);
        promptBox.focus();
        console.warn('[PromptTemplate] Save failed: Prompt content empty.');
        return;
    }

    const savedPrompts = getSavedPrompts();
    if (savedPrompts[name]) {
        if (!confirm(`A prompt named '${name}' already exists. Overwrite it?`)) {
            console.log('[PromptTemplate] Overwrite of prompt declined by user.');
            return;
        }
        console.log(`[PromptTemplate] User confirmed overwrite for prompt: '${name}'.`);
    }

    savedPrompts[name] = templateContent;
    savePromptsToStorage(savedPrompts);
    loadSavedPromptTemplatesToSelect(); // Refresh dropdown
    promptTemplateNameInput.value = ''; // Clear name input
    updateStatus(`Prompt template '${name}' saved.`, CONSTANTS.STATUS_TYPES.SUCCESS);
    console.info(`[PromptTemplate] Prompt template '${name}' saved successfully.`);
}

function handleLoadSelectedPrompt() {
    if (!savedPromptsSelect || !promptBox) return;
    const selectedName = savedPromptsSelect.value;
    if (!selectedName) {
        updateStatus('Please select a prompt template to load.', CONSTANTS.STATUS_TYPES.INFO);
        console.log('[PromptTemplate] Load failed: No prompt selected from dropdown.');
        return;
    }

    const savedPrompts = getSavedPrompts();
    if (savedPrompts[selectedName]) {
        promptBox.value = savedPrompts[selectedName];
        // Optionally, also save this loaded prompt as the current active prompt in localStorage
        saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, savedPrompts[selectedName]);
        updateStatus(`Prompt template '${selectedName}' loaded.`, CONSTANTS.STATUS_TYPES.SUCCESS);
        console.info(`[PromptTemplate] Prompt template '${selectedName}' loaded successfully.`);
    } else {
        updateStatus(`Error: Prompt template '${selectedName}' not found.`, CONSTANTS.STATUS_TYPES.ERROR);
        console.error(`[PromptTemplate] Error loading prompt: Template '${selectedName}' not found in storage.`);
    }
}

function handleDeleteSelectedPrompt() {
    if (!savedPromptsSelect) return;
    const selectedName = savedPromptsSelect.value;
    if (!selectedName) {
        updateStatus('Please select a prompt template to delete.', CONSTANTS.STATUS_TYPES.INFO);
        console.log('[PromptTemplate] Delete failed: No prompt selected from dropdown.');
        return;
        }

    if (!confirm(`Are you sure you want to delete the prompt template '${selectedName}\'?`)) {
        console.log('[PromptTemplate] Deletion of prompt declined by user.');
        return;
    }
    console.log(`[PromptTemplate] User confirmed deletion for prompt: '${selectedName}'.`);

    const savedPrompts = getSavedPrompts();
    if (savedPrompts[selectedName]) {
        const deletedPromptContent = savedPrompts[selectedName]; // Store before deleting for comparison
        delete savedPrompts[selectedName];
        savePromptsToStorage(savedPrompts);
        loadSavedPromptTemplatesToSelect(); // Refresh dropdown
        if (promptBox.value === deletedPromptContent) { // If the deleted prompt was in the textarea
            console.log('[PromptTemplate] Deleted prompt was active in textarea, resetting to default.');
            promptBox.value = defaultPromptTemplate; // Reset to default or clear
            saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.PROMPT_CONTENT, promptBox.value);
        }
        updateStatus(`Prompt template '${selectedName}' deleted.`, CONSTANTS.STATUS_TYPES.SUCCESS);
        console.info(`[PromptTemplate] Prompt template '${selectedName}' deleted successfully.`);
    } else {
        updateStatus(`Error: Prompt template '${selectedName}' not found for deletion.`, CONSTANTS.STATUS_TYPES.ERROR);
        console.error(`[PromptTemplate] Error deleting prompt: Template '${selectedName}' not found in storage.`);
    }
}

// --- End of Prompt Template Management Functions ---

// Event listener for the inter-chunk summary toggle (assuming it exists in HTML)
const interChunkSummaryToggleElement = document.getElementById('inter-chunk-summary-toggle');
if (interChunkSummaryToggleElement) {
    interChunkSummaryToggleElement.addEventListener('change', () => {
        saveToLocalStorage(CONSTANTS.LOCAL_STORAGE_KEYS.INTER_CHUNK_SUMMARY_ENABLED, interChunkSummaryToggleElement.checked);
    });
}
