import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { LoginForm } from "./pages/login";
import { RegisterUser } from "./pages/register";
import Tasks from "./pages/tasks"; // Importação padrão

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <RegisterUser />,
  },
  {
    path: "/tasks",
    element: <Tasks />,
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
