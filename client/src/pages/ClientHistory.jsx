import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown-menu";
import { Search, Filter, Eye, Edit, Copy, Trash2, Download, Send, MoreHorizontal } from "lucide-react";
import { useToast } from "../hooks/toast";
import { useNavigate } from "react-router-dom";


const InvoiceHistory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const navigate = useNavigate();

  const [invoices] = useState([
    {
      id: "INV-2024-001",
      clientName: "ABC Industries",
      amount: 45000,
      date: "2024-01-15",
      dueDate: "2024-02-15",
      status: "Paid",
      items: 3
    },
    {
      id: "INV-2024-002",
      clientName: "XYZ Corp",
      amount: 32500,
      date: "2024-01-14",
      dueDate: "2024-02-14",
      status: "Sent",
      items: 2
    },
    {
      id: "INV-2024-003",
      clientName: "Digital Solutions Ltd",
      amount: 28900,
      date: "2024-01-13",
      dueDate: "2024-02-13",
      status: "Overdue",
      items: 4
    },
    {
      id: "INV-2024-004",
      clientName: "Tech Innovators",
      amount: 55200,
      date: "2024-01-12",
      dueDate: "2024-02-12",
      status: "Paid",
      items: 5
    },
    {
      id: "INV-2024-005",
      clientName: "Modern Solutions",
      amount: 18750,
      date: "2024-01-11",
      dueDate: "2024-02-11",
      status: "Draft",
      items: 2
    },
    {
      id: "INV-2024-006",
      clientName: "Business Hub",
      amount: 67300,
      date: "2024-01-10",
      dueDate: "2024-02-10",
      status: "Sent",
      items: 6
    }
  ]);
  

  

