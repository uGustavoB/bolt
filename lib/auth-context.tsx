"use client"

import React, { createContext, useContext } from "react"

interface User {
  id: number;
  nome: string;
  nomeCompleto: string;
  email: string;
  setor: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    // Restaurar a sessão a partir do storage ao carregar o site
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Ignorar caso o JSON esteja quebrado
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Implementação real da chamada à API (Softcom)
    // O endpoint a usar: POST /v1/auth/login
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const response = await fetch(`${baseUrl}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // NOTA: A API da Softcom espera 'senha' e não 'password'
      body: JSON.stringify({ email, senha: password }),
    })

    if (!response.ok) {
      // Cria um objeto de erro customizado com o status HTTP para o catch no login-form lidar com a lógica
      const error: any = new Error("Erro na autenticação")
      error.status = response.status
      throw error
    }

    const data = await response.json()
    
    // Sucesso - Guarda os tokens (accessToken, refreshToken)
    // Em produção, deve-se gravar preferencialmente num cookie httpOnly ou numa storage segura.
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken)
    }
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken)
    }
    
    // Guardar os dados do user em estado e no localStorage
    if (data.user) {
      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))
    }
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider")
  }
  return context
}
