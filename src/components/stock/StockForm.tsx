
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { StockItem } from "@/types";
import { useAppData } from "@/contexts/AppDataContext";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  quantity: z.coerce.number().min(0, { message: "Quantidade não pode ser negativa." }),
  unit: z.string().min(1, { message: "Unidade é obrigatória." }),
  expiryDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data de validade inválida." }),
  supplier: z.string().min(2, { message: "Fornecedor deve ter pelo menos 2 caracteres." }),
  cost: z.coerce.number().min(0, { message: "Custo não pode ser negativo."}).optional(),
});

type StockFormValues = z.infer<typeof formSchema>;

interface StockFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: StockItem;
}

export function StockForm({ isOpen, onOpenChange, itemToEdit }: StockFormProps) {
  const { addStockItem, updateStockItem } = useAppData();

  const form = useForm<StockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "",
      expiryDate: new Date().toISOString().split('T')[0],
      supplier: "",
      cost: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        form.reset({
            ...itemToEdit,
            cost: itemToEdit.cost || 0, // Garante que cost seja um número
        });
      } else {
        form.reset({
          name: "",
          quantity: 0,
          unit: "",
          expiryDate: new Date().toISOString().split('T')[0],
          supplier: "",
          cost: 0,
        });
      }
    }
  }, [itemToEdit, form, isOpen]);


  function onSubmit(values: StockFormValues) {
    if (itemToEdit) {
      updateStockItem({ ...itemToEdit, ...values });
    } else {
      addStockItem(values);
    }
    onOpenChange(false);
    // form.reset(); // Reset é tratado no useEffect
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? "Editar Item" : "Adicionar Novo Item ao Estoque"}</DialogTitle>
          <DialogDescription>
            {itemToEdit ? "Atualize os detalhes do item." : "Preencha as informações do novo item."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Arroz Agulhinha Tipo 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="Ex: 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: kg, L, un" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Data de Validade</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Custo Unitário (R$)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 2.50" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Distribuidora Alimentos XYZ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">{itemToEdit ? "Salvar Alterações" : "Adicionar Item"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
