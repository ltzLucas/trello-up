import { Task, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Task[]> {
  // Fetch data from your API here.
  return [
    {
      id: "1",
      title: "Novo projeto",
      description: "descrição do projeto",
      status: "pendente",
      owner_id: "1"
    },
    {
      id: "2",
      title: "Novo projeto",
      description: "descrição do projeto",
      status: "pendente",
      owner_id: "1"
    },
    // Adicione mais dados conforme necessário
  ]
}

export default async function Page() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
