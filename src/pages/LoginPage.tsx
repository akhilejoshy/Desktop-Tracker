import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { LogIn } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { adminLogin } from "@/store/slices/loginSlice";
import { Eye, EyeOff } from "lucide-react";


import icon from '../../icon.png';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const resultAction = await dispatch(adminLogin({ email, password }));
      if (adminLogin.fulfilled.match(resultAction)) {
        const data = resultAction.payload;
        if (data.success) {
          navigate("/dashboard");
        } else {
          const backendError =
            typeof data.error === "string"
              ? data.error
              : data.response?.message || "Login failed";
          if (
            backendError.includes("Invalid Email or Password") ||
            backendError.includes("admin")
          ) {
            setError("Invalid Email or Password");
          } else {
            setError(backendError || "Login failed");
          }
          setError(backendError);
        }
      } else if (adminLogin.rejected.match(resultAction)) {
        const payloadError = resultAction.payload;
        const errorMessage =
          typeof payloadError === "string"
            ? payloadError
            : (payloadError as any)?.error || "Login failed. Please try again.";
        if (
          errorMessage.includes("Invalid Email or Password for admin")
        ) {
          setError("Invalid Email or Password");
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full  bg-background">
      <div className="w-full rounded-lg">
        <Card className="flex h-full flex-col shadow-none border-0  ">
          <div className="text-center px-4 pb-3 pt-5">
            <div className="flex justify-center ">
              <img
                src={icon}
                alt="CloudHouse Icon"
                className="h-15 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">CloudHouse Agent 2</CardTitle>
            <CardDescription>Sign in to start your session</CardDescription>
          </div>
          <form onSubmit={handleLogin} className="flex flex-1 flex-col">
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>

              {error && (
                <p className="text-red-500 text-sm text-center mt-2">
                  {error}
                </p>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </main>
  );
}
