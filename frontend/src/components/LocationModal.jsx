import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from '../hooks/useGeolocation';

const LocationModal = ({ isOpen, onClose, onSelectDistrict, districts }) => {
  const { t } = useTranslation();
  const { getLocation, loading, error } = useGeolocation();
  const [userLocation, setUserLocation] = useState(null);
  const [districtNotFound, setDistrictNotFound] = useState(false);

  const handleGetLocation = async () => {
    setUserLocation(null);
    setDistrictNotFound(false);

    // Pass districts to geolocation hook for matching
    const locationData = await getLocation(districts);
    
    if (!locationData) return;

    setUserLocation(locationData);

    // If matched district exists
    if (locationData.matchedDistrict) {
      // Auto-select after 2 seconds so user can see the match
      setTimeout(() => {
        onSelectDistrict(locationData.matchedDistrict);
      }, 2000);
    } else {
      // No match found
      setDistrictNotFound(true);
    }
  };

  const handleManualSelect = (districtName) => {
    onClose();
    onSelectDistrict(districtName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📍</span>
            View Current Location
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && !userLocation && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Location Detected */}
        {userLocation && (
          <div className={`border-2 rounded-xl p-4 mb-6 ${
            districtNotFound 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <p className={`font-semibold mb-3 ${
              districtNotFound ? 'text-yellow-800' : 'text-green-800'
            }`}>
              {districtNotFound ? '⚠️ Location Detected' : '✅ District Found!'}
            </p>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Your Address</p>
                <p className="font-bold text-gray-800 text-sm">
                  {userLocation.completeAddress}
                </p>
              </div>

              {userLocation.matchedDistrict ? (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-gray-600">Matched District</p>
                  <p className={`font-bold text-lg ${
                    districtNotFound ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {userLocation.matchedDistrict}
                  </p>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <p className={`text-sm font-semibold ${
                    districtNotFound ? 'text-yellow-700' : 'text-gray-700'
                  }`}>
                    This district is not in our database.
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    We have data for: <strong>{districts.map(d => d.district_name).join(', ')}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-blue-700">
            <strong>ℹ️ Note:</strong> This uses your device's GPS location. Make sure location permission is enabled in your browser settings.
          </p>
        </div>

        {/* Manual Selection */}
        {districtNotFound && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Select a district manually:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {districts.map((district) => (
                <button
                  key={district.district_name}
                  onClick={() => handleManualSelect(district.district_name)}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-indigo-100 text-gray-800 hover:text-indigo-800 transition font-medium text-sm"
                >
                  {district.district_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={handleGetLocation}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Detecting...
              </>
            ) : userLocation ? (
              <>
                <span>🔄</span>
                Try Again
              </>
            ) : (
              <>
                <span>📍</span>
                Detect Location
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
