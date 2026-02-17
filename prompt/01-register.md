# Register API

## Endpoint
`POST /api/auth/register`

## Request Body
```json
{
  "nama_sekolah": "TK Ceria",
  "nama_kepala_sekolah": "Budi Santoso",
  "email": "budi@example.com",
  "phone": "081234567890",
  "password": "secret123"
}
```

**Notes:**
- `email` or `phone` — at least one required
- `password` — minimum 6 characters

## Response (201)
```json
{
  "message": "Registrasi berhasil. Silakan verifikasi akun Anda.",
  "data": {
    "user_id": "uuid",
    "school_id": "uuid"
  }
}
```

## Flow
1. Creates school record
2. Creates user with hashed password
3. Links user to school (user_schools pivot)
4. Auto-sends verification code to email/phone
