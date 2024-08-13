const actionMap = {
  "client-sign-up": {
    path: "../views/client/sign-up/index.hbs",
    subject: "Welcome to HVAC Negotiators",
  },
  "new-task": {
    path: "../views/client/new-task/index.hbs",
    subject: "New task created",
  },
  "task-activated": {
    path: "../views/client/task-activated/index.hbs",
    subject: "Task activated",
  },
  "company-sign-up": {
    path: "../views/company/sign-up/index.hbs",
    subject: "Welcome to HVAC Negotiators",
  },
  "task-assigned": {
    path: "../views/company/task-assigned/index.hbs",
    subject: "Task assigned",
  },
};

module.exports = { actionMap };
