# Account Verification API

## Send Verification Code
`POST /api/auth/send-verification`

### Request Body
```json
{
  "user_id": "uuid"
}
```

### Response (200)
```json
{
  "message": "Kode verifikasi telah dikirim"
}
```

---

## Verify Account
`POST /api/auth/verify`

### Request Body
```json
{
  "user_id": "uuid",
  "code": "123456"
}
```

### Response (200)
```json
{
  "message": "Akun berhasil diverifikasi"
}
```

## Notes
- Verification code is 6 digits
- **Code stored in Redis** with 3 minute TTL (auto-expires)
- Supports email (implemented) and phone/SMS (placeholder for future)

## Redis Keys
- `verify:{user_id}` — stores verification code, TTL 3 minutes
