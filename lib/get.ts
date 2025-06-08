export async function StatisticsAPI() {
  try {
    const res = await fetch("https://api.helldivers2.dev/api/v1/war", {
      headers: {
        "X-Super-Client": "helldivers.michi.onl - helldivers-2/companion",
        "X-Super-Contact": "@.mixhi",
      },
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(`API Error: ${String(error)}`);
  }
}