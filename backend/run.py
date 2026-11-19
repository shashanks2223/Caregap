import uvicorn
import os
import sys

# Ensure backend directory is in sys.path and is current working directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    print(f"Starting CareGap AI backend server on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
