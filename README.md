
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
  - [Diagrams](#diagrams)
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


## Diagrams

### Diagram 1: Sequence Diagram

<img src="public/FinalSequenceDiagram.drawio.svg" alt="Alt text" width="1000"/>
<br>
<br>

**Description of Sequence Diagram**

The sequence diagram shows how the authentication for our website works as well as how listings are selected and inserted into the database. We utilize Google OAuth for user authentication

As you can see, the first step in the diagram is the client clicking sign in button whose component, call AuthButton, is shown
below. This button connects to a route in auth.ts.

AuthButton.tsx
```tsx
export default function AuthButton() {
  
  ...

  if (!user) {
    return (
      <div className="w-full">
        <button
          onClick={() => {
            const apiBase = process.env.NEXT_PUBLIC_API_URL;
            window.location.href = `${apiBase}/api/auth/google`; // redirect to Google OAuth instead of signIn('google') from NextAuth
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >

        ...

        </button>
      </div>
    );
  }

  ...

}  
```

The AuthButton routes to this code below in auth.ts.

You can see in this route, the line of code `res.redirect(url)` which corresponds to the second arrow in the diagram from the server redirecting the client to the Google accounts sign-in page. The callback function that Google calls after the user enters their credentials is also defined in the line const ``const redirectUri = ${req.protocol}://${req.get('host')}/api/auth/google/callback`;`` 

auth.ts
```ts
router.get('/google', (req: Request, res: Response) => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth is not configured' });
    }


    // generate a random state for CSRF protection with 32 bytes of random data
    const state = crypto.randomBytes(32).toString('hex');


    res.cookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });


    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);


    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state,
      prompt: 'select_account',
    });


    res.redirect(url);
  } catch (error) {
    console.error('Google auth init error:', error);
    res.status(500).json({ error: 'Failed to start Google sign in' });
  }
});
```

Next in the sequence diagram, the client gets the Google sign-in page from the Google server. The blue ‘Opt’ box shows that only if the credentials are valid, meaning the user enters an actual google account, will they be able to proceed. The alternate would just be whatever Google’s response is to an invalid Google account, which is in most cases just prompting the user to sign in again. However, this is all handled by Google so it is not in our code and thus not shown in the sequence diagram.

In the case the user has a valid Google account, Google does a callback to the callback handler mentioned before, sending the AUTHORIZATION_CODE in the URL. The definition of this callback handler can be seen in the code below. In the snippet below, the AUTHORIZATION_CODE is extracted in the line `const { code, state } = req.query;` where `code` is the AUTHORIZATION_CODE.

In this first part of the code below, you can see we utilize a guard clause that checks the AUTHORIZATION_CODE was actually sent and that it is of type string. In our sequence diagram, this is represented by the orange alternate box. At the bottom of the diagram, you can see the alternate flow if the code is null or is not of type string; the user is redirected back to the login page with an error “missing_code”. The next guard clause checking that the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are represented by the purple alternate box in the diagram. Similarly, if the guard clause catches the GOOGLE_CLINET_ID or GOOGLE_CLIENTS_SECRET equal to null, it again redirects the user to the login page but this time with an error “not_configured”

```ts
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies?.oauth_state;
    const frontendUrl = process.env.FRONTEND_URL;


    if (!code || typeof code !== 'string') {
      return res.redirect(`${frontendUrl}/login?error=missing_code`);
    }


...


    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${frontendUrl}/login?error=not_configured`);
    }


...


}
```

The next part of the sequence diagram within the purple alternate box represents the code below. This is where the server sends the AUTHORIZATION code to the Google to exchange it for tokens. 

```ts
router.get('/google/callback', async (req: Request, res: Response) => {


...


    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);


    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });


...


}
```

Next, you can see in the code below where we check that the id_token is not null, represented by the yellow alternate box in the diagram. Like the other guard clauses, if the id_token is null, the server redirects the client to the login page with error “no_id_token”. Otherwise if the id_token is not null, next is the self-call in the diagram to `verifyIdToken()` that essentially checks if the id_token is for the `GOOGLE_CLIENT_ID` that was registered for our app.


```ts
router.get('/google/callback', async (req: Request, res: Response) => {


...


    if (!tokens.id_token) {
      return res.redirect(`${frontendUrl}/login?error=no_id_token`);
    }


    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });


