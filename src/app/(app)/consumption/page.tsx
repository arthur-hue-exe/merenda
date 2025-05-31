
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Eye } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";
import type { ConsumptionRecord } from "@/types";
import { ConsumptionForm } from "@/components/consumption/ConsumptionForm"; // Will be created
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function ConsumptionPage() {
  const { consumptionRecords, isLoadingData } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingRecord, setViewingRecord] = useState<ConsumptionRecord | null>(null);

  const filteredRecords = consumptionRecords.filter(record =>
    record.classOrStudent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(parseISO(record.date), 'dd/MM/yyyy').includes(searchTerm)
  );

  if (isLoadingData) {
    return <div className="flex h-full items-center justify-center"><p>Carregando registros de consumo...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Input
          placeholder="Buscar por turma/aluno ou data (dd/mm/aaaa)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Novo Consumo
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Turma/Aluno</TableHead>
              <TableHead className="text-right">Nº de Itens Consumidos</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(parseISO(record.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{record.classOrStudent}</TableCell>
                  <TableCell className="text-right">{record.items.length}</TableCell>
                  <TableCell className="truncate max-w-xs">{record.notes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewingRecord(record)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum registro de consumo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConsumptionForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      {viewingRecord && (
        <Dialog open={!!viewingRecord} onOpenChange={() => setViewingRecord(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Consumo</DialogTitle>
              <DialogDescription>
                Turma/Aluno: {viewingRecord.classOrStudent} | Data: {format(parseISO(viewingRecord.date), 'dd/MM/yyyy')}
              </DialogDescription>
            </DialogHeader>
             <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-4">
                <h4 className="font-semibold">Itens Consumidos:</h4>
                {viewingRecord.items.length > 0 ? (
                  <ul className="space-y-2">
                    {viewingRecord.items.map((item, index) => (
                      <li key={index} className="p-2 border rounded-md bg-muted/50">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground">Quantidade: {item.quantityConsumed} {item.unit}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Nenhum item neste registro.</p>
                )}
                {viewingRecord.notes && (
                  <div>
                    <h4 className="font-semibold mt-4">Observações:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingRecord.notes}</p>
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

