import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Incident, Hotspot } from '../types';
import { ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface Props {
  incidents: Incident[];
  hotspots: Hotspot[];
  onSelectIncident?: (inc: Incident) => void;
  selectedZone?: string;
}

// Custom Leaflet Marker Icons
const createCustomMarker = (severity: string, priorityScore: number) => {
  let color = '#10b981'; // Green
  if (priorityScore >= 85 || severity === 'CRITICAL') color = '#ef4444'; // Red
  else if (priorityScore >= 70 || severity === 'HIGH') color = '#f97316'; // Orange
  else if (priorityScore >= 50 || severity === 'MEDIUM') color = '#eab308'; // Yellow

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid #0f172a;
        box-shadow: 0 0 15px ${color}90;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0f172a;
        font-weight: 800;
        font-size: 11px;
        font-family: 'Plus Jakarta Sans', sans-serif;
      ">
        ${priorityScore}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

export const GISMap: React.FC<Props> = ({ incidents, hotspots, onSelectIncident }) => {
  // Indore City Coordinates (Central Rajwada & AB Road Corridor)
  const centerLat = 22.7196;
  const centerLng = 75.8577;

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full dark-map-tiles"
      >
        {/* OpenStreetMap Tile Layer (100% Free, Public, Zero API Key!) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Hotspot Cluster Circles */}
        {hotspots.map((hs) => (
          <Circle
            key={hs.id}
            center={[hs.latitude, hs.longitude]}
            radius={hs.radius_meters}
            pathOptions={{
              color: hs.risk_level === 'CRITICAL' ? '#ef4444' : '#f97316',
              fillColor: hs.risk_level === 'CRITICAL' ? '#ef4444' : '#f97316',
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="p-1.5 space-y-1 text-xs font-sans">
                <div className="font-bold text-red-400">{hs.code}: {hs.name}</div>
                <div className="text-[11px] text-slate-300 leading-tight">{hs.description}</div>
                <div className="mt-1 font-bold text-amber-400 text-[11px]">Risk Level: {hs.risk_level} ({hs.incident_count} Incidents)</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Incident Markers */}
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createCustomMarker(inc.severity, inc.priority_score)}
          >
            <Popup>
              <div className="p-1.5 space-y-2 max-w-xs font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 text-xs">{inc.report_code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Prio: {inc.priority_score}
                  </span>
                </div>
                <div className="font-bold text-white text-xs leading-snug">{inc.title}</div>
                <div className="text-[11px] text-slate-300 font-medium">{inc.address}</div>

                <div className="pt-1.5 flex items-center justify-between border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">Status: <strong className="text-white font-semibold">{inc.status}</strong></span>
                  {onSelectIncident && (
                    <button
                      onClick={() => onSelectIncident(inc)}
                      className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-bold text-[10px] rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
