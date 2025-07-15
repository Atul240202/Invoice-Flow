import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/Table";
import { Badge } from "../components/Badge";
import { Button } from "../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { MoreHorizontal } from "lucide-react"; 
import { BellRing, Download } from "lucide-react";
import { useToast } from "../hooks/toast";

const ClientDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    // Client
    api.get(`/clients/${id}`)
      .then(res => setClient(res.data))
      .catch(() => toast({ title: "Error", description: "Failed to load client." }));

    // Invoices
    api.get("/invoices")
  .then(res => {
    const allInvoices = Array.isArray(res.data) ? res.data : res.data.invoices || [];
    const clientInvoices = allInvoices.filter(inv => {
      const billToId =  inv.billToDetail?._id || inv.billToDetail;
      return String(billToId) === String(id);
    });
    setInvoices(clientInvoices);
  })
.catch(() => toast({ title: "Error", description: "Failed to load invoices." }));
  }, [id]);

  // Reminder
  const handleSendReminder = async (invoiceId) => {
    try {
      await api.post(`/invoices/${invoiceId}/reminder`);
      toast({ title: "Reminder Sent", description: "Client has been reminded." });
    } catch {
      toast({ title: "Error", description: "Could not send reminder." });
    }
  };

  if (!client) return <p className="p-6 text-gray-600">Loading client info...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      {/* ═════ Client Info ═════ */}
      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-5 gap-y-2 text-sm">
            <dt className="font-medium col-span-2">Name</dt>
            <dd className="col-span-3">{client.name}</dd>

            <dt className="font-medium col-span-2">Email</dt>
            <dd className="col-span-3">{client.email}</dd>

            <dt className="font-medium col-span-2">Company</dt>
            <dd className="col-span-3">{client.company}</dd>

            <dt className="font-medium col-span-2">Phone</dt>
            <dd className="col-span-3">{client.phone}</dd>

            <dt className="font-medium col-span-2">Status</dt>
            <dd className="col-span-3">
              <Badge>{client.status || "Active"}</Badge>
            </dd>
          </dl>
        </CardContent>
      </Card>

      {/* ═════ Invoices ═════ */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-500 py-4"
                  >
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell>
                      {new Date(inv.invoiceDate || inv.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{inv.items?.length || 0}</TableCell>
                    <TableCell>
                      ₹
                      {(inv.summary?.totalAmount || inv.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status?.toLowerCase() === "unpaid"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>

                    {/* ───── Actions Dropdown ───── */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="right" sideOffset={8} className="w-48 rounded-md shadow-lg border border-gray-200 bg-white z-50">
                          {(inv.status?.toLowerCase() === "overdue" || inv.status?.toLowerCase() === "draft") && (
                            <DropdownMenuItem onClick={() => handleSendReminder(inv._id)}
                            className="gap-2 text-red-600 hover:bg-red-50 focus:bg-red-100 font-medium">
                                <BellRing className="h-4 w-4 shrink-0" />
                              Send Reminder
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild
                          className="gap-2 text-blue-600 hover:bg-blue-50 focus:bg-blue-100 font-medium">
                          <a
                            href={`http://localhost:5000/api/invoices/${inv._id}/download-pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 shrink-0" />
                          Download PDF
                         </a>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};


export default ClientDetails;
