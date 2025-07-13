import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "../card";
import { Button } from "../button";
import { Input } from "../Input";
import { Label } from "../Label";
import { User, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "../../hooks/toast";

export default function ProfileSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/settings/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setIsSaved(false); // Reset saved state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("http://localhost:5000/api/settings/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Profile updated",
        description: "Your profile was saved successfully.",
      });

      setForm(res.data);
      setIsSaved(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 space-y-4 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-24 w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg">
          <User className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-black">Profile Settings</h1>
          <p className="text-gray-600">Manage your name, contact, and address details</p>
        </div>
      </div>

      <Card className="shadow-xl border border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-100 pb-6">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Personal Info
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your name"
                  value={form.fullName}
                  onChange={handleChange}
                  className="h-11 border-gray-300 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  disabled
                  className="h-11 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 text-blue-500 inline-block mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="h-11 border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="w-4 h-4 text-blue-500 inline-block mr-1" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Your full address"
                  value={form.address}
                  onChange={handleChange}
                  className="h-11 border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              {isSaved && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Saved successfully
                </div>
              )}
              <Button
                type="submit"
                className="h-11 px-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:from-purple-700 hover:to-blue-700 shadow-md"
              >
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
