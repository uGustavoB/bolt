"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ModalSelecaoCliente, 
  ClienteResumo 
} from "@/components/clientes/modal-selecao-cliente"
import { 
  ModalDetalhesCliente, 
  ClienteDetalhes 
} from "@/components/clientes/modal-detalhes-cliente"

export function BuscaCliente() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q")

  const [searchTerm, setSearchTerm] = useState(q || "")
  const [isSearching, setIsSearching] = useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  // Estados dos Modais
  const [showSelecao, setShowSelecao] = useState(false)
  const [showDetalhes, setShowDetalhes] = useState(false)

  // Dados
  const [resultados, setResultados] = useState<ClienteResumo[]>([])
  const [clienteDetalhes, setClienteDetalhes] = useState<ClienteDetalhes | null>(null)

  const handleBuscar = useCallback(async (termo: string) => {
    if (!termo.trim()) return

    const token = localStorage.getItem("accessToken")
    if (!token) {
      // Guardar a intenção de redirecionamento
      const currentUrl = encodeURIComponent(`/dashboard/clientes?q=${termo}`)
      router.push(`/login?redirect=${currentUrl}`)
      return
    }

    setIsSearching(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const response = await fetch(`${baseUrl}/v1/busca-cliente?q=${termo}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          const currentUrl = encodeURIComponent(`/dashboard/clientes?q=${termo}`)
          router.push(`/login?redirect=${currentUrl}`)
          return
        }
        throw new Error("Erro ao buscar clientes")
      }

      const data: ClienteResumo[] = await response.json()

      if (data.length === 0) {
        toast.error("Nenhum cliente encontrado")
      } else if (data.length === 1) {
        // Apenas 1 resultado, vai direto para os detalhes
        fetchClienteDetalhes(data[0].id)
      } else {
        // Mais que 1 resultado, abre modal de seleção
        setResultados(data)
        setShowSelecao(true)
      }
    } catch (error) {
      toast.error("Ocorreu um erro na busca. Tente novamente.")
    } finally {
      setIsSearching(false)
    }
  }, [router])

  const fetchClienteDetalhes = async (id: number) => {
    const token = localStorage.getItem("accessToken")
    if (!token) return

    setShowSelecao(false) // Fecha o modal de seleção se estiver aberto
    setShowDetalhes(true) // Abre o modal de detalhes (em modo loading)
    setIsFetchingDetails(true)
    setClienteDetalhes(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const response = await fetch(`${baseUrl}/v1/clientes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Erro ao carregar detalhes")

      const data: ClienteDetalhes = await response.json()
      setClienteDetalhes(data)
    } catch (error) {
      toast.error("Falha ao carregar os detalhes do cliente")
      setShowDetalhes(false)
    } finally {
      setIsFetchingDetails(false)
    }
  }

  // Effect para lidar com a busca automática pela URL no mount/alteração de URL
  useEffect(() => {
    if (q) {
      setSearchTerm(q)
      handleBuscar(q)
    }
  }, [q, handleBuscar])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim() !== q) {
      router.push(`/dashboard/clientes?q=${encodeURIComponent(searchTerm)}`)
    } else {
      handleBuscar(searchTerm)
    }
  }

  return (
    <div className="w-full max-w-2xl bg-card rounded-lg border p-6 shadow-sm">
      <form onSubmit={onSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="Procure por nome, razão social, CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 text-base"
            disabled={isSearching}
          />
        </div>
        <Button type="submit" disabled={isSearching || !searchTerm.trim()} className="py-6 px-8">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Procurar"
          )}
        </Button>
      </form>

      {/* Modais */}
      <ModalSelecaoCliente 
        open={showSelecao} 
        onOpenChange={setShowSelecao} 
        clientes={resultados} 
        onSelectCliente={fetchClienteDetalhes}
      />
      
      <ModalDetalhesCliente 
        open={showDetalhes} 
        onOpenChange={setShowDetalhes} 
        isLoading={isFetchingDetails} 
        cliente={clienteDetalhes} 
      />
    </div>
  )
}
