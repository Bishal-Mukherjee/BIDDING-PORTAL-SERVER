const { Router } = require("express");
const router = Router();
const {
  getAllTask,
  getTaskById,
  //   createTask,
  deleteTask,
  updateTask,
} = require("../../controllers/client");
const { auth } = require("../../middlewares/auth");

router.get("/getAllTask", auth("CLIENT"), getAllTask);

// router.post("/createTask", auth("CLIENT"), createTask);

router.get("/getTask/:taskId", auth("CLIENT"), getTaskById);

router.delete("/deleteTask/:taskId", auth("CLIENT"), deleteTask);

router.put("/updateTask/:taskId", auth("CLIENT"), updateTask);

module.exports = router;
