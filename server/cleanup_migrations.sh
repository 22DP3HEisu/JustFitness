#!/bin/bash

# Script to clean up migration files and run proper migrations
# Run this from the server directory of your JustFitness project

echo "Creating backup of old migration files..."
mkdir -p database/migrations_backup
cp database/migrations/2025_*.php database/migrations_backup/ 2>/dev/null

echo "Removing future-dated migration files..."
rm database/migrations/2025_*.php 2>/dev/null

echo "Migration files have been cleaned up."
echo "You can now run the migrations with:"
echo "php artisan migrate:fresh --seed"
