const { Router } = require("express");
const router = Router();
const { auth } = require("../../middlewares/auth");
const {
  getTasks,
  getTaskById,
  createBid,
  markInProgress,
} = require("../../controllers/company");

router.get("/getTasks", auth("COMPANY"), getTasks);

router.get("/getTask/:taskId", auth("COMPANY"), getTaskById);

router.post("/createBid/:taskId", auth("COMPANY"), createBid);

router.put("/makeInProgress/:taskId", auth("COMPANY"), markInProgress);

module.exports = router;
