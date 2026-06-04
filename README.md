# AeroLink Airline Management Platform

A cloud-native distributed airline management platform built using AWS microservices, serverless computing, event-driven architecture, and modern web technologies. AeroLink demonstrates how airline operations such as flight management, passenger bookings, baggage tracking, check-in services, notifications, and payment processing can be implemented using scalable and fault-tolerant cloud-native architectures. Based on the AeroLink assignment report and implementation. 

---

## Overview

AeroLink was developed to address the limitations of traditional monolithic airline systems by adopting a distributed microservices architecture. The platform provides:

* Flight management and scheduling
* Passenger booking and reservation management
* Simulated payment processing
* Passenger check-in operations
* Baggage tracking and status updates
* Airport event integration
* Notification management
* User authentication and role-based access control
* Event-driven communication between services

The system utilizes AWS cloud services to ensure scalability, availability, security, and resilience.

---

## Architecture

### Cloud Services Used

* Amazon API Gateway
* AWS Lambda
* Amazon ECS Fargate
* Amazon DynamoDB
* Amazon EventBridge
* Amazon SQS
* Amazon SNS
* Amazon CloudWatch
* Amazon S3
* Amazon CloudFront
* Amazon Route 53
* AWS WAF

### Architecture Style

* Microservices Architecture
* Event-Driven Architecture
* Serverless Computing
* RESTful APIs
* JWT Authentication
* Role-Based Access Control (RBAC)

---

## Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* React Router

### Backend

* Node.js
* AWS Lambda
* REST APIs
* JWT Authentication

### Cloud & Infrastructure

* Amazon API Gateway
* Amazon ECS Fargate
* Docker
* Amazon ECR
* Amazon DynamoDB
* Amazon EventBridge
* Amazon CloudWatch

---

## Core Microservices

| Service                     | Responsibility                                          |
| --------------------------- | ------------------------------------------------------- |
| Authentication Service      | User registration, login, JWT generation, authorization |
| Flight Service              | Flight scheduling, pricing, seat availability           |
| Booking Service             | Passenger reservations and ticket management            |
| Payment Service             | Payment authorization and transaction processing        |
| Check-In Service            | Passenger check-in and boarding pass generation         |
| Baggage Service             | Baggage registration and tracking                       |
| Notification Service        | System notifications and event processing               |
| Airport Integration Service | Airport operational event management                    |

---

## Key Features

### Authentication & Security

* JWT-based authentication
* Role-based access control
* Secure HTTPS communication
* API Gateway authorization
* Protected API endpoints

### Flight Operations

* Create and manage flights
* Update flight schedules
* Modify seat availability
* Manage flight status

### Passenger Services

* Book flights
* Simulated payment processing
* Passenger check-in
* Baggage tracking

### Event-Driven Processing

* Amazon EventBridge integration
* Automatic notification generation
* Asynchronous event processing
* Loose coupling between services

### Monitoring & Observability

* AWS CloudWatch logging
* Metrics monitoring
* Event tracking
* Operational visibility

---

## API Documentation

The platform provides OpenAPI (Swagger) documentation covering:

* Authentication APIs
* Flight APIs
* Booking APIs
* Payment APIs
* Baggage APIs
* Check-In APIs
* Notification APIs
* Airport Integration APIs

---

## Security Features

* JWT Authentication
* HTTPS/TLS Encryption
* API Gateway Security Controls
* Role-Based Authorization
* Secure Payment Processing
* Encrypted Data Storage

---

## Database

### Amazon DynamoDB Tables

* Users
* Flights
* Bookings
* Payments
* Baggage
* Notifications
* Airport Events

Features:

* Fully managed NoSQL database
* High availability
* Automatic scaling
* Encryption at rest
* Low-latency performance

---

## Deployment

### Frontend

```bash
npm install
npm run build
```

Deploy generated build files to:

* Amazon S3
* Amazon CloudFront

### Backend Services

```bash
docker build -t service-name .
docker push <amazon-ecr-repository>
```

Deploy containers to:

* Amazon ECS Fargate

Serverless functions are deployed using:

* AWS Lambda
* Amazon API Gateway integrations

---

## Event Flow Example

1. Passenger creates booking
2. Payment Service authorizes payment
3. Booking Service confirms reservation
4. EventBridge publishes booking event
5. Notification Service receives event
6. Notification stored in DynamoDB
7. User receives confirmation

---

## Project Structure

```text
aerolink-platform/
│
├── frontend/
├── services/
│   ├── auth-service/
│   ├── flight-service/
│   ├── booking-service/
│   ├── baggage-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── airport-service/
│   └── checkin-service/
│
├── openapi/
│   └── aerolink-api.yaml
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Future Enhancements

* Real airline payment gateway integration
* Live flight tracking
* Multi-region deployment
* AI-powered flight demand forecasting
* Passenger recommendation engine
* Mobile application support
* Automated disaster recovery workflows

---

## Author

**Pramishka Kannangara**

The implementation demonstrates cloud-native application design, distributed systems development, RESTful API design, event-driven architectures, security implementation, and cloud deployment using Amazon Web Services. 
