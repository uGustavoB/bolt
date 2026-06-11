"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Assume a existência deste hook e que expõe a função login
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!email || !password) return

    setIsLoading(true)

    try {
      await login(email, password)
      toast.success("Início de sessão bem-sucedido!")
      const redirectUrl = searchParams.get("redirect")
      router.push(redirectUrl || "/sucesso")
    } catch (error: any) {
      // O bloco catch está preparado para lidar com respostas de erro (ex: axios, fetch)
      const status = error?.response?.status || error?.status

      if (status === 401) {
        toast.error("Credenciais inválidas. Por favor, verifique o seu e-mail e senha.")
      } else if (status === 429) {
        toast.error("Muitas tentativas de login. Aguarde um momento e tente novamente.")
      } else {
        toast.error("Ocorreu um erro ao tentar iniciar sessão.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Entrar
        </CardTitle>
        <CardDescription className="text-base">
          Insira as suas credenciais para aceder à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          <div className="left text-[12px] text-muted-foreground">Dica: Mesmas credenciais de acesso ao HelpTools.</div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
