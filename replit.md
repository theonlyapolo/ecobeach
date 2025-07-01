# EcoBeach - Praia de Guriri Platform

## Overview

EcoBeach is a Flask-based web application designed to promote ocean culture awareness and environmental education focused on Guriri Beach in São Mateus, Espírito Santo, Brazil. The platform serves as an educational portal showcasing local biodiversity, culture, history, and sustainability practices through interactive content and mapping features.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive design
- **CSS Framework**: Bootstrap 5 with custom CSS variables for ocean-themed styling
- **JavaScript**: Vanilla JavaScript with modular organization (main.js, maps.js, quiz.js)
- **Icon Library**: Font Awesome for consistent iconography
- **Interactive Maps**: Google Maps API integration for location-based content

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Data Storage**: JSON files for static content (biodiversity, tourist points)
- **Template Rendering**: Server-side rendering with Jinja2
- **Environment Configuration**: Environment variables for sensitive data (API keys, secrets)

### Design Patterns
- **MVC Pattern**: Clear separation between models (JSON data), views (templates), and controllers (Flask routes)
- **Template Inheritance**: Base template with extending child templates for consistent layout
- **Modular JavaScript**: Feature-specific JS modules for maintainability

## Key Components

### Core Pages
1. **Home Page** (`/`): Landing page with hero section and feature overview
2. **History Page** (`/historia`): Interactive timeline of Guriri and São Mateus history
3. **Biodiversity Page** (`/biodiversidade`): Species information with educational content
4. **Culture Page** (`/cultura`): Caiçara culture and traditional cuisine information
5. **Interactive Map** (`/mapa`): Google Maps integration with points of interest
6. **Educational Area** (`/educativo`): Learning resources and educational materials
7. **Emergency Center** (`/emergencia`): Emergency contacts and safety information
8. **Preservation Tips** (`/preserve`): Sustainability guidelines and eco-friendly practices

### Data Management
- **JSON Data Files**: Structured storage for biodiversity information and tourist points
- **Static Content**: Images, CSS, and JavaScript files served from static directory
- **Template System**: Reusable HTML components with Jinja2 inheritance

### Interactive Features
- **Quiz System**: Educational quizzes about local biodiversity and culture
- **Interactive Maps**: Filterable points of interest with custom markers
- **Responsive Design**: Mobile-first approach with Bootstrap grid system

## Data Flow

1. **Request Processing**: Flask routes handle incoming HTTP requests
2. **Data Loading**: JSON files loaded using helper functions when needed
3. **Template Rendering**: Data passed to Jinja2 templates for server-side rendering
4. **Client-Side Enhancement**: JavaScript modules add interactivity post-load
5. **API Integration**: Google Maps API calls for mapping functionality

## External Dependencies

### Frontend Libraries
- **Bootstrap 5**: CSS framework for responsive design
- **Font Awesome 6**: Icon library for UI elements
- **Google Maps JavaScript API**: Interactive mapping functionality

### Backend Dependencies
- **Flask**: Python web framework
- **Python Standard Library**: JSON handling, environment variables, logging

### Third-Party Services
- **Google Maps Platform**: Mapping and location services
- **CDN Services**: External hosting for CSS/JS libraries

## Deployment Strategy

### Environment Configuration
- **Development**: Debug mode enabled, local file serving
- **Production**: Environment variables for configuration
- **API Keys**: Secure handling through environment variables

### Static Assets
- **CSS/JS Files**: Served from static directory
- **JSON Data**: File-based storage for easy content management
- **Images**: Static file serving for multimedia content

### Scalability Considerations
- **Database Migration Path**: Current JSON structure can be easily migrated to database
- **Caching Strategy**: Static content cacheable, dynamic content optimized
- **CDN Integration**: External libraries loaded from CDN for performance

## Recent Changes

- June 29, 2025: Added dedicated Projeto Tamar page with comprehensive turtle conservation content
- June 29, 2025: Fixed Google Maps JSON filter error (tojsonfilter → tojson)
- June 29, 2025: Enhanced Points of Interest section with detailed cards and filtering system
- June 29, 2025: Added fallback functionality for points display when map fails to load
- June 29, 2025: Implemented share and directions functions for each point of interest

## Changelog

- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.