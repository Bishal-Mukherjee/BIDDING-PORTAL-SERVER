const dayjs = require("dayjs");
const Task = require("../../models/tasks");
const Bid = require("../../models/bids");
const InterestedClients = require("../../models/interested-clients");
const { auth } = require("firebase-admin");
const { compactUUID } = require("../../utils/stringUtils");
const { sendEmail } = require("../../notification/controller");

/* @desc:  Retrieves all tasks from the database and returns
   them in a sorted order based on creation date. */
// @route: GET /api/admin/getAllTask
exports.getAllTask = async (req, res) => {
  const { status = "created" } = req.query;

  try {
    const tasks = await Task.aggregate([
      { $match: { status } },
      {
        $addFields: {
          previewImage: {
            $cond: [
              { $gt: [{ $size: "$images" }, 0] },
              { $arrayElemAt: ["$images", 0] },
              "",
            ],
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $project: { _id: 0, __v: 0, images: 0, address: 0 } },
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

/* @desc:  Retrieves a specific task by its taskId and also retrieves 
   all bids associated with that task */
// @route: GET /api/admin/getTask/:taskId
exports.getTaskById = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findOne({ id: taskId }).select("-_id");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const bids = await Bid.find({ taskId }).select("-_id").sort({ amount: 1 });
    return res.status(200).json({ task, bids });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to get task" });
  }
};

/* @desc:  Retrieves tasks created within the last seven days. */
// @route: GET /api/admin/getRecentTasks
exports.getRecentTasks = async (req, res) => {
  const sevenDaysAgo = dayjs().subtract(7, "day").toDate();

  try {
    const tasks = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      { $addFields: { images: { $size: "$images" } } },
      { $sort: { createdAt: -1 } },
      { $project: { _id: 0, id: 1, title: 1 } },
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

/* desc: Creates a new task */
// route: POST /api/admin/createTask
// body: { firstName, lastName, email, title, description, images, attachments, address }
exports.createTask = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    title,
    description,
    address,
    images,
    attachments,
  } = req.body;

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
      address,
      images,
      attachments,
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

/* desc: Updates a specific task by its taskId */
// route: PUT /api/admin/updateTask/:taskId
// body: { title, description, images }
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, images, attachments } = req.body;

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

      if (attachments && attachments.length > 0) {
        updateFields.attachments = attachments;
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

/* @desc:  Updates the status of a task in the database. */
// @route: PUT /api/admin/updateTaskStatus/:taskId
// body: { status }
exports.updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findOne({ id: taskId }).select("-_id");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await Task.updateOne({ id: taskId }, { $set: { status } });
    return res
      .status(200)
      .json({ message: "Task status updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to update task status" });
  }
};

/* @desc:  Updates the isActive of a task in the database. */
// @route: POST /api/admin/updateActivateTask/:taskId
exports.updateActivateTask = async (req, res) => {
  const { taskId } = req.params;
  const { suggestedBidders } = req.body;
  try {
    const task = await Task.findOne({ id: taskId }).select("-_id");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await Task.updateOne(
      { id: taskId },
      { $set: { isActive: true, suggestedBidders, activationDate: new Date() } }
    );
    return res.status(200).json({ message: "Task activated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to activate task" });
  }
};

/* @desc: Selects a bid for a task, marking it as "accepted" and 
   rejecting all other bids for that task. */
// @route: PUT /api/admin/updateSelectBid/:taskId/:bidId
exports.updateSelectBid = async (req, res) => {
  const { taskId, bidId } = req.params;
  try {
    const task = await Task.findOne({ id: taskId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.assignedTo) {
      const bid = await Bid.findOne({ id: bidId });

      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      await Bid.updateOne({ id: bidId }, { $set: { status: "accepted" } });

      await Bid.updateMany(
        { taskId: taskId, id: { $ne: bidId } },
        { $set: { status: "rejected" } }
      );

      await Task.updateOne(
        { id: taskId },
        {
          $set: {
            assignedTo: { name: bid.bidder.name, email: bid.bidder.email },
            status: "assigned",
          },
        }
      );

      return res.status(200).json({ message: "Bid selected successfully" });
    }
    return res.status(400).json({ message: "Task already assigned" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to select bid" });
  }
};

exports.postCreateClient = async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  try {
    const userData = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      designation: "CLIENT",
    };
    await auth().createUser(userData);
    return res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to create user" });
  }
};

/* desc: Retrieves all interested clients */
// route: GET /api/admin/getInterestedClients
exports.getInterestedClients = async (req, res) => {
  try {
    const clients = await InterestedClients.find().select("-_id");
    if (!clients) {
      return res.status(404).json({ message: "Interested clients not found" });
    }
    return res.status(200).json(clients);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

/* desc: Sends email to interested clients */
// route: POST /api/admin/email/:action
exports.postSendEmail = async (req, res) => {
  const { action } = req.params;
  const { email, context } = req.body;

  try {
    await sendEmail({ action, to: email, context });
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to send email" });
  }
};

/* desc: Clears all tasks related to a user */
// route: POST /api/admin/clearUserRelatedTasks/:email
exports.clearUserRelatedTasks = async (req, res) => {
  const { email } = req.params;
  try {
    await Task.deleteMany({ email: { email } });
    return res
      .status(200)
      .json({ message: "User related tasks cleared successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Failed to clear user related tasks" });
  }
};
