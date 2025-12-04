# API Documentation

REST API for BruinMarketplace. All endpoints are served from the Express backend at `http://localhost:3001` and are prefixed with `/api` 

## Base URL

```
http://localhost:3001
```

## Authentication

All endpoints require authentication via HTTP-only cookie (`auth_token`). Login through Google OAuth to obtain a session.

Only `@g.ucla.edu` email addresses.

---

## Auth

### Start Google OAuth
```
GET /auth/google
```
Redirects to Google sign-in. Sets `auth_token` cookie on success.

### Get Current User
```
GET /auth/me
```
```json
{
  "user": {
    "id": "abc123",
    "email": "bruin@g.ucla.edu",
    "name": "Joe Bruin",
    "image": "https://...",
    "role": "user",
    "isVerified": true
  }
}
```

### Logout
```
POST /auth/logout
```
Clears the `auth_token` cookie.

---

## Listings

### Get All Listings
```
GET /listings
```
**Query Parameters:**
- `condition`: `new`, `like_new`, `good`, `fair`, `poor`
- `category`: `textbooks`, `electronics`, `furniture`, `parking`, `clothing`, `tickets`, `other`
- `location`: `hill`, `on_campus`, `off_campus`
- `sort`: `date_asc`, `date_desc` (default)

**Response:** Array of listings with media.

### Create Listing
```
POST /listings
```
**Rate Limit:** 5 listings per day

**Body:** `multipart/form-data`
- `title` (string, required)
- `price` (number, required)
- `description` (string)
- `condition` (string, required)
- `category` (string, required)
- `location` (string, required)
- `status` (string, required)
- `preferred_payment` (string, default: `other`)
- `mediaFiles` (files, max 5)

**Response:** Created listing.

### Get My Listings
```
GET /listings/me
```
Returns your active listings.

### Get User's Listings
```
GET /listings/user/:userId
```
Returns all listings for a user.

### Get Single Listing
```
GET /listings/:id
```
Returns listing with media and seller info. Includes `interested_user_details` if you own it.

### Update Listing
```
PUT /listings/:id
```
**Auth:** Must own listing

**Body:** Same fields as create (all optional). Include `mediaToDelete` as JSON array of media IDs to remove.

### Delete Listing
```
DELETE /listings/:id
```
**Auth:** Must own listing or be admin

Deletes listing and media. Returns `204 No Content`.

### Update Listing Status
```
POST /listings/:id/status
```
**Auth:** Must own listing or be admin

```json
{ "status": "sold" }
```
Valid statuses: `active`, `sold`, `traded`, `removed`

### Mark Interest
```
POST /listings/:id/interested
```
Adds you to the listing's interested users list.

### Remove Interest
```
DELETE /listings/:id/interested/:userId
```
**Auth:** Must own listing or be admin

Removes a user from the interested list.

---

## Profile

### Get My Profile
```
GET /profile/me
```
Returns your full profile.

### Get User Profile
```
GET /profile/:user_id
```
Returns public profile: `id`, `name`, `profile_image_url`, `major`, `hide_major`, `class_year`, `hide_class_year`, `created_at`.

### Update My Profile
```
PUT /profile/me
```
**Body:** `multipart/form-data`
- `major` (string)
- `hide_major` (boolean)
- `class_year` (number)
- `hide_class_year` (boolean)
- `email` (string)
- `phone_number` (string)
- `avatar` (file)

---

## Search

### Search Listings
```
GET /search
```
**Query Parameters:**
- `q` (string, required) - Search query
- `scope` - `all` or `me` (default: `all`) // returns all listings or only your listings
- `page` (number, default: 1)
- `limit` (number, default: 12, max: 50)

```json
{
  "results": [...],
  "total": 42,
  "page": 1,
  "limit": 12
}
```

---

## Reports

### Create Report
```
POST /reports
```
Report a listing:
```json
{
  "listingId": 123,
  "reason": "scam",
  "notes": "Optional details"
}
```

Or report a user:
```json
{
  "reportedUserId": "abc123",
  "reason": "harassment",
  "notes": "Optional details"
}
```

Must provide exactly one of `listingId` or `reportedUserId`.

**Valid reasons:** `scam`, `prohibited_item`, `harassment`, `counterfeit`, `no_show`

---

## Admin

All admin endpoints require `role: "admin"`.

### Get All Reports
```
GET /admin/reports
```
Returns all reports ordered by date (newest first).

### Update Report Status
```
POST /admin/reports/:id/status
```
```json
{ "status": "in_review" }
```
Valid statuses: `open`, `in_review`, `resolved`

### Remove Listing
```
POST /admin/listings/:id/remove
```
Soft-deletes a listing (sets `status: "removed"` and `deleted_at`).

**Body (optional):**
```json
{ "reportId": 123 }
```

### Suspend User
```
POST /admin/users/:id/suspend
```
Sets `is_suspended: true`. Suspended users cannot log in.

**Body (optional):**
```json
{ "reportId": 123 }
```

### Unsuspend User
```
POST /admin/users/:id/unsuspend
```
Sets `is_suspended: false`.

---

## Error Responses

All errors return JSON: `{ "error": "Error message" }`

Status codes:
- `400` — Bad request / validation error
- `401` — Not authenticated
- `403` — Not authorized
- `404` — Resource not found
- `429` — Rate limit exceeded
- `500` — Server error
