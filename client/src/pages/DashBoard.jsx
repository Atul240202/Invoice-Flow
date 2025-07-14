import { useState, useEffect } from "react";
import api from "../utils/api";
import { AIInsightCard } from "../components/AIInsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { StatCard } from "../components/Statcard";
import { Settings } from "lucide-react";
import { useToast } from "../hooks/toast";

import { 
  IndianRupee, 
  Users, 
  FileText, 
  Clock,
  Plus,
  ArrowRight,
  Send,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topClients, setTopClients] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, topRes, recRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/clients/top?limit=4"),
          api.get("/invoices/recent?limit=4"),
        ]);
        setStats(statsRes.data);
        setTopClients(topRes.data);
        setRecentInvoices(recRes.data);
      } catch (err) {
        toast({ title: "Error", description: "Failed to load dashboard data." });
      }
    }
    loadDashboard();
  }, []);

  const aiInsights = [
    {
      text: "Your sales are 23% lower this month compared to last month. Consider following up on pending invoices.",
      type: "negative"
    },
    {
      text: "Client ABC Industries delays payments by average 15 days – consider adding late fee terms.",
      type: "warning"
    },
    {
      text: "Product 'Web Development Services' sells 40% more after 15th of each month – try running offers during this period.",
      type: "positive"
    }
  ];

  const handleSendToCA = () => {
    console.log("Sending reports to CA...");
  };
  let enhancedStats = null;
if (stats) {
  enhancedStats = {
    totalSales: {
      ...stats.totalSales,
      icon: IndianRupee
    },
    pendingPayments: {
      ...stats.pendingPayments,
      icon: Clock
    },
    totalClients: {
      ...stats.totalClients,
      icon: Users
    },
    invoicesCreated: {
      ...stats.invoicesCreated,
      icon: FileText
    },
  };
}


  return (
    <div className="space-y-6 animate-fade-in text-slate-800 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
       
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:scale-105 transition-all duration-200">
          <Link to="/create-invoice">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>

          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:scale-105 transition-all duration-200">
          <Link to="/logout">
            Logout
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      {stats ? (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["totalSales", "pendingPayments", "totalClients", "invoicesCreated"].map((key) => {
          const cardProps = enhancedStats?.[key];
          return cardProps ? <StatCard key={key} {...cardProps} /> : null;
        })}
      </div>
      ) : (
       <div>Loading stats...</div>
      )}
      

      {/* AI Insights */}
      <AIInsightCard title="Smart Business Insights" insights={aiInsights} />

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Send to CA */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-indigo-600 shadow-lg">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-indigo-900">Send to CA</h3>
                <p className="text-sm text-indigo-700">One-click filing support</p>
              </div>
            </div>
            <p className="text-sm text-indigo-800 mb-4">
              Automatically compile and send all necessary reports to your CA for GST filing
            </p>
            <Button 
              onClick={handleSendToCA}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Export & Send Reports
            </Button>
          </CardContent>
        </Card>

        {/* GST Reports */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-purple-600 shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-purple-900">GST Reports</h3>
                <p className="text-sm text-purple-700">Ready for filing</p>
              </div>
            </div>
            <p className="text-sm text-purple-800 mb-4">
              Generate GSTR-1, GSTR-3B and other compliance reports
            </p>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Secure Export */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-slate-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Secure Export</h3>
                <p className="text-sm text-slate-700">Encrypted & watermarked</p>
              </div>
            </div>
            <p className="text-sm text-slate-800 mb-4">
              All exports are encrypted and watermarked for security
            </p>
            <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Clients & Invoices */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-indigo-800">Top Clients</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-indigo-700 hover:bg-indigo-50">
              <Link to="/clients">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-medium text-indigo-900">{client.name}</p>
                    <p className="text-sm text-indigo-600">{client.invoices} invoices</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-800">{client.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      client.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-indigo-800">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-indigo-700 hover:bg-indigo-50">
              <Link to="/invoices">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{invoice.id}</p>
                    <p className="text-sm text-slate-500">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{invoice.amount}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{invoice.date}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "Overdue"
                          ? "bg-red-100 text-red-700"
                          : invoice.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;