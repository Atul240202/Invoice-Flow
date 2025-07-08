import { useState } from "react";

import { Button } from "../components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown-menu";
import { Search, Filter, Eye, Edit, Copy, Trash2, Download, Send, MoreHorizontal, X, FileText } from "lucide-react";
import { useToast } from "../hooks/toast";
import { Textarea } from "../components/Textarea";
import { useNavigate } from "react-router-dom";

const ClientManagement = () => {
   const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
    phone: "",
    address: "",
    gstNumber: "",
  });


  const [clients, setClients] = useState([
    {
      id: "CLT-001",
      name: "John Doe",
      email: "john.doe@abc.com",
      company: "ABC Industries",
      industry: "Manufacturing",
      phone: "+91 98765 43210",
      address: "123 Main Street, Anytown, India",
      gstNumber: "22AAAAA0000A1Z5",
      totalRevenue: 125000,
      totalInvoices: 8,
      lastActivity: "2024-02-01",
      status: "Active"
    },
    {
      id: "CLT-002",
      name: "Alice Smith",
      email: "alice.smith@xyz.com",
      company: "XYZ Corp",
      industry: "Technology",
      phone: "+91 87654 32109",
      address: "456 Park Avenue, Somecity, India",
      gstNumber: "29BBBBB0000B2Z6",
      totalRevenue: 98500,
      totalInvoices: 5,
      lastActivity: "2024-01-28",
      status: "Active"
    },
    {
      id: "CLT-003",
      name: "Bob Johnson",
      email: "bob.johnson@dgtl.com",
      company: "Digital Solutions Ltd",
      industry: "Information Technology",
      phone: "+91 76543 21098",
      address: "789 Tech Road, Infocity, India",
      gstNumber: "05CCCCC0000C3Z7",
      totalRevenue: 87300,
      totalInvoices: 6,
      lastActivity: "2024-01-25",
      status: "Active"
    },
    {
      id: "CLT-004",
      name: "Emily White",
      email: "emily.white@ti.com",
      company: "Tech Innovators",
      industry: "Technology",
      phone: "+91 65432 10987",
      address: "101 Innovation Hub, Newtech, India",
      gstNumber: "36DDDDD0000D4Z8",
      totalRevenue: 76800,
      totalInvoices: 4,
      lastActivity: "2024-01-22",
      status: "Active"
    },
    {
      id: "CLT-005",
      name: "David Brown",
      email: "david.brown@mdrn.com",
      company: "Modern Solutions",
      industry: "Consulting",
      phone: "+91 54321 09876",
      address: "222 Business Park, Metrocity, India",
      gstNumber: "13EEEEE0000E5Z9",
      totalRevenue: 65200,
      totalInvoices: 3,
      lastActivity: "2024-01-19",
      status: "Inactive"
    },
    {
      id: "CLT-006",
      name: "Sophia Green",
      email: "sophia.green@bhub.com",
      company: "Business Hub",
      industry: "Finance",
      phone: "+91 43210 98765",
      address: "333 Financial District, Capitalcity, India",
      gstNumber: "47FFFFF0000F6ZA",
      totalRevenue: 54700,
      totalInvoices: 2,
      lastActivity: "2024-01-16",
      status: "Active"
    }
  ]);

  const [editingClient, setEditingClient] = useState(null);


  // Get unique industry names for filter
  const uniqueIndustries = Array.from(new Set(clients.map(client => client.industry))).sort();

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || client.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesIndustry = industryFilter === "all" || client.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const getTotalRevenue = () => {
    return filteredClients.reduce((sum, client) => sum + client.totalRevenue, 0);
  };

  const getAvgInvoiceValue = () => {
    const totalRevenue = getTotalRevenue();
    return filteredClients.length > 0 ? totalRevenue / filteredClients.length : 0;
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
  const client = clients.find((c) => c.id === clientId);
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

const deleteClient = (clientId) => {
  setClients(prev => prev.filter(client => client.id !== clientId));
};
  


  const handleAddClient = (e) => {
  e.preventDefault();

  if (editingClient) {
    // Editing existing client
    setClients(prev =>
      prev.map(client =>
        client.id === editingClient.id
          ? { ...client, ...newClient }
          : client
      )
    );
    setEditingClient(null);
    toast({
      title: "Client Updated",
      description: `Client ${newClient.name} has been updated successfully.`,
    });
  } else {
    // Adding new client
    const newId = `CLT-${Math.floor(Math.random() * 1000)}`;
    const newClientData = {
      id: newId,
      ...newClient,
      totalRevenue: 0,
      totalInvoices: 0,
      lastActivity: new Date().toISOString().slice(0, 10),
      status: "Active",
    };
    setClients(prev => [...prev, newClientData]);
    toast({
      title: "Client Added",
      description: `Client ${newClientData.name} has been added successfully.`,
    });
  }

  setNewClient({
    name: "",
    email: "",
    company: "",
    industry: "",
    phone: "",
    address: "",
    gstNumber: "",
  });
  setShowAddForm(false);
};


  const toggleClientStatus = (clientId) => {
    setClients(prev =>
      prev.map(client =>
        client.id === clientId ? { ...client, status: client.status === "Active" ? "Inactive" : "Active" } : client
      )
    );
  };

  

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-black tracking-tight">Client Management</h1>
          <p className="text-lg text-gray-700 max-w-2xl leading-relaxed font-medium">
            Manage your client relationships and track their business interactions
          </p>
        </div>
        <Button 
          onClick={ () => navigate('/clients/new')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        >
         
          Add New Client +
          
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black mb-2">{filteredClients.length}</div>
            <p className="text-sm text-gray-600 font-medium">Active clients</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">From all clients</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Active This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 mb-2">{activeThisMonth}</div>
            <p className="text-sm text-gray-600 font-medium">Recent interactions</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Avg. Invoice Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 mb-2">₹{avgInvoiceValue.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">Per client</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl transition-all duration-300">
        <CardContent className="p-8">
          <div className="flex gap-6 items-center flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search clients by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-base font-medium border-2 border-gray-300 focus:border-blue-500 input-hover bg-white text-black placeholder:text-gray-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-14 text-base font-medium border-2 border-gray-300 filter-hover focus:border-blue-500 bg-white text-black">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-xl border-2 border-gray-200 z-50">
                <SelectItem value="all" className="text-black dropdown-item">All Status</SelectItem>
                <SelectItem value="Active" className="text-black dropdown-item">Active</SelectItem>
                <SelectItem value="Inactive" className="text-black dropdown-item">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[200px] h-14 text-base font-medium border-2 border-gray-300 filter-hover focus:border-blue-500 bg-white text-black">
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
        </CardContent>
      </Card>

      {/* Enhanced Add Client Form */}
      {showAddForm && (
        <Card className="shadow-xl border-2 border-blue-300 bg-white">
          <CardHeader className="p-8 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-black font-bold">Add New Client</CardTitle>
                <p className="text-gray-600 mt-2 font-medium">Create a new client profile with complete information</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                className="button-hover h-10 w-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAddClient} className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-black uppercase tracking-wider">Client Name *</label>
                  <Input
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter client's full name"
                    className="h-12 text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-black uppercase tracking-wider">Email Address *</label>
                  <Input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="client@company.com"
                    className="h-12 text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-black uppercase tracking-wider">Company Name</label>
                  <Input
                    value={newClient.company}
                    onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company or Organization"
                    className="h-12 text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-black uppercase tracking-wider">Phone Number</label>
                  <Input
                    value={newClient.phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="h-12 text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-black uppercase tracking-wider">Industry</label>
                  <Input
                    value={newClient.industry}
                    onChange={(e) => setNewClient(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="h-12 text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-black uppercase tracking-wider">GST Number</label>
                  <Input
                    value={newClient.gstNumber}
                    onChange={(e) => setNewClient(prev => ({ ...prev, gstNumber: e.target.value }))}
                    placeholder="22AAAAA0000A1Z5"
                    className="h-12 text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-black uppercase tracking-wider">Address</label>
                <Textarea
                  value={newClient.address}
                  onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Complete business address including city, state, and PIN code"
                  className="min-h-[100px] text-base border-2 border-gray-300 input-hover bg-white placeholder:text-gray-500 text-black font-medium resize-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                
                  Add Client +
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="bg-white text-black border-2 border-gray-300 font-semibold px-8 py-3 rounded-lg button-hover"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Clients Table */}
      <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl transition-all duration-300">
        <CardHeader className="p-8 border-b-2 border-gray-100">
          <CardTitle className="text-2xl text-black font-bold">Clients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b-2 border-gray-200">
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6 px-6">Client</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Company</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Industry</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Total Revenue</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Invoices</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Last Activity</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Status</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="table-row-hover border-b border-gray-200">
                    <TableCell className="py-6 px-6">
                      <div>
                        <p className="font-bold text-black">{client.name}</p>
                        <p className="text-sm text-gray-600 font-medium">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-black py-6">{client.company}</TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">{client.industry}</TableCell>
                    <TableCell className="font-bold text-black py-6">₹{client.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">{client.totalInvoices}</TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">{client.lastActivity}</TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-2">
                        <Badge variant={client.status === "Active" ? "default" : "secondary"} className="font-semibold px-3 py-1">
                          {client.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleClientStatus(client.id)}
                          className={`text-xs px-3 py-1 rounded toggle-hover transition-all duration-200 ${
                            client.status === "Active"
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {client.status === "Active" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 button-hover border-2 border-transparent transition-all">
                            <MoreHorizontal className="h-5 w-5 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white shadow-xl border-2 border-gray-200 w-48 z-50">
                          <DropdownMenuItem onClick={() => handleAction("viewed", client.id)} className="py-3 px-4 text-black dropdown-item">
                            <Eye className="mr-3 h-4 w-4" />
                            View Details
                          </DropdownMenuItem> 
                          <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}/edit`)} className="py-3 px-4 text-black dropdown-item">
                            <Edit className="mr-3 h-4 w-4" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("invoiced", client.id)} className="py-3 px-4 text-black dropdown-item">
                            <FileText className="mr-3 h-4 w-4" />
                            Create Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAction("deleted", client.id)}
                            className="text-red-600 hover:text-red-700 py-3 px-4 hover:bg-red-50"
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientManagement;