export const revalidate = 3600;

export async function API() {
  const res = await fetch("https://api.diveharder.com/v1/all", {
    headers: {
      "User-Agent": "Helldivers 2 Companion - helldiverscompanion.app",
      "Accept-Language": "en-US",
      "X-Super-Client": "Helldivers 2 Companion - helldiverscompanion.app",
      "X-Super-Contact": "@.mixhi",
    },
  });
  return res.json();
}
{
  /*https://api.diveharder.com/docs*/
}

export async function statusAPI() {
  const res = await fetch("https://api.helldivers2.dev/api/v1/planets", {
    headers: {
      "User-Agent": "Helldivers 2 Companion - helldiverscompanion.app",
      "Accept-Language": "en-US",
      "X-Super-Client": "Helldivers 2 Companion - helldiverscompanion.app",
      "X-Super-Contact": "@.mixhi",
    },
  });
  return res.json();
}

export async function stratagemsAPI() {
  const res = await fetch(
    "https://api-hellhub-collective.koyeb.app/api/stratagems?limit=59",
    {
      headers: {
        "User-Agent": "Helldivers 2 Companion - helldiverscompanion.app",
        "Accept-Language": "en-US",
      },
    },
  );
  return res.json();
}
