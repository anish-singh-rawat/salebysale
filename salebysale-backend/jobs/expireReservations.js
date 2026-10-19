import { expireReservations, hideStaleInventory } from "../services/inventoryService.js";

export function startJobs() {
  setInterval(async () => {
    try {
      const n = await expireReservations();
      if (n) console.log(`Released ${n} expired reservation(s)`);
      await hideStaleInventory();
    } catch (err) {
      console.error("Job error:", err.message);
    }
  }, 30_000);
}
