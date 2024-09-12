import React, { useEffect, useState } from "react";
import axios from "axios";
import { Task, columns } from "../tasks/columns";
import { DataTable } from "../tasks/data-table";
import { useNavigate } from 'react-router-dom';

const fetchData = async (): Promise<Task[]> => {
  try {
    const response = await axios.get("http://127.0.0.1:5000/task/");
    return response.data;  // Assume the response data is in the format: [{ id, title, description, status, owner_id }]
  } catch (error) {
    console.error("Failed to fetch data", error);
    return [];  // Return an empty array in case of an error
  }
};

const Tasks: React.FC = () => {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpar o localStorage
    localStorage.removeItem('userId');
    // Redirecionar para a tela '/'
    navigate('/');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">Here's a list of your tasks for this month!</p>
        </div>
        <div className="flex items-center space-x-2">
        <button
      className="inline-flex items-center justify-center text-sm font-medium transition-colors"
      onClick={handleLogout}
    >
      <span className="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9">
        <img className="aspect-square h-full w-full" alt="@shadcn" src="./03.png" />
      </span>
    </button>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Tasks;
