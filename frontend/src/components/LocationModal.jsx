import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from '../hooks/useGeolocation';

const LocationModal = ({ isOpen, onClose, onSelectDistrict, districts }) => {
  const { t } = useTranslation();
  const { getLocation, loading, error } = useGeolocation();
  const [userDistrict, setUserDistrict] = useState(null);
  const [districtNotFound, setDistrictNotFound] = useState(false);

  const handleGetLocation = async () => {
    setUserDistrict(null);
    setDistrictNotFound(false);

    const locationData = await getLocation();
    
    if (!locationData) return;

    // Find matching district in database
    const matchedDistrict = districts.find(
      (d) =>
        d.district_name.toLowerCase() === locationData.districtName.toLowerCase() ||
        d.district_name.toLowerCase().includes(locationData.districtName.toLowerCase().split(' ')[0])
    );

    if (matchedDistrict) {
      setUserDistrict(matchedDistrict);
      onSelectDistrict(matchedDistrict.district_name);
    } else {
      setDistrictNotFound(true);
      setUserDistrict(locationData);
    }
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
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* District Not Found */}
        {districtNotFound && userDistrict && (
          <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6">
            <p className="font-semibold mb-2">⚠️ No Data Available</p>
            <p className="text-sm">
              There is no data available for your district: <strong>{userDistrict.districtName}</strong>
            </p>
            <p className="text-xs text-yellow-700 mt-2 opacity-75">
              We only have data for: Tamil Nadu districts
            </p>
          </div>
        )}

        {/* District Found */}
        {userDistrict && !districtNotFound && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-green-800 mb-3">✅ District Found!</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">District</p>
                <p className="font-bold text-lg text-green-700">
                  {userDistrict.district_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">State</p>
                <p className="font-bold text-green-700">
                  {userDistrict.state_name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-blue-700">
            <strong>ℹ️ Note:</strong> This will use your device's location to determine your district.
            Make sure location permission is enabled in your browser.
          </p>
        </div>

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
