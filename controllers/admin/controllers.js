const dayjs = require("dayjs");
const Task = require("../../models/tasks");
const Bid = require("../../models/bids");

/* @desc:  Retrieves all tasks from the database and returns
   them in a sorted order based on creation date. */
// @route: GET /api/admin/getAllTask
exports.getAllTask = async (req, res) => {
  try {
    const tasks = await Task.aggregate([
      { $addFields: { images: { $size: "$images" } } },
      { $sort: { createdAt: -1 } },
      { $project: { _id: 0, __v: 0 } },
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
      { $set: { assignedTo: bid.bidder.name, status: "assigned" } }
    );

    return res.status(200).json({ message: "Bid selected successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to select bid" });
  }
};
