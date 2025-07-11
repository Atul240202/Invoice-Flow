import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { Badge } from "../components/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/Table";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { Plus, Upload, FileText, TrendingDown, Calendar, Filter, Download, Tag, Building2, Receipt, AlertCircle, BarChart3 } from "lucide-react";
import { useToast } from "../hooks/toast";
import { Checkbox } from "../components/checkbox";
import { Switch } from "../components/Switch";
import { RadioGroup, RadioGroupItem } from "../components/radio-group";
import api from "../utils/api";
import axios from 'axios';

const ExpenseTracker = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("add-expense");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterTags, setFilterTags] = useState("all");
  const [filterGST, setFilterGST] = useState("all");
  const [dateRange, setDateRange] = useState("this-month");
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    vendor: "",
    category: "",
    subCategory: "",
    gstPercent: "",
    gstin: "",
    description: "",
    tags: [],
    type: "Business",
    isRecurring: false,
    recurringFrequency: "Monthly",
    recurringStartDate: "",
    recurringEndDate: "",
    itcEligible: false
  });

  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
      const fetchExpenses = async () => {
      try {
        const res = await api.get("http://localhost:5000/api/expenses");
        setExpenses(res.data); 
      } catch (err) {
        toast({
        title: "Failed to load expenses",
        description: err.response?.data?.message || "Server error",
        variant: "destructive"
        });
      }
      };

    fetchExpenses();
    }, []);

  const categories = [
    { main: "Rent", sub: ["Office Rent", "Equipment Rent"] },
    { main: "Transport", sub: ["Fuel", "Maintenance", "Parking", "Tolls"] },
    { main: "Utilities", sub: ["Electricity", "Water", "Internet", "Phone"] },
    { main: "Salary", sub: ["Basic Salary", "Bonus", "Allowances"] },
    { main: "Marketing", sub: ["Digital Ads", "Print Media", "Events"] },
    { main: "Office Supplies", sub: ["Stationery", "Equipment", "Software"] },
    { main: "Travel", sub: ["Accommodation", "Meals", "Transportation"] },
    { main: "Food & Entertainment", sub: ["Client Meals", "Team Events"] },
    { main: "Software", sub: ["Subscriptions", "Licenses", "Tools"] },
    { main: "Other", sub: ["Miscellaneous"] }
  ];

  const vendorHistory = Array.from(new Set(expenses.map(e => e.vendor)));
  const allTags = Array.from(new Set(expenses.flatMap(e => e.tags)));

  const gstRates = [
    { rate: 0, label: "0% (Exempt)" },
    { rate: 5, label: "5% (Essential goods)" },
    { rate: 12, label: "12% (Standard goods)" },
    { rate: 18, label: "18% (Most services)" },
    { rate: 28, label: "28% (Luxury items)" }
  ];

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
  if (key === "tags") {
    value.forEach((tag) => data.append("tags[]", tag));
  } else {
    data.append(key, value);
  }
});
selectedFiles.forEach((file) => data.append("receipts", file));

    const res = await api.post("http://localhost:5000/api/expenses", data);

    setExpenses((prev) => [...prev, res.data]); 

    toast({
      title: "Expense Added Successfully",
      description: `Added ${formData.category} expense of ₹${formData.amount}${formData.itcEligible ? ` (ITC: ₹${formData.itcAmount})` : ''}`,
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      vendor: "",
      category: "",
      subCategory: "",
      gstPercent: "",
      gstin: "",
      description: "",
      tags: [],
      type: "Business",
      isRecurring: false,
      recurringFrequency: "Monthly",
      recurringStartDate: "",
      recurringEndDate: "",
      itcEligible: false
    });
    setSelectedFiles([]);
    setTagInput("");

  } catch (err) {
    toast({
      title: "Error adding expense",
      description: err.response?.data?.message || "Server error",
      variant: "destructive"
    });
  }
};


const fileInputRef = useRef(null);
const [selectedFiles, setSelectedFiles] = useState([]);

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  setSelectedFiles(files);
};

const handleRemoveFile = (indexToRemove) => {
  setSelectedFiles((prevFiles) =>
    prevFiles.filter((_, index) => index !== indexToRemove)
  );
};



  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const autoDetectGST = (vendor) => {
  const match = expenses.find(e => e.vendor === vendor);
  if (match) {
    setFormData({
      ...formData,
      vendor,
      gstPercent: match.gstPercent.toString(),
      gstin: match.gstin || ""
    });
  } else {
    setFormData({ ...formData, vendor });
  }
};



  // Calculate stats
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const businessExpenses = expenses.filter(e => e.type === "Business").reduce((sum, expense) => sum + expense.amount, 0);
  const totalITC = expenses.reduce((sum, expense) => sum + expense.itcAmount, 0);
  const recurringCount = expenses.filter(e => e.isRecurring).length;

  // Enhanced reporting data
  const categoryData = categories.map(cat => ({
    name: cat.main,
    value: expenses.filter(e => e.category === cat.main).reduce((sum, e) => sum + e.amount, 0),
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  })).filter(item => item.value > 0);

  const [monthlyTrend, setMonthlyTrend] = useState([]);

useEffect(() => {
  const fetchTrend = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/reports/monthly-trend", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      const data = await res.json();
      setMonthlyTrend(data);
    } catch (err) {
      console.error("Trend fetch failed:", err);
    }
  };

  fetchTrend();
}, []);


  const topVendors = vendorHistory.slice(0, 5).map(vendor => ({
    name: vendor,
    amount: expenses.filter(e => e.vendor === vendor).reduce((sum, e) => sum + e.amount, 0)
  })).sort((a, b) => b.amount - a.amount);

  const filteredExpenses = expenses.filter(expense => {
    if (filterCategory !== "all" && expense.category !== filterCategory) return false;
    if (filterTags !== "all" && !expense.tags.includes(filterTags)) return false;
    if (filterGST === "gst" && expense.gstPercent === 0) return false;
    if (filterGST === "non-gst" && expense.gstPercent > 0) return false;
    return true;
  });

  const exportToExcel = () => {
    toast({
      title: "Export Started",
      description: "Your Excel report is being generated...",
    });
  };

  const exportToPDF = () => {
    toast({
      title: "Export Started", 
      description: "Your PDF report is being generated...",
    });
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredExpenses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'expenses.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
              <TrendingDown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">Enhanced Expense Tracker</h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Smart expense management with GST compliance and advanced reporting
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToExcel} className="h-18 px-6 border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 text-black font-semibold">
           
            Import Bank Statement
          </Button>
          <Button onClick={exportToPDF} className="h-18 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg">
            
            Export Report
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300 bg-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="font-semibold border-2 border-green-200 bg-green-50 text-green-800">
                This Month
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Expenses</h3>
              <p className="text-3xl font-bold text-black">₹{totalExpenses.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="font-semibold border-2 border-blue-200 bg-blue-50 text-blue-800">
                Business
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Business Expenses</h3>
              <p className="text-3xl font-bold text-black">₹{businessExpenses.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-300 bg-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="font-semibold border-2 border-orange-200 bg-orange-50 text-orange-800">
                ITC Eligible
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Input Tax Credit</h3>
              <p className="text-3xl font-bold text-black">₹{Math.round(totalITC).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 bg-white group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <Badge variant="outline" className="font-semibold border-2 border-purple-200 bg-purple-50 text-purple-800">
                Auto-Recurring
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Recurring Expenses</h3>
              <p className="text-3xl font-bold text-black">{recurringCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-14 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="add-expense" className="h-12 font-semibold text-black data-[state=active]:bg-white data-[state=active]:shadow-md">
            Add Expense
          </TabsTrigger>
          <TabsTrigger value="view-expenses" className="h-12 font-semibold text-black data-[state=active]:bg-white data-[state=active]:shadow-md">
            View Expenses
          </TabsTrigger>
          <TabsTrigger value="recurring" className="h-12 font-semibold text-black data-[state=active]:bg-white data-[state=active]:shadow-md">
            Recurring
          </TabsTrigger>
          <TabsTrigger value="gst-itc" className="h-12 font-semibold text-black data-[state=active]:bg-white data-[state=active]:shadow-md">
            GST & ITC
          </TabsTrigger>
          <TabsTrigger value="reports" className="h-12 font-semibold text-black data-[state=active]:bg-white data-[state=active]:shadow-md">
            Smart Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-expense" className="space-y-8">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white">
            <CardHeader className="pb-6 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-black">Enhanced Expense Entry</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-12 border-2 border-gray-300 focus:border-blue-500 bg-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="h-12 border-2 border-gray-300 focus:border-blue-500 bg-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Vendor </Label>
                    <Input
                      id="vendor"
                      type="text"
                      placeholder="Enter or select vendor"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      onBlur={(e) => autoDetectGST(e.target.value)}
                      className="h-12 border-2 border-gray-300 focus:border-blue-500 bg-white placeholder:text-gray-400"
                      list="vendor-history"
                      required
                    />
                    <datalist id="vendor-history">
                      {vendorHistory.map(vendor => (
                        <option key={vendor} value={vendor} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, subCategory: "" })}>
                      <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-blue-500 bg-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-xl border-2 z-50">
                        {categories.map((category) => (
                          <SelectItem key={category.main} value={category.main} className="hover:bg-blue-50 text-black">
                            {category.main}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.category && (
                    <div className="space-y-2">
                      <Label htmlFor="subCategory" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Sub-category</Label>
                      <Select value={formData.subCategory} onValueChange={(value) => setFormData({ ...formData, subCategory: value })}>
                        <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-blue-500 bg-white">
                          <SelectValue placeholder="Select sub-category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white shadow-xl border-2 z-50">
                          {categories.find(c => c.main === formData.category)?.sub.map((sub) => (
                            <SelectItem key={sub} value={sub} className="hover:bg-blue-50 text-black">
                              {sub}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="gst" className="text-sm font-bold text-gray-700 uppercase tracking-wide">GST Rate</Label>
                    <Select value={formData.gstPercent} onValueChange={(value) => setFormData({ ...formData, gstPercent: value })}>
                      <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-blue-500 bg-white">
                        <SelectValue placeholder="Select GST rate" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-xl border-2 z-50">
                        {gstRates.map((gst) => (
                          <SelectItem key={gst.rate} value={gst.rate.toString()} className="hover:bg-blue-50 text-black">
                            {gst.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {parseFloat(formData.gstPercent) > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="gstin" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Vendor GSTIN</Label>
                      <Input
                        id="gstin"
                        type="text"
                        placeholder="22AAAAA0000A1Z5"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                        className="h-12 border-2 border-gray-300 focus:border-blue-500 bg-white placeholder:text-gray-400"
                        maxLength={15}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Expense Type</Label>
                    <RadioGroup 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Business" id="business" />
                        <Label htmlFor="business" className="text-sm font-medium">Business</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Personal" id="personal" />
                        <Label htmlFor="personal" className="text-sm font-medium">Personal</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="description" className="text-sm font-bold text-gray-700 uppercase tracking-wide">Description/Notes</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the expense..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px] border-2 border-gray-300 focus:border-blue-500 bg-white placeholder:text-gray-400"
                    rows={4}
                  />
                </div>

                {/* Tags Section */}
              {/* Tags Section */}
<div className="space-y-4">
  <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tags (Optional)</Label>
  <div className="flex gap-2">
    <Input
      type="text"
      placeholder="Add tags like #campaign, #travel..."
      value={tagInput}
      onChange={(e) => setTagInput(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
      className="h-12 border-2 border-gray-300 focus:border-blue-500 bg-white placeholder:text-gray-400"
    />
    <Button type="button" onClick={addTag} variant="outline" className="h-12 px-4">
      <Tag className="h-4 w-4" />
    </Button>
  </div>
  {formData.tags.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {formData.tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
          #{tag} ×
        </Badge>
      ))}
    </div>
  )}
</div>

                {/* Recurring Options */}
                <div className="space-y-4 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="recurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                    />
                    <Label htmlFor="recurring" className="text-sm font-bold text-gray-700">Mark as Recurring Expense</Label>
                  </div>

                  {formData.isRecurring && (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Frequency</Label>
                        <Select value={formData.recurringFrequency} onValueChange={(value) => setFormData({ ...formData, recurringFrequency: value })}>
                          <SelectTrigger className="h-10 border-2 border-gray-300 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white shadow-xl border-2 z-50">
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                            <SelectItem value="Yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                        <Input
                          type="date"
                          value={formData.recurringStartDate}
                          onChange={(e) => setFormData({ ...formData, recurringStartDate: e.target.value })}
                          className="h-10 border-2 border-gray-300 bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">End Date (Optional)</Label>
                        <Input
                          type="date"
                          value={formData.recurringEndDate}
                          onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                          className="h-10 border-2 border-gray-300 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ITC Eligibility */}
                {formData.type === "Business" && parseFloat(formData.gstPercent) > 0 && (
                  <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <Checkbox 
                      id="itc"
                      checked={formData.itcEligible}
                      onCheckedChange={(checked) => setFormData({ ...formData, itcEligible: !!checked })}
                    />
                    <Label htmlFor="itc" className="text-sm font-medium text-green-800">
                      Eligible for Input Tax Credit (ITC)
                      {formData.itcEligible && formData.amount && formData.gstPercent && (
                        <span className="ml-2 font-bold">
                          (₹{((parseFloat(formData.amount) * parseFloat(formData.gstPercent)) / 100).toFixed(2)})
                        </span>
                      )}
                    </Label>
                  </div>
                )}

                {/* File Upload Input (Hidden) */}
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <Button variant="outline" type="button" className="h-12 px-8 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-black font-semibold" onClick={() => fileInputRef.current.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Attach Receipts
                  </Button>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 bg-gray-100 px-3 py-1 rounded-md">
                        <div className="truncate">
                          {file.name}{" "}
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                      ❌
                      </button>
                    </div>
                  ))}
                </div>
                )}


                  <Button type="submit" className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view-expenses" className="space-y-8">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white">
            <CardHeader className="pb-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-black">Enhanced Expense List</CardTitle>
                <div className="flex items-center gap-4">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40 h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 bg-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border-2 z-50">
                      <SelectItem value="all" className="hover:bg-blue-50 text-black">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.main} value={category.main} className="hover:bg-blue-50 text-black">
                          {category.main}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterTags} onValueChange={setFilterTags}>
                    <SelectTrigger className="w-32 h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 bg-white">
                      <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border-2 z-50">
                      <SelectItem value="all" className="hover:bg-blue-50 text-black">All Tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag} className="hover:bg-blue-50 text-black">
                          #{tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterGST} onValueChange={setFilterGST}>
                    <SelectTrigger className="w-32 h-10 border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500 bg-white">
                      <SelectValue placeholder="GST" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-xl border-2 z-50">
                      <SelectItem value="all" className="hover:bg-blue-50 text-black">All</SelectItem>
                      <SelectItem value="gst" className="hover:bg-blue-50 text-black">GST Applicable</SelectItem>
                      <SelectItem value="non-gst" className="hover:bg-blue-50 text-black">Non-GST</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="h-10 px-8 border-2 border-gray-300  hover:border-blue-400 hover:bg-blue-50 text-black font-semibold">
                  
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-gray-100">
                      <TableHead className="font-bold text-gray-700 text-sm uppercase tracking-wider py-4">Date</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm uppercase tracking-wider py-4">Vendor</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm uppercase tracking-wider py-4">Category</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm uppercase tracking-wider py-4">Amount</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm uppercase tracking-wider py-4">GST</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm uppercase tracking-wider py-4">ITC</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm uppercase tracking-wider py-4">Tags</TableHead>
                      <TableHead className="font-bold text-gray-700 text-sm uppercase tracking-wider py-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                        <TableCell className="font-medium text-black py-4">{expense.date}</TableCell>
                        <TableCell className="text-gray-700 font-medium py-4">{expense.vendor}</TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <Badge variant="outline" className="font-semibold border-2">
                              {expense.category}
                            </Badge>
                            {expense.subCategory && (
                              <div className="text-xs text-gray-500">{expense.subCategory}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-black py-4">₹{expense.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-gray-700 font-medium py-4">{expense.gstPercent}%</TableCell>
                        <TableCell className="py-4">
                          {expense.itcEligible ? (
                            <div className="text-green-600 font-semibold">₹{expense.itcAmount.toFixed(2)}</div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-wrap gap-1">
                            {expense.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                            {expense.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{expense.tags.length - 2}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant={expense.type === "Business" ? "default" : "secondary"} className="font-semibold text-xs">
                              {expense.type}
                            </Badge>
                            {expense.isRecurring && (
                              <Badge variant="outline" className="font-semibold border-2 border-green-200 bg-green-50 text-green-800 text-xs">
                                {expense.recurringFrequency}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst-itc" className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300 bg-white">
              <CardHeader className="pb-6 border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                  <Receipt className="h-6 w-6 text-green-600" />
                  GST Input Tax Credit Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide">Total ITC Eligible</h3>
                      <p className="text-2xl font-bold text-green-800">₹{totalITC.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">This Month</h3>
                      <p className="text-2xl font-bold text-blue-800">₹{(totalITC * 0.8).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700">ITC by GST Rate</h4>
                    {gstRates.filter(rate => rate.rate > 0).map(rate => {
                      const itcForRate = expenses
                        .filter(e => e.gstPercent === rate.rate && e.itcEligible)
                        .reduce((sum, e) => sum + e.itcAmount, 0);
                      
                      return itcForRate > 0 ? (
                        <div key={rate.rate} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">GST {rate.rate}%</span>
                          <span className="font-bold text-green-600">₹{itcForRate.toFixed(2)}</span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold">
                      <Download className="mr-2 h-4 w-4" />
                      Export GSTR-3B Format
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-300 bg-white">
              <CardHeader className="pb-6 border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  GST Compliance Check
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-2">Missing GSTIN</h4>
                    <p className="text-sm text-yellow-700">
                      {expenses.filter(e => e.gstPercent > 0 && !e.gstin).length} expenses missing vendor GSTIN
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">ITC Eligible</h4>
                    <p className="text-sm text-green-700">
                      {expenses.filter(e => e.itcEligible).length} expenses eligible for input credit
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Monthly Summary</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>Business Expenses: ₹{businessExpenses.toLocaleString()}</div>
                      <div>Total GST: ₹{expenses.reduce((sum, e) => sum + (e.amount * e.gstPercent / 100), 0).toFixed(2)}</div>
                      <div>Available ITC: ₹{totalITC.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-8">
          {/* Export Options */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 bg-white">
            <CardHeader className="pb-6 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                Smart Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex gap-4 mb-6">
                <Button onClick={exportToExcel} className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold">
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button onClick={exportToPDF} className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button onClick={exportToJSON} className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Monthly Trend */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white">
              <CardHeader className="pb-6 border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-black">Monthly Trendline</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
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
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} name="Expenses" />
                    <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={3} name="Income" />
                    <Line type="monotone" dataKey="itc" stroke="#3B82F6" strokeWidth={3} name="ITC" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Pie Chart */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white">
              <CardHeader className="pb-6 border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-black">Category-wise Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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

          {/* Top Vendors and Expense vs Revenue */}
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300 bg-white">
              <CardHeader className="pb-6 border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-black">Top 5 Vendors by Spend</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {topVendors.map((vendor, index) => (
                    <div key={vendor.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{vendor.name}</span>
                      </div>
                      <span className="font-bold text-blue-600">₹{vendor.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-300 bg-white">
              <CardHeader className="pb-6 border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-black">Expense vs Revenue Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrend}>
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
                    <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
                    <Bar dataKey="income" fill="#22C55E" radius={[4, 4, 0, 0]} name="Income" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-8">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-300 bg-white">
            <CardHeader className="pb-6 border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                <Calendar className="h-6 w-6 text-purple-600" />
                Improved Recurring Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {expenses.filter(e => e.isRecurring).map((expense) => (
                  <div key={expense.id} className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{expense.vendor}</h3>
                        <p className="text-gray-600">{expense.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">₹{expense.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{expense.recurringFrequency}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Category</span>
                        <div className="font-semibold text-gray-800">{expense.category}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">GST Rate</span>
                        <div className="font-semibold text-gray-800">{expense.gstPercent}%</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">ITC Eligible</span>
                        <div className="font-semibold text-gray-800">
                          {expense.itcEligible ? `₹${expense.itcAmount.toFixed(2)}` : 'No'}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Next Due</span>
                        <div className="font-semibold text-gray-800">
                          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {expense.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {expense.itcEligible && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">ITC Eligible</Badge>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Pause</Button>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </div>
                ))}

                {expenses.filter(e => e.isRecurring).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No Recurring Expenses</h3>
                    <p>Add expenses and mark them as recurring to see them here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseTracker;