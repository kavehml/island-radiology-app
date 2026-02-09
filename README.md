# Island Radiology Queue Management System

A comprehensive radiology queue management application for managing multiple hospital sites, radiologist schedules, patient orders, and optimizing workload distribution.

## Features

- **Multi-Site Management**: Manage multiple hospital sites with their facilities and equipment
- **Facility Tracking**: Track equipment (CT, MRI, Ultrasound, PET, X-Ray) at each site
- **Radiologist Scheduling**: Calendar system for scheduling radiologists across sites
- **Order Management**: Create and manage imaging orders with priority ranking, specialty requirements, and time sensitivity
- **Patient Routing**: Intelligent routing system that assigns orders to optimal sites based on:
  - Equipment availability
  - Radiologist availability and specialty match
  - Current workload
  - Priority and time sensitivity
  - Geographic preferences
- **Vacation Optimization**: Optimize radiologist assignments to balance workload across sites
- **Order Combination**: Identify and combine multiple orders for the same patient to reduce hospital visits
- **Time Estimates**: Track average time for performing and reading scans

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL client)

### Frontend
- React
- React Router
- Axios
- React Calendar
- Vite

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb radiology_app
```

2. Run the schema:
```bash
psql radiology_app < database/schema.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=radiology_app
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Sites
- `GET /api/sites` - Get all sites
- `GET /api/sites/:id` - Get site by ID
- `POST /api/sites` - Create new site
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site

### Facilities
- `GET /api/facilities/site/:siteId` - Get facilities for a site
- `POST /api/facilities` - Update facility (creates if doesn't exist)

### Radiologists
- `GET /api/radiologists` - Get all radiologists
- `GET /api/radiologists/:id` - Get radiologist by ID
- `POST /api/radiologists` - Create new radiologist
- `POST /api/radiologists/assign-site` - Assign radiologist to site
- `POST /api/radiologists/specialty` - Add specialty to radiologist

### Schedules
- `GET /api/schedules` - Get schedules (requires startDate, endDate query params)
- `POST /api/schedules` - Create schedule
- `GET /api/schedules/radiologist/:radiologistId` - Get schedules for a radiologist

### Orders
- `GET /api/orders` - Get all orders (supports filtering: status, orderType, priorityMin, timeSensitive, specialty)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `POST /api/orders/:id/route` - Route order to optimal site
- `POST /api/orders/route/all` - Auto-route all pending orders
- `POST /api/orders/route/time-sensitive` - Route time-sensitive orders

### Optimization
- `POST /api/optimization/vacation` - Optimize workload distribution
- `GET /api/optimization/combinable-orders` - Find combinable orders
- `POST /api/optimization/combine-orders` - Combine multiple orders

### Time Estimates
- `GET /api/time-estimates/radiologist/:radiologistId` - Get time estimates for radiologist
- `POST /api/time-estimates` - Create/update time estimate
- `GET /api/time-estimates/average/:scanType` - Get average times for scan type

## Usage

### Creating a Site
1. Navigate to the Sites page
2. Click "Add New Site"
3. Enter site name and address
4. Click "Create Site"

### Adding Facilities
1. Select a site from the list
2. Click "Edit Facilities"
3. Enter quantities for each equipment type
4. Click "Save"

### Creating an Order
1. Navigate to the Orders page
2. Click "Create New Order"
3. Fill in patient information
4. Select order type, priority, and specialty requirements
5. Mark as time-sensitive if needed
6. Enable auto-routing to automatically assign to optimal site
7. Click "Create Order"

### Routing Orders
- Orders can be automatically routed when created (if auto-route is enabled)
- Manual routing: Click "View Details" on an order, then click "Route to Optimal Site"
- The system considers multiple factors to find the best site

### Optimizing Workload
1. Navigate to the Optimization page
2. Set date range for optimization
3. Click "Optimize Workload"
4. Review recommendations for radiologist reassignments

### Combining Orders
1. Navigate to the Optimization page
2. Review combinable orders (same patient, same site)
3. Set scheduled date and time
4. Click "Combine These Orders"

## Database Schema

The application uses the following main tables:
- `sites` - Hospital sites
- `facilities` - Equipment at each site
- `radiologists` - Radiologist information
- `radiologist_specialties` - Radiologist specialties
- `schedules` - Radiologist schedules
- `orders` - Imaging orders
- `combined_orders` - Combined orders
- `time_estimates` - Time estimates for scans
- `site_capacity` - Site capacity tracking
- `order_routing_history` - Routing history

## Priority Scoring

Orders are scored on a 1-10 scale:
- STAT: 10
- Urgent: 7
- Routine: 5
- Low: 3
- Time-sensitive orders get +2 bonus (capped at 10)

## Routing Algorithm

The patient routing system scores sites based on:
1. Equipment Availability (0-30 points)
2. Radiologist Availability & Specialty Match (0-25 points)
3. Current Workload (0-20 points) - Lower workload = higher score
4. Priority & Time Sensitivity Match (0-15 points)
5. Geographic/Logistic Considerations (0-10 points)

Total score: 0-100 points. The site with the highest score is selected.

## License

This project is for educational purposes.

