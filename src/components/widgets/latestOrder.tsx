import { API } from "@/components/widgets/util/getApiData";
import { statusAPI } from "@/components/widgets/util/getApiData";
import { Progress } from "../ui/progress";
import { formatNumber } from "@/components/widgets/globalStats";

interface Task {
  values: number[];
}

export default async function majorOrder() {
  const order = await API();
  const status = await statusAPI();

  if (order.major_order.length === 0) {
    return (
      <div className="w-full rounded-lg border">
        <p className="p-4 font-bold text-muted-foreground">
          Currently no major order
        </p>
      </div>
    );
  }

  const unixTimestamp = order.major_order[0].expiresIn;
  const milliseconds = unixTimestamp * 1000;

  let timeLeft;

  if (milliseconds >= 24 * 60 * 60 * 1000) {
    // Check if the duration is over 24 hours
    const days = Math.round(milliseconds / (24 * 60 * 60 * 1000));
    if (days <= 1) {
      timeLeft = "1 day";
    } else {
      timeLeft = `${days} days`;
    }
  } else {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    if (hours <= 1) {
      timeLeft = "less than 1 hour";
    } else {
      timeLeft = `${hours} hours`;
    }
  }

  const calculateTotalPlayers = (order: any): number => {
    let totalPlayers = 0;

    // Iterate through each planet
    order.status.planetStatus.forEach((planet: any) => {
      totalPlayers += planet.players;
    });

    return totalPlayers;
  };

  return (
    <div className="w-full bg-background">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 rounded-lg border p-4 lg:col-span-2">
          <p>
            <span className="font-bold text-primary">
              {order.major_order[0].setting.overrideBrief}
            </span>
          </p>
          {/*<p className="mt-4">{order.major_order[0].setting.taskDescription}</p>*/}
        </div>
        <div
          className={`grid ${
            order.major_order[0].setting.tasks.length <= 2
              ? "grid-cols-1"
              : order.major_order[0].setting.tasks.length <= 4
                ? "grid-cols-2"
                : "grid-cols-3"
          } gap-4`}
        >
          {order.major_order[0].setting.tasks.map(
            (task: Task, index: number) => {
              const planetNumber = task.values[2];
              const planet = status[planetNumber];

              let borderClassName = "";

              if (planet && planet.health / 10000 === 100) {
                borderClassName += "border border-primary";
              }

              return (
                <div
                  key={index}
                  className={`flex items-center justify-center rounded-lg bg-muted p-4 text-xl leading-none text-primary ${borderClassName}`}
                >
                  <div className="block">
                    {planet ? (
                      <>
                        <p id="title" role="progressbar">
                          {planet.name}
                        </p>
                        <Progress
                          value={planet.health / 10000}
                          className="mt-1 h-2 w-full bg-background"
                          role="progressbar"
                          aria-labelledby="title"
                        />
                      </>
                    ) : (
                      `Kill ${formatNumber(task.values[2])} Enemies`
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
        <div className="col-span-1 grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-center rounded-lg border p-4">
            <div className="block">
              <h3 className="text-xl font-semibold leading-none tracking-tight">
                {timeLeft}
              </h3>
              <p className="text-sm text-primary">Time Left</p>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-lg border p-4">
            <div className="block">
              <h3 className="text-xl font-semibold leading-none tracking-tight">
                {order.major_order[0].setting.reward.amount}
              </h3>
              <p className="text-sm text-primary">Medals</p>
            </div>
          </div>
          <div className="col-span-2 flex items-center justify-center rounded-lg border p-4">
            <div className="block">
              <h3 className="text-xl font-semibold leading-none tracking-tight">
                {formatNumber(calculateTotalPlayers(order))}
              </h3>
              <p className="text-sm text-primary">Players Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
