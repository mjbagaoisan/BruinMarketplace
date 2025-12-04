
# BruinMarketplace

An online marketplace exclusively for UCLA students to buy and sell items securely.

## Description
A secure, UCLA-exclusive marketplace designed for students to buy, sell, and trade items safely. The platform uses Google OAuth to verify UCLA emails, an Express.js backend for listings and moderation, and PostgreSQL for persistent storage. Students can post items, browse categories/listings, report scams, and manage their profiles.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Express](https://img.shields.io/badge/Express-5-lightgrey) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E) ![Playwright](https://img.shields.io/badge/Tests-Playwright-orange)

## Table of Contents

- [BruinMarketplace](#bruinmarketplace)
  - [Description](#description)
  - [Table of Contents](#table-of-contents)
  - [Feature Highlights](#feature-highlights)
  - [Requirements](#requirements)
  - [Installation \& Setup](#installation--setup)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Configure Environment Variables](#2-configure-environment-variables)
    - [3. Set Up Google OAuth](#3-set-up-google-oauth)
    - [4. Set Up Supabase](#4-set-up-supabase)
    - [5. Run the App](#5-run-the-app)
  - [Usage](#usage)
    - [Development Commands](#development-commands)
  - [Tests](#tests)
  - [API Documentation](#api-documentation)
  - [Database](#database)
    - [Tables Overview](#tables-overview)
    - [Database setup](#database-setup)
  - [Tech Stack](#tech-stack)
  - [Authors](#authors)

## Feature Highlights

- **UCLA-Only Authentication** — Google OAuth restricted to UCLA email domains
- **Listing Management** — Create, edit, and delete listings with up to 5 images
- **Search & Filtering** — Filter by category, condition, location. Sort by date
- **User Profiles** — View seller profiles, class year, major, and active listings
- **Admin Dashboard** — Report management, user moderation, and suspend/unsuspend users
- **Rate Limiting** — 5 listings/day limit and API rate limiting to prevent abuse
- **Reporting System** — Report user or listing based on "x" reason

## Requirements

- **Node.js** v18+ 
- **npm** v9+
- **Supabase** account (for PostgreSQL database)
- **Google Cloud** project (for OAuth)


## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mjbagaoisan/BruinMarketplace.git
cd BruinMarketplace
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_Secret=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# URLS
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Express API Configuration
PORT=3001
ALLOW_ORIGIN=http://localhost:3000
NODE_ENV=development

# Frontend API URL (for production)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env.local`

### 4. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the database schema (see [Database Schema](#database-schema) section)
3. Copy your project URL and keys to `.env.local`

### 5. Run the App

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001

## Usage

### Development Commands

```bash
# Start both Next.js and Express servers
npm run dev

# Start only Next.js frontend
npm run dev:next

# Start only Express API server
npm run dev:api
```

## Tests
Playwright End to End tests can be found here:
**[tests/README.md](tests/README.md)**

## API Documentation

Full API reference can be found here:

**[api/documentation.md](api/documentation.md)**

## Database

The application uses Supabase (PostgreSQL) with the following tables:

### Tables Overview

- **users** – Every UCLA account plus verification/suspension flags.
- **listings** – Items posted for sale, including condition, category, and search metadata.
- **media** – Photos or videos attached to a listing.
- **reports** – Complaints filed against listings or users with workflow status.
- **admin_actions** – Audit trail of moderator decisions (bans, warnings, report closures).

### Database setup

Run **[database/schema.sql](database/schema.sql)** in the Supabase SQL Editor to create every table and constraint.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Backend** | Express.js 5, Node.js |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Google OAuth 2.0, JWT |
| **File Storage** | Supabase Storage |
| **Testing** | Playwright |


## Authors

**UCLA CS 35L Final Project**

- [Marc Jowell Bagaoisan](https://github.com/mjbagaoisan)
- [Tri Nguyen](https://github.com/tringuwin)
- [Brandon Becerra](https://github.com/bbecerra12)
- [Aron Maung](https://github.com/roshilel)
- [Uzouf Baagil](https://github.com/Uzouf)




