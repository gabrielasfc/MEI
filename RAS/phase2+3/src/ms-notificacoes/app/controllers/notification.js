const db = require("../models");
const nodemailer = require("nodemailer");
const emailConfig = require("../config/email.config");
const Notification = db.notification;

module.exports.byUserMec = async (req, res) => {
    const { mec } = req.params;

    try {
        var notifs = await Notification.find({'receivers.mec': mec});
	    if (notifs.length > 0) {
            notifs.forEach(function(notif, n_index, n_array) {
                notif.receivers.forEach(function(receiver, r_index, r_array) {
                    if (receiver.mec !== mec) {
                        r_array.splice(r_index, 1);
                    }
                });
                if (notif.receivers.length === 0) {
                    n_array.splice(n_index, 1);
                }
            });
        }
        res.json(notifs);        
    } catch (error) {
        console.error("Erro ao obter notificações:", error);
        res.status(500).json({ error: "Erro ao obter notificações" });
    }
};

module.exports.addNotificacao = async (req, res) => {
    try {
        const notif = await Notification.create(req.body);
        if (notif) {
            res.status(201).json(notif);
        } else {
            res.status(602).json({ message: "Erro ao criar notificação"})
        }
    } catch (error) {
        console.error("Erro ao criar notificação:", error);
        res.status(500).json({ error: "Erro ao criar notificação" });
    }
};

module.exports.readNotification = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            {'receivers._id': req.params.id},
            {$set: {'receivers.$.read': req.params.read}}
        );

        if (result.nModified === 0) {
            throw new Error("Nenhuma notificação encontrada para atualizar");
        }

        res.json(result);
    } catch (error) {
        console.error("Erro ao atualizar notificação:", error);
        res.status(500).json({ error: "Erro a atualizar o estado read da notificacao" });
    }
};

module.exports.deleteNotification = async (req, res) => {
    try {
        const mecToDelete = req.params.mec;

        // Encontra todas as notificações que têm o receiver com o mec correspondente
        const notifications = await Notification.find({ 'receivers.mec': mecToDelete });

        // Atualiza cada notificação removendo o receiver com o mec correspondente
        for (const notification of notifications) {
            notification.receivers = notification.receivers.filter(receiver => receiver.mec !== mecToDelete);
            
            // Se a notificação ficar sem receivers, remove a notificação completamente
            if (notification.receivers.length === 0) {
                await Notification.deleteOne({ _id: notification._id });
            } else {
                await notification.save();
            }
        }

        res.json({ success: true, message: 'Receivers removidos com sucesso' });
    } catch (error) {
        console.error("Erro ao remover receiver da notificação:", error);
        res.status(500).json({ error: "Erro ao remover receiver da notificação" });
    }
};
