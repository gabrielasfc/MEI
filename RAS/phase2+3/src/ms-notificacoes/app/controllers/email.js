const nodemailer = require('nodemailer');
const emailConfig = require("../config/email.config.js");
const transporter = nodemailer.createTransport(emailConfig.transporter)

module.exports.sendEmail = async function(req, res) {
    const { receiverList, email } = req.body;
    const emailList = receiverList.map(receiver => receiver.email);

    // Configurar o e-mail a ser enviado
    const mailOptions = {
        from: emailConfig.from,
        to: emailList,
        subject: email.subject,
        html: email.content
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erro no envio de e-mails:', error);
            res.status(500).json({ message: "Erro no envio de e-mails" });
        } else {
            console.log('E-mail(s) enviado(s) com sucesso:', info);
            res.status(200).json({ message: "E-mail(s) enviado(s) com sucesso" });
        }
    });

};