export default async function WikipediaText() {
  return (
    <div className="space-y-4">
      <p>
        Helldivers 2 is a cooperative third-person shooter from Arrowhead Game
        Studios, published by Sony Interactive Entertainment. It launched on
        PlayStation 5 and Windows on 8 February 2024 and reached Xbox Series X|S
        on 26 August 2025. It follows Helldivers (2015).
      </p>

      <p>
        Set in the 22nd century, you play a Helldiver, one of Super Earth&apos;s
        expendable elite spreading managed democracy across the galaxy. The game
        took Best Multiplayer and Best Ongoing Game at The Game Awards 2024, and
        Arrowhead passed 20 million copies sold in January 2026.
      </p>

      <h3 className="pt-2 text-xl font-semibold">Gameplay</h3>

      <p>
        Squads of up to four drop onto hostile planets held by the Terminids,
        the Automatons and the Illuminate. Before the drop you pick a loadout
        and four stratagems: airstrikes, supply drops, sentries and vehicles,
        each called down with a directional input sequence.
      </p>

      <p>
        Ten difficulty levels run from Trivial to Super Helldive. You fight or
        sneak your way through the objectives, call in the extraction shuttle,
        then hold the landing zone for two minutes while the planet throws
        everything it has at you. The enemy reinforces without limit, so picking
        fights you can walk away from beats winning them.
      </p>

      <h3 className="pt-2 text-xl font-semibold">The Galactic War</h3>

      <p>
        Everyone plays in one persistent war. Every mission you finish damages a
        planet&apos;s health pool and moves it toward liberation, while the
        enemy regenerates that health whenever player numbers fall. A game
        master at Arrowhead writes the campaigns, escalates threats and answers
        what the player base does.
      </p>

      <p>
        This companion tracks that war as the API reports it: major orders,
        active campaigns, liberation progress and the enemy&apos;s regeneration
        rate per planet.
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
