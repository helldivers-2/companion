export default async function WikipediaText() {
  return (
    <div className="space-y-4">
      <p>
        Helldivers 2 is a cooperative third-person shooter developed by
        Arrowhead Game Studios and published by Sony Interactive Entertainment
        for PlayStation 5 and Windows. Released on 8 February 2024, it is the
        sequel to Helldivers (2015).
      </p>

      <p>
        Set in the 22nd century, players take the role of Helldivers, elite
        soldiers dispatched to spread managed democracy across the galaxy. The
        game was a critical and commercial hit, winning multiple awards and
        becoming one of the best-selling titles of 2024.
      </p>

      <h3 className="pt-2 text-xl font-semibold">Gameplay</h3>

      <p>
        Up to four players drop onto hostile planets to complete objectives
        while fighting three enemy factions. Before each mission, players pick
        their loadout and stratagems, orbital abilities like airstrikes, supply
        drops, and vehicle deployments called in via directional input
        sequences.
      </p>

      <p>
        Missions span 10 difficulty levels. Players fight or sneak through enemy
        territory, complete objectives, then call in an extraction shuttle and
        survive 90 seconds of heavy combat to escape. Enemies have unlimited
        reinforcements, so avoiding unnecessary fights is often the smarter
        play.
      </p>

      <h3 className="pt-2 text-xl font-semibold">The Galactic War</h3>

      <p>
        All players share a single persistent war. Every completed mission deals
        damage to a planet&apos;s health pool, pushing it toward liberation.
        Enemy factions push back constantly, regenerating planet health when
        player activity drops. A game master at Arrowhead adjusts the war in
        real time, creating dynamic campaigns and escalating threats.
      </p>

      <p>
        This companion site tracks the current state of that war, active
        campaigns, liberation progress, major orders, and estimated completion
        times.
      </p>

      <p className="text-sm text-muted-foreground">
        Based on information from{" "}
        <a
          href="https://en.wikipedia.org/wiki/Helldivers_2"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          Wikipedia
        </a>{" "}
        (CC BY-SA 4.0) and in-game sources.
      </p>
    </div>
  );
}
