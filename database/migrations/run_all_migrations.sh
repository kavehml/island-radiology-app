#!/bin/bash
# Script to run all database migrations in order
# Usage: ./run_all_migrations.sh <database_url>

if [ -z "$1" ]; then
    echo "Usage: ./run_all_migrations.sh <database_url>"
    echo "Example: ./run_all_migrations.sh postgresql://user:pass@host:5432/dbname"
    exit 1
fi

DATABASE_URL=$1

echo "Running database migrations..."
echo "Database: $DATABASE_URL"
echo ""

# Run migrations in order
echo "1. Running schema.sql..."
psql "$DATABASE_URL" -f schema.sql

echo "2. Running add_users_table.sql..."
psql "$DATABASE_URL" -f migrations/add_users_table.sql

echo "3. Running add_requisitions_table.sql..."
psql "$DATABASE_URL" -f migrations/add_requisitions_table.sql

echo "4. Running add_assigned_site_to_requisitions.sql..."
psql "$DATABASE_URL" -f migrations/add_assigned_site_to_requisitions.sql

echo ""
echo "All migrations completed successfully!"
