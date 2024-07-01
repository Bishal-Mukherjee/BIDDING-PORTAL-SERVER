const { Router } = require("express");
const router = Router();
const {
  getAllTask,
  getTaskById,
  getRecentTasks,
  updateTaskStatus,
  updateSelectBid,
  updateActivateTask,
  updateTask,
  postCreateClient,
  //   createTask,
  //   deleteTask,
} = require("../../controllers/admin");
const { auth } = require("../../middlewares/auth");
// const { sendEmail } = require("../../notification/controller");

router.get("/getAllTask", auth("ADMIN"), getAllTask);

router.get("/getTask/:taskId", auth("ADMIN"), getTaskById);

router.get("/getRecentTasks", auth("ADMIN"), getRecentTasks);

router.put("/updateTaskStatus/:taskId", auth("ADMIN"), updateTaskStatus);

router.put("/updateSelectBid/:taskId/:bidId", auth("ADMIN"), updateSelectBid);

router.put("/updateActivateTask/:taskId", auth("ADMIN"), updateActivateTask);

router.put("/updateTask/:taskId", auth("ADMIN"), updateTask);

router.post("/createClient", auth("ADMIN"), postCreateClient);

// router.get("/email", async (req, res) => {
//   await sendEmail({
//     to: "jmtbiswa.dev@gmail.com",
//     subject: "Test Email",
//     text: "This is a test email sent",
//     html: "<b>This is a test email sent</b>",
//   })
//     .then((info) => {
//       console.log("Email sent successfully!");
//     })
//     .catch((error) => {
//       console.error("Error sending email:", error);
//     });

//   return res.status(200).json({ message: "Email triggered successfully" });
// });

// router.post("/createTask", auth("CLIENT"), createTask);

// router.delete("/deleteTask/:taskId", auth("CLIENT"), deleteTask);

module.exports = router;
