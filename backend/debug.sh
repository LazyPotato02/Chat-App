#!/bin/bash

echo "🐛 Starting Uvicorn in Debug Mode..."
uvicorn backend.asgi:application --host 127.0.0.1 --port 8000 --reload --log-level debug
