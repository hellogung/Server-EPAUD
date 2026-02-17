# Other Auth APIs

## Refresh Token
`POST /api/auth/refresh`

Uses HTTP-only cookie `refresh_token`

### Response (200)
```json
{
  "access_token": "new_jwt_token"
}
```

---

## Verify Access Token
`GET /api/auth/verify-token`

**Auth Required:** Yes (Bearer Token)

### Response (200)
```json
{
  "valid": true
}
```

---

## Get Profile
`GET /api/auth/profile`

**Auth Required:** Yes (Bearer Token)

### Response (200)
```json
{
  "data": {
    "id": "uuid",
    "full_name": "Budi Santoso",
    "username": "budi@example.com",
    "role": "admin"
  }
}
```

---

## Logout
`DELETE /api/auth/logout`

**Auth Required:** Yes (Bearer Token)

### Response (200)
```json
{
  "message": "Logout berhasil"
}
```
