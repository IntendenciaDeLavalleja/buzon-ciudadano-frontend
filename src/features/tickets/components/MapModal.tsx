import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import type { LocationData } from "../schema";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPickerProps {
  onSelect: (loc: LocationData) => void;
  initial: LocationData;
}

function MapPicker({ onSelect, initial }: MapPickerProps) {
  const [position, setPosition] = useState<LocationData | null>(
    initial.lat !== 0 || initial.lng !== 0 ? initial : null
  );

  useMapEvents({
    click(e) {
      const loc = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(loc);
      onSelect(loc);
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (loc: LocationData) => void;
  currentLocation: LocationData;
}

export function MapModal({ isOpen, onClose, onConfirm, currentLocation }: MapModalProps) {
  const [selected, setSelected] = useState<LocationData | null>(
    currentLocation.lat !== 0 || currentLocation.lng !== 0 ? currentLocation : null
  );

  useEffect(() => {
    if (isOpen) {
      setSelected(currentLocation.lat !== 0 || currentLocation.lng !== 0 ? currentLocation : null);
    }
  }, [isOpen, currentLocation]);

  // Lavalleja centre as default view
  const defaultCenter: [number, number] = [-33.92597, -55.01971];
  const defaultZoom = 9;

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="map-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="map-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Seleccionar Lugar del Problema</h2>
                <p className="text-sm text-gray-500 mt-0.5">Haga clic en el mapa para marcar la ubicacion exacta</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Map */}
            <div className="flex-1" style={{ minHeight: "400px" }}>
              <MapContainer
                center={
                  selected ? [selected.lat, selected.lng] : defaultCenter
                }
                zoom={selected ? 13 : defaultZoom}
                className="w-full h-full"
                style={{ height: "400px" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPicker onSelect={setSelected} initial={currentLocation} />
              </MapContainer>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50">
              <div className="text-sm text-gray-600">
                {selected ? (
                  <span className="text-green-700 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Lat: {selected.lat.toFixed(5)}, Lng: {selected.lng.toFixed(5)}
                  </span>
                ) : (
                  <span className="text-amber-600">Ningun punto seleccionado</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selected}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Confirmar Ubicacion
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}