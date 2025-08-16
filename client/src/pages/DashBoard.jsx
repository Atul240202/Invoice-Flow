import { useState, useEffect } from "react";
import api from "../utils/api";
import { AIInsightCard } from "../components/AIInsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { StatCard } from "../components/StatCard";
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
  Shield,
  LogOut,
  Sparkles
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
    <div className="space-y-10 animate-fade-in text-slate-800 bg-white px-4 sm:px-6 py-6 sm:py-8 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Create Invoice Button - Primary Action */}
          <Button
            asChild
            className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base"
          >
            <Link to="/create-invoice" className="flex items-center justify-center gap-2">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-90 duration-300" />
              <span>Create Invoice</span>
              <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
            </Link>
          </Button>

          
        </div>
      </div>

      {/* Stats Grid */}
      {stats ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {["totalSales", "pendingPayments", "totalClients", "invoicesCreated"].map(
            (key) => {
              const cardProps = enhancedStats?.[key];
              return cardProps ? <StatCard key={key} {...cardProps} /> : null;
            }
          )}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          Loading stats...
        </div>
      )}

      {/* AI Insights */}
      <AIInsightCard title="Smart Business Insights" insights={aiInsights} />

      {/* Quick Actions */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Send to CA */}
        <Card className="group bg-gradient-to-br from-indigo-50 via-indigo-100/50 to-cyan-50 border-2 border-indigo-200/50 hover:border-indigo-300 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-indigo-900">Send to CA</h3>
                <p className="text-sm text-indigo-700">One-click filing support</p>
              </div>
            </div>
            <p className="text-sm text-indigo-800 mb-4 leading-relaxed">
              Automatically compile and send all necessary reports to your CA for GST filing.
            </p>
            <Button
              onClick={handleSendToCA}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
            >
              <Send className="mr-2 h-4 w-4" />
              Export & Send Reports
            </Button>
          </CardContent>
        </Card>

        {/* GST Reports */}
        <Card className="group bg-gradient-to-br from-purple-50 via-purple-100/50 to-violet-50 border-2 border-purple-200/50 hover:border-purple-300 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-purple-900">GST Reports</h3>
                <p className="text-sm text-purple-700">Ready for filing</p>
              </div>
            </div>
            <p className="text-sm text-purple-800 mb-4 leading-relaxed">
              Generate GSTR-1, GSTR-3B and other compliance reports.
            </p>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
            >
              <Link to="/reports">View Reports</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Secure Export */}
        <Card className="group bg-gradient-to-br from-slate-50 to-slate-100/80 border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Secure Export</h3>
                <p className="text-sm text-slate-700">Encrypted & watermarked</p>
              </div>
            </div>
            <p className="text-sm text-slate-800 mb-4 leading-relaxed">
              All exports are encrypted and watermarked for security
            </p>
            <Button 
              variant="outline" 
              className="w-full border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300 rounded-xl"
            >
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Clients & Invoices */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Clients */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-indigo-800 text-lg font-bold">Top Clients</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200 rounded-xl">
              <Link to="/clients">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-xl hover:from-indigo-100 hover:to-indigo-150/50 transition-colors duration-200 border border-indigo-100">
                  <div>
                    <p className="font-semibold text-indigo-900">{client.name}</p>
                    <p className="text-sm text-indigo-600">{client.invoices} invoices</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-800">{client.amount}</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      client.status === "Active"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
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
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-indigo-800 text-lg font-bold">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200 rounded-xl">
              <Link to="/invoices">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-200 border border-slate-100 hover:border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-800">{invoice.id}</p>
                    <p className="text-sm text-slate-600">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{invoice.amount}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{invoice.date}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : invoice.status === "Overdue"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : invoice.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
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