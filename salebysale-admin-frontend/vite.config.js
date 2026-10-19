import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/auth": "http://localhost:5050",
      "/businesses": "http://localhost:5050",
      "/catalog": "http://localhost:5050",
      "/inventory": "http://localhost:5050",
      "/supplier": "http://localhost:5050",
      "/orders": "http://localhost:5050",
      "/shipments": "http://localhost:5050",
      "/admin": "http://localhost:5050",
      "/riders": "http://localhost:5050",
    },
  },
});
