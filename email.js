const nodemailer = require('nodemailer');

// Configure the email transport using the default SMTP transport and a GMail account.
// For other providers, update the service and authentication as needed.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password'   // Replace with your email password
    }
});

/**
 * Sends a confirmation email.
 * @param {string} recipientEmail - The email address of the recipient.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} html - The HTML body of the email.
 */
const sendConfirmationEmail = (recipientEmail, subject, text, html) => {
    const mailOptions = {
        from: 'your-email@gmail.com', // Replace with your email
        to: recipientEmail,
        subject: subject,
        text: text,
        html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email: ', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

// Example usage:
// sendConfirmationEmail(
//     'recipient-email@example.com',
//     'Appointment Confirmation',
//     'Your appointment has been confirmed.',
//     '<h1>Appointment Confirmation</h1><p>Your appointment has been confirmed.</p>'
// );

module.exports = sendConfirmationEmail;
