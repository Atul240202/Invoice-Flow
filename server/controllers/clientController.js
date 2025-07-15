const Invoice = require("../models/Invoice");
const Client = require("../models/Client");

exports.syncClientsFromInvoices = async (req, res) => {
  try {
    const userId = req.user._id;

    const invoices = await Invoice.find({ user: userId });

    const map = new Map();

    invoices.forEach((inv) => {
      const bt = inv.billTo;
      const key = bt.email || bt.businessName;

      if (!map.has(key)) {
        map.set(key, {
          user: userId,
          name: bt.businessName,
          email: bt.email,
          company: bt.businessName,
          industry: bt.industry || "General",
          phone: bt.phone,
          gstin: bt.gstin,
          pan:           bt.pan,
          address:       bt.address,
          city:          bt.city,
          state:         bt.state,
          pincode:       bt.pincode,
          country:       bt.country || "India",
          status: "Active",
          lastActivity: when || inv.date || new Date(),
          totalRevenue: amount || inv.grandTotal || 0,
          invoiceCount: 1
        });
      } else {
        const ex = map.get(key);
        ex.totalRevenue  += amount;
        ex.totalInvoices += 1;
        if (when > ex.lastActivity) ex.lastActivity = when;
        map.set(key, ex);
      }
    });

    const uniqueClients = Array.from(map.values());

    // Upsert into Client collection
    for (const clientData of uniqueClients) {
      await Client.findOneAndUpdate(
        { user: userId, email: clientData.email || undefined, name: clientData.name},
        { $set: clientData },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Client sync successful", clients: uniqueClients });
  } catch (err) {
    console.error("Error syncing clients:", err);
    res.status(500).json({ message: "Failed to sync clients from invoices" });
  }
};

//get clients with filters
exports.getClients = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, industry, search } = req.query;

    const query = { user: userId };

    if (status) query.status = status;
    if (industry) query.industry = industry;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { company: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }

    const clients = await Client.find(query).sort({ updatedAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//add a new client
exports.createClient = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name, email, company, industry,
      phone, gstin, address,
    } = req.body;

    const newClient = new Client({
      user: userId,
      name,
      email,
      company,
      industry,
      phone,
      gstin,
      address,
    });

    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ message: "Failed to create client" });
  }
};

//update or edit a client
exports.updateClient = async (req, res) => {
  try {
    const userId = req.user._id;
    const clientId = req.params.id;

    const client = await Client.findOne({ _id: clientId, user: userId });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    Object.assign(client, req.body);
    await client.save();

    res.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Failed to update client" });
  }
};

//delete a client
exports.deleteClient = async (req, res) => {
  try {
    const userId = req.user._id;
    const clientId = req.params.id;

    const deleted = await Client.findOneAndDelete({ _id: clientId, user: userId });
    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deleted" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ message: "Failed to delete client" });
  }
};

//toggle status
exports.toggleClientStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const clientId = req.params.id;

    const client = await Client.findOne({ _id: clientId, user: userId });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.status = client.status === "Active" ? "Inactive" : "Active";
    await client.save();

    res.json({ message: `Client status changed to ${client.status}`, client });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({ message: "Failed to toggle status" });
  }
};