import os
import subprocess
import sys

# Path to the tokenizer server
TOKENIZER_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "deepseek_v3_tokenizer")
SERVER_SCRIPT = os.path.join(TOKENIZER_DIR, "tokenizer_server.py")

def main():
    print("Starting DeepSeek Tokenizer Server...")
    print(f"Server location: {SERVER_SCRIPT}")
    
    try:
        # Change to the tokenizer directory
        os.chdir(TOKENIZER_DIR)
        print(f"Changed directory to: {os.getcwd()}")
        
        # Check if requirements are installed
        try:
            import flask
            import flask_cors
            import transformers
            import torch
            print("All required dependencies are installed.")
        except ImportError as e:
            print(f"Missing dependency: {e}")
            install = input("Would you like to install required dependencies? (y/n): ")
            if install.lower() == 'y':
                print("Installing dependencies...")
                subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
                print("Dependencies installed successfully.")
            else:
                print("Skipping dependency installation. Server may not work correctly.")
        
        # Run the server
        print("\nStarting server. Press Ctrl+C to stop.")
        subprocess.call([sys.executable, SERVER_SCRIPT])
        
    except Exception as e:
        print(f"Error starting server: {e}")
        return 1
        
    return 0

if __name__ == "__main__":
    sys.exit(main()) 