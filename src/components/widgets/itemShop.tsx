import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API } from "@/components/widgets/util/getApiData";
import { types, passives } from "@/components/widgets/items/data/data";

export default async function ItemShop() {
  const shop = await API();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
      {shop.store_rotation.items.map((item: any, index: number) => (
        <Card
          key={index}
          className={`${index === 0 ? "row-span-2" : "row-auto"} ${
            index === 3 ? "md:col-start-3 md:row-span-2 md:row-start-1" : ""
          }`}
        >
          <CardHeader>
            <CardTitle>
              {item.name}
              <br />
              <Badge variant="outline" className="text-muted-foreground">
                {item.slot}
              </Badge>
              {(() => {
                const type = types.find((type) => type.value === item.type);
                if (!type) return null;
                return (
                  <Badge variant="outline">
                    <span className="text-center text-muted-foreground">
                      {type.label}
                    </span>
                  </Badge>
                );
              })()}
              {(() => {
                const passive = passives.find(
                  (passive) => passive.value === item.passive.name,
                );
                if (!passive) return null;
                return (
                  <Badge variant="outline">
                    <span className="text-center text-muted-foreground">
                      {passive.label}
                    </span>
                  </Badge>
                );
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img src="" alt="" className="rounded-lg" />
            <div className="grid gap-4">
              <div className="rounded-lg bg-muted p-4">{item.description}</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted p-4 leading-none">
                  {item.armor_rating}
                  <br />
                  <span className="text-sm leading-none text-muted-foreground">
                    Armor
                  </span>
                </div>
                <div className="rounded-lg bg-muted p-4 leading-none">
                  {item.speed}
                  <br />
                  <span className="text-sm leading-none text-muted-foreground">
                    Speed
                  </span>
                </div>
                <div className="rounded-lg bg-muted p-4 leading-none">
                  {item.stamina_regen}
                  <br />
                  <span className="text-sm leading-none text-muted-foreground">
                    Stamina Regeneration
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
