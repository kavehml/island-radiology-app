# Requisition Submission System

## Overview

The requisition system allows external physicians, office admins, and clinics to submit imaging requisitions to the radiology system without needing full system access. This provides a seamless interface for referring physicians to request imaging studies.

## Features

### 1. **Public Requisition Submission Form**
   - **URL**: `http://localhost:3000/requisition-submit`
   - **Access**: No login required
   - **Features**:
     - Complete patient information form
     - Referring physician details
     - Order details (type, body part, clinical indication)
     - Priority and time sensitivity settings
     - Special instructions and contrast requirements
     - Automatic requisition number generation

### 2. **API Integration** (for external systems)
   - **Endpoint**: `POST /api/requisitions/submit-api`
   - **Authentication**: API Key (X-API-Key header)
   - **Use Case**: EMR systems, clinic management software
   - **Features**:
     - Programmatic submission
     - IP whitelisting (optional)
     - Rate limiting
     - API key management

### 3. **Requisition Management** (Admin/Staff)
   - **URL**: `http://localhost:3000/requisitions`
   - **Access**: Admin and Staff roles only
   - **Features**:
     - View all requisitions
     - Filter by status (pending, approved, rejected, converted)
     - Approve/Reject requisitions
     - Convert approved requisitions to orders
     - Review notes and tracking

## User Workflows

### For External Physicians/Office Admins:

1. **Submit Requisition**:
   - Navigate to `/requisition-submit`
   - Fill out the form with patient and order details
   - Submit (no login required)
   - Receive requisition number for tracking

2. **Track Requisition**:
   - Use requisition number to check status
   - API endpoint: `GET /api/requisitions/track/:requisitionNumber`

### For Admin/Staff:

1. **Review Requisitions**:
   - Navigate to `/requisitions`
   - View pending requisitions
   - Review details and clinical indication

2. **Approve/Reject**:
   - Approve: Requisition moves to "approved" status
   - Reject: Requisition moves to "rejected" with review notes

3. **Convert to Order**:
   - Approved requisitions can be converted to orders
   - Automatically creates an order in the system
   - Links requisition to the created order

## API Endpoints

### Public Endpoints

- `POST /api/requisitions/submit` - Submit requisition (no auth)
- `POST /api/requisitions/submit-api` - Submit with API key
- `GET /api/requisitions/track/:requisitionNumber` - Track requisition status

### Admin/Staff Endpoints

- `GET /api/requisitions` - List all requisitions (filter by status)
- `GET /api/requisitions/:id` - Get requisition details
- `POST /api/requisitions/:id/approve` - Approve requisition
- `POST /api/requisitions/:id/reject` - Reject requisition
- `POST /api/requisitions/:id/convert` - Convert to order

## API Key Management

Admins can create API keys for external systems:

- **Endpoint**: `/api/api-keys`
- **Features**:
  - Generate secure API keys
  - Set organization name and contact
  - IP whitelisting (optional)
  - Rate limiting
  - Expiration dates
  - Deactivate/Delete keys

## Database Schema

### Requisitions Table
- Stores all requisition submissions
- Links to orders when converted
- Tracks submission method (web/api/email)
- Stores review information

### API Keys Table
- Manages API keys for external integrations
- Tracks usage and expiration
- IP whitelisting support

## Example API Usage

### Submit Requisition via API

```bash
curl -X POST http://localhost:5001/api/requisitions/submit-api \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "patientName": "John Doe",
    "referringPhysicianName": "Dr. Smith",
    "orderType": "CT",
    "bodyPart": "Head",
    "clinicalIndication": "Headache evaluation",
    "priority": "routine"
  }'
```

### Track Requisition

```bash
curl http://localhost:5001/api/requisitions/track/REQ-20260208-000001
```

## Integration Options

### Option 1: Public Web Form (Recommended for most users)
- **Best for**: Individual physicians, small clinics
- **Setup**: Just share the URL
- **No technical integration needed**

### Option 2: API Integration
- **Best for**: Large clinics, EMR systems, automated workflows
- **Setup**: Request API key from admin
- **Use**: API endpoints for programmatic submission

### Option 3: Email Integration (Future)
- **Best for**: Legacy systems
- **Setup**: Configure email parsing
- **Status**: Not yet implemented

## Security Considerations

1. **Public Form**: 
   - Rate limiting recommended
   - CAPTCHA for production
   - Input validation and sanitization

2. **API Keys**:
   - IP whitelisting available
   - Rate limiting per key
   - Expiration dates
   - Secure key generation

3. **Data Privacy**:
   - Patient information is protected
   - Access logs maintained
   - Review process ensures quality

## Next Steps

1. Run the database migration (already done)
2. Test the public form at `/requisition-submit`
3. Create API keys for external systems (admin panel)
4. Configure rate limiting and security settings
5. Set up email notifications (optional)

## Benefits

✅ **Easy Access**: No login required for submission
✅ **Professional Interface**: Clean, user-friendly form
✅ **Tracking**: Requisition numbers for status checking
✅ **Integration Ready**: API support for EMR systems
✅ **Workflow Management**: Approve → Convert → Order pipeline
✅ **Audit Trail**: Complete history of submissions and reviews
