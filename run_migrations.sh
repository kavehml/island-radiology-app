#!/bin/bash

# Run database migrations on Railway
# Make sure you're linked to your Railway project first: railway link

echo "Running database migrations on Railway..."
echo ""

echo "Migration 1: Schema..."
railway run psql $DATABASE_URL < database/schema.sql

echo ""
echo "Migration 2: Users table..."
railway run psql $DATABASE_URL < database/migrations/add_users_table.sql

echo ""
echo "Migration 3: Requisitions table..."
railway run psql $DATABASE_URL < database/migrations/add_requisitions_table.sql

echo ""
echo "Migration 4: Assigned site to requisitions..."
railway run psql $DATABASE_URL < database/migrations/add_assigned_site_to_requisitions.sql

echo ""
echo "✅ All migrations completed!"
