/**
 * Seed realistic mock bookings for the next 48 hours.
 * Run with: pnpm --filter @workspace/db tsx src/seed-bookings.ts
 */
import { db } from "./index";
import { bookingsTable } from "./schema";

const ADD_ON_PRICES: Record<string, number> = {
  referee: 5000,
  bibs: 2000,
  water: 3000,
};

function calcAddOns(addOns: string[]) {
  return addOns.reduce((sum, a) => sum + (ADD_ON_PRICES[a] ?? 0), 0);
}

function makeBooking(
  referenceNumber: string,
  pitchId: number,
  userName: string,
  userEmail: string,
  date: string,
  timeSlot: string,
  matchType: string,
  addOns: string[],
  basePrice: number,
  status: string
) {
  const addOnsTotal = calcAddOns(addOns);
  return {
    referenceNumber,
    pitchId,
    userId: null as string | null,
    userName,
    userEmail,
    date,
    timeSlot,
    matchType,
    addOns,
    basePrice,
    addOnsTotal,
    discountApplied: 0,
    totalPrice: basePrice + addOnsTotal,
    status,
  };
}

// Today = 2026-07-16, Tomorrow = 2026-07-17
// Pitches: 1=Lagos Legacy ₦45k, 2=Abuja National ₦35k, 3=Port Harcourt ₦25k, 4=Enugu ₦15k
const bookings = [
  makeBooking("SPP-TY4K9LQM", 1, "Tunde Okafor",    "tunde.okafor@gmail.com",   "2026-07-16", "09:00", "competitive", ["referee", "bibs"],        45000, "confirmed"),
  makeBooking("SPP-CH7WRBP2", 2, "Chidi Nwachukwu", "chidi.nwa@yahoo.com",       "2026-07-16", "14:00", "friendly",    ["water"],                   35000, "confirmed"),
  makeBooking("SPP-AM3XVNKJ", 4, "Amina Bello",     "amina.bello@outlook.com",   "2026-07-16", "16:00", "friendly",    [],                          15000, "confirmed"),
  makeBooking("SPP-EM9QZST6", 3, "Emeka Eze",       "emeka.eze@hotmail.com",     "2026-07-16", "18:00", "competitive", ["referee"],                 25000, "confirmed"),
  makeBooking("SPP-KF2DMPW8", 1, "Kemi Fashola",    "kemi.fashola@gmail.com",    "2026-07-16", "20:00", "friendly",    ["bibs", "water"],           45000, "confirmed"),
  makeBooking("SPP-YS5LNKR4", 2, "Yusuf Salami",    "yusuf.salami@gmail.com",    "2026-07-17", "10:00", "competitive", ["referee", "water"],        35000, "confirmed"),
  makeBooking("SPP-NG8BVQZH", 4, "Ngozi Adeyemi",   "ngozi.adeyemi@gmail.com",   "2026-07-17", "12:00", "friendly",    [],                          15000, "confirmed"),
  makeBooking("SPP-IB6TMCPX", 3, "Ibrahim Musa",    "ibrahim.musa@yahoo.com",    "2026-07-17", "15:00", "competitive", ["referee", "bibs"],         25000, "confirmed"),
  makeBooking("SPP-FU1RWDH3", 1, "Funmi Adebayo",   "funmi.adebayo@gmail.com",   "2026-07-17", "17:00", "friendly",    ["water"],                   45000, "pending"),
  makeBooking("SPP-OB4KZPYN", 2, "Obinna Okonkwo",  "obinna.ok@gmail.com",       "2026-07-17", "19:00", "competitive", ["referee", "bibs", "water"],35000, "confirmed"),
];

async function seed() {
  console.log("🌱 Seeding mock bookings...\n");

  for (const b of bookings) {
    try {
      await db.insert(bookingsTable).values(b).onConflictDoNothing();
      const emoji = b.status === "confirmed" ? "✅" : "🕐";
      console.log(`  ${emoji} ${b.userName.padEnd(20)} Pitch ${b.pitchId}  ${b.date} ${b.timeSlot}  ₦${b.totalPrice.toLocaleString().padStart(7)}  [${b.status}]`);
    } catch (err) {
      console.error(`  ❌ Failed: ${b.referenceNumber}`, err);
    }
  }

  const total = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + b.totalPrice, 0);
  console.log(`\n💰 Total confirmed revenue: ₦${total.toLocaleString()}`);
  console.log("✅ Seed complete.");
  process.exit(0);
}

seed();
