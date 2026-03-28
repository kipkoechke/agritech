"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MdMap } from "react-icons/md";

const defaultCenter: [number, number] = [-1.2921, 36.8219];
const defaultZoom = 8;

const FarmMapPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Popup: any;
  } | null>(null);
  const farms: any[] = [];

  useEffect(() => {
    setIsClient(true);
    import("react-leaflet").then((mod) => {
      setMapComponents({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        Marker: mod.Marker,
        Popup: mod.Popup,
      });
    });
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
        <MdMap className="w-6 h-6 text-emerald-600" />
        Farm Map
      </h1>
      <p className="text-gray-600 mb-4">
        View farm locations and concentrations. Heat maps show farm density by area.
      </p>
      
      <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
        {isClient && MapComponents ? (
          <MapComponents.MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: "100%", width: "100%" }}
          >
            <MapComponents.TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {farms.map((farm, index) => (
              <MapComponents.Marker
                key={index}
                position={[farm.lat, farm.lng]}
              >
                <MapComponents.Popup>
                  <div className="text-sm">
                    <strong>{farm.name}</strong>
                    <br />
                    Owner: {farm.owner}
                    <br />
                    Size: {farm.size} acres
                  </div>
                </MapComponents.Popup>
              </MapComponents.Marker>
            ))}
          </MapComponents.MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-400">Loading map...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmMapPage;
