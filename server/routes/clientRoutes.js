const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  syncClientsFromInvoices,
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,
} = require("../controllers/clientController");

router.use(authMiddleware);

// For syncing from invoices
router.post("/sync-from-invoices", syncClientsFromInvoices);

router.get("/", getClients);
router.get("/:id", getClientById);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
router.patch("/:id/toggle", toggleClientStatus);

module.exports = router;
