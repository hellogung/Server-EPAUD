# School Data API

## Get School
`GET /api/school/:id`

**Auth Required:** Yes (Bearer Token)

### Response (200)
```json
{
  "data": {
    "id": "uuid",
    "school_name": "TK Ceria",
    "address": "Jl. Merdeka No. 1",
    "school_type": "swasta",
    "school_category": "tk",
    "npsn": "12345678",
    "accreditation": "A",
    "createdAt": "2026-02-17T00:00:00.000Z",
    "updatedAt": "2026-02-17T00:00:00.000Z"
  }
}
```

---

## Update School Data
`PATCH /api/school/:id`

**Auth Required:** Yes (Bearer Token)

### Request Body
```json
{
  "address": "Jl. Merdeka No. 1, Jakarta",
  "school_type": "swasta",
  "school_category": "tk",
  "npsn": "12345678",
  "accreditation": "A"
}
```

**Notes:**
- All fields are optional
- `school_type`: `negeri` | `swasta`
- `school_category`: `sps` | `tk` | `kb`
- `accreditation`: `A` | `B` | `C`

### Response (200)
```json
{
  "message": "Data sekolah berhasil diperbarui",
  "data": {
    "id": "uuid",
    "school_name": "TK Ceria",
    "address": "Jl. Merdeka No. 1, Jakarta",
    "school_type": "swasta",
    "school_category": "tk",
    "npsn": "12345678",
    "accreditation": "A"
  }
}
```
