"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface ClienteResumo {
  id: number
  nome: string
  razaoSocial: string
  cnpj: string
  cidade: string
  uf: string
  contatos: any[]
}

interface ModalSelecaoClienteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientes: ClienteResumo[]
  onSelectCliente: (id: number) => void
}

export function ModalSelecaoCliente({
  open,
  onOpenChange,
  clientes,
  onSelectCliente,
}: ModalSelecaoClienteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[85vw] max-w-[85vw] sm:max-w-[85vw] h-[85vh] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Cliente</DialogTitle>
          <DialogDescription>
            Foram encontrados múltiplos resultados para a sua busca. Por favor,
            selecione o cliente pretendido.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-full border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Registro</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Cidade - UF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow
                    key={cliente.id}
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => onSelectCliente(cliente.id)}
                  >
                    <TableCell className="font-bold text-primary">{cliente.id}</TableCell>
                    <TableCell>{cliente.razaoSocial}</TableCell>
                    <TableCell>{cliente.cnpj || "N/A"}</TableCell>
                    <TableCell>{cliente.cidade} - {cliente.uf}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
