import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import transformers

app = Flask(__name__)
# CORS(app)  # Enable Cross-Origin Resource Sharing for local development - We'll make this more specific
CORS(app, resources={r"/*": {"origins": "https://emperoryuuki.github.io"}})

# Load the tokenizer once at startup - since we're now inside the tokenizer directory,
# we can use "." as the path
try:
    tokenizer_dir = "."  # Path is relative to this file in deepseek_v3_tokenizer folder
    tokenizer = transformers.AutoTokenizer.from_pretrained(
        tokenizer_dir, trust_remote_code=True
    )
    print("Tokenizer loaded successfully!")
except Exception as e:
    print(f"Error loading tokenizer: {e}")
    sys.exit(1)

@app.route('/tokenize', methods=['POST'])
def tokenize_text():
    """
    Endpoint to tokenize text and return the token count.
    Request body should be JSON with a 'text' field.
    Returns JSON with 'token_count' field.
    """
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text parameter'}), 400
    
    text = data['text']
    try:
        # Get token IDs from the tokenizer
        token_ids = tokenizer.encode(text)
        token_count = len(token_ids)
        
        return jsonify({
            'token_count': token_count,
            'tokens': token_ids[:10] + ([] if len(token_ids) <= 10 else ['...']) + ([] if len(token_ids) <= 20 else token_ids[-10:])  # Only show first/last 10 tokens for large inputs
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chunk', methods=['POST'])
def chunk_text():
    """
    Endpoint to split text into chunks based on token count.
    Request body should be JSON with:
    - 'text': The text to chunk
    - 'max_tokens': Maximum tokens per chunk
    
    Returns JSON with 'chunks' array field containing the text chunks.
    """
    data = request.json
    if not data or 'text' not in data or 'max_tokens' not in data:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    text_to_chunk = data['text']
    max_tokens_per_chunk = int(data['max_tokens'])
    
    if max_tokens_per_chunk <= 0:
        return jsonify({'error': 'max_tokens must be positive'}), 400

    try:
        # Split by one or more newlines to better respect paragraph-like structures
        # and filter out empty strings that may result from multiple newlines.
        input_paragraphs = [p for p in text_to_chunk.splitlines() if p.strip()]
        
        chunks_list = []
        current_chunk_text_parts = []
        current_chunk_token_count = 0

        for paragraph_str in input_paragraphs:
            paragraph_tokens = tokenizer.encode(paragraph_str, add_special_tokens=False) # No special tokens for internal paragraph tokenization
            
            # Case 1: The paragraph itself is larger than max_tokens_per_chunk
            if len(paragraph_tokens) > max_tokens_per_chunk:
                # Finalize any existing current_chunk_text_parts before processing the large paragraph
                if current_chunk_text_parts:
                    chunks_list.append("\n".join(current_chunk_text_parts).strip())
                    current_chunk_text_parts = []
                    current_chunk_token_count = 0
                
                # Split the large paragraph into smaller, compliant chunks
                idx = 0
                while idx < len(paragraph_tokens):
                    sub_paragraph_token_ids = paragraph_tokens[idx : idx + max_tokens_per_chunk]
                    # Use skip_special_tokens=True for decode if tokenizer adds them by default,
                    # but since we used add_special_tokens=False for encode, it might not be strictly needed.
                    # However, it's safer.
                    decoded_sub_chunk = tokenizer.decode(sub_paragraph_token_ids, skip_special_tokens=True).strip()
                    if decoded_sub_chunk: # Ensure we don't add empty chunks
                        chunks_list.append(decoded_sub_chunk)
                    idx += max_tokens_per_chunk
                continue # Move to the next paragraph in input_paragraphs

            # Case 2: Adding this paragraph would make current_chunk_text_parts exceed max_tokens_per_chunk
            if current_chunk_text_parts and (current_chunk_token_count + len(paragraph_tokens) > max_tokens_per_chunk):
                chunks_list.append("\n".join(current_chunk_text_parts).strip())
                current_chunk_text_parts = [paragraph_str]
                current_chunk_token_count = len(paragraph_tokens)
            else:
                # Case 3: Add this paragraph to current_chunk_text_parts
                current_chunk_text_parts.append(paragraph_str)
                current_chunk_token_count += len(paragraph_tokens)
        
        # Add any remaining part of the last chunk
        if current_chunk_text_parts:
            chunks_list.append("\n".join(current_chunk_text_parts).strip())
            
        # Filter out any empty strings just in case
        chunks_list = [c for c in chunks_list if c]

        # Calculate actual total tokens in the generated chunks for more accuracy
        actual_tokens_in_generated_chunks = sum(len(tokenizer.encode(c, add_special_tokens=False)) for c in chunks_list)

        print(f"Created {len(chunks_list)} chunks with total {actual_tokens_in_generated_chunks} tokens")
        for i, chunk in enumerate(chunks_list):
            chunk_tokens = len(tokenizer.encode(chunk, add_special_tokens=False))
            print(f"Chunk {i+1}: {chunk_tokens} tokens, {len(chunk)} chars")

        return jsonify({
            'chunks': chunks_list,
            'chunk_count': len(chunks_list),
            'max_tokens_setting': max_tokens_per_chunk,
            'actual_total_tokens_in_chunks': actual_tokens_in_generated_chunks 
        })
    except Exception as e:
        app.logger.error(f"Error in /chunk: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the server is running."""
    # Try a simple tokenization to confirm tokenizer is working
    try:
        test_tokens = tokenizer.encode("Test message")
        return jsonify({
            'status': 'healthy', 
            'tokenizer': 'loaded',
            'test_tokenization': len(test_tokens)
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Run the Flask app on port 5000 (default)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 