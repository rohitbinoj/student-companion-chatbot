#!/usr/bin/env python3
"""
Script to start the FastAPI server with proper configuration
"""
import os
import sys
import subprocess

def main():
    # Get the directory where this script is located
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set up environment variables
    env = os.environ.copy()
    env['PYTHONPATH'] = backend_dir
    
    # Set working directory to backend
    os.chdir(backend_dir)
    
    # Get the virtual environment python path
    venv_python = os.path.join(os.path.dirname(backend_dir), '.venv', 'bin', 'python')
    
    # Start the server
    cmd = [
        venv_python, 
        '-m', 'uvicorn', 
        'app.main:app', 
        '--reload', 
        '--host', '0.0.0.0', 
        '--port', '8001'
    ]
    
    print(f"Starting FastAPI server...")
    print(f"Server will be available at: http://localhost:8001")
    print(f"API documentation at: http://localhost:8001/docs")
    print(f"Press Ctrl+C to stop the server")
    
    try:
        subprocess.run(cmd, env=env, check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
