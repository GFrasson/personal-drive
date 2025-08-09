"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        toast.success("Login realizado com sucesso");
        router.replace("/");
      } else {
        const data = await response.json().catch(() => {});
        toast.error(data?.error ?? "Falha no login");
      }
    } catch {
      toast.error("Erro de rede ao tentar logar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 border rounded-lg p-6 bg-background"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Acessar</h1>
          <p className="text-sm text-muted-foreground">
            Use as credenciais de administrador.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Usuário</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <Button className="w-full cursor-pointer" type="submit" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </main>
  );
}


