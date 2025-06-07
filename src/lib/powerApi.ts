// src/lib/powerApi.ts
export async function fetchDailyPower(lat: number, lon: number, date: string) {
    const url =
      `https://power.larc.nasa.gov/api/temporal/daily/point` +
      `?parameters=T2M,PRECTOT,RH2M` +
      `&community=AG` +
      `&latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lon)}` +
      `&start=${date}&end=${date}` +
      `&format=JSON`;
  
    const res = await fetch(url);
    if (!res.ok) throw new Error(`POWER daily API ${res.status}`);
    return res.json();
  }
  
  export async function fetchMonthlyPower(lat: number, lon: number, year: number) {
    const url =
      `https://power.larc.nasa.gov/api/temporal/monthly/point` +
      `?parameters=T2M,PRECTOT,RH2M` +
      `&community=AG` +
      `&latitude=${encodeURIComponent(lat)}` +
      `&longitude=${encodeURIComponent(lon)}` +
      `&start=${year}&end=${year}` +
      `&format=JSON`;
  
    const res = await fetch(url);
    if (!res.ok) throw new Error(`POWER monthly API ${res.status}`);
    return res.json();
  }
  