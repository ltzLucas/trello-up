import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";  // Import useNavigate

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

export function RegisterUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();  // Initialize useNavigate

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:5000/user/register", {
        login: email,
        password: password,
      });

      if (response.status === 201) {
        setMessage("User registered successfully");
        // Redirect after 1 second
        setTimeout(() => {
          navigate("/");  // Redirect to the login page or home page
        }, 1000);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setMessage("User already exists");
      } else {
        setMessage("An error occurred during registration");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            </div>
            {message && <p className="mt-4 text-center text-sm text-emerald-400">{message}</p>}
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/" className="underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
