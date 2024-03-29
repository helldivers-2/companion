export async function omnediaAllInOneAPI(){
  const res = await fetch("https://helldivers-b.omnedia.com/api/current-war-season", { cache: 'no-store' })
  return res.json()
}{/* caching temporarily disabled */}

export async function deallocStatusAPI(){
  const res = await fetch("https://helldivers-2.fly.dev/api/801/status")
  return res.json()
}

export async function officialOrderAPI(){
  const res = await fetch("https://api.live.prod.thehelldiversgame.com/api/v2/Assignment/War/801")
  return res.json()
}

export async function officialStatsAPI(){
  const res = await fetch("https://api.live.prod.thehelldiversgame.com/api/Stats/War/801/Summary")
  return res.json()
}

export async function officialLeaderboardAPI(){
  const res = await fetch("https://api.live.prod.thehelldiversgame.com/api/LeaderBoard/HotF/v2/Player/801")
  return res.json()
}

export async function steamNewsAPI(){
  const res = await fetch("https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=553850&count=100")
  return res.json()
}


{/*
- = in use


-https://helldivers-b.omnedia.com/api/current-war-season
All-in-one

https://helldivers-2.fly.dev/api/801/info
Get information on a war season

https://helldivers-2.fly.dev/api/801/planets
Get an overview of all planets

https://helldivers-2.fly.dev/api/801/planets/{planet_index}
Get information on a specific planet

https://helldivers-2.fly.dev/api/801/planets/{planet_index}/status
Get the current war status of a specific planet

-https://helldivers-2.fly.dev/api/801/status
Get the current status of the Helldivers offensive

-https://api.live.prod.thehelldiversgame.com/api/v2/Assignment/War/801
Major Order

-https://api.live.prod.thehelldiversgame.com/api/Stats/War/801/Summary 
Global Stats

not working:
https://helldivers-2.fly.dev/api/801/events
Get an overview of all global events

https://helldivers-2.fly.dev/api/801/events/latest
Get the latest global event

https://helldivers-2.fly.dev/api/801/feed
Gets the newsfeed shown in-game under 'Dispatch'
 */}


 {
  /*
import { omnediaAPI } from "@/lib/getPlanetsData";

export default async function Home() {
  const posts = await omnediaAPI();
  return (
    <div>
      {posts.map((order) => {
        return (
          <div
            key={order.id}
            className="m-4 rounded-lg border border-primary bg-muted"
          >
            <p>{order.setting.overrideBrief}</p>
          </div>
        );
      })}
    </div>
  );
}*/
}
