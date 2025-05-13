// Chunker.js - Text chunking visualization tool

document.addEventListener('DOMContentLoaded', () => {
    const modelSelect = document.getElementById('model-select');
    const customLimitInput = document.getElementById('custom-limit');
    const chunkBtn = document.getElementById('chunk-btn');
    const sourceText = document.getElementById('source-text');
    const resultsDiv = document.getElementById('results');
    const statsDiv = document.getElementById('stats');
    const loadingDiv = document.getElementById('loading');
    const tokenizerStatusDiv = document.getElementById('tokenizer-status');
    
    // Default chunk sizes
    const DEFAULT_GROK_TOKENS = 22000; // For Grok models
    const DEFAULT_DEEPSEEK_TOKENS = 6000; // For DeepSeek models
    const TOKENIZER_SERVER_URL = getTokenizerUrl(); // Dynamically get the tokenizer URL
    
    // Function to get the tokenizer URL from config or default to localhost
    function getTokenizerUrl() {
        try {
            // Try to fetch from tunnel_config.json first
            const tunnelConfigUrl = '../tunnel_config.json';
            const cachedConfigKey = 'tokenizer_tunnel_url';
            const cachedUrl = localStorage.getItem(cachedConfigKey);
            
            // First check if we have a cached URL
            if (cachedUrl) {
                console.log(`[Chunker] Using cached tokenizer tunnel URL: ${cachedUrl}`);
                // We'll still try to fetch the latest in the background
                fetch(tunnelConfigUrl)
                    .then(response => response.json())
                    .then(config => {
                        if (config && config.tokenizer_url) {
                            console.log(`[Chunker] Updated tokenizer tunnel URL: ${config.tokenizer_url}`);
                            localStorage.setItem(cachedConfigKey, config.tokenizer_url);
                        }
                    })
                    .catch(err => console.warn(`[Chunker] Could not fetch latest tunnel config: ${err.message}`));
                return cachedUrl;
            }
            
            // If no cached URL, check for a tunneled URL synchronously using a fake XHR
            const xhr = new XMLHttpRequest();
            xhr.open('GET', tunnelConfigUrl, false); // Synchronous request
            xhr.send(null);
            
            if (xhr.status === 200) {
                const config = JSON.parse(xhr.responseText);
                if (config && config.tokenizer_url) {
                    console.log(`[Chunker] Using tokenizer tunnel URL: ${config.tokenizer_url}`);
                    localStorage.setItem(cachedConfigKey, config.tokenizer_url);
                    return config.tokenizer_url;
                }
            }
        } catch (error) {
            console.warn(`[Chunker] Error getting tokenizer URL: ${error.message}`);
        }
        
        // Default to localhost if no tunneled URL found
        console.log('[Chunker] Using default localhost tokenizer URL');
        return 'http://localhost:5000';
    }
    
    // Check tokenizer server status on page load
    checkTokenizerStatus();
    
    // Helper function to count words, more accurately for CJK-like languages
    function getWordCount(text) {
        if (!text) return 0;
        // Simple heuristic: if text contains Chinese characters, or generally lacks spaces,
        // count characters as words. Otherwise, split by space.
        // A more robust solution might involve proper language detection.
        const chineseRegex = /[\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/; // Basic CJK, Full-width punctuation
        const hasChinese = chineseRegex.test(text);
        const hasSpaces = /\s/.test(text.trim());

        if (hasChinese && !hasSpaces) { // Primarily Chinese text without many spaces
            return text.replace(/\s+/g, '').length; // Count non-whitespace characters
        } else if (hasChinese && hasSpaces) {
             // Mixed content or Chinese with spaces, could be titles or specific formatting
             // A mixed approach: count segments separated by spaces, and for segments without spaces, count chars.
             // For now, let's stick to character count if Chinese is present, assuming it's dominant.
             // Or, a more complex approach: split by space, then for each part, if it has no further spaces and has Chinese, count its chars.
             // For simplicity here, if Chinese chars are present, we lean towards character counting as a proxy.
            return text.length; // Fallback to char count if CJK detected, as space splitting is unreliable
        }
        return text.trim().split(/\s+/).length; // Default for space-separated languages
    }
    
    // Set up event listeners
    chunkBtn.addEventListener('click', handleChunkText);
    
    // Function to check if the DeepSeek tokenizer server is running
    async function checkTokenizerStatus() {
        try {
            const response = await fetch(`${TOKENIZER_SERVER_URL}/health`, {
                method: 'GET'
            });
            
            if (response.ok) {
                tokenizerStatusDiv.classList.remove('disconnected');
                tokenizerStatusDiv.classList.add('connected');
                tokenizerStatusDiv.textContent = 'DeepSeek Tokenizer Server: Connected';
            } else {
                setTokenizerDisconnected();
            }
        } catch (error) {
            setTokenizerDisconnected();
        }
    }
    
    function setTokenizerDisconnected() {
        tokenizerStatusDiv.classList.remove('connected');
        tokenizerStatusDiv.classList.add('disconnected');
        tokenizerStatusDiv.textContent = 'DeepSeek Tokenizer Server: Not Connected (will fallback to character-based chunking)';
    }
    
    // Main function to handle text chunking
    async function handleChunkText() {
        const text = sourceText.value.trim();
        if (!text) {
            alert('Please enter some text to chunk.');
            return;
        }
        
        const selectedModel = modelSelect.value;
        const customLimit = customLimitInput.value ? parseInt(customLimitInput.value) : null;
        
        // Show loading indicator
        loadingDiv.style.display = 'block';
        resultsDiv.innerHTML = '';
        statsDiv.style.display = 'none';
        
        try {
            // Create chunks based on selected model
            const chunks = await createTextChunks(text, selectedModel, customLimit);
            
            // Display chunks
            displayChunks(chunks, selectedModel);
            
            // Display statistics
            displayStats(text, chunks, selectedModel);
        } catch (error) {
            console.error('Error chunking text:', error);
            resultsDiv.innerHTML = `<div class="chunk">
                <div class="chunk-header">Error</div>
                <p>An error occurred while chunking the text: ${error.message}</p>
            </div>`;
        } finally {
            // Hide loading indicator
            loadingDiv.style.display = 'none';
        }
    }
    
    // Function to create text chunks based on model type
    async function createTextChunks(text, modelType, customLimit) {
        // Split by double newlines to respect paragraph boundaries
        const paragraphs = text.split(/\n\s*\n/);
        let chunks = [];
        let currentChunk = '';

        let maxTokens;
        if (modelType === 'grok') {
            maxTokens = customLimit || DEFAULT_GROK_TOKENS;
        } else if (modelType === 'deepseek') {
            maxTokens = customLimit || DEFAULT_DEEPSEEK_TOKENS;
        } else {
            console.error('Unknown model type for chunking:', modelType);
            // Fallback to returning the whole text as one chunk if model type is unknown
            return [text.trim()].filter(chunk => chunk.length > 0);
        }

        try {
            // Attempt to use the tokenizer server for chunking
            console.log(`[Chunker] Attempting to use tokenizer server for ${modelType} model with max_tokens: ${maxTokens}`);
            console.log(`[Chunker] Using tokenizer URL: ${TOKENIZER_SERVER_URL}`);
            const healthResponse = await fetch(`${TOKENIZER_SERVER_URL}/health`, { method: 'GET' });
            if (!healthResponse.ok) {
                throw new Error('Tokenizer server not available or health check failed');
            }

            const chunkResponse = await fetch(`${TOKENIZER_SERVER_URL}/chunk`, {
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
            chunks = chunkData.chunks;
            
            // Debug server response
            console.log("[Chunker] Server response:", chunkData);
            console.log(`[Chunker] Received ${chunkData.chunks?.length || 0} chunks from server`);
            if (chunkData.chunks) {
                chunkData.chunks.forEach((chunk, i) => {
                    console.log(`[Chunker] Chunk ${i+1} preview: ${chunk.substring(0, 50)}... (${chunk.length} chars)`);
                });
            }
            
            // Store token counts for statistics
            if (chunkData.chunks && chunkData.chunks.length > 0) {
                if (chunkData.actual_total_tokens_in_chunks !== undefined) {
                    const averageTokensPerChunk = chunkData.actual_total_tokens_in_chunks / chunkData.chunks.length;
                    chunks.tokenCounts = chunkData.chunks.map(() => averageTokensPerChunk);
                } else if (chunkData.total_tokens_of_input !== undefined) { // Fallback to older field if new one isn't there
                    const averageTokensPerChunk = chunkData.total_tokens_of_input / chunkData.chunks.length;
                    chunks.tokenCounts = chunkData.chunks.map(() => averageTokensPerChunk);
                    console.warn('[Chunker] Server response using older \'total_tokens_of_input\'. Consider updating server for \'actual_total_tokens_in_chunks\'.');
                }
            } else {
                 chunks.tokenCounts = []; // No chunks, no token counts
            }

            console.log(`[Chunker] Tokenizer server successfully chunked text for ${modelType}. Chunks: ${chunks.length}`);
            tokenizerStatusDiv.classList.remove('disconnected');
            tokenizerStatusDiv.classList.add('connected');
            tokenizerStatusDiv.textContent = 'DeepSeek Tokenizer Server: Connected';

        } catch (error) {
            console.error(`[Chunker] Tokenizer server error for ${modelType}:`, error.message);
            console.warn(`[Chunker] Falling back to character-based chunking for ${modelType}. This is a rough approximation.`);
            setTokenizerDisconnected(); // Update UI to show server is not used
            
            // Fallback: Use character-based approximation
            const CHARS_PER_TOKEN_ESTIMATE = 4; // General estimate
            const maxCharsFallback = maxTokens * CHARS_PER_TOKEN_ESTIMATE;
            currentChunk = ''; // Reset currentChunk for fallback logic
            chunks = []; // Reset chunks for fallback logic
            let accumulatedCharsInCurrentChunk = 0;

            // Split by one or more newlines to treat lines as paragraphs
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
                if (currentChunk.length > 0) { // If current chunk has content, add paragraph separator
                    currentChunk += '\n\n'; // Use double newline to reconstruct paragraph structure
                    accumulatedCharsInCurrentChunk += 2; // Account for the separator
                }
                currentChunk += pText;
                accumulatedCharsInCurrentChunk += pText.length;
            }

            for (const line of textLines) {
                if (line.trim() === '') { // Empty line signifies a paragraph break
                    if (paragraphBuffer.length > 0) {
                        let currentParagraph = paragraphBuffer.join('\n');
                        paragraphBuffer = [];

                        // Process this paragraph
                        if (accumulatedCharsInCurrentChunk + currentParagraph.length + (currentChunk.length > 0 ? 2 : 0) > maxCharsFallback && accumulatedCharsInCurrentChunk > 0) {
                            finalizeCurrentChunk();
                        }

                        if (currentParagraph.length > maxCharsFallback && accumulatedCharsInCurrentChunk === 0) {
                            // Paragraph itself is too big and chunk is empty
                            let pToSplit = currentParagraph;
                            while (pToSplit.length > 0) {
                                let subP = pToSplit.substring(0, maxCharsFallback);
                                chunks.push(subP.trim()); // Add as a new chunk directly
                                pToSplit = pToSplit.substring(subP.length);
                            }
                        } else if (currentParagraph.length + accumulatedCharsInCurrentChunk + (currentChunk.length > 0 ? 2:0) <= maxCharsFallback) {
                             addParagraphToChunk(currentParagraph);
                        } else {
                             // Paragraph won't fit, finalize current and start new with this one (if it fits alone)
                             finalizeCurrentChunk();
                             if (currentParagraph.length <= maxCharsFallback) {
                                 addParagraphToChunk(currentParagraph);
                             } else { // Still too big, split it
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
            // Process any remaining text in paragraphBuffer
            if (paragraphBuffer.length > 0) {
                let currentParagraph = paragraphBuffer.join('\n');
                // (Repeat paragraph processing logic similar to above for the last paragraph)
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

            finalizeCurrentChunk(); // Add any remaining currentChunk content
            
            console.log(`[Chunker] Fallback created ${chunks.length} chunks based on ~${maxCharsFallback} chars for ${modelType}.`);
        }
        
        // Filter out empty chunks that might result from splitting or trimming
        const finalChunks = chunks.filter(chunk => chunk.trim().length > 0);

        // If all chunks were filtered out but the original text was not empty, return the original text as one chunk.
        if (finalChunks.length === 0 && text.trim().length > 0) {
            return [text.trim()];
        }

        return finalChunks;
    }
    
    // Function to display chunks in the UI
    function displayChunks(chunks, modelType) {
        resultsDiv.innerHTML = '';
        
        chunks.forEach((chunk, index) => {
            const wordCount = getWordCount(chunk);
            const charCount = chunk.length;
            
            const chunkDiv = document.createElement('div');
            chunkDiv.className = 'chunk';
            
            const chunkHeader = document.createElement('div');
            chunkHeader.className = 'chunk-header';
            
            // Display chunk number and counts
            let headerText = `Chunk ${index + 1} of ${chunks.length}`;
            let countText = `${wordCount} words, ${charCount} characters`;
            
            // Add token count if available (for DeepSeek)
            if (modelType === 'deepseek' && chunks.tokenCounts && chunks.tokenCounts[index]) {
                countText += `, ~${Math.round(chunks.tokenCounts[index])} tokens`;
            }
            
            chunkHeader.innerHTML = `<span>${headerText}</span><span>${countText}</span>`;
            chunkDiv.appendChild(chunkHeader);
            
            // Format chunk text with line breaks preserved
            const textContent = document.createElement('div');
            textContent.innerText = chunk;
            chunkDiv.appendChild(textContent);
            
            resultsDiv.appendChild(chunkDiv);
        });
    }
    
    // Function to display statistics
    function displayStats(text, chunks, modelType) {
        if (chunks.length === 0) return;
        
        const totalChars = text.length;
        const totalWords = getWordCount(text);
        const chunkCount = chunks.length;
        
        const avgChunkSize = Math.round(totalChars / chunkCount);
        const avgChunkWords = Math.round(totalWords / chunkCount);
        
        // Update statistics display
        document.getElementById('stat-total-length').textContent = totalChars;
        document.getElementById('stat-total-words').textContent = totalWords;
        document.getElementById('stat-chunk-count').textContent = chunkCount;
        document.getElementById('stat-avg-chunk-size').textContent = avgChunkSize;
        document.getElementById('stat-avg-chunk-words').textContent = avgChunkWords;
        
        // Show token stats if available (DeepSeek)
        const tokensContainer = document.getElementById('stat-tokens-container');
        if (modelType === 'deepseek' && chunks.tokenCounts) {
            const avgTokens = Math.round(chunks.tokenCounts.reduce((sum, count) => sum + count, 0) / chunkCount);
            document.getElementById('stat-avg-tokens').textContent = avgTokens;
            tokensContainer.style.display = 'block';
        } else {
            tokensContainer.style.display = 'none';
        }
        
        statsDiv.style.display = 'block';
    }
}); 