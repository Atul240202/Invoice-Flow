import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Input } from "../Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Select";
import { useEffect } from "react";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const ShippingDetails = ({ shippingDetails, setShippingDetails }) => {
  if (!shippingDetails) return null;
  
  useEffect(() => {
    const fetchShippingFrom = async () => {
      console.log("Token:", localStorage.getItem("token"));

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/shipped-from`, {
           method: "GET",
           headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });

         if (!res.ok) {
        const errText = await res.text();
        console.error("Server returned:", errText);
        return;
      }

        const data = await res.json();

        if (data.shippingFrom) {
          setShippingDetails(prev => ({
            ...prev,
            shippedFrom: data.shippedFrom,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch shippingFrom:", err);
      }
    };

    fetchShippingFrom();
  }, [setShippingDetails]);

  return (
    <Card className="bg-white border border-gray-200 rounded-lg mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-black">
          Shipping Details
        </CardTitle>
        <p className="text-gray-500 text-sm font-normal">
          Enter shipping origin and destination for this invoice
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipped From */}
          <div>
            <h3 className="text-base font-semibold text-blue-700 mb-2">Shipped From</h3>
            <div className="space-y-3">
              <Input
                value={shippingDetails.shippedFrom.businessName}
                onChange={e =>
                  setShippingDetails(prev => ({
                    ...prev,
                    shippedFrom: { ...prev.shippedFrom, businessName: e.target.value }
                  }))
                }
                placeholder="Business Name"
                className="h-10 border-gray-300 focus:border-blue-500"
              />
              <Input
                value={shippingDetails.shippedFrom.address}
                onChange={e =>
                  setShippingDetails(prev => ({
                    ...prev,
                    shippedFrom: { ...prev.shippedFrom, address: e.target.value }
                  }))
                }
                placeholder="Address"
                className="h-10 border-gray-300 focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={shippingDetails.shippedFrom.city}
                  onChange={e =>
                    setShippingDetails(prev => ({
                      ...prev,
                      shippedFrom: { ...prev.shippedFrom, city: e.target.value }
                    }))
                  }
                  placeholder="City"
                  className="h-10 border-gray-300 focus:border-blue-500"
                />
                <Select
                  value={shippingDetails.shippedFrom.state}
                  onValueChange={value =>
                    setShippingDetails(prev => ({
                      ...prev,
                      shippedFrom: { ...prev.shippedFrom, state: value }
                    }))
                  }
                >
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {indianStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={shippingDetails.shippedFrom.country}
                onChange={e =>
                  setShippingDetails(prev => ({
                    ...prev,
                    shippedFrom: { ...prev.shippedFrom, country: e.target.value }
                  }))
                }
                placeholder="Country"
                className="h-10 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>
          {/* Shipped To */}
          <div>
            <h3 className="text-base font-semibold text-blue-700 mb-2">Shipped To</h3>
            <div className="space-y-3">
              <Input
                value={shippingDetails.shippedTo.businessName}
                onChange={e =>
                  setShippingDetails(prev => ({
                    ...prev,
                    shippedTo: { ...prev.shippedTo, businessName: e.target.value }
                  }))
                }
                placeholder="Business Name"
                className="h-10 border-gray-300 focus:border-blue-500"
              />
              <Input
                value={shippingDetails.shippedTo.address}
                onChange={e =>
                  setShippingDetails(prev => ({
                    ...prev,
                    shippedTo: { ...prev.shippedTo, address: e.target.value }
                  }))
                }
                placeholder="Address"
                className="h-10 border-gray-300 focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={shippingDetails.shippedTo.city}
                  onChange={e =>
                    setShippingDetails(prev => ({
                      ...prev,
                      shippedTo: { ...prev.shippedTo, city: e.target.value }
                    }))
                  }
                  placeholder="City"
                  className="h-10 border-gray-300 focus:border-blue-500"
                />
                <Select
                  value={shippingDetails.shippedTo.state}
                  onValueChange={value =>
                    setShippingDetails(prev => ({
                      ...prev,
                      shippedTo: { ...prev.shippedTo, state: value }
                    }))
                  }
                >
                  <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {indianStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={shippingDetails.shippedTo.country}
                onChange={e =>
                  setShippingDetails(prev => ({
                    ...prev,
                    shippedTo: { ...prev.shippedTo, country: e.target.value }
                  }))
                }
                placeholder="Country"
                className="h-10 border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};