#!/bin/bash

# Firebase deployment script
echo "Starting Firebase deployment..."

# Build web application
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

# Deploy to Firebase
firebase deploy --only firestore:rules,functions,hosting

echo "Deployment complete"