import * as React from "react";
import axios from "axios";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [tasks, setTasks] = React.useState<TData[]>(data);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string | undefined>(""); // State for selected status filter
  const [loading, setLoading] = React.useState(false);

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    withCredentials: true, // Enviar cookies com requisições
  });
  
  const handleCreateTask = async () => {
    setLoading(true);
    try {
      // Obtendo o userId do localStorage
      const userId = localStorage.getItem('userId');
  
      // Verificar se o userId está disponível
      if (!userId) {
        console.error("User ID is not available in localStorage");
        return;
      }
  
      // Convertendo userId para número (caso esteja armazenado como string)
      const ownerId = parseInt(userId, 10);
  
      const response = await axiosInstance.post("/task/new", {
        title: title,
        description: description,
        owner_id: ownerId
      });
  
      if (response.status === 201) {
        setTasks((prevTasks) => [...prevTasks, response.data]);
        setTitle(""); 
        setDescription(""); 
      }
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    if(value != "all"){
      table.getColumn("status")?.setFilterValue(value)
    }else{
      !table.getColumn("status")?.setFilterValue("")
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Filter titles..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm rounded-md"
          />
          <Select onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue  />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em andamento">Em andamento</SelectItem>
                  <SelectItem value="concluída">Concluída</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button className="rounded-2xl">New task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Task</DialogTitle>
              <DialogDescription>
                Fill in all the information to create a task.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  className="col-span-3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreateTask}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create a new Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
