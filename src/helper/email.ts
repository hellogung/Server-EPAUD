import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (to: string, subject: string, html: string) => {

    const from = `SERVICE EPAUD <service@${process.env.RESEND_EMAIL_FROM}>`

    await resend.emails.send({
        from,
        to,
        subject,
        html,
    })
}