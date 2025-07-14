import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Badge } from "../components/Badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, IndianRupee, FileText, Users, Calendar } from "lucide-react";
import { useEffect } from "react";
import axios from "axios";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("thisMonth");

  const token = localStorage.getItem("token");

  const [fullMonthlyData, setFullMonthlyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
  const fetchMonthlyTrend = async () => {
    try {
       const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      const response = await axios.get("http://localhost:5000/api/reports/monthly-trend", {headers});

      const trend = response.data?.monthlyTrend || [];

      const chartFormatted = trend.map((entry) => ({
        month: entry.month,
        revenue: entry.income,
        expenses: entry.expenses,
        itc: entry.itc,
        invoices: entry.invoices || 0, 
        clients: entry.clients || 0, 
      }));

      setFullMonthlyData(chartFormatted);

      const totalRevenue = trend.reduce((sum, m) => sum + m.income, 0);
      setTotalRevenue(totalRevenue);

      const invoiceRes = await axios.get("http://localhost:5000/api/invoices/summary", { headers });
      setTotalInvoices(invoiceRes.data.totalInvoices);

      const clientRes = await axios.get("http://localhost:5000/api/clients/summary", { headers });
       setTotalClients(clientRes.data.totalClients);
       setClientDistribution(clientRes.data.distribution || []);

    } catch (error) {
      console.error("Failed to fetch monthly trend:", error);
    }
  };

  fetchMonthlyTrend();
}, []);


  const filterMonthlyData = (range) => {
    switch (range) {
      case "thisWeek":
        return fullMonthlyData.slice(-1); 
      case "thisMonth":
        return fullMonthlyData.slice(-1); 
      case "lastMonth":
        return fullMonthlyData.slice(-2, -1); 
      case "thisQuarter":
        return fullMonthlyData.slice(-3); 
      case "thisYear":
        return fullMonthlyData; 
      default:
        return fullMonthlyData;
    }
  };

  const filteredMonthlyData = useMemo(() => filterMonthlyData(timeRange), [timeRange]);
  const [clientDistribution, setClientDistribution] = useState([]);

  const colors = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#EC4899'];

  const computedStats = useMemo(() => {

    const pctChange = (curr = 0, prev = 0) => {
      if(!prev){
        return "0.0%";
      }
      const diff = ((curr - prev) / prev) * 100;
      return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`
    }

    const curr = fullMonthlyData.at(-1) || {};
    const prev = fullMonthlyData.at(-2) || {};

    const revChange     = pctChange(curr.revenue,  prev.revenue);
    const invChange     = pctChange(curr.invoices, prev.invoices);
    const clientChange  = pctChange(curr.clients,  prev.clients);

    const isPos = (str) => !str.startsWith("-");

  return [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: revChange, 
      isPositive: isPos(revChange),
      icon: IndianRupee,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Invoices Generated",
      value: `${totalInvoices}`,
      change: invChange,
      isPositive: isPos(invChange),
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
}, [totalRevenue, totalInvoices, totalClients, filteredMonthlyData]);


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
          
          <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg transition-all duration-200">
            Export 
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