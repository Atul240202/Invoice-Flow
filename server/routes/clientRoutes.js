const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  syncClientsFromInvoices,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,
} = require("../controllers/clientController");

router.use(authMiddleware);

router.get("/", getClients);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
router.patch("/:id/status", toggleClientStatus);

// For syncing from invoices
router.post("/sync-from-invoices", syncClientsFromInvoices);

module.exports = router;
