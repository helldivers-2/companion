import { API } from "@/components/widgets/util/getApiData";
import { statusAPI } from "@/components/widgets/util/getApiData";
import { Progress } from "../ui/progress";

interface Task {
  // Define the properties of the 'task' object
  values: number[]; // Adjust this type based on the actual structure of 'values'
}

export default async function majorOrder() {
  const order = await API();
  const status = await statusAPI();

  const unixTimestamp = order.majorOrder[0].expiresIn;
  const milliseconds = unixTimestamp * 1000; // UNIX timestamps are in seconds, so convert to milliseconds

  let timeLeft;
  if (milliseconds >= 24 * 60 * 60 * 1000) {
    // Check if the duration is over 24 hours
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000)); // Convert milliseconds to days
    if (days <= 1) {
      timeLeft = `1 day`;
    } else {
      timeLeft = `${days} days`;
    }
  } else {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000)); // Convert milliseconds to hours
    if (hours <= 1) {
      timeLeft = `less than 1 hour`;
    } else {
      timeLeft = `${hours} hours`;
    }
  }

  return (
    <div className="w-full bg-background">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="col-span-1 rounded-lg border p-4 md:col-span-2">
          <p>
            <span className="font-bold text-primary">
              {order.majorOrder[0].setting.overrideBrief}
            </span>
          </p>
          <p className="mt-4">{order.majorOrder[0].setting.taskDescription}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 ">
          {order.majorOrder[0].setting.tasks.map(
            (task: Task, index: number) => {
              const planetNumber = task.values[2];
              const planet = status.planet_status[planetNumber];

              let borderClassName = "";

              if (planet.liberation === 100) {
                borderClassName += "border border-primary";
              }

              return (
                <div
                  key={index}
                  className={`flex items-center justify-center rounded-lg bg-muted p-4 text-xl leading-none text-primary ${borderClassName}`}
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
              <h3 className="text-xl font-semibold leading-none tracking-tight">
                {timeLeft}
              </h3>
              <p className="text-sm text-primary">Time Left</p>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-lg border p-4">
            <div className="block">
              <h3 className="text-xl font-semibold leading-none tracking-tight">
                {order.majorOrder[0].setting.reward.amount}
              </h3>
              <p className="text-sm text-primary">Medals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
