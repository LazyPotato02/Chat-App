#!/bin/bash

echo "🚀 Starting Uvicorn..."
uvicorn backend.asgi:application --host 127.0.0.1 --port 8000 --workers 4
