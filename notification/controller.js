const { getDatabase } = require("firebase-admin/database");
// const nodemailer = require("nodemailer");
const { compactUUID } = require("../utils/stringUtils");
const { NOTIFICATION_CONFIG } = require("./config");
require("dotenv").config();

exports.createNotification = ({
  title,
  description,
  resourceType,
  resourceId,
  type,
}) => {
  try {
    const notification = {
      id: compactUUID(),
      title,
      description: description || NOTIFICATION_CONFIG[type].description,
      resourceType: resourceType || NOTIFICATION_CONFIG[type].resourceType,
      resourceId,
      type,
      createdAt: new Date().toISOString(),
      isUnRead: true,
    };
    const database = getDatabase();
    database.ref(`/${notification.id}`).set(notification);
    return notification;
  } catch (err) {
    console.log(err.message);
  }
};

// exports.sendEmail = async ({ to, subject, text, html }) => {
//   let transporter = nodemailer.createTransport({
//     host: process.env.SENDER_HOST,
//     port: process.env.SENDER_PORT,
//     secure: false,
//     auth: {
//       user: process.env.SENDER_EMAIL,
//       pass: process.env.SENDER_PASSWORD,
//     },
//   });

//   let mailOptions = {
//     from: process.env.SENDER_EMAIL,
//     to,
//     subject,
//     text,
//     html,
//   };

//   try {
//     let info = await transporter.sendMail(mailOptions);
//     console.log("Message sent: %s", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// };
