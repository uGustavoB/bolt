"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, AlertCircle, Clock } from "lucide-react"
import { toast } from "sonner"

export interface Pendencia {
  id: number
  clienteId: number
  nomeEmpresa: string
  cnpj: string
  vencimento: string
  valorParcela: number
  pixCopiaCola?: string
  telefoneFinanceiro?: string
  situacao: "vencido" | "a_vencer"
  diasParaVencimento: number
  boleto_url?: string
}

interface ModalPendenciasClienteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendencias: Pendencia[]
}

export function ModalPendenciasCliente({
  open,
  onOpenChange,
  pendencias,
}: ModalPendenciasClienteProps) {
  const formatData = (dataStr: string) => {
    if (!dataStr) return ""
    const date = new Date(dataStr)
    if (isNaN(date.getTime())) return dataStr
    // Force UTC so it doesn't shift days if time is 00:00:00Z
    return date.toLocaleDateString("pt-BR", { timeZone: "UTC" })
  }

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  const handleCopyPix = (pix: string) => {
    navigator.clipboard.writeText(pix)
    toast.success("Chave PIX copiada para a área de transferência!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[40vw] max-w-[85vw] sm:max-w-[85vw] flex flex-col p-0 overflow-hidden max-h-[85vh]">
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                Pendências Financeiras
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {pendencias.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  Nenhuma pendência encontrada.
                </div>
              ) : (
                pendencias.map((pendencia) => (
                  <Card key={pendencia.id} className="p-4 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              pendencia.situacao === "vencido"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              pendencia.situacao === "a_vencer"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-100/80 dark:bg-amber-900 dark:text-amber-300"
                                : ""
                            }
                          >
                            {pendencia.situacao === "vencido"
                              ? "Vencido"
                              : "A Vencer"}
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {pendencia.situacao === "vencido"
                              ? `Venceu há ${pendencia.diasParaVencimento} dias`
                              : `Vence em ${pendencia.diasParaVencimento} dias`}
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg">
                          {formatCurrency(pendencia.valorParcela)}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Vencimento:{" "}
                          <span className="font-medium text-foreground">
                            {formatData(pendencia.vencimento)}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                        {pendencia.boleto_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            asChild
                          >
                            <a
                              href={pendencia.boleto_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Visualizar Boleto
                            </a>
                          </Button>
                        )}
                        {pendencia.pixCopiaCola && (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleCopyPix(pendencia.pixCopiaCola!)}
                          >
                            <Copy className="w-4 h-4" />
                            Copiar PIX
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