const handleAction = (action, invoiceId) => {
  switch (action) {
    case "viewed":
      navigate(`/invoices/${invoiceId}/preview`);
      break;

    case "edited":
      navigate(`/invoices/${invoiceId}/edit`);
      break;

    case "downloaded":
      axios
        .post(`/api/invoices/${invoiceId}/download-pdf`, {}, { responseType: 'blob' })
        .then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `invoice-${invoiceId}.pdf`);
          document.body.appendChild(link);
          link.click();
        });
      break;

    case "deleted":
      // Implement delete logic
      break;

    case "sent":
      // Implement send logic
      break;

    default:
      break;
  }

  // Show toast after performing action
  toast({
    title: "Action Completed",
    description: `Invoice ${invoiceId} has been ${action}`,
  });
};


  // Get unique client names for filter
  const uniqueClients = Array.from(new Set(invoices.map(invoice => invoice.clientName))).sort();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter;
    const matchesClient = clientFilter === "all" || invoice.clientName === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "default";
      case "Sent":
        return "secondary";
      case "Overdue":
        return "destructive";
      case "Draft":
        return "outline";
      default:
        return "secondary";
    }
  };



  const getTotalStats = () => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = filteredInvoices
      .filter(inv => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = filteredInvoices
      .filter(inv => inv.status === "Sent" || inv.status === "Overdue")
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    return { totalAmount, paidAmount, pendingAmount };
  };

  const { totalAmount, paidAmount, pendingAmount } = getTotalStats();

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-black tracking-tight">Invoice History</h1>
        <p className="text-lg text-gray-700 max-w-2xl leading-relaxed font-medium">
          Track, manage, and analyze all your invoices in one comprehensive dashboard
        </p>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black mb-2">₹{totalAmount.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">₹{paidAmount.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">
              {filteredInvoices.filter(inv => inv.status === "Paid").length} paid invoices
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:transform hover:-translate-y-1 hover:bg-blue-50/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-sm text-gray-600 font-medium">
              {filteredInvoices.filter(inv => inv.status === "Sent" || inv.status === "Overdue").length} pending invoices
            </p>
          </CardContent>
        </Card>
      </div>

    <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl transition-all duration-300">
  <CardContent className="p-6">
  
      {/* Search Input */}
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
        <Input
          placeholder="Search by invoice ID or client name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-14 text-base font-medium border-2 border-gray-300 focus:border-blue-500 bg-white text-black placeholder:text-gray-500 w-full"
        />
      </div>
        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center mt-2">
      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="min-w-[160px] h-14 text-base font-medium border-2 border-gray-300 focus:border-blue-500 bg-white text-black">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent className="bg-white shadow-xl border-2 border-gray-200 z-50">
          <SelectItem value="all" className="text-black">All Status</SelectItem>
          <SelectItem value="draft" className="text-black">Draft</SelectItem>
          <SelectItem value="sent" className="text-black">Sent</SelectItem>
          <SelectItem value="paid" className="text-black">Paid</SelectItem>
          <SelectItem value="overdue" className="text-black">Overdue</SelectItem>
        </SelectContent>
      </Select>

      {/* Client Filter */}
      <Select value={clientFilter} onValueChange={setClientFilter}>
        <SelectTrigger className="min-w-[180px] h-14 text-base font-medium border-2 border-gray-300 focus:border-blue-500 bg-white text-black">
          <SelectValue placeholder="All Clients" />
        </SelectTrigger>
        <SelectContent className="bg-white shadow-xl border-2 border-gray-200 z-50">
          <SelectItem value="all" className="text-black">All Clients</SelectItem>
          {uniqueClients.map((client) => (
            <SelectItem key={client} value={client} className="text-black">
              {client}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Filter */}
      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger className="min-w-[160px] h-14 text-base font-medium border-2 border-gray-300 focus:border-blue-500 bg-white text-black">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent className="bg-white shadow-xl border-2 border-gray-200 z-50">
          <SelectItem value="all" className="text-black">All Time</SelectItem>
          <SelectItem value="today" className="text-black">Today</SelectItem>
          <SelectItem value="week" className="text-black">This Week</SelectItem>
          <SelectItem value="month" className="text-black">This Month</SelectItem>
          <SelectItem value="quarter" className="text-black">This Quarter</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardContent>
</Card>


      {/* Enhanced Invoice Table */}
      <Card className="shadow-lg border-2 border-gray-200 bg-white hover:shadow-xl transition-all duration-300">
        <CardHeader className="p-8 border-b-2 border-gray-100">
          <CardTitle className="text-2xl text-black font-bold">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b-2 border-gray-200">
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6 px-6">Invoice ID</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Client</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Amount</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Date</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Due Date</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Status</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6">Items</TableHead>
                  <TableHead className="font-bold text-black text-sm uppercase tracking-wider py-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="table-row-hover border-b border-gray-200">
                    <TableCell className="font-bold text-black py-6 px-6">{invoice.id}</TableCell>
                    <TableCell className="font-semibold text-black py-6">{invoice.clientName}</TableCell>
                    <TableCell className="font-bold text-black py-6">₹{invoice.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">{new Date(invoice.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="py-6">
                      <Badge variant={getStatusColor(invoice.status)} className="font-semibold px-3 py-1">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">{invoice.items} items</TableCell>
                    <TableCell className="text-right py-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 button-hover border-2 border-transparent transition-all">
                            <MoreHorizontal className="h-5 w-5 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white shadow-xl border-2 border-gray-200 w-48 z-50">
                          <DropdownMenuItem onClick={() => handleAction("viewed", invoice.id)} className="py-3 px-4 text-black dropdown-item">
                            <Eye className="mr-3 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("edited", invoice.id)} className="py-3 px-4 text-black dropdown-item">
                            <Edit className="mr-3 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("downloaded", invoice.id)} className="py-3 px-4 text-black dropdown-item">
                            <Download className="mr-3 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          {invoice.status !== "Sent" && (
                            <DropdownMenuItem onClick={() => handleAction("sent", invoice.id)} className="py-3 px-4 text-black dropdown-item">
                              <Send className="mr-3 h-4 w-4" />
                              Send
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleAction("deleted", invoice.id)}
                            className="text-red-600 hover:text-red-700 py-3 px-4 hover:bg-red-50"
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete
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

export default InvoiceHistory;