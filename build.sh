#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

pip install --upgrade pip

if [ -f requirements.txt ]; then
    echo "Installing from ./requirements.txt"
    pip install -r requirements.txt
elif [ -f backend/requirements.txt ]; then
    echo "Installing from ./backend/requirements.txt"
    pip install -r backend/requirements.txt
elif [ -f ../requirements.txt ]; then
    echo "Installing from ../requirements.txt"
    pip install -r ../requirements.txt
fi
