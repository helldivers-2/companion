import { stratagemsAPI } from "../util/getApiData";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function AllStratagemsTable() {
  const gems = await stratagemsAPI();

  const gemsTypes = gems.data.map(
    ({
      id,
      codename,
      name,
      uses,
      cooldown,
      activation,
      imageUrl,
      groupId,
    }: {
      id: number;
      codename: string;
      name: string;
      uses: string;
      cooldown: number;
      activation: number;
      imageUrl: string;
      groupId: number;
    }) => ({
      id,
      codename,
      name,
      uses,
      cooldown,
      activation,
      imageUrl,
      groupId,
    }),
  );

  return <DataTable data={gemsTypes} columns={columns} />;
}
