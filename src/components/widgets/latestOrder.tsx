import { omnediaAllInOneAPI } from "@/lib/fetchPlanetsData";
import { Progress } from "../ui/progress";

interface Task {
  // Define the properties of the 'task' object
  values: number[]; // Adjust this type based on the actual structure of 'values'
}

export default async function MajorOrder() {
  const order = await omnediaAllInOneAPI();

  const unixTimestamp = order.warSeason.assignment.expiresIn;
  const milliseconds = unixTimestamp * 1000; // UNIX timestamps are in seconds, so convert to milliseconds

  let timeLeft;
  if (milliseconds >= 24 * 60 * 60 * 1000) {
    // Check if the duration is over 24 hours
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000)); // Convert milliseconds to days
    timeLeft = `${days} days`;
  } else {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000)); // Convert milliseconds to hours
    timeLeft = `${hours} hours`;
  }

  return (
    <div className="w-full bg-background">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="col-span-1 rounded-lg border p-4 md:col-span-2">
          <p>
            <span className="font-bold text-primary">
              {order.warSeason.assignment.setting.overrideBrief}
            </span>
          </p>
          <p className="mt-4">
            {order.warSeason.assignment.setting.taskDescription}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 ">
          {order.warSeason.assignment.setting.tasks.map(
            (task: Task, index: number) => {
              // Extracting the planet number from task.values[2]
              const planetNumber = task.values[2];
              // Extracting the planet object based on the planet number
              const planet = order.warSeason.planets[planetNumber];

              return (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-lg bg-muted p-4 text-xl text-primary"
                >
                  {/* TODO: wenn liberation 100 ist -> border border-primary*/}
                  <div className="block">
                    <p>{planet.planet.name}</p>
                    <Progress
                      value={planet.liberation}
                      className="h-2 w-full bg-background"
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
        <div className="grid  grid-cols-2 gap-4">
          <div className="flex items-center justify-center rounded-lg border p-4">
            <div className="block">
              <h3 className=" text-xl font-semibold leading-none tracking-tight">
                {timeLeft}
              </h3>
              <p className="text-sm text-primary">Time Left</p>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-lg border p-4">
            <div className="block">
              <h3 className="text-xl font-semibold leading-none tracking-tight">
                {order.warSeason.assignment.setting.reward.amount}
              </h3>
              <p className="text-sm text-primary">Medals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
