"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Hash,
  Briefcase,
  CreditCard,
  Building,
  Copy,
  AlertTriangle,
  FileText,
  MonitorPlay,
  Calendar,
  MoreVertical,
  BadgeDollarSign,
} from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModalPendenciasCliente, Pendencia } from "./modal-pendencias-cliente"

export interface ClienteDetalhes {
  id: number
  nome: string
  razaoSocial: string
  cpf: string
  cnpj: string
  cidade: string
  uf: string
  cep: string
  bairro: string
  endereco: string
  foneResidencial: string
  foneComercial: string
  email: string
  empresa: string
  dataCadastro: string
  desativado: boolean
  responsavel: string
  inscricaoEstadual: string
  programa: string
  atividade: string
  tipoPagamento: string
  regimeTributario: string
}

interface ModalDetalhesClienteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  cliente: ClienteDetalhes | null
}

export function ModalDetalhesCliente({
  open,
  onOpenChange,
  isLoading,
  cliente,
}: ModalDetalhesClienteProps) {
  const [isCheckingPendencias, setIsCheckingPendencias] = useState(false);
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [isPendenciasModalOpen, setIsPendenciasModalOpen] = useState(false);

  const handleVerificarPendencias = async () => {
    if (!cliente || !cliente.cnpj) return;
    
    setIsCheckingPendencias(true);
    const toastId = toast.loading("Buscando pendências...");
    
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("softcom_token") || localStorage.getItem("token") || "";
      const cleanCnpj = cliente.cnpj.replace(/\D/g, "");
      
      const response = await fetch(`https://api.softcom.cloud/v1/pagamentos/pix?cnpj=${cleanCnpj}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        toast.dismiss(toastId);
        toast.info("Nenhum pagamento pendente encontrado para este cliente.");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro na requisição");
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        toast.dismiss(toastId);
        toast.info("Nenhum pagamento pendente encontrado para este cliente.");
        return;
      }

      setPendencias(data);
      toast.dismiss(toastId);
      setIsPendenciasModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Erro ao buscar pendências. Tente novamente mais tarde.");
    } finally {
      setIsCheckingPendencias(false);
    }
  }

  const formatDocumento = (doc: string) => {
    if (!doc) return "";
    const cleaned = doc.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    if (cleaned.length === 14) {
      return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }
    return doc;
  }

  const formatData = (dataStr: string) => {
    if (!dataStr) return "";
    const date = new Date(dataStr);
    if (isNaN(date.getTime())) return dataStr;
    return date.toLocaleDateString("pt-BR");
  }

  const handleCopy = (text: string, label: string) => {
    const unmaskedText = text.replace(/[.\-\/ ]/g, "");
    navigator.clipboard.writeText(unmaskedText);
    toast.success(`${label} copiado!`);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "flex h-[85vh] max-h-[85vh] w-[85vw] max-w-[85vw] flex-col overflow-hidden p-0 transition-colors sm:max-w-[85vw]",
            cliente?.desativado && "bg-red-50/50 dark:bg-red-950/20"
          )}
        >
          <ScrollArea className="h-full w-full">
            <div className="h-full p-6">
              <DialogHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                      <span>Detalhes do Cliente</span>
                      {cliente && (
                        <Badge
                          variant={
                            cliente.desativado ? "destructive" : "default"
                          }
                          className={
                            !cliente.desativado
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }
                        >
                          {cliente.desativado ? "Desativado" : "Ativo"}
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      Informação detalhada sobre o registo selecionado.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Lado Esquerdo: Detalhes do Cliente */}
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : !cliente ? (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                      Nenhum cliente selecionado
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cliente.desativado && (
                        <div className="flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
                          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                          <p className="text-sm font-medium">
                            Este cliente encontra-se desativado.
                          </p>
                        </div>
                      )}
                      {/* Header do Cliente */}
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="mb-1 text-xl font-bold text-primary">
                            {cliente.razaoSocial}
                          </h3>
                          {cliente && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="rounded-md p-2 transition-colors hover:bg-muted disabled:opacity-50"
                                  disabled={
                                    isCheckingPendencias || !cliente.cnpj
                                  }
                                  title={
                                    !cliente.cnpj
                                      ? "Cliente sem CNPJ"
                                      : "Opções"
                                  }
                                >
                                  <MoreVertical className="h-5 w-5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-full"
                              >
                                <DropdownMenuItem
                                  onClick={handleVerificarPendencias}
                                  disabled={
                                    !cliente.cnpj || isCheckingPendencias
                                  }
                                  className="cursor-pointer"
                                >
                                  <BadgeDollarSign className="mr-2 h-4 w-4" />
                                  Verificar pendências
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {cliente.nome && (
                          <p className="mb-2 text-sm font-medium text-muted-foreground">
                            Nome Fantasia: {cliente.nome}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 font-medium text-foreground">
                            <Hash className="h-4 w-4" /> Registro: {cliente.id}
                          </span>
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span className="font-medium">
                              {cliente.cnpj
                                ? formatDocumento(cliente.cnpj)
                                : cliente.cpf
                                  ? formatDocumento(cliente.cpf)
                                  : "Sem Documento"}
                            </span>
                            {(cliente.cnpj || cliente.cpf) && (
                              <button
                                onClick={() =>
                                  handleCopy(
                                    cliente.cnpj || cliente.cpf,
                                    "Documento"
                                  )
                                }
                                className="rounded-md p-1 transition-colors hover:bg-muted"
                                title="Copiar Documento"
                              >
                                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="block text-xs text-muted-foreground">
                              IE:
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                {cliente.inscricaoEstadual || "Isento/N/A"}
                              </span>
                              {cliente.inscricaoEstadual && (
                                <button
                                  onClick={() =>
                                    handleCopy(
                                      cliente.inscricaoEstadual,
                                      "Inscrição Estadual"
                                    )
                                  }
                                  className="rounded-md p-1 transition-colors hover:bg-muted"
                                  title="Copiar IE"
                                >
                                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Secção Localização */}
                      <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                          <MapPin className="h-4 w-4" /> Localização
                        </h4>
                        <p className="text-sm font-medium">
                          {cliente.cidade} - {cliente.uf}
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {cliente.endereco}
                          <br />
                          {cliente.bairro}, CEP: {cliente.cep}
                        </p>
                      </div>

                      {/* Secção Contacto */}
                      <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                          <Phone className="h-4 w-4" /> Contacto
                        </h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="flex items-start gap-2">
                            <Mail className="mt-0.5 h-4 w-4 text-primary" />
                            <div className="text-sm">
                              <p className="font-medium">E-mail</p>
                              <p className="break-all text-muted-foreground">
                                {cliente.email || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="mt-0.5 h-4 w-4 text-primary" />
                            <div className="text-sm">
                              <p className="font-medium">Telefones</p>
                              <p className="text-muted-foreground">
                                {cliente.foneComercial ||
                                  cliente.foneResidencial ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Secção Administrativa */}
                      <div className="space-y-3 rounded-lg border bg-card/50 p-4 shadow-sm">
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                          <Briefcase className="h-4 w-4" /> Administrativo
                        </h4>
                        <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2">
                          <div className="flex gap-2 text-sm">
                            <User className="h-4 w-4 text-primary" />
                            <div>
                              <span className="block text-xs text-muted-foreground">
                                Responsável
                              </span>
                              <span className="font-medium">
                                {cliente.responsavel || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <CreditCard className="h-4 w-4 text-primary" />
                            <div>
                              <span className="block text-xs text-muted-foreground">
                                Pagamento
                              </span>
                              <span className="font-medium">
                                {cliente.tipoPagamento || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-primary" />
                            <div>
                              <span className="block text-xs text-muted-foreground">
                                Atividade
                              </span>
                              <span
                                className="line-clamp-1 font-medium"
                                title={cliente.atividade}
                              >
                                {cliente.atividade || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <MonitorPlay className="h-4 w-4 text-primary" />
                            <div>
                              <span className="block text-xs text-muted-foreground">
                                Programa
                              </span>
                              <span className="font-medium">
                                {cliente.programa || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                              <span className="block text-xs text-muted-foreground">
                                Data de Cadastro
                              </span>
                              <span className="font-medium">
                                {formatData(cliente.dataCadastro) || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lado Direito: Placeholder para futuras funcionalidades */}
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50 p-8 text-center dark:bg-slate-900">
                  <div className="mb-4 rounded-full bg-slate-200 p-4 dark:bg-slate-800">
                    <Building2 className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">
                    Área reservada para funcionalidades futuras
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    Este espaço está planeado para apresentar gráficos,
                    histórico de transações ou ficheiros associados a este
                    cliente.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <ModalPendenciasCliente
        open={isPendenciasModalOpen}
        onOpenChange={setIsPendenciasModalOpen}
        pendencias={pendencias}
      />
    </>
  )
}
