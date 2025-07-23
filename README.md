# Dhruvaa

live link: https://kpi-builder-tzml.onrender.com

## Overview
Dhruvaa is a full-stack application designed to manage and visualize KPIs (Key Performance Indicators) for various business domains like Marketing, Sales, Finance, Operations, and more.
The project consists of a **Frontend** built with React, a **Backend** with Node.js, Express, and MongoDB, and a **Flask API** integration for advanced insights.

---

## Table of Contents
1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running the Project](#running-the-project)
6. [Environment Variables](#environment-variables)
7. [Folder Structure](#folder-structure)
8. [API Endpoints](#api-endpoints)
9. [Troubleshooting](#troubleshooting)

---

## Features
- **Frontend**:
  - Interactive dashboards to visualize KPIs.
  - Responsive design.
- **Backend**:
  - RESTful APIs for managing KPIs.
  - User authentication and authorization.
- **Flask Integration**:
  - Generates AI-based insights and predictions based on KPI data.

---

## Technologies Used
- **Frontend**:
  - React.js
  - Redux (state management)
  - Chart.js / D3.js (for visualizations)
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB (Mongoose)
- **Other**:
  - Flask (Python) for analytics
  - Docker (optional)

---

## Prerequisites
- Node.js >= 14.x
- npm or yarn
- Python >= 3.8
- MongoDB installed and running
- (Optional) Docker

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/dhruvaa.git
cd dhruvaa
```

### 2. Install dependencies
#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

#### Flask API
```bash
cd flask
pip install -r requirements.txt
```

---

## Running the Project

### 1. Start MongoDB
Ensure MongoDB is running on your local machine or connect to a cloud database.

### 2. Run Backend Server
```bash
cd backend
npm run dev
```

### 3. Run Frontend
```bash
cd frontend
npm start
```

### 4. Run Flask API
```bash
cd flask
python flask_backend.py
```

---

## Environment Variables

Create a `.env` file in the backend and frontend directories.

**Backend (`/backend/.env`)**
```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key
FLASK_API_URL=http://localhost:5000
```

**Frontend (`/frontend/.env`)**
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

**Flask API (`/flask-api/.env`)**
```
# If required for Flask configuration
```

---

## Folder Structure
```
Dhruvaa/
|-- frontend/
|-- backend/
|-- flask-api/
|-- README.md
```

---

## API Endpoints

### Backend
- `GET /api/kpis` - Fetch all KPIs
- `POST /api/kpis` - Create a new KPI
- `PUT /api/kpis/:id` - Update KPI
- `DELETE /api/kpis/:id` - Delete KPI
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Flask API
- `POST /api/analyze` - Analyze KPI data and return insights

---

## Troubleshooting
- Ensure all services (MongoDB, Node backend, Flask API) are running.
- Check your `.env` configuration.
- Use correct ports to avoid conflicts.
- For CORS issues, adjust headers in the backend or frontend settings.

---

## License
This project is licensed under the [MIT License](LICENSE).

---

> Built with passion and precision for data-driven businesses.

