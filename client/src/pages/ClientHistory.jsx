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
import { useEffect } from "react";
import axios from "axios";
import { isToday, isThisWeek, isThisMonth, isThisQuarter } from "date-fns";

const InvoiceHistory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const navigate = useNavigate();
  const [status, setStatus] = useState("Draft");
  const [loading, setLoading] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/invoices?date=${dateFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch invoices");

      const data = await response.json();
      console.log("Invoices fetched:", data); 
      setInvoices(data.invoices || []);  
    } catch (err) {
      console.error(err);
      setError("Unable to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  fetchInvoices();
}, []);

  const handleStatusChange = async (invoiceId, newStatus) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Login required to change status.",
        variant: "destructive",
      });
      return;
    }

    const response = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) throw new Error("Failed to update status");

    const updated = await response.json();

    setInvoices((prev) =>
      prev.map((inv) =>
        inv._id === invoiceId ? { ...inv, status: newStatus } : inv
      )
    );

    toast({
      title: "Status Updated",
      description: `Invoice ${invoiceId} marked as ${newStatus}`,
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to update invoice status.",
      variant: "destructive",
    });
  }
};


const handleAction = async (action, invoice) => {
  const invoiceId = invoice._id;
  switch (action) {
    case "viewed":
      navigate(`/invoices/${invoiceId}/preview`);
      break;

    case "edited":
      if (invoice.status === "Paid") {
        toast({
          title: "Edit Disabled",
          description: "Paid invoices cannot be edited.",
          variant: "destructive",
        });
      return;
      }
      navigate(`/invoices/${invoiceId}/edit`);
      break;

    case "downloaded":
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `http://localhost:5000/api/invoices/${invoice._id}/download-pdf`,
      {}, 
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${invoice._id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    toast({
      title: "Download Failed",
      description: "Unable to generate PDF",
      variant: "destructive",
    });
  }finally {
    setLoading(false); 
  }
  break;


    case "deleted":
      if (!window.confirm("Are you sure you want to delete this invoice?")) return;

      try {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        });

      setInvoices((prev) => prev.filter((inv) => inv._id !== invoiceId));

      toast({
        title: "Deleted",
        description: `Invoice ${invoiceId} deleted successfully.`,
      });
      } catch (err) {
        toast({
        title: "Error",
        description: "Failed to delete the invoice.",
        variant: "destructive",
        });
      }
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

const matchesDate = (invoiceDate) => {
  const date = new Date(invoiceDate);
  switch (dateFilter) {
    case "today": return isToday(date);
    case "week": return isThisWeek(date);
    case "month": return isThisMonth(date);
    case "quarter": return isThisQuarter(date);
    default: return true;
  }
};

  // Get unique client names for filter
  const uniqueClients = Array.from(new Set(invoices.map(invoice => invoice.billTo?.businessName || "Unknown"))).sort();

  const filteredInvoices = invoices.filter((invoice) => {
  const matchesSearch =
    (invoice?.id?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
     invoice?.billTo?.businessName?.toLowerCase()?.includes(searchTerm.toLowerCase()));

  const matchesStatus =
    statusFilter === "all" || (invoice?.status?.toLowerCase?.() || "draft")  === statusFilter;

  const matchesClient =
    clientFilter === "all" || invoice?.billTo?.businessName === clientFilter;

  const matchesDateFilter = dateFilter === "all" || matchesDate(invoice.invoiceDate);

  return matchesSearch && matchesStatus && matchesClient && matchesDateFilter;
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
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.amount ?? inv.summary?.totalAmount ?? 0), 0);
    const paidAmount = filteredInvoices
  .filter(inv => inv.status === "Paid")
  .reduce((sum, inv) => sum + (inv.amount ?? inv.summary?.totalAmount ?? 0), 0);

const pendingAmount = filteredInvoices
  .filter(inv => inv.status === "Sent" || inv.status === "Overdue")
  .reduce((sum, inv) => sum + (inv.amount ?? inv.summary?.totalAmount ?? 0), 0);
    
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
          {loading && (
            <div className="flex justify-center items-center py-4">
              <span className="text-sm font-medium text-gray-600">Generating PDF, please wait...</span>
            </div>
          )}
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
                  <TableRow key={invoice._id} className="table-row-hover border-b border-gray-200">
                    <TableCell className="font-bold text-black py-6 px-6">{invoice._id}</TableCell>
                    <TableCell className="font-semibold text-black py-6">{invoice.billTo?.businessName}</TableCell>
                    <TableCell className="font-bold text-black py-6">       
  ₹{(invoice.amount ?? invoice.summary?.totalAmount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">
                      {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN') : "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell className="py-6">
                      <Select
                        value={
                          invoice.status? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase(): "Draft"
                        }
                        onValueChange={(newStatus) => handleStatusChange(invoice._id, newStatus)}
                      >
                      <SelectTrigger className="min-w-[120px] text-sm font-semibold border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-xl border-2 border-gray-200 z-50">
                        <SelectItem value="Draft" className="text-black">Draft</SelectItem>
                        <SelectItem value="Sent" className="text-black">Sent</SelectItem>
                        <SelectItem value="Overdue" className="text-black">Overdue</SelectItem>
                        <SelectItem value="Paid" className="text-black">Paid</SelectItem>
                      </SelectContent>
                      </Select>

                    </TableCell>
                    <TableCell className="text-gray-700 font-medium py-6">{invoice.items?.length || 0} items</TableCell>
                    <TableCell className="text-right py-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 button-hover border-2 border-transparent transition-all">
                            <MoreHorizontal className="h-5 w-5 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white shadow-xl border-2 border-gray-200 w-48 z-50">
                          <DropdownMenuItem onClick={() => handleAction("viewed", invoice)} className="py-3 px-4 text-black dropdown-item">
                            <Eye className="mr-3 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("edited", invoice)} className="py-3 px-4 text-black dropdown-item">
                            <Edit className="mr-3 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("downloaded", invoice)} className="py-3 px-4 text-black dropdown-item">
                            <Download className="mr-3 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          {invoice.status !== "Sent" && (
                            <DropdownMenuItem onClick={() => handleAction("sent", invoice)} className="py-3 px-4 text-black dropdown-item">
                              <Send className="mr-3 h-4 w-4" />
                              Send
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleAction("deleted", invoice)}
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