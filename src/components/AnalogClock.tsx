'use client';

import React, { useState, useEffect } from 'react';

/**
 * Shows a live analog clock for the lat/lng location passed in.
 * It fetches the IANA time-zone for that point via Google Time Zone API
 * (needs NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in env).
 */
export default function AnalogClock({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const [time, setTime] = useState(new Date());
  const [tz, setTz] = useState<string>();

  /* get IANA zone once */
  useEffect(() => {
    const ts = Math.floor(Date.now() / 1000);
    fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'OK') setTz(data.timeZoneId);
      });
  }, [lat, lng]);

  /* update the shown time every second */
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  const local = tz
    ? new Date(new Date().toLocaleString('en-US', { timeZone: tz }))
    : time;

  const sec = local.getSeconds();
  const min = local.getMinutes() + sec / 60;
  const hr = (local.getHours() % 12) + min / 60;

  return (
    <div className="w-20 h-20 relative">
      <div className="w-full h-full border-2 border-white rounded-full" />

      {/* hour hand */}
      <div
        className="absolute bg-white"
        style={{
          width: '2px',
          height: '25%',
          top: '25%',
          left: '50%',
          transform: `rotate(${hr * 30}deg) translateX(-50%)`,
          transformOrigin: '50% 100%',
        }}
      />
      {/* minute hand */}
      <div
        className="absolute bg-white"
        style={{
          width: '2px',
          height: '35%',
          top: '15%',
          left: '50%',
          transform: `rotate(${min * 6}deg) translateX(-50%)`,
          transformOrigin: '50% 100%',
        }}
      />
      {/* second hand */}
      <div
        className="absolute bg-red-500"
        style={{
          width: '1px',
          height: '40%',
          top: '10%',
          left: '50%',
          transform: `rotate(${sec * 6}deg) translateX(-50%)`,
          transformOrigin: '50% 100%',
        }}
      />

      {/* centre pin */}
      <div
        className="absolute bg-white rounded-full"
        style={{ width: '4px', height: '4px', top: '48%', left: '48%' }}
      />
    </div>
  );
}
