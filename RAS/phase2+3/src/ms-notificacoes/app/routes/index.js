const express = require('express');
const router = express.Router();
const Notification = require('../controllers/notification');
const Email = require("../controllers/email");


// Gets
router.get("/:mec", Notification.byUserMec);

// Posts
router.post("/", Notification.addNotificacao);
router.post("/sendEmail", Email.sendEmail);

// Put
router.put("/:id/:read", Notification.readNotification);

// Delete
router.delete("/:mec", Notification.deleteNotification);

module.exports = router;
