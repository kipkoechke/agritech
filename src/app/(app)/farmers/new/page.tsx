"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdPerson, MdLocationOn, MdSave, MdArrowBack } from "react-icons/md";
import Link from "next/link";
import Button from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";

interface FarmerFormData {
  name: string;
  nationalId: string;
  phone: string;
  acreage: string;
  farmCode: string;
  location: string;
  latitude: number;
  longitude: number;
}

const defaultCenter: [number, number] = [-1.2921, 36.8219];

export default function NewFarmerPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Popup: any;
  } | null>(null);
  const [formData, setFormData] = useState<FarmerFormData>({
    name: "",
    nationalId: "",
    phone: "",
    acreage: "",
    farmCode: "",
    location: "",
    latitude: 0,
    longitude: 0,
  });

  const [farmerCode] = useState(() => {
    return `FRM${Date.now().toString().slice(-6)}`;
  });

  useEffect(() => {
    if (showMap) {
      import("react-leaflet").then((mod) => {
        setMapComponents({
          MapContainer: mod.MapContainer,
          TileLayer: mod.TileLayer,
          Marker: mod.Marker,
          Popup: mod.Popup,
        });
      });
    }
  }, [showMap]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      router.push("/farmers");
    }, 1000);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPosition([latitude, longitude]);
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/farmers">
            <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
              <MdArrowBack className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdPerson className="w-7 h-7 text-emerald-600" />
            Farmer Registration
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter farmer's full name"
              required
            />

            <InputField
              label="National ID"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleInputChange}
              placeholder="Enter National ID number"
              required
            />

            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="2547XXXXXXXX"
              required
            />

            <InputField
              label="Acreage"
              name="acreage"
              type="number"
              value={formData.acreage}
              onChange={handleInputChange}
              placeholder="Enter farm size in acres"
              required
            />

            <InputField
              label="Farm Code (If >1 farm)"
              name="farmCode"
              value={formData.farmCode}
              onChange={handleInputChange}
              placeholder="Enter farm code if multiple farms"
            />

            <InputField
              label="Farmer Code (System Generated)"
              name="farmerCode"
              value={farmerCode}
              disabled
              placeholder="Auto-generated"
            />

            <div className="md:col-span-2">
              <InputField
                label="Location (Zone)"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Click 'Get Current Location' to set"
                required
                icon={<MdLocationOn className="w-5 h-5 text-emerald-600" />}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  type="small"
                  htmlType="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm"
                >
                  {showMap ? "Hide Map" : "Show Map"}
                </Button>
                <Button
                  type="small"
                  htmlType="button"
                  onClick={getCurrentLocation}
                  className="text-sm"
                >
                  Get Current Location
                </Button>
              </div>
            </div>

            {showMap && MapComponents && (
              <div className="md:col-span-2">
                <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                  <MapComponents.MapContainer
                    center={markerPosition || defaultCenter}
                    zoom={10}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <MapComponents.TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markerPosition && (
                      <MapComponents.Marker position={markerPosition}>
                        <MapComponents.Popup>Farm Location</MapComponents.Popup>
                      </MapComponents.Marker>
                    )}
                  </MapComponents.MapContainer>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click "Get Current Location" to auto-detect your position, or enter coordinates manually above
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Link href="/farmers">
              <Button type="secondary" className="text-sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <MdSave className="w-5 h-5" />
              {isSaving ? "Saving..." : "Save Farmer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
