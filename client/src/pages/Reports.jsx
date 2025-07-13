import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Badge } from "../components/Badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, IndianRupee, FileText, Users, Calendar } from "lucide-react";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("thisMonth");

  
  const fullMonthlyData = [
    { month: "Jan", revenue: 45000, invoices: 12, clients: 8 },
    { month: "Feb", revenue: 52000, invoices: 15, clients: 10 },
    { month: "Mar", revenue: 48000, invoices: 13, clients: 9 },
    { month: "Apr", revenue: 61000, invoices: 18, clients: 12 },
    { month: "May", revenue: 58000, invoices: 16, clients: 11 },
    { month: "Jun", revenue: 67000, invoices: 20, clients: 14 }
  ];

  const filterMonthlyData = (range) => {
    switch (range) {
      case "thisWeek":
        return fullMonthlyData.slice(-1); // only June
      case "thisMonth":
        return fullMonthlyData.slice(-1); // only June
      case "lastMonth":
        return fullMonthlyData.slice(-2, -1); // May
      case "thisQuarter":
        return fullMonthlyData.slice(-3); // Apr, May, Jun
      case "thisYear":
        return fullMonthlyData; // all data
      default:
        return fullMonthlyData;
    }
  };

  const filteredMonthlyData = useMemo(() => filterMonthlyData(timeRange), [timeRange]);

  // Keep client distribution static, or also apply a filter similarly
  const clientDistribution = [
    { name: "ABC Industries", value: 30, invoices: 8 },
    { name: "XYZ Corp", value: 25, invoices: 6 },
    { name: "Digital Solutions", value: 20, invoices: 5 },
    { name: "Tech Innovators", value: 15, invoices: 4 },
    { name: "Others", value: 10, invoices: 3 }
  ];

  const colors = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#EC4899'];

  const computedStats = useMemo(() => {
  const totalRevenue = filteredMonthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalInvoices = filteredMonthlyData.reduce((sum, m) => sum + m.invoices, 0);
  const totalClients = filteredMonthlyData.reduce((sum, m) => sum + m.clients, 0);

  return [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: "+12.5%", // dynamic if needed
      isPositive: true,
      icon: IndianRupee,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Invoices Generated",
      value: `${totalInvoices}`,
      change: "+8.2%",
      isPositive: true,
      icon: FileText,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Active Clients",
      value: `${totalClients}`,
      change: "+15.3%",
      isPositive: true,
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Avg. Payment Time",
      value: "18 days", // static or you can compute this too
      change: "-2.1 days",
      isPositive: true,
      icon: Calendar,
      color: "from-orange-500 to-orange-600"
    }
  ];
}, [filteredMonthlyData]);


  const stats = [
    {
      title: "Total Revenue",
      value: "₹4,52,840",
      change: "+12.5%",
      isPositive: true,
      icon: IndianRupee,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Invoices Generated",
      value: "127",
      change: "+8.2%",
      isPositive: true,
      icon: FileText,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Active Clients",
      value: "34",
      change: "+15.3%",
      isPositive: true,
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Avg. Payment Time",
      value: "18 days",
      change: "-2.1 days",
      isPositive: true,
      icon: Calendar,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const exportToPDF = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "2024-07-01", to: "2024-07-31" }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Expense_Report.pdf";
    link.click();
    link.remove();
  } catch (err) {
    alert("Export failed");
    console.error(err);
  }
};


  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-black tracking-tight">Reports & Analytics</h1>
          <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
            Comprehensive insights into your business performance, revenue trends, and client analytics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] h-12 text-base font-medium border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 bg-white">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-xl border-2 z-50">
              <SelectItem value="thisWeek" className="hover:bg-gray-50 text-black">This Week</SelectItem>
              <SelectItem value="thisMonth" className="hover:bg-gray-50 text-black">This Month</SelectItem>
              <SelectItem value="lastMonth" className="hover:bg-gray-50 text-black">Last Month</SelectItem>
              <SelectItem value="thisQuarter" className="hover:bg-gray-50 text-black">This Quarter</SelectItem>
              <SelectItem value="thisYear" className="hover:bg-gray-50 text-black">This Year</SelectItem>
            </SelectContent>
          </Select>
          
         <Button
  onClick={exportToPDF}
  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg transition-all duration-200"
>
  Export Report
</Button>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {computedStats.map((stat, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  {stat.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-bold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white">
          <CardHeader className="pb-6 border-b border-gray-100">
            <CardTitle className="text-2xl font-bold text-black">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis tick={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    color: '#000'
                  }} 
                />
                <Legend wrapperStyle={{ color: '#000', fontWeight: 'bold' }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Distribution */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white">
          <CardHeader className="pb-6 border-b border-gray-100">
            <CardTitle className="text-2xl font-bold text-black">Client Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clientDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {clientDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    color: '#000'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white">
        <CardHeader className="pb-6 border-b border-gray-100">
          <CardTitle className="text-2xl font-bold text-black">Monthly Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis tick={{ fill: '#374151', fontSize: 12, fontWeight: 'bold' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  color: '#000'
                }} 
              />
              <Legend wrapperStyle={{ color: '#000', fontWeight: 'bold' }} />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              <Bar dataKey="invoices" fill="#22C55E" radius={[4, 4, 0, 0]} name="Invoices" />
              <Bar dataKey="clients" fill="#F97316" radius={[4, 4, 0, 0]} name="New Clients" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;