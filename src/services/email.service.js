import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()


// ye func SMTP connection ko configure krta h
// helps in send message to smtp server
const transporter = nodemailer.createTransport({
    // host: 'smtp.gmail.com',
    // port: 465,
    // secure: true,
    service: 'gmail',   // when using 'service' as 'gmail' --- nodemailer automaticlly maps: 
    // smtp.gmail.com
    // port 465
    // secure true
    auth: {
        // user: process.env.EMAIL_USER,
        // pass: process.env.EMAIL_PASS
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
})
transporter.verify((error, success) => {
    if (error) {
        console.log(`Error connecting to mail server ${error}`);
        throw new Error(error.message)
    }
    else {
        console.log(`Email server connected to send message ${success}`);
    }
})

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `Ramiz : ${process.env.EMAIL_USER}`,
            to,
            subject,
            text,
            html
        })
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export const sendRegistrationEmail = async (userEmail, name) => {
    const subject = "Bank Transaction System — Welcome email 🎉";
    const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome, ${name} 👋</h2>
                <p>We're excited to have you onboard.</p>
                <p>Your account has been successfully created.</p>
                <p>If you have any questions, feel free to reply to this email.</p>
                <br />
                <p><strong>— Ramiz</strong></p>
            </div>
        `;
    // const text = `<p>Please review and do let me know...</p><strong>— Ramiz</strong>`

    await sendEmail(userEmail, subject, null, html)
}