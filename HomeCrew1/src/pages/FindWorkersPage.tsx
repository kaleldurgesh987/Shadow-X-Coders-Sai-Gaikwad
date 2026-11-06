
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  MessageCircle,
  Navigation,
} from 'lucide-react';

import { SEED_WORKERS } from '../data/seedWorkers';
import { WorkerProfile } from '../types';
import { subscribeWorkers } from '../services/firestoreService';

// Custom marker icons
const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 7px rgba(37,99,235,0.25);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const workerIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 34px;
      height: 34px;
      background: #0B5D43;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">H</div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export const FindWorkersPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get('cat') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [workersList, setWorkersList] = useState<WorkerProfile[]>(SEED_WORKERS);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedService, setSelectedService] = useState(initialCategory);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxRate, setMaxRate] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);

  useEffect(() => {
    const unsub = subscribeWorkers((data) => {
      setWorkersList(data);
    });

    return () => unsub();
  }, []);

  // User location (defaults to Mumbai)
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 19.0760,
    lng: 72.8777,
  });

  const [locationName, setLocationName] = useState<string>('Mumbai MMR');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const servicesList = [
    'All',
    'Plumber',
    'Electrician',
    'Cleaner',
    'Carpenter',
    'Painter',
    'AC repair technicians',
    'Appliance repair technicians',
    'Cooks',
    'Housemaids',
  ];

  // Detect user's location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        setLocationName('Detected Location');
        setDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error or permission denied:', err.message);
        setDetectingLocation(false);
        alert('Unable to detect your location. Please allow location access.');
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  };

  // Calculate distance in KM
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(1);
  };

  // Filter workers
  const filteredWorkers = useMemo(() => {
    const activeList =
      workersList && workersList.length > 0
        ? workersList
        : SEED_WORKERS;

    return activeList.filter((worker) => {
      const matchesSearch =
        searchQuery === '' ||
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.skills.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        worker.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesService =
        selectedService === 'All' ||
        worker.services.includes(selectedService) ||
        worker.skills.some((s) =>
          s.toLowerCase().includes(selectedService.toLowerCase())
        );

      const matchesVerification =
        !verifiedOnly || worker.verificationStatus === 'verified';

      const matchesAvailability =
        !availableOnly || worker.availability;

      const matchesRate = worker.hourlyRate <= maxRate;
      const matchesRating = worker.averageRating >= minRating;

      return (
        matchesSearch &&
        matchesService &&
        matchesVerification &&
        matchesAvailability &&
        matchesRate &&
        matchesRating
      );
    });
  }, [
    workersList,
    searchQuery,
    selectedService,
    verifiedOnly,
    availableOnly,
    maxRate,
    minRating,
  ]);

  return (
    <div className="min-h-screen bg-[#FAFBF8] flex flex-col">

      {/* Top Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-18 z-30 shadow-xs">
        <div className="container mx-auto flex flex-col lg:flex-row gap-3 items-center justify-between">

          {/* Search Inputs */}
          <div className="w-full lg:w-auto flex-1 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search worker by name, skill, or area..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0B5D43] outline-none font-medium"
              />
            </div>

            <button
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0B5D43] text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 shrink-0 transition-colors cursor-pointer"
            >
              <Navigation
                className={`w-3.5 h-3.5 ${
                  detectingLocation ? 'animate-spin' : ''
                }`}
              />
              <span>
                {detectingLocation ? 'Detecting...' : 'Near Me'}
              </span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="w-full lg:w-auto flex items-center justify-between sm:justify-end gap-2 overflow-x-auto pb-1 sm:pb-0">

            {/* Service dropdown */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl text-gray-800 outline-none"
            >
              {servicesList.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>

            {/* Available toggle */}
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all ${
                availableOnly
                  ? 'bg-emerald-50 text-[#0B5D43] border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  availableOnly
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-gray-400'
                }`}
              />
              <span>Available Only</span>
            </button>

            {/* Verified toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all ${
                verifiedOnly
                  ? 'bg-[#0B5D43] text-white border-[#0B5D43]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Only</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 shrink-0">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'split'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500'
                }`}
                title="Split View"
              >
                Split
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500'
                }`}
                title="List View"
              >
                List
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500'
                }`}
                title="Full Map View"
              >
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-6">

        <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            Found <strong>{filteredWorkers.length}</strong> active professionals across Mumbai
          </span>

          <span className="flex items-center gap-1 text-[#0B5D43] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Guaranteed &lt;30 Min Arrival Available</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-210px)] min-h-[550px]">

          {/* Worker Cards */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div
              className={`h-full overflow-y-auto space-y-4 pr-1 ${
                viewMode === 'list'
                  ? 'lg:col-span-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0'
                  : 'lg:col-span-5 xl:col-span-5'
              }`}
            >
              {filteredWorkers.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                  <p className="text-gray-500 text-sm">
                    No workers match the selected filters.
                  </p>

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedService('All');
                      setVerifiedOnly(false);
                      setAvailableOnly(false);
                      setMaxRate(1000);
                      setMinRating(0);
                    }}
                    className="mt-3 px-4 py-2 bg-[#0B5D43] text-white text-xs font-bold rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredWorkers.map((worker) => {
                  const dist = calculateDistance(
                    userCoords.lat,
                    userCoords.lng,
                    worker.latitude,
                    worker.longitude
                  );

                  const isSelected = selectedWorker?.id === worker.id;

                  return (
                    <div
                      key={worker.id}
                      onClick={() => setSelectedWorker(worker)}
                      className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                        isSelected
                          ? 'border-2 border-[#0B5D43] ring-2 ring-emerald-500/20'
                          : 'border-gray-200/90 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={worker.profileImage}
                          alt={worker.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-heading font-bold text-gray-900 text-sm truncate">
                              {worker.name}
                            </h3>

                            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
                              <Star className="w-3 h-3 text-[#F9B000] fill-current" />
                              <span>{worker.averageRating}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#0B5D43] font-semibold mt-0.5">
                            <span>{worker.services.join(', ')}</span>
                            <span>&bull;</span>
                            <span className="text-gray-500 font-normal">
                              {worker.experienceYears}y exp
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1 truncate max-w-[140px]">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">
                                {worker.location}
                              </span>
                            </span>

                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                              {dist} km away
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
                            Standard Rate
                          </span>

                          <div className="text-base font-heading font-extrabold text-gray-900">
                            ₹{worker.hourlyRate}{' '}
                            <span className="text-xs font-normal text-gray-500">
                              /hr
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/negotiate?workerId=${worker.id}`}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors"
                          >
                            Negotiate
                          </Link>

                          <Link
                            to={`/worker/${worker.id}`}
                            className="px-3 py-1.5 rounded-lg bg-[#0B5D43] hover:bg-[#084532] text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            Book Now
                          </Link>

                          <a
                            href={`https://wa.me/${worker.whatsappNumber.replace(
                              /[^0-9]/g,
                              ''
                            )}?text=${encodeURIComponent(
                              `Hi ${worker.name}, I found your profile on HomeCrew and would like to request your service.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* OpenStreetMap */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div
              className={`h-full rounded-2xl overflow-hidden border border-gray-200 shadow-md relative bg-emerald-50/20 ${
                viewMode === 'map'
                  ? 'lg:col-span-12'
                  : 'lg:col-span-7 xl:col-span-7'
              }`}
              style={{ minHeight: '400px' }}
            >
              <MapContainer
                center={[userCoords.lat, userCoords.lng]}
                zoom={12}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location */}
                <Marker
                  position={[userCoords.lat, userCoords.lng]}
                  icon={userIcon}
                >
                  <Popup>
                    <strong>Your Location</strong>
                    <br />
                    {locationName}
                  </Popup>
                </Marker>

                {/* Worker locations */}
                {filteredWorkers.map((worker) => (
                  <Marker
                    key={worker.id}
                    position={[worker.latitude, worker.longitude]}
                    icon={workerIcon}
                    eventHandlers={{
                      click: () => setSelectedWorker(worker),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[180px] text-gray-900">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={worker.profileImage}
                            alt={worker.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />

                          <strong>{worker.name}</strong>
                        </div>

                        <p className="text-xs">
                          {worker.services.join(', ')}
                        </p>

                        <p className="font-bold mt-1">
                          ₹{worker.hourlyRate} / hour
                        </p>

                        <p className="text-xs text-gray-500">
                          Rating: {worker.averageRating}
                        </p>

                        <Link
                          to={`/worker/${worker.id}`}
                          className="inline-block mt-2 px-3 py-1.5 rounded-md bg-[#0B5D43] text-white text-xs font-bold"
                        >
                          Profile & Book
                        </Link>

                        <Link
                          to={`/negotiate?workerId=${worker.id}`}
                          className="inline-block mt-2 ml-2 text-xs font-bold text-amber-700"
                        >
                          Offer
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
