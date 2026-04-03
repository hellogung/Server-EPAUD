import { sendEmail } from "./src/helper/email"

(async () => {
    try {
        const content = `
        Halo agung, ini testing email menggunakan resend 2
    `
        await sendEmail("gunghello@gmail.com", "AKTIFASI AKUN EPAUD", content)
        console.log("Email berhasil dikirim")
    } catch (error) {
        console.error("Gagal mengirim email:", error)
    }
})()