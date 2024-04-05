export async function API() {
  const res = await fetch("https://api.diveharder.com/all", {
    headers: {
      "User-Agent": "Helldivers 2 Companion - helldiverscompanion.app",
      "Accept-Language": "en-US"
    },
    next: { revalidate: 900 }
  });
  return res.json();
}

export async function statusAPI(){
  const res = await fetch("https://helldivers-2.fly.dev/api/801/status",{
    headers: {
      "User-Agent": "Helldivers 2 Companion - helldiverscompanion.app",
      "Accept-Language": "en-US"
    },
    next: { revalidate: 900 }
  });
  return res.json()
}

export async function stratagemsAPI(){
  const res = await fetch("https://api-hellhub-collective.koyeb.app/api/stratagems?limit=59",{
    headers: {
      "User-Agent": "Helldivers 2 Companion - helldiverscompanion.app",
      "Accept-Language": "en-US"
    },
    next: { revalidate: 900 }
  });
  return res.json()
}

{/*
  API Options:
  https://helldivers-2.fly.dev/api/swaggerui
  https://api.diveharder.com/docs
  https://helldivers-b.omnedia.com/api/current-war-season
  https://api.live.prod.thehelldiversgame.com/
*/}
