"use client"

import { useState } from "react";
import axios from 'axios';
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definição do tipo Task com as propriedades da tabela
export type Task = {
  id: string;
  title: string;
  description: string;
  status: "pendente" | "em andamento" | "concluída";
  owner_id: string;
};

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Description
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      const [loading, setLoading] = useState(false);
      const [dialogOpen, setDialogOpen] = useState(false);
      const [title, setTitle] = useState(task.title)
      const [description, setDescription] = useState(task.description)
      const [status, setStatus] = useState(task.status === "pendente" ? "0" : task.status === "em andamento" ? "1" : "2")

      const handleDeleteTask = async () => {
        setLoading(true);
        try {
          const userIdString = localStorage.getItem('userId');
          if (!userIdString) {
            throw new Error('User ID not found');
          }

          const userId = parseInt(userIdString, 10);
          if (isNaN(userId)) {
            throw new Error('Invalid user ID');
          }

          const response = await axios.post(
            `http://127.0.0.1:5000/task/${task.id}/delete`,
            { user_id: userId },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.status === 200) {
            window.location.reload();
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error deleting task:", error.response?.data?.error || error.message);
            alert(`Error: ${error.response?.data?.error || error.message}`);
          }
        } finally {
          setLoading(false);
        }
      };

      const handleEditTask = async () => {
        setLoading(true);
        try {
          // Update task details
          const updateResponse = await axios.post(
            `http://127.0.0.1:5000/task/${task.id}/edit`,
            { title, description },
            { headers: { 'Content-Type': 'application/json' } }
          );
          if (updateResponse.status === 200) {
            // Update task status
            const statusResponse = await axios.post(
              `http://127.0.0.1:5000/task/${task.id}/update_status`,
              { status: parseInt(status, 10) }, // Converte o status para número
              { headers: { 'Content-Type': 'application/json' } }
            );
            if (statusResponse.status === 200) {
              // Successful update
              alert('Task updated successfully!');
              setDialogOpen(false);
              window.location.reload();
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error updating task:", error.response?.data?.error || error.message);
            alert(`Error: ${error.response?.data?.error || error.message}`);
          }
        } finally {
          setLoading(false);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(task.id)}
            >
              Copy task ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              Edit task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteTask}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete task"}
            </DropdownMenuItem>
          </DropdownMenuContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Task Details</DialogTitle>
                <DialogDescription>
                  Here you can edit the details of the task.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={
                        status === "0" ? "Pendente" :
                        status === "1" ? "Em andamento" :
                        "Concluída"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="0">Pendente</SelectItem>
                        <SelectItem value="1">Em andamento</SelectItem>
                        <SelectItem value="2">Concluída</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Close</Button>
                <Button type="button" className="w-32" onClick={handleEditTask}>Edit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenu>
      );
    },
  },
];