...


}
```

The information is extracted from the ticket in the payload where, most importantly, we check that the email domain matches ucla.edu or g.ucla.edu using the `isAllowedEmail()` function. This is shown in the code below and represented by the green alternate box on our diagram. If the domain does not match, the client is redirected to the login in page with the error “invalid_domain”

```ts
const ALLOWED_DOMAINS = ['@ucla.edu', '@g.ucla.edu'];

function isAllowedEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return ALLOWED_DOMAINS.some((domain) => lower.endsWith(domain));
}

...

router.get('/google/callback', async (req: Request, res: Response) => {


...


    const payload = ticket.getPayload();


    if (!payload || !payload.sub || !payload.email) {
      return res.redirect(`${frontendUrl}/login?error=invalid_profile`);
    }


    const { sub, email, name, picture } = payload;


    if (!isAllowedEmail(email)) {
      return res.redirect(`${frontendUrl}/login?error=invalid_domain`);
    }
...
}
```

Next, we check if the user exists in the database and add them if they do not in the code below. In the Diagram, these are the sequence
of arrows within the pink alternate box.

```ts
router.get('/google/callback', async (req: Request, res: Response) => {


...


    // check if user exists in database
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')  // includes is_suspended
      .eq('id', sub)
      .maybeSingle();


    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return res.redirect(`${frontendUrl}/login?error=database_error`);
    }


    let user = existing;
    if (user) {
	...
    } else {
	...
     
      // insert new user into database if user does not exist
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert({
          id: sub,
          email,
          name: name,
          profile_image_url: picPublicUrl || undefined,
          role: 'user',
          is_verified: true,
          hide_class_year: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // is_suspended will default to false from DB schema
        })
        .select()
        .single();


      if (insertError) {
        console.error('Error creating user:', insertError);
        return res.redirect(`${frontendUrl}/login?error=database_error`);
      }


      user = inserted;
    }


 
    if (user.is_suspended) {
      return res.redirect(`${frontendUrl}/login?error=account_suspended`);
    }


...
}
```

Then, we generate the JWT token as shown by the server’s self-call in the diagram and redirect the user back to the main app. This can be seen by the last portion of the callback handler below.

```ts
router.get('/google/callback', async (req: Request, res: Response) => {


...


    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });


    // set auth_token cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });


    res.redirect(`${frontendUrl}/callback?success=true`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});
```

Additionally, after authentication, our diagram shows various ways that the client and server request data from the database. These are pretty typical requests, with the client requesting via HTTP methods to GET or POST certain data which the server SELECTS or INSERTS data from the database and returns to the server and then the client. The code itself for these functions can be seen in the files profile.ts for getting the profile data and listings.ts for getting the listing data. Below are a truncated version of these routes showing
the code most relevant to our sequence diagram.

This route gets profile data:
```ts
// gets the logged in user's profile
router.get("/me", authenticateToken, async (req, res) => {
  const user_id = req.user!.userId;


  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user_id)
    .single();
  if (error || !data) {
    console.error("Fetch user profile error:", error);
    return res.status(404).json({ error: "User not found" });
  }


  return res.json(data);
});
```

This route gets listing data:
```ts
router.get("/", authenticateToken, async (req, res) => {
  const {
    condition,
    location,
    category,
    sort,
  } = req.query as {
    condition?: string;
    location?: string;
    category?: string;
    sort?: string;
  };
 
  let query = supabase
    .from("listings")
    .select("*, media(*)")
    .eq("status", "active");


...


  return res.json(data ?? []);
});
```

This route posts listing data:
```ts
router.post("/", authenticateToken, uploadLimiter, upload.array('mediaFiles', 5), async (req, res) => {
  const user_id = req.user!.userId;


...


  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id,
      title,
      price: priceNum,
      description,
      condition,
      category,
      status,
      location,
      preferred_payment,
    })
    .select()
    .single();


...


  return res.status(201).json(data);
});
```

### Diagram 2: Entity Relationship Diagram



## Authors

**UCLA CS 35L Final Project**

- [Marc Jowell Bagaoisan](https://github.com/mjbagaoisan)
- [Tri Nguyen](https://github.com/tringuwin)
- [Brandon Becerra](https://github.com/bbecerra12)
- [Aron Maung](https://github.com/roshilel)
- [Uzouf Baagil](https://github.com/Uzouf)




