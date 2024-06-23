const { getDatabase } = require("firebase-admin/database");
const { compactUUID } = require("../utils/stringUtils");
const { NOTIFICATION_CONFIG } = require("./config");

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
