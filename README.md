# Fanfic Translator

A web-based tool for translating text, especially fanfiction, using AI language models. It provides a rich interface for customizing translations with different models, prompts, context, and settings.

## Features

*   **Multiple AI Models**: Supports translation using various models from Groq (Grok-3 series) and DeepSeek.
*   **Customizable Prompts**: Users can define and save their own prompt templates for translation.
*   **Chunking System**: Automatically splits large text into smaller chunks for translation, ensuring high quality outputs even for massive texts.
*   **Contextual Translation**:
    *   **Fandom Context**: Add fandom-specific terminology and nuances.
    *   **Notes & Instructions**: Provide specific instructions or stylistic notes for the translator.
    *   **Chapter Summaries**: (Implied by prompt template) Can include summaries of previous content for better continuity.
*   **Source & Target Languages**: Specify source language (default: Chinese) and target language (fixed: English).
*   **Temperature Control**: Adjust the creativity/temperature of the AI model.
*   **Streaming Responses**: Option to see translation results as they are generated.
*   **API Key Management**: Securely store and manage API keys for Groq and DeepSeek within the browser's local storage.
*   **Text Areas**:
    *   Input for source text with word/character count.
    *   Output for translated text with word/character count.
    *   Dedicated areas for prompt templates, notes, and fandom context.
*   **Output Management**:
    *   Copy translated text.
    *   Save translated text as a `.txt` file.
    *   Generate a summary of the translated text.
    *   Clear input, output, notes, and fandom context fields.
*   **Persistent Storage**: Saves text content (source, prompt, notes, fandom, output), selected model, language, temperature, and API keys to the browser's local storage.
*   **Export & Reset**:
    *   **Export All Settings**: Download a ZIP file containing all text inputs, settings, and API keys (for backup or transfer).
    *   **Reset All**: Clear all stored data and reset to default settings.
*   **User Interface**:
    *   Modern dark theme.
    *   Responsive design for various screen sizes.
    *   Status messages for user feedback.
    *   Model pricing information display (example data).

## How to Use

1.  **Open `index.html`**: Launch the `index.html` file in a modern web browser.
2.  **Configure API Keys**:
    *   Click the "API Keys" button (or "Configure API Keys").
    *   Enter your API keys for Groq and/or DeepSeek in the modal that appears.
    *   Click "Save API Keys". These are stored locally in your browser.
3.  **Select Translation Model**: Choose your preferred AI model from the dropdown.
4.  **Set Languages**:
    *   Enter the "Source Language" (e.g., Japanese, Korean).
    *   The "Target Language" is fixed as English.
5.  **Adjust Temperature**: Use the slider to set the desired creativity level. Lower values are more deterministic, higher values are more creative.
6.  **Customize (Optional)**:
    *   Edit the **Prompt Template** to guide the AI's translation style.
    *   Add **Fandom Context** for specific terms or lore.
    *   Input **Notes & Instructions** for the AI.
7.  **Enter Source Text**: Paste or type the text you want to translate into the "Source Text" area.
8.  **Translate**: Click the "Translate" button.
9.  **View Output**: The translated text will appear in the "Translated Text" area.
    *   If "Enable Streaming Response" is checked, the text will appear token by token.
10. **Manage Output**:
    *   Use "Copy" to copy the translation.
    *   Use "Save" to download it as a `.txt` file.
    *   Use "Generate Summary" to create a summary of the translation.
11. **Save Work**: Most text fields and settings are auto-saved to local storage. You can also use the "Save" buttons for individual text areas or "Export All Settings" to download a backup.

## Project Structure

*   `index.html`: The main HTML file for the user interface.
*   `script.js`: Contains the JavaScript logic for handling user interactions, API calls, local storage, and other functionalities.
*   `styles.css`: Defines the styling and theme for the application.
*   `README.md`: This file.

## Technical Details

*   **Frontend**: HTML, CSS, JavaScript
*   **APIs**: GroqCloud, DeepSeek API
*   **Libraries**:
    *   Font Awesome (for icons)
    *   Google Fonts (Inter)
    *   JSZip (for exporting settings)
*   **Local Storage**: Used extensively to save user preferences, API keys, and text content directly in the browser. This means your data stays on your machine unless you export it.

## Setup for Local Development

1.  Clone or download the project files.
2.  Ensure you have valid API keys for Groq and/or DeepSeek if you intend to use the translation features.
3.  Open `index.html` in your web browser. No build step or local server is strictly required for basic operation, as it's a client-side application. However, some browser security features related to `file://` URLs might affect certain functionalities (like API calls if they are restricted by CORS policies in such a setup, though usually this is fine for client-side API calls where the server has permissive CORS). For full compatibility, serving it via a simple local HTTP server is recommended:
    ```bash
    # If you have Python 3
    python -m http.server

    # Or if you have Node.js and npx
    npx serve
    ```
    Then navigate to the local server address (e.g., `http://localhost:8000`).

4.  **Optional but Recommended: Start the Tokenizer Server** (for accurate DeepSeek chunking):
    If you're using DeepSeek models and need precise text chunking for large documents, start the tokenizer server:
    ```bash
    # Run the tokenizer server startup script
    python start_tokenizer_server.py
    ```
    This requires Python with the dependencies listed in `deepseek_v3_tokenizer/requirements.txt`. The script will help you install these if needed.

## Batch Processing and Chunking

For large texts, the application automatically breaks content into manageable chunks:

* **Groq Models**: Splits text into ~22,000 word chunks
* **DeepSeek Models**: Uses the tokenizer server to create 6,000 token chunks

This chunking happens transparently to the user. If the tokenizer server isn't running for DeepSeek models, a character-based approximation is used as a fallback.

## Disclaimer

*   API pricing information displayed in the app is based on example data and may not be up-to-date. Always refer to the official Groq and DeepSeek websites for current pricing.
*   API keys are stored in your browser's local storage. While this is convenient for a local tool, be mindful of the security implications if using a shared computer.