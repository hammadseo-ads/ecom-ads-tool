import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface NewFeatureSectionProps {
  selectedAccountId: string;
  selectedAccountName: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const NewFeatureSection: React.FC<NewFeatureSectionProps> = ({
  selectedAccountId,
  selectedAccountName
}) => {

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("accessToken");

  // 🔵 Example MERN backend action
  const handleAddFeature = async () => {
    if (!selectedAccountId) return;

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/google-ads/campaigns`,
        {
          customerId: selectedAccountId,
          campaignName: "New Feature Campaign",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      alert("Feature added successfully!");
      console.log(response.data);

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Error adding feature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>New Feature Section</span>
            </CardTitle>
            <CardDescription>
              This is where your new MERN functionality will run.
            </CardDescription>
          </div>

          <Button
            disabled={!selectedAccountId || loading}
            onClick={handleAddFeature}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Processing..." : "Add Feature"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {selectedAccountId ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selected Account: <span className="font-medium">{selectedAccountName}</span> ({selectedAccountId})
            </p>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Your MERN feature has access to:
              </p>

              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Google Ads Account ID: {selectedAccountId}</li>
                <li>• Google Ads Account Name: {selectedAccountName}</li>
                <li>• JWT Authentication</li>
                <li>• MERN backend endpoints</li>
                <li>• axios with bearer token</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Please select a Google Ads account to use this feature.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewFeatureSection;
