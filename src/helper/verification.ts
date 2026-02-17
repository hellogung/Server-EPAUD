import { logger } from "../config/logger"

export const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Email service - placeholder for future implementation
export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
    // TODO: Implement actual email sending (nodemailer, resend, etc.)
    logger.info(`[VERIFICATION] Code ${code} sent to ${email}`)
    console.log(`📧 Verification code for ${email}: ${code}`)
    return true
}

// SMS/WhatsApp service - placeholder for future implementation  
export const sendVerificationSMS = async (phone: string, code: string): Promise<boolean> => {
    // TODO: Implement actual SMS/WhatsApp sending
    logger.info(`[VERIFICATION] Code ${code} sent to ${phone}`)
    console.log(`📱 Verification code for ${phone}: ${code}`)
    return true
}
