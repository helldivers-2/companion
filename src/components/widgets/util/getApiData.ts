export async function API(){
  const res = await fetch("https://api.diveharder.com/all")
  return res.json()
}

export async function statusAPI(){
  const res = await fetch("https://helldivers-2.fly.dev/api/801/status")
  return res.json()
}

{/*
  Api Options:
  https://helldivers-2.fly.dev/api/swaggerui
  https://api.diveharder.com/docs
  https://helldivers-b.omnedia.com/api/current-war-season
  https://api.live.prod.thehelldiversgame.com/
*/}
