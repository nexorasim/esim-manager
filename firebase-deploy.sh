#!/bin/bash

echo "Deploying to Firebase nexora-sim project..."

# Install Firebase CLI if not present
if ! command -v firebase &> /dev/null; then
    npm install -g firebase-tools
fi

# Login to Firebase (requires manual authentication)
firebase login

# Set project
firebase use nexora-sim

# Build web app
cd web
npm install
npm run build
npm run export
cd ..

# Build functions
cd functions
npm install
npm run build
cd ..

# Deploy everything
firebase deploy --only firestore:rules,functions,hosting

echo "Deployment to nexora-sim.web.app complete"