#!/usr/bin/env bash
set -e

if [ -d "backend" ]; then
    cd backend
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
