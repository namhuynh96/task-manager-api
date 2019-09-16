const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'huynhnam96@gmail.com',
        subject: 'Thank you for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelAccountEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'huynhnam96@gmail.com',
        subject: 'Goodbye!',
        text: `Hello, ${name}. Thank you for using our app. Could you give me a reason why you cancel the service?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelAccountEmail
}