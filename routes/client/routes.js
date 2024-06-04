const { Router } = require("express");
const router = Router();
const {
  getAllTask,
  getTaskById,
  createTask,
  deleteTask,
  updateTask,
} = require("../../controllers/client");
const { auth } = require("../../middlewares/auth");

router.get("/getAllTask", auth, getAllTask);

router.post("/createTask", auth, createTask);

router.get("/getTask/:taskId", auth, getTaskById);

router.put("/updateTask/:taskId", auth, updateTask);

router.delete("/deleteTask/:taskId", auth, deleteTask);

module.exports = router;
