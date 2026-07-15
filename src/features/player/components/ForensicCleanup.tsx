"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ForensicCleanup() {
  const [cleaned, setCleaned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const forceReset = urlParams.get('reset') === 'true';

    if (typeof window === "undefined" || (!forceReset && localStorage.getItem("forensic_cleanup_done"))) {
      return;
    }

    const cleanOriginData = async () => {
      // 1. Local Storage
      localStorage.clear();
      
      // 2. Session Storage
      sessionStorage.clear();
      
      // 3. Cookies (Clear all app-specific cookies)
      const cookies = document.cookie.split("; ");
      for (const c of cookies) {
        const [name] = c.split("=");
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      }

      // 4. IndexedDB
      if (window.indexedDB && window.indexedDB.databases) {
        try {
          const dbs = await window.indexedDB.databases();
          dbs.forEach(db => {
            if (db.name) window.indexedDB.deleteDatabase(db.name);
          });
        } catch (e) {
          console.warn("Could not enumerate IndexedDB", e);
        }
      }

      // 5. Cache Storage
      if (window.caches) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map(key => window.caches.delete(key)));
        } catch (e) {
          console.warn("Could not clear caches", e);
        }
      }

      // 6. Service Workers
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        } catch (e) {
          console.warn("Could not unregister service workers", e);
        }
      }

      // Mark as done
      localStorage.setItem("forensic_cleanup_done", "true");
      setCleaned(true);
      
      // Force reload to apply cleanly (remove the query param so it doesn't loop)
      if (forceReset) {
        window.location.href = '/profiles';
      } else {
        window.location.reload();
      }
    };

    cleanOriginData();
  }, [router]);

  if (cleaned) return null;
  return null;
}
