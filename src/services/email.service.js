import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    }
})

transporter.verify((error, success) => {
    if (error) {
        console.log(`Error connecting to mail server ${error}`);
        throw new Error
    }
    else {
        console.log(`Email server connected to send message ${success}`);
    }
})

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = transporter.sendMail({
            from: `Ramiz : ${process.env.EMAIL_USER}`,
            to,
            subject,
            text,
            html
        })
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}