import geoip from "geoip-lite";

export function getGeo(ip: string) {
  const geo = geoip.lookup(ip);
  return {
    country: geo?.country ?? null,
    region: geo?.region ?? null,
    city: geo?.city ?? null,
    timezone: geo?.timezone ?? null,
    lat: geo?.ll?.[0] ?? null,
    lon: geo?.ll?.[1] ?? null,
  };
}

export function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}
