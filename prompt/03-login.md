# Login API

## Endpoint
`POST /api/auth/login`

## Request Body
```json
{
  "identifier": "budi@example.com",
  "password": "secret123"
}
```

**Notes:**
- `identifier` can be username, email, or phone

## Response (200)
```json
{
  "message": "Login berhasil",
  "data": {
    "access_token": "jwt_token",
    "user": {
      "id": "uuid",
      "full_name": "Budi Santoso",
      "username": "budi@example.com",
      "role": "admin"
    }
  }
}
```

## Prerequisites
- Account must be verified (`is_verified = true`)

## Security
- Refresh token stored in HTTP-only cookie
- Access token expires in 15 minutes
- Refresh token expires in 15 days
