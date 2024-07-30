const {
    EMAIL_SENDER_USER,
    EMAIL_SENDER_PASSWORD,
    EMAIL_SERVICE_HOST,
    EMAIL_SERVICE_PORT
} = process.env;

module.exports = {
    transporter: {
        host: EMAIL_SERVICE_HOST,
        port: EMAIL_SERVICE_PORT,
        secure: true,
        auth: {
            user: EMAIL_SENDER_USER,
            pass: EMAIL_SENDER_PASSWORD,
        },
    },
    from: `Probum2C - <${EMAIL_SENDER_USER}>`
};