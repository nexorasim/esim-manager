#!/bin/bash

# Set Git credentials
git config --global user.name "NexoraSIM"
git config --global user.email "nexorasim@gmail.com"

# Add remote if not exists
git remote add origin https://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@github.com/nexorasim/esim-manager.git 2>/dev/null || true

# Stage all changes
git add .

# Commit changes
git commit -m "Firebase migration complete - login/register fixed"

# Push to main
git push origin main

echo "Code pushed to GitHub successfully"