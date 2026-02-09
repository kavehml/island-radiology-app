# Island Solution for Radiology - Comprehensive Documentation

## Executive Summary

The **Island Solution for Radiology** is an intelligent queue management system designed for hospital networks operating multiple radiology sites. The system automatically routes patient imaging orders to optimal sites, balances radiologist workloads across locations, and optimizes scheduling to maximize efficiency and improve patient care quality.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Problem Statement](#core-problem-statement)
3. [System Architecture](#system-architecture)
4. [Key Features](#key-features)
5. [Intelligent Routing Algorithm](#intelligent-routing-algorithm)
6. [Workflow Examples](#workflow-examples)
7. [Technical Specifications](#technical-specifications)
8. [Benefits and Use Cases](#benefits-and-use-cases)

---

## System Overview

The Island Solution addresses the complex challenge of managing radiology services across multiple hospital sites. In a multi-site healthcare network, patient orders for imaging scans (CT, MRI, X-Ray, Ultrasound, PET) need to be intelligently routed to the most appropriate site based on multiple factors including equipment availability, radiologist expertise, current workload, and patient urgency.

The system provides:
- **Automated patient routing** using a sophisticated scoring algorithm
- **Workload balancing** across multiple sites
- **Radiologist scheduling** and specialty matching
- **Order combination** to reduce patient visits
- **Real-time capacity tracking** and optimization

---

## Core Problem Statement

Hospital networks with multiple radiology sites face several critical challenges:

### 1. **Uneven Workload Distribution**
- Some sites become overloaded while others remain underutilized
- Manual assignment leads to inefficient resource allocation
- Difficult to predict and balance workload across sites

### 2. **Suboptimal Patient Routing**
- Orders may be assigned to sites without appropriate equipment
- Lack of consideration for radiologist availability and specialties
- No systematic approach to matching patient needs with site capabilities

### 3. **Inefficient Scheduling**
- Radiologists may be scheduled at sites with low demand
- Difficulty coordinating schedules across multiple locations
- No optimization for vacation coverage or workload shifts

### 4. **Patient Inconvenience**
- Patients may need multiple visits for different scans
- No system to identify opportunities for combining orders
- Longer wait times due to inefficient routing

### 5. **Specialty Matching Challenges**
- Complex cases requiring specialized radiologists may not be routed correctly
- No systematic way to match order requirements with radiologist expertise
- Difficulty tracking which radiologists have which specialties

### 6. **Urgent Case Management**
- Time-sensitive orders may not be prioritized appropriately
- No automated system to identify and route urgent cases quickly
- Difficulty ensuring urgent cases get to sites with immediate capacity

The Island Solution addresses all these challenges through intelligent automation and optimization algorithms.

---

## System Architecture

### Backend Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Database Client**: pg (PostgreSQL client library)
- **Environment**: dotenv for configuration management

### Frontend Technology Stack

- **Framework**: React
- **Routing**: React Router
- **HTTP Client**: Axios
- **Calendar Component**: React Calendar
- **Build Tool**: Vite

### Database Schema

The system uses a comprehensive PostgreSQL database with the following main tables:

- **sites** - Hospital sites with name and address information
- **facilities** - Equipment inventory at each site (CT, MRI, Ultrasound, PET, X-Ray)
- **radiologists** - Radiologist information including work hours and schedules
- **radiologist_specialties** - Specialty assignments with proficiency levels (1-10 scale)
- **radiologist_sites** - Many-to-many relationship between radiologists and sites
- **schedules** - Calendar entries for radiologist assignments
- **orders** - Patient imaging orders with all relevant metadata
- **combined_orders** - Groups of orders scheduled together
- **combined_order_items** - Individual orders within combined groups
- **time_estimates** - Performance metrics for scan times
- **site_capacity** - Capacity tracking for equipment and scheduling
- **order_routing_history** - Historical routing decisions for analytics

---

## Key Features

### 1. Multi-Site Management

The system maintains comprehensive information about each hospital site:

- **Site Information**: Name, address, and administrative details
- **Equipment Inventory**: Tracks quantities of each equipment type (CT, MRI, Ultrasound, PET, X-Ray) at each site
- **Capacity Tracking**: Monitors booked vs. available slots for each equipment type
- **Workload Metrics**: Real-time tracking of order volume and pending cases per site

**Use Case**: Administrators can view all sites, their equipment, and current capacity at a glance, making it easy to understand the network's capabilities.

### 2. Intelligent Patient Routing

The core feature of the system is its intelligent routing algorithm that automatically assigns each patient order to the optimal site. The algorithm uses a sophisticated scoring system (0-100 points) that evaluates multiple factors:

#### Factor 1: Equipment Availability (0-30 points)

- Verifies that the required equipment type exists at the site
- Evaluates equipment availability over the next 7 days
- Considers current bookings vs. total capacity
- Calculates average availability ratio across the week
- Higher availability = higher score

**Example**: A site with 2 CT scanners and 80% availability over the next week scores higher than a site with 1 CT scanner at 50% capacity.

#### Factor 2: Radiologist Availability & Specialty Match (0-25 points)

- Checks which radiologists are scheduled at the site for the next 7 days
- Matches required specialties (neuroradiology, musculoskeletal, cardiac, pediatric, etc.)
- Specialty match: +15 points
- General radiologist availability: +10 points
- No radiologists scheduled: +5 points (low score)

**Example**: An order requiring a neuroradiologist will score higher at a site with a scheduled neuroradiologist than at a site with only general radiologists.

#### Factor 3: Current Workload (0-20 points)

- Counts pending orders and scheduled orders for the next 7 days
- Lower workload = higher score (inverse relationship)
- Normalized against average workload (~50 orders/week per site)
- Prevents overloading already busy sites

**Example**: A site with 20 pending orders scores higher than a site with 60 pending orders, assuming both have the required equipment.

#### Factor 4: Priority & Time Sensitivity Match (0-15 points)

- Base score: 10 points
- For time-sensitive orders: Checks if site can accommodate urgent cases within 24 hours
  - Can handle urgent: +5 bonus
  - Cannot handle urgent: -5 penalty
- For high-priority orders (score ≥8): Bonus for sites with multiple machines (redundancy): +3 points

**Example**: A STAT order (priority 10) will prefer sites with multiple machines and immediate capacity, ensuring redundancy and faster processing.

#### Factor 5: Geographic/Logistic Considerations (0-10 points)

- If order already has a preferred site (original site_id), gives preference: 8 points
- Other sites receive neutral score: 5 points
- Considers patient convenience and geographic proximity

**Example**: If a patient's physician is at Site A, the system will prefer routing to Site A if it meets other criteria, reducing patient travel.

**Routing Result**: The site with the highest total score is selected. The system provides detailed reasoning for transparency and analytics, logging every routing decision for continuous improvement.

### 3. Order Management

Each imaging order contains comprehensive information:

- **Patient Information**: Patient ID, name
- **Ordering Physician**: Physician name and specialty
- **Order Details**: 
  - Order type (CT, MRI, Ultrasound, PET, X-Ray)
  - Body part
  - Priority level (STAT: 10, Urgent: 7, Routine: 5, Low: 3)
  - Time sensitivity flag and deadline
  - Specialty requirements
- **Status Tracking**: pending, scheduled, completed, cancelled
- **Routing Information**: Assigned site and routing reasoning

**Auto-Routing**: Orders can be automatically routed when created (if auto-route is enabled), or manually routed later by administrators.

**Priority Scoring System**:
- STAT: 10 points
- Urgent: 7 points
- Routine: 5 points
- Low: 3 points
- Time-sensitive orders receive +2 bonus (capped at 10)

### 4. Radiologist Scheduling & Management

The system provides comprehensive radiologist management:

- **Calendar System**: Schedule radiologists across multiple sites with date/time assignments
- **Work Hours Tracking**: Records work hours (start/end time) and work days (e.g., Mon-Fri, Mon-Sat)
- **Specialty Management**: Assign specialties to radiologists with proficiency levels (1-10 scale)
- **Site Assignments**: Radiologists can be assigned to multiple sites
- **Schedule Status**: Tracks scheduled, vacation, and sick status

**Use Case**: When scheduling a radiologist, the system shows their specialties, assigned sites, and current workload, helping administrators make informed scheduling decisions.

### 5. Vacation & Workload Optimization

The Vacation Optimizer balances workload across sites when radiologists take time off:

**How It Works**:
1. Calculates current workload per site (pending + scheduled orders)
2. Calculates workload per radiologist based on their site assignments
3. Identifies overworked sites (>120% of average workload)
4. Identifies underworked sites (<80% of average workload)
5. Generates recommendations to reassign radiologists from underworked to overworked sites
6. Provides detailed analytics on workload distribution

**Output**: The system provides actionable recommendations like:
- "Reassign Dr. Smith from Site C to Site A because Site A is overworked (60 orders) while Site C is underworked (25 orders)"

**Use Case**: When a radiologist takes vacation, the system suggests reassigning other radiologists to maintain balanced workload across all sites.

### 6. Order Combination

The Order Combiner identifies opportunities to reduce patient visits:

**Functionality**:
- Finds pending orders for the same patient at the same site
- Validates that orders can be combined (same site, non-conflicting body parts)
- Allows scheduling multiple scans in a single visit
- Reduces patient trips and improves efficiency

**Example**: A patient needs both a CT scan of the head and an MRI of the spine. Instead of requiring two separate visits, the system identifies these as combinable and schedules them together.

**Benefits**:
- Reduces patient travel time
- Improves patient satisfaction
- Increases operational efficiency
- Reduces scheduling complexity

### 7. Time Estimates Tracking

The system tracks performance metrics:

- **Per-Radiologist Metrics**: Average performance time (scanning) and reading time for each radiologist
- **Scan Type Averages**: Can calculate average times by scan type across all radiologists
- **Capacity Planning**: Helps estimate how many orders can be processed in a given time period

**Use Case**: Administrators can use time estimates to better plan schedules and understand capacity constraints.

---

## Intelligent Routing Algorithm - Detailed Breakdown

### Scoring Methodology

The routing algorithm evaluates each candidate site using five weighted factors:

| Factor | Weight | Description |
|-------|--------|-------------|
| Equipment Availability | 0-30 points | Based on equipment quantity and availability over next 7 days |
| Radiologist Availability & Specialty Match | 0-25 points | Considers scheduled radiologists and specialty requirements |
| Current Workload | 0-20 points | Inverse relationship - lower workload = higher score |
| Priority & Time Sensitivity Match | 0-15 points | Matches order priority with site capabilities |
| Geographic/Logistic Considerations | 0-10 points | Considers patient convenience and original site preference |

**Total Score Range**: 0-100 points

### Algorithm Flow

1. **Filter Candidate Sites**: Only sites with required equipment are considered
2. **Score Each Site**: Calculate score for each candidate using all five factors
3. **Rank Sites**: Sort by total score (highest first)
4. **Select Best Site**: Assign order to highest-scoring site
5. **Log Decision**: Record routing decision with reasoning for analytics

### Example Scoring Scenario

**Order**: CT scan of head, Priority: Urgent (7), Time-sensitive: Yes, Specialty: Neuroradiology

**Site A**:
- Equipment: 2 CT scanners, 85% availability = 25 points
- Radiologist: Neuroradiologist scheduled = 20 points
- Workload: 15 pending orders = 18 points
- Priority: Can handle urgent, multiple machines = 13 points
- Geographic: Original site = 8 points
- **Total: 84 points**

**Site B**:
- Equipment: 1 CT scanner, 60% availability = 18 points
- Radiologist: General radiologist = 10 points
- Workload: 35 pending orders = 12 points
- Priority: Can handle urgent = 12 points
- Geographic: Other site = 5 points
- **Total: 57 points**

**Result**: Site A is selected with detailed reasoning logged.

---

## Workflow Examples

### Example 1: Routine Order with Auto-Routing

**Scenario**: A physician creates a routine CT scan order for a patient.

1. **Order Creation**:
   - Patient: Jane Smith
   - Order: CT scan of chest
   - Priority: Routine (5)
   - Time-sensitive: No
   - Specialty required: General
   - Auto-route: Enabled

2. **System Processing**:
   - System identifies all sites with CT equipment
   - Scores each site based on the five factors
   - Selects optimal site (e.g., Site B with score 72)

3. **Result**:
   - Order automatically assigned to Site B
   - Status: Scheduled
   - Patient notified of appointment location

### Example 2: Urgent Time-Sensitive Order

**Scenario**: Emergency department needs urgent MRI with neuroradiology specialty.

1. **Order Creation**:
   - Patient: John Doe
   - Order: MRI of brain
   - Priority: STAT (10)
   - Time-sensitive: Yes (deadline: 4 hours)
   - Specialty required: Neuroradiology
   - Auto-route: Enabled

2. **System Processing**:
   - System prioritizes sites with:
     - Immediate MRI availability
     - Scheduled neuroradiologist
     - Low current workload
   - Scores sites accordingly
   - Selects Site A (score: 92)

3. **Result**:
   - Order routed to Site A immediately
   - System ensures neuroradiologist is available
   - Order scheduled within deadline

### Example 3: Vacation Optimization

**Scenario**: Dr. Smith takes vacation next week, leaving Site A short-staffed.

1. **Administrator Action**:
   - Runs vacation optimizer for next week
   - System analyzes workload distribution

2. **System Analysis**:
   - Site A: 55 orders, 1 radiologist (overworked)
   - Site B: 20 orders, 2 radiologists (underworked)
   - Site C: 30 orders, 1 radiologist (balanced)

3. **Recommendations**:
   - "Reassign Dr. Jones from Site B to Site A for next week"
   - "Site A workload will be balanced (55 orders / 2 radiologists)"
   - "Site B can handle reduced capacity (20 orders / 1 radiologist)"

4. **Result**:
   - Administrator reviews and approves recommendations
   - System updates schedules automatically
   - Workload balanced across network

### Example 4: Order Combination

**Scenario**: Patient needs both CT and MRI scans.

1. **Initial State**:
   - Order 1: CT scan of abdomen (pending)
   - Order 2: MRI of abdomen (pending)
   - Both at Site A

2. **System Detection**:
   - Order Combiner identifies same patient, same site
   - Validates orders can be combined (same body part, compatible)

3. **Administrator Action**:
   - Reviews combinable orders
   - Schedules both scans for same day/time

4. **Result**:
   - Both orders combined into single visit
   - Patient makes one trip instead of two
   - Improved efficiency and patient satisfaction

---

## Technical Specifications

### API Endpoints

#### Sites Management
- `GET /api/sites` - Get all sites
- `GET /api/sites/:id` - Get site by ID
- `POST /api/sites` - Create new site
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site

#### Facilities Management
- `GET /api/facilities/site/:siteId` - Get facilities for a site
- `POST /api/facilities` - Update facility (creates if doesn't exist)

#### Radiologists Management
- `GET /api/radiologists` - Get all radiologists
- `GET /api/radiologists/:id` - Get radiologist by ID
- `POST /api/radiologists` - Create new radiologist
- `POST /api/radiologists/assign-site` - Assign radiologist to site
- `POST /api/radiologists/specialty` - Add specialty to radiologist

#### Schedules Management
- `GET /api/schedules` - Get schedules (requires startDate, endDate query params)
- `POST /api/schedules` - Create schedule
- `GET /api/schedules/radiologist/:radiologistId` - Get schedules for a radiologist

#### Orders Management
- `GET /api/orders` - Get all orders (supports filtering: status, orderType, priorityMin, timeSensitive, specialty)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `POST /api/orders/:id/route` - Route order to optimal site
- `POST /api/orders/route/all` - Auto-route all pending orders
- `POST /api/orders/route/time-sensitive` - Route time-sensitive orders

#### Optimization
- `POST /api/optimization/vacation` - Optimize workload distribution
- `GET /api/optimization/combinable-orders` - Find combinable orders
- `POST /api/optimization/combine-orders` - Combine multiple orders

#### Time Estimates
- `GET /api/time-estimates/radiologist/:radiologistId` - Get time estimates for radiologist
- `POST /api/time-estimates` - Create/update time estimate
- `GET /api/time-estimates/average/:scanType` - Get average times for scan type

### Database Indexes

The system includes optimized indexes for performance:
- `idx_orders_status` - Fast filtering by order status
- `idx_orders_assigned_site` - Quick site-based queries
- `idx_orders_time_sensitive` - Efficient time-sensitive order queries
- `idx_orders_priority` - Priority-based sorting
- `idx_schedules_date` - Date range queries for schedules
- `idx_schedules_radiologist` - Radiologist schedule lookups
- `idx_radiologist_specialties` - Specialty matching queries

---

## Benefits and Use Cases

### Key Benefits

1. **Operational Efficiency**
   - Automated routing reduces manual administrative work
   - Faster order processing and assignment
   - Reduced scheduling conflicts

2. **Workload Balance**
   - Prevents overloading specific sites
   - Ensures even distribution of work
   - Optimizes resource utilization

3. **Patient Experience**
   - Faster routing to appropriate sites
   - Reduced wait times
   - Fewer visits through order combination
   - Better access to specialized care

4. **Quality of Care**
   - Ensures specialty-matched radiologists
   - Proper handling of urgent cases
   - Appropriate equipment allocation

5. **Data-Driven Decisions**
   - Comprehensive analytics and reporting
   - Routing history for continuous improvement
   - Workload trends and patterns

6. **Scalability**
   - Handles multiple sites efficiently
   - Supports large order volumes
   - Easy to add new sites or radiologists

### Use Cases

1. **Multi-Site Hospital Networks**
   - Manage radiology services across multiple locations
   - Balance workload across sites
   - Optimize resource allocation

2. **Healthcare Systems**
   - Coordinate radiology services system-wide
   - Improve patient access to imaging
   - Reduce operational costs

3. **Radiology Groups**
   - Manage radiologist schedules across locations
   - Balance workloads among radiologists
   - Optimize vacation coverage

4. **Emergency Departments**
   - Route urgent cases quickly
   - Ensure appropriate specialty availability
   - Prioritize time-sensitive orders

5. **Outpatient Clinics**
   - Schedule routine scans efficiently
   - Combine multiple orders for patient convenience
   - Reduce patient travel time

---

## Conclusion

The Island Solution for Radiology represents a comprehensive approach to managing radiology services across multiple hospital sites. By combining intelligent routing algorithms, workload optimization, and order combination capabilities, the system addresses the complex challenges of multi-site radiology management while improving both operational efficiency and patient care quality.

The system's automated decision-making, combined with comprehensive analytics and reporting, provides healthcare administrators with the tools needed to optimize their radiology operations and deliver better patient outcomes.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**System Version**: Island Solution for Radiology v1.0
