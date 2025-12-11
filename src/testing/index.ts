import { sign, verify, decode } from "hono/jwt"
// (async () => {

//     const payload = {
//         name: "Agung Gumelar",
//         role: "admin",
//         email: "gunghello@gmail.com",
//         exp: Math.floor(Date.now() / 1000) + 60 * 5 // Token expire 5 menit
//     }

//     const secret = process.env.SECRET_KEY as string

//     const token = await sign(payload, secret)
//     console.log(token)
// })()

(async () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQWd1bmcgR3VtZWxhciIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiZ3VuZ2hlbGxvQGdtYWlsLmNvbSIsImV4cCI6MTc2NDk0ODQyMH0.3fwRAkySUKL5JFSL7h86sPOdbXJ_x5AMHRScW-8TLcA"
    const secret_key = process.env.SECRET_KEY as string

    
    const decode = await verify(token, secret_key)
    console.log(decode)
    
    // const {header, payload} = decode(token)
    // console.log(header)
    // console.log(payload)
})()