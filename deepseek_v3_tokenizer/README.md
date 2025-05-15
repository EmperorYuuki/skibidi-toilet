# DeepSeek Tokenizer Server

This is a Flask server that provides API endpoints for tokenizing text using the DeepSeek tokenizer. It's designed to work with the Fanfic Translator application for accurate text chunking.

## Setup and Usage

1. **Install the required dependencies:**

```bash
# Navigate to the tokenizer directory
cd deepseek_v3_tokenizer

# Install dependencies
pip install -r requirements.txt
```

2. **Start the server:**

```bash
# Run from within the deepseek_v3_tokenizer folder
python tokenizer_server.py
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

The server provides the following endpoints:

- `/health` (GET): Check if the server is running and the tokenizer is loaded
- `/tokenize` (POST): Count tokens in a given text
- `/chunk` (POST): Split text into chunks based on a maximum token count

## Usage with Fanfic Translator

The Fanfic Translator application connects to this server automatically when translating text with the DeepSeek model. The server must be running on port 5000 for this integration to work.

If the server is not available, the application will fall back to a character-based approximation for chunking, which is less accurate than using the actual tokenizer. 