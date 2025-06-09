import Container from "@/components/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import MajorOrder from "@/components/widgets/root/major-order";
import Map from "@/components/widgets/root/map";
import CurrentTargets from "@/components/widgets/root/current-targets";
import Comments from "@/components/comments";

export default function Home() {
  return (
    <>
      <Container title="Galaxy Status">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>latest Major Order</CardTitle>
            </CardHeader>
            <CardContent>
              <MajorOrder />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Map</CardTitle>
            </CardHeader>
            <CardContent>
              <Map />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <CurrentTargets />
            </CardContent>
          </Card>
        </div>
      </Container>

      <Comments keyword="Status" reactions="0" />
    </>
  );
}
