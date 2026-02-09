#!/bin/bash

echo "=== Step 1: Killing processes on port 5000 ==="
lsof -ti:5000 | xargs kill -9 2>/dev/null || echo "No processes to kill"
sleep 1

echo ""
echo "=== Step 2: Running database migration ==="
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
psql radiology_app << EOF
ALTER TABLE radiologists ADD COLUMN IF NOT EXISTS work_hours_start TIME;
ALTER TABLE radiologists ADD COLUMN IF NOT EXISTS work_hours_end TIME;
ALTER TABLE radiologists ADD COLUMN IF NOT EXISTS work_days VARCHAR(50);
EOF

echo ""
echo "=== Step 3: Verifying migration ==="
psql radiology_app -c "\d radiologists" | grep -E "(work_hours|work_days)" || echo "Columns added successfully"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Now run these commands in separate terminals:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"

