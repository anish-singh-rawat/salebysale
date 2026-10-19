export const PLATFORM_FEE_RATE = Number(process.env.PLATFORM_FEE_RATE || 0.01);
export const DEFAULT_MARGIN_RATE = Number(process.env.DEFAULT_SUPPLIER_MARGIN_RATE || 0.03);

export function deliveryChargeForKm(km) {
  if (km <= 3) return 40;
  if (km <= 8) return 60;
  if (km <= 20) return 90;
  return 120;
}

export function etaMinutesForKm(km, readyInMinutes = 0) {
  let windowMin;
  let windowMax;
  if (km <= 3) {
    windowMin = 15;
    windowMax = 30;
  } else if (km <= 8) {
    windowMin = 30;
    windowMax = 45;
  } else {
    windowMin = 45;
    windowMax = 90;
  }
  return {
    etaMin: windowMin + readyInMinutes,
    etaMax: windowMax + readyInMinutes,
    slaBand: km <= 3 ? "0-3km" : km <= 8 ? "3-8km" : "8-20km",
  };
}

export function haversineKm(a, b) {
  if (!a?.lat || !b?.lat) return 4;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function quoteLandedPrice({
  floorPrice,
  marginRate = DEFAULT_MARGIN_RATE,
  km,
  gstRate = 0,
}) {
  const supplierMargin = Math.round(floorPrice * marginRate);
  const supplierPayout = floorPrice + supplierMargin;
  const platformFee = Math.round(supplierPayout * PLATFORM_FEE_RATE);
  const deliveryCharge = deliveryChargeForKm(km);
  const taxable = supplierPayout + platformFee + deliveryCharge;
  const tax = Math.round(taxable * gstRate);
  const landedPrice = taxable + tax;
  return {
    floorPrice,
    supplierMargin,
    supplierPayout,
    platformFee,
    deliveryCharge,
    tax,
    gstRate,
    landedPrice,
    note: "Platform fee is gross, not net profit.",
  };
}

export function matchScore({ price, km, readyInMinutes, reliability, riderAvailable }) {
  const priceScore = Math.max(0, 10000 - price) / 100;
  const distScore = Math.max(0, 20 - km) * 8;
  const readyScore = Math.max(0, 30 - readyInMinutes) * 2;
  const relScore = (reliability || 70) * 0.8;
  const riderScore = riderAvailable ? 40 : 0;
  return priceScore + distScore + readyScore + relScore + riderScore;
}
