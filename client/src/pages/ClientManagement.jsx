import { useState } from "react";

import { Button } from "../components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown-menu";
import { Search, Filter, Eye, Edit, Copy, Trash2, Download, Send, MoreHorizontal, X, FileText, Menu } from "lucide-react";
import { useToast } from "../hooks/toast";
import { Textarea } from "../components/Textarea";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import api from "../utils/api";
import { useEffect } from "react";
import { useMemo } from "react";

const ClientManagement = () => {
   const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    gstNumber: "",
    pan: ""
  });
  const [invoiceData, setInvoiceData] = useState({ invoices: [] });
  const { invoices } = invoiceData;

  useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const res = await api.get("/invoices"); 
      console.log("Fetched Invoices:", res.data);
      setInvoiceData(res.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices.",
      });
    }
  };

  fetchInvoices();
}, []);

  useEffect(() => {
  const fetchClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      toast({
        title: "Error",
        description: "Failed to fetch clients.",
      });
    }
  };

  fetchClients();
}, []);

const clientStatsMap = useMemo(() => {
  return invoices.reduce((acc, inv) => {
    const clientId = (inv.billToDetail && inv.billToDetail._id) ||
    inv.billToDetail || null;

    if (!clientId) return acc;

    const invoiceDate = new Date(inv.invoiceDate || inv.date || inv.createdAt); 

    if (!acc[clientId]) {
      acc[clientId] = {
        totalRevenue: 0,
        totalInvoices: 0,
        latestInvoiceDate: invoiceDate,
      };
    } 

       acc[clientId].totalRevenue +=
      (inv.summary?.totalAmount) ??
      inv.amount ??                 
      0;
      acc[clientId].totalInvoices += 1;

      if (invoiceDate > acc[clientId].latestInvoiceDate) {
        acc[clientId].latestInvoiceDate = invoiceDate;
      }

    return acc;
  }, {});
}, [invoices]);

  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);

const uniqueIndustries = Array.from(
  new Set(
    clients
      .map(c => c.industry)
      .filter(Boolean)
  )
).sort();

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || (client.status?.toLowerCase() === statusFilter.toLowerCase());
    const matchesIndustry = industryFilter === "all" || client.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const getTotalRevenue = () => {
  return invoices.reduce((sum, inv) => sum + (inv.summary?.totalAmount || 0), 0);
};

const getAvgInvoiceValue = () => {
  const totalInvoices = Array.isArray(invoices) ? invoices.length : 0;
  return totalInvoices > 0
    ? getTotalRevenue() / totalInvoices
    : 0;
};
  

  const getActiveClientsThisMonth = () => {
    return filteredClients.filter(client => {
      const lastActivityDate = new Date(client.lastActivity);
      const now = new Date();
      return lastActivityDate.getMonth() === now.getMonth() && lastActivityDate.getFullYear() === now.getFullYear();
    }).length;
  };

  const totalRevenue = getTotalRevenue();
  const avgInvoiceValue = getAvgInvoiceValue();
  const activeThisMonth = getActiveClientsThisMonth();

  const handleAction = (action, clientId) => {
  const client = clients.find((c) => c._id === clientId);
  if (!client) return;

  switch (action) {
    case "viewed":
      navigate(`/clients/${clientId}`);
      break;

    case "edited":
      navigate(`/clients/edit/${clientId}`, { state: { client } });
      break;

    case "invoiced":
      navigate(`/create-invoice`, { state: { client } });
      break;

    case "deleted":
      if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
        deleteClient(clientId);
      }
      break;

    default:
      break;
  }
};

const deleteClient = async (clientId) => {
  try {
    await api.delete(`/clients/${clientId}`);
    setClients(prev => prev.filter(client => client._id !== clientId));
    toast({
      title: "Client Deleted",
      description: "Client has been removed successfully.",
    });
  } catch (err) {
    console.error("Error deleting client:", err);
    toast({
      title: "Error",
      description: "Failed to delete client.",
    });
  }
};

const handleAddClient = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...newClient,
      gstin: newClient.gstNumber,
    };

    const response = await api.post("/clients", payload);
    setClients(prev => [...prev, response.data]);

    toast({
      title: "Client Added",
      description: `${response.data.name} has been added successfully.`,
    });

    setNewClient({
      name: "",
      email: "",
      company: "",
      industry: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      gstNumber: "",
      pan: ""
    });
    setShowAddForm(false);
  } catch (err) {
    console.error("Error adding client:", err);
    toast({
      title: "Error",
      description: "Failed to add client.",
    });
  }
};

  const toggleClientStatus = async (clientId) => {
  try {
    const response = await api.patch(`/clients/${clientId}/toggle`);
    const updatedClient = response.data.client;

    setClients(prev =>
      prev.map(c => c._id === updatedClient._id ? updatedClient : c)
    );
    toast({
      title: "Status Updated",
      description: `Client is now ${updatedClient.status}`,
    });
  } catch (err) {
    console.error("Error toggling status:", err);
    toast({
      title: "Error",
      description: "Failed to toggle client status.",
    });
  }
};

  return (
      <div className="mx-auto w-full max-w-[calc(100vw-10px)] md:max-w-[calc(100vw-90px)] lg:max-w-7xl space-y-6">
          {/* Header */}
   <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
    <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
      <div className="w-full animate-fade-in space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Enhanced Header - Responsive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="space-y-2 min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black tracking-tight truncate">Client Management</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed font-medium">
                Manage your client relationships and track their business interactions
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button 
                onClick={() => navigate('/clients/new')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base whitespace-nowrap"
              >
                Add New Client +
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards - Responsive Grid */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4 w-full">
          <Card className="p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20 min-w-0">
            <CardHeader className="pb-2 sm:pb-4 p-0">
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider truncate">Total Clients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-1 sm:mb-2 truncate">{filteredClients.length}</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Active clients</p>
            </CardContent>
          </Card>
          <Card className="p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20 min-w-0">
            <CardHeader className="pb-2 sm:pb-4 p-0">
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider truncate">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 mb-1 sm:mb-2 truncate">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">From all clients</p>
            </CardContent>
          </Card>
          <Card className="p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20 min-w-0">
            <CardHeader className="pb-2 sm:pb-4 p-0">
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider truncate">Active This Month</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 mb-1 sm:mb-2 truncate">{activeThisMonth}</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Recent interactions</p>
            </CardContent>
          </Card>
          <Card className="p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20 min-w-0">
            <CardHeader className="pb-2 sm:pb-4 p-0">
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider truncate">Avg. Invoice Value</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 mb-1 sm:mb-2 truncate">₹{avgInvoiceValue.toLocaleString()}</div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Per client</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters - Mobile Responsive */}
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl transition-all duration-300 w-full">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Mobile Filter Toggle */}
            <div className="flex flex-col space-y-4 w-full">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="text-lg font-semibold text-black truncate">Search & Filter</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="p-2 flex-shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Search Bar - Always Visible */}
              <div className="relative w-full">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                <Input
                  placeholder="Search clients by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-gray-300 focus:border-blue-500 input-hover bg-white text-black placeholder:text-gray-500 w-full"
                />
              </div>

              {/* Filters - Desktop Always Visible, Mobile Collapsible */}
              <div className={`flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 w-full ${showMobileFilters ? 'flex' : 'hidden lg:flex'}`}>
                <div className="w-full lg:w-auto lg:max-w-[150px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-gray-300 filter-hover focus:border-blue-500 bg-white text-black">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border-2 border-gray-200">
                      <SelectItem value="all" className="text-black dropdown-item">All Status</SelectItem>
                      <SelectItem value="Active" className="text-black dropdown-item">Active</SelectItem>
                      <SelectItem value="Inactive" className="text-black dropdown-item">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full lg:w-auto lg:max-w-[150px]">
                  <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="w-full h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-gray-300 filter-hover focus:border-blue-500 bg-white text-black">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border-2 border-gray-200 z-50">
                      <SelectItem value="all" className="text-black dropdown-item">All Industries</SelectItem>
                      {uniqueIndustries.map((industry) => (
                        <SelectItem key={industry} value={industry} className="text-black dropdown-item">
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Add Client Form - Responsive */}
        {showAddForm && (
          <Card className="shadow-xl border-2 border-blue-300 bg-white w-full">
            <CardHeader className="p-4 sm:p-6 lg:p-8 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl sm:text-2xl text-black font-bold truncate">Add New Client</CardTitle>
                  <p className="text-sm sm:text-base text-gray-600 mt-2 font-medium">Create a new client profile with complete information</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                  className="button-hover h-8 w-8 sm:h-10 sm:w-10 p-0 flex-shrink-0"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8 w-full">
              <form onSubmit={handleAddClient} className="space-y-6 sm:space-y-8 w-full">
                <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 w-full">
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Client Name *</label>
                    <Input
                      value={newClient.name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter client's full name"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Email Address *</label>
                    <Input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="client@company.com"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Company Name</label>
                    <Input
                      value={newClient.company}
                      onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Company or Organization"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Phone Number</label>
                    <Input
                      value={newClient.phone}
                      onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Industry</label>
                    <Input
                      value={newClient.industry}
                      onChange={(e) => setNewClient(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">GST Number</label>
                    <Input
                      value={newClient.gstNumber}
                      onChange={(e) => setNewClient(prev => ({ ...prev, gstNumber: e.target.value }))}
                      placeholder="22AAAAA0000A1Z5"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                    />
                  </div>
                </div>
                
                {/* Address Section */}
                <div className="space-y-2 sm:space-y-3 w-full">
                  <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Address</label>
                  <Textarea
                    value={newClient.address}
                    onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Complete business address"
                    className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium resize-none w-full"
                  />
                </div>

                {/* Location Fields */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">City</label>
                    <Input
                      value={newClient.city}
                      onChange={(e) => setNewClient(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">State</label>
                    <Input
                      value={newClient.state}
                      onChange={(e) => setNewClient(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Pincode</label>
                    <Input
                      value={newClient.pincode}
                      onChange={(e) => setNewClient(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="400001"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">Country</label>
                    <Input
                      value={newClient.country}
                      onChange={(e) => setNewClient(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="India"
                      className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                    />
                  </div>
                </div>

                {/* PAN Field */}
                <div className="space-y-2 sm:space-y-3 w-full">
                  <label className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider">PAN</label>
                  <Input
                    value={newClient.pan}
                    onChange={(e) => setNewClient(prev => ({ ...prev, pan: e.target.value }))}
                    placeholder="ABCDE1234F"
                    className="h-10 sm:h-12 text-sm sm:text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium w-full"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Add Client +
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="bg-white text-black border-2 border-gray-300 font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg button-hover"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Clients Table - Mobile Responsive */}
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl transition-all duration-300 w-full">
          <CardHeader className="p-4 sm:p-6 lg:p-8 border-b-2 border-gray-100">
            <CardTitle className="text-xl sm:text-2xl text-black font-bold truncate">Clients</CardTitle>
          </CardHeader>
          <CardContent className="p-0 w-full overflow-hidden">
            <div className="w-full overflow-x-auto scrollbar-hide">
              <Table className="w-full min-w-[650px]">
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b-2 border-gray-200">
                    <TableHead className="font-bold text-black text-xs sm:text-sm uppercase tracking-wider py-4 sm:py-6 px-2 sm:px-4 min-w-[160px]">Client</TableHead>
                    <TableHead className="hidden lg:table-cell font-bold text-black text-xs sm:text-sm uppercase tracking-wider py-4 sm:py-6 min-w-[100px]">Company</TableHead>
                    <TableHead className="hidden lg:table-cell font-bold text-black text-xs sm:text-sm uppercase tracking-wider py-4 sm:py-6 min-w-[70px]">Industry</TableHead>
                    <TableHead className="hidden sm:table-cell font-bold text-black text-xs sm:text-sm uppercase tracking-wider py-4 sm:py-6 min-w-[100px]">Revenue</TableHead>
                    <TableHead className="hidden sm:table-cell font-bold text-black text-xs sm:text-sm uppercase tracking-wider py-4 sm:py-6 min-w-[40px]">Invoices</TableHead>
                    <TableHead className="hidden lg:table-cell font-bold text-black text-xs sm:text-sm uppercase tracking-wider py-4 sm:py-6 min-w-[80px]">Last Activity</TableHead>
                    <TableHead className="font-bold text-black text-xs sm:text-sm uppercase tracking-wider py-4 sm:py-6 min-w-[100px]">Status</TableHead>
                    <TableHead className="font-bold text-black text-xs sm:text-sm uppercase tracking-wider py-4 sm:py-6 text-right min-w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client._id} className="table-row-hover border-b border-gray-200">
                      <TableCell className="py-3 sm:py-4 lg:py-6 px-2 sm:px-4 min-w-[160px]">
                        <div className="min-w-0 max-w-[120px]">
                          <p className="font-bold text-black text-sm sm:text-base truncate">{client.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">{client.email}</p>
                          {/* Mobile: Show company and industry here */}
                          <div className="lg:hidden mt-1 space-y-1">
                            {client.company && (
                              <p className="text-xs text-gray-700 font-medium truncate">{client.company}</p>
                            )}
                            {client.industry && (
                              <p className="text-xs text-gray-500 truncate">{client.industry}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-3 sm:py-4 lg:py-6 font-semibold text-black min-w-[100px] max-w-[100px]">
                        <span className="truncate block">{client.company}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-3 sm:py-4 lg:py-6 text-gray-700 font-medium min-w-[80px] max-w-[80px]">
                        <span className="truncate block">{client.industry}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-3 sm:py-4 lg:py-6 font-bold text-black text-xs sm:text-sm min-w-[100px] max-w-[100px]">
                        <span className="truncate block">₹{(clientStatsMap[client._id]?.totalRevenue || 0).toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-3 sm:py-4 lg:py-6 text-gray-700 font-medium min-w-[60px] text-center">
                        {clientStatsMap[client._id]?.totalInvoices || 0}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-3 sm:py-4 lg:py-6 text-gray-700 font-medium text-xs min-w-[100px] max-w-[100px]">
                        <span className="truncate block">
                          {clientStatsMap[client._id]?.latestInvoiceDate? new Date(clientStatsMap[client._id].latestInvoiceDate).toLocaleDateString(): "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 sm:py-4 lg:py-6 min-w-[100px] max-w-[100px]">
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant={client.status === "Active" ? "default" : "secondary"} className="font-semibold px-2 py-1 text-xs whitespace-nowrap">
                            {client.status || "Active"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleClientStatus(client._id)}
                            className={`text-xs px-2 py-1 rounded transition-all duration-200 whitespace-nowrap ${
                              client.status === "Active"
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {client.status === "Active" ? "Disable" : "Enable"}
                          </Button>
                          {/* Mobile: Show revenue and invoice count */}
                          <div className="sm:hidden mt-1 space-y-1">
                            <p className="text-xs font-bold text-black truncate">
                              ₹{(clientStatsMap[client._id]?.totalRevenue || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {clientStatsMap[client._id]?.totalInvoices || 0} invoices
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 sm:py-4 lg:py-6 px-2 sm:px-4 text-right min-w-[60px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 border-2 border-transparent transition-all flex-shrink-0 hover:border-gray-300">
                              <MoreHorizontal className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white shadow-xl border-2 border-gray-200 w-36 z-50">
                            <DropdownMenuItem onClick={() => handleAction("viewed", client._id)} className="py-2 px-3 text-black text-xs hover:bg-gray-50">
                              <Eye className="mr-2 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">View</span>
                            </DropdownMenuItem> 
                            <DropdownMenuItem onClick={() => navigate(`/clients/${client._id}/edit`)} className="py-2 px-3 text-black text-xs hover:bg-gray-50">
                              <Edit className="mr-2 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("invoiced", client._id)} className="py-2 px-3 text-black text-xs hover:bg-gray-50">
                              <FileText className="mr-2 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">Invoice</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction("deleted", client._id)}
                              className="text-red-600 hover:text-red-700 py-2 px-3 hover:bg-red-50 text-xs"
                            >
                              <Trash2 className="mr-2 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile-friendly empty state */}
            {filteredClients.length === 0 && (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all" || industryFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Get started by adding your first client"}
                </p>
                {(!searchTerm && statusFilter === "all" && industryFilter === "all") && (
                  <Button 
                    onClick={() => navigate('/clients/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                  >
                    Add Your First Client
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
   </div>
   </div>  );
};

export default ClientManagement;