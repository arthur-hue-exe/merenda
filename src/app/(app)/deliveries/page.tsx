
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";
import type { Delivery } from "@/types";
import { DeliveryForm } from "@/components/deliveries/DeliveryForm"; // Will be created
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DeliveriesPage() {
  const { deliveries, isLoadingData } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // DeliveryToEdit and Delete logic would be similar to StockPage if needed.
  // For now, focusing on Add and View.
  const [viewingDelivery, setViewingDelivery] = useState<Delivery | null>(null);

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.items.some(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoadingData) {
    return <div className="flex h-full items-center justify-center"><p>Carregando entregas...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Input
          placeholder="Buscar por fornecedor ou item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Nova Entrega
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Nº de Itens</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{format(parseISO(delivery.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{delivery.supplier}</TableCell>
                  <TableCell className="text-right">{delivery.items.length}</TableCell>
                  <TableCell className="truncate max-w-xs">{delivery.notes || '-'}</TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => setViewingDelivery(delivery)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    {/* Placeholder for more actions if needed
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingDelivery(delivery)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    */}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhuma entrega encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeliveryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      {viewingDelivery && (
        <Dialog open={!!viewingDelivery} onOpenChange={() => setViewingDelivery(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Entrega</DialogTitle>
              <DialogDescription>
                Fornecedor: {viewingDelivery.supplier} | Data: {format(parseISO(viewingDelivery.date), 'dd/MM/yyyy')}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-4">
                <h4 className="font-semibold">Itens Entregues:</h4>
                {viewingDelivery.items.length > 0 ? (
                  <ul className="space-y-2">
                    {viewingDelivery.items.map((item, index) => (
                      <li key={index} className="p-2 border rounded-md bg-muted/50">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground">Quantidade: {item.quantity} {item.unit}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Nenhum item nesta entrega.</p>
                )}
                {viewingDelivery.notes && (
                  <div>
                    <h4 className="font-semibold mt-4">Observações:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingDelivery.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
