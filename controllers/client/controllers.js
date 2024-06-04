const { compactUUID } = require("../../utils/stringUtils");
const Task = require("../../models/tasks");

exports.getAllTask = async (req, res) => {
  const { email } = req.user;

  try {
    const tasks = await Task.aggregate([
      { $match: { email } },
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

exports.createTask = async (req, res) => {
  const { firstName, lastName, email } = req.user;
  const { title, description, images } = req.body;

  if (!title) {
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
    });

    await task.save();
    return res.status(201).json({
      message: "Task created successfully",
      taskId: id,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Failed to create task" });
  }
};

exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    await Task.deleteOne({ id: taskId });
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Failed to delete task" });
  }
};

exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, images } = req.body;

  try {
    const task = await Task.findOne({ id: taskId });
    const updateFields = {};

    if (title) {
      updateFields.title = title;
    }

    if (description) {
      updateFields.description = description;
    }

    if (images && images.length > 0) {
      updateFields.images = [...task.images, ...images];
    }

    if (Object.keys(updateFields).length > 0) {
      await Task.updateOne({ id: taskId }, { $set: updateFields });
      return res.status(200).json({ message: "Task updated successfully" });
    } else {
      return res.status(400).json({ message: "No fields to update" });
    }
  } catch (err) {
    console.error("Error updating task:", err);
    return res.status(500).json({ message: "Failed to update task" });
  }
};
