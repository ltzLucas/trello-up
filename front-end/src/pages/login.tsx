import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useState } from "react";

export const description =
  "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account.";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const navigate = useNavigate();  // Initialize useNavigate

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  withCredentials: true, // Enviar cookies com requisições
});

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    // Requisição de login
    const loginResponse = await axiosInstance.post("/user/login", {
      login: email,
      password: password,
    });

    if (loginResponse.status === 200) {
      setMessage("Login successful");
      setMessageType("success");

      // Obter o userId
      try {
        const userIdResponse = await axiosInstance.get(`/user/user_id`, {
          params: { email }
        });

        if (userIdResponse.status === 200 && userIdResponse.data.user_id) {
          // Salvar o userId no localStorage
          localStorage.setItem('userId', String(userIdResponse.data.user_id));

          // Navegar para a página de tarefas após 1 segundo
          setTimeout(() => {
            navigate("/tasks");
          }, 1000);
        } else {
          console.error("User ID not found in response");
        }
      } catch (error) {
        console.error("Failed to fetch user ID", error);
      }
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      setMessage("Invalid credentials");
      setMessageType("error");
    } else {
      setMessage("An error occurred during login");
      setMessageType("error");
    }
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            {message && (
              <p
                className={`mt-4 text-center text-sm ${
                  messageType === "success" ? "text-emerald-400" : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
