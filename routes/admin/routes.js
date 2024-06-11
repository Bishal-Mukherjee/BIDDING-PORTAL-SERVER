const { Router } = require("express");
const router = Router();
const {
  getAllTask,
  getTaskById,
  getRecentTasks,
  updateTaskStatus,
  updateSelectBid,
  updateActivateTask,
  //   createTask,
  //   deleteTask,
  //   updateTask,
} = require("../../controllers/admin");
const { auth } = require("../../middlewares/auth");

router.get("/getAllTask", auth("ADMIN"), getAllTask);

router.get("/getTask/:taskId", auth("ADMIN"), getTaskById);

router.get("/getRecentTasks", auth("ADMIN"), getRecentTasks);

router.put("/updateTaskStatus/:taskId", auth("ADMIN"), updateTaskStatus);

router.put("/updateSelectBid/:taskId/:bidId", auth("ADMIN"), updateSelectBid);

router.put("/updateActivateTask/:taskId", auth("ADMIN"), updateActivateTask);

// router.post("/createTask", auth("CLIENT"), createTask);

// router.put("/updateTask/:taskId", auth("CLIENT"), updateTask);

// router.delete("/deleteTask/:taskId", auth("CLIENT"), deleteTask);

module.exports = router;
