import { Suspense } from "react"
import { BuscaCliente } from "@/components/clientes/busca-cliente"
import { Loader2 } from "lucide-react"

export default function ClientesPage() {
  return (
    <main className="p-4 md:p-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Busca de Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Procure por clientes e visualize os seus detalhes completos.
          </p>
        </div>
        
        <Suspense 
          fallback={
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>A carregar parâmetros...</span>
            </div>
          }
        >
          <BuscaCliente />
        </Suspense>
      </div>
    </main>
  )
}
