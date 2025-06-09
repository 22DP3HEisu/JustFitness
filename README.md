```
                             ___           _  ______ _ _                       
                            |_  |         | | |  ___(_) |                      
                              | |_   _ ___| |_| |_   _| |_ _ __   ___  ___ ___ 
                              | | | | / __| __|  _| | | __| '_ \ / _ \/ __/ __|
                          /\__/ / |_| \__ \ |_| |   | | |_| | | |  __/\__ \__ \
                          \____/ \__,_|___/\__\_|   |_|\__|_| |_|\___||___/___/
```
# JustFitness: Comprehensive Fitness Tracking and Planning Platform

JustFitness is a comprehensive web application designed to help users track their fitness progress, create personalized workout plans, and monitor nutrition intake.

## Features

- **User Authentication**: Secure login and registration system
- **Workout Management**: Create, edit, save, and share personalized workout plans
- **Exercise Library**: Browse a comprehensive exercise database with detailed instructions
- **Nutrition Tracking**: Record and monitor daily nutrition intake with detailed macronutrient analysis
- **Progress Tracking**: Follow fitness progress with visual charts and statistics
- **Personalization**: Receive workout recommendations based on personal fitness goals and preferences
- **Admin Panel**: Manage users, exercises, and workout plans through an intuitive admin interface
- **Responsive Design**: Fully optimized for both desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: React.js
- **Styling**: CSS with responsive design
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend
- **Framework**: Laravel (PHP)
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **API**: RESTful architecture

## Installation

### Prerequisites
- Node.js (v14+)
- PHP (v8.0+)
- Composer
- MySQL

### Client Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

### Server Setup
```bash
# Navigate to server directory
cd server

# Install PHP dependencies
composer install

# Create and configure .env file
cp .env.example .env
# Edit database credentials in .env file

# Generate application key
php artisan key:generate

# Run database migrations and seeders
php artisan migrate --seed

# Start development server
php artisan serve
```

## Usage

1. Register a new account or login with existing credentials
2. Navigate through the application using the intuitive navigation menu
3. Create custom workout plans or select from recommended templates
4. Track daily nutrition and fitness progress
5. Update profile preferences for personalized recommendations

## Acknowledgments

- Special thanks to all contributors who participated in the development
- Exercise data sourced from verified fitness resources
- Nutrition information provided by reliable dietary databases