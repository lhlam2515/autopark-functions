# AutoPark Firebase Functions

This repository contains the Firebase Cloud Functions that support the [AutoPark](https://github.com/lhlam2515/autopark-website) project. These functions handle backend operations such as real-time data processing and notification delivery.

## 🔧 Functions

- **Weather Notifications**: Process weather data from IoT devices and send notifications to users about weather conditions at parking locations
- **User Notifications**: Send notifications to users about parking status changes

## 🚀 Technology Stack

- Firebase Cloud Functions
- TypeScript
- Firebase Admin SDK
- Firebase Realtime Database

## 📋 Prerequisites

- Node.js 22 or higher
- Firebase CLI
- Firebase project with Realtime Database enabled

## 🔧 Installation & Setup

1. Clone the repository

   ```bash
   git clone https://github.com/lhlam2515/autopark-functions.git
   cd autopark-functions
   ```

2. Install dependencies

   ```bash
   cd functions
   npm install
   ```

3. Configure Firebase project

   ```bash
   firebase use your-project-id
   ```

## 📝 Development

1. Run the emulators locally

   ```bash
   npm run serve
   ```

2. Build functions

   ```bash
   npm run build
   ```

3. Deploy to Firebase

   ```bash
   npm run deploy
   ```

## 🔗 Related Projects

- [AutoPark Website](https://github.com/lhlam2515/autopark-website) - Main web application
