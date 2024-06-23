const { compactUUID } = require("../../utils/stringUtils");
const Task = require("../../models/tasks");
const { createNotification } = require("../../notification/controller");
const { NOTIFICATION_TYPE } = require("../../notification/config");

/* desc: Retrieves tasks created by the logged in user */
// route: GET /api/client/getAllTask
exports.getAllTask = async (req, res) => {
  const { email } = req.user;
  const { status = "created" } = req.query;

  try {
    const tasks = await Task.aggregate([
      { $match: { email, status } },
      { $addFields: { images: { $size: "$images" } } },
      { $sort: { createdAt: -1 } },
      { $project: { _id: 0, email: 0, __v: 0 } },
    ]).exec();
    if (!tasks) {
      return res.status(404).json({ tasks: [] });
    }
    return res.status(200).json({ tasks });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to get tasks" });
  }
};

/* desc: Retrieves a specific task by its taskId */
// route: GET /api/client/getTask/:taskId
exports.getTaskById = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findOne({ id: taskId }).select("-_id");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json(task);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to get task" });
  }
};

/* desc: Creates a new task */
// route: POST /api/client/createTask
// body: { title, description, images, address }
exports.createTask = async (req, res) => {
  const { firstName, lastName, email } = req.user;
  const { title, description, images, address } = req.body;

  if (!title || !address) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const id = compactUUID();

    const task = new Task({
      id,
      title,
      description,
      status: "created",
      name: `${firstName} ${lastName}`,
      email,
      images,
      address,
    });

    await task.save();

    // create notification for admin
    createNotification({
      type: NOTIFICATION_TYPE.TASK_CREATED,
      title: `${firstName} ${lastName}`,
      resourceId: id,
    });
    return res.status(201).json({
      message: "Task created successfully",
      taskId: id,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Failed to create task" });
  }
};

/* desc: Deletes a specific task by its taskId */
// route: DELETE /api/client/deleteTask/:taskId
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findOne({ id: taskId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // only inactive task, can be deleted
    if (!task.isActive) {
      await Task.deleteOne({ id: taskId });
      return res.status(200).json({ message: "Task deleted successfully" });
    }
    return res.status(400).json({ message: "Task cannot be deleted" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Failed to delete task" });
  }
};

/* desc: Updates a specific task by its taskId */
// route: PUT /api/client/updateTask/:taskId
// body: { title, description, images }
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, images } = req.body;

  try {
    const task = await Task.findOne({ id: taskId });
    const updateFields = {};

    if (!task.isActive) {
      if (title) {
        updateFields.title = title;
      }

      if (description) {
        updateFields.description = description;
      }

      if (images && images.length > 0) {
        updateFields.images = images;
      }

      if (Object.keys(updateFields).length > 0) {
        await Task.updateOne({ id: taskId }, { $set: updateFields });
        return res.status(200).json({ message: "Task updated successfully" });
      } else {
        return res.status(400).json({ message: "No fields to update" });
      }
    }
    return res
      .status(400)
      .json({ message: "Failed to update. Task is active" });
  } catch (err) {
    console.error("Error updating task:", err);
    return res.status(500).json({ message: "Failed to update task" });
  }
};
