#!/bin/bash

# Script to install PostgreSQL and set up the database
# Run this after Homebrew is installed

echo "Installing PostgreSQL..."
brew install postgresql@16

echo "Starting PostgreSQL service..."
brew services start postgresql@16

echo "Adding PostgreSQL to PATH..."
# Detect which Homebrew path to use
if [ -d "/opt/homebrew" ]; then
    BREW_PREFIX="/opt/homebrew"
else
    BREW_PREFIX="/usr/local"
fi

# Add to .zshrc if not already there
if ! grep -q "postgresql@16/bin" ~/.zshrc 2>/dev/null; then
    echo "export PATH=\"$BREW_PREFIX/opt/postgresql@16/bin:\$PATH\"" >> ~/.zshrc
fi

# Export for current session
export PATH="$BREW_PREFIX/opt/postgresql@16/bin:$PATH"

echo "Waiting for PostgreSQL to start..."
sleep 3

echo "Creating database..."
# Use current macOS username as PostgreSQL user (no password needed for local)
createdb radiology_app

echo "Running schema..."
psql radiology_app < database/schema.sql

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "To use PostgreSQL in new terminal sessions, run:"
echo "  source ~/.zshrc"
echo ""
echo "Or restart your terminal."
echo ""
echo "Next steps:"
echo "  1. Start backend: cd backend && npm run dev"
echo "  2. Start frontend: cd frontend && npm run dev"

