#!/bin/bash
set -e

# Install npm dependencies
npm install
cd src/web && npm install && cd ../..
cd src/api && npm install && cd ../..

# Install Playwright browsers and system dependencies
npx playwright install-deps
npx playwright install

# Install Aspire orchestrator
curl -sSL https://aspire.dev/install.sh | bash

# Trust HTTPS dev certificates
dotnet dev-certs https --trust

# Install TypeScript language server for Copilot CLI LSP support
npm install -g typescript-language-server

# Install Python docs tooling
pip install mkdocs mkdocs-material
