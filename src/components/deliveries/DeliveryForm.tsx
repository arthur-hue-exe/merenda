
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { DeliveryItem } from "@/types";
import { useAppData } from "@/contexts/AppDataContext";
import { useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

const deliveryItemSchema = z.object({
  itemId: z.string().min(1, "Selecione um item."),
  itemName: z.string(), // Will be populated based on itemId
  quantity: z.coerce.number().min(0.01, "Quantidade deve ser maior que zero."),
  unit: z.string(), // Will be populated based on itemId
});

const formSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida." }),
  supplier: z.string().min(2, "Fornecedor deve ter pelo menos 2 caracteres."),
  items: z.array(deliveryItemSchema).min(1, "Adicione pelo menos um item à entrega."),
  notes: z.string().optional(),
});

type DeliveryFormValues = z.infer<typeof formSchema>;

interface DeliveryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // deliveryToEdit?: Delivery; // For future edit functionality
}

export function DeliveryForm({ isOpen, onOpenChange }: DeliveryFormProps) {
  const { addDelivery, stockItems } = useAppData();

  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      supplier: "",
      items: [],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        supplier: "",
        items: [],
        notes: "",
      });
    }
  }, [isOpen, form]);

  const handleAddItem = () => {
    if (stockItems.length > 0) {
      const firstStockItem = stockItems[0];
      append({ itemId: firstStockItem.id, itemName: firstStockItem.name, quantity: 1, unit: firstStockItem.unit });
    } else {
       append({ itemId: "", itemName: "", quantity: 1, unit: "" }); // Fallback if no stock items
    }
  };

  const handleStockItemChange = (value: string, index: number) => {
    const selectedStockItem = stockItems.find(item => item.id === value);
    if (selectedStockItem) {
      form.setValue(`items.${index}.itemName`, selectedStockItem.name);
      form.setValue(`items.${index}.unit`, selectedStockItem.unit);
      // Optionally, clear quantity or set a default
      // form.setValue(`items.${index}.quantity`, 1); 
    }
  };


  function onSubmit(values: DeliveryFormValues) {
    // Map items to ensure itemName and unit are correctly set if user didn't interact with Select after initial add
    const processedItems = values.items.map(item => {
        const stockItemDetails = stockItems.find(si => si.id === item.itemId);
        return {
            ...item,
            itemName: stockItemDetails?.name || item.itemName, // Keep original if somehow not found
            unit: stockItemDetails?.unit || item.unit,
        };
    });

    addDelivery({...values, items: processedItems});
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Nova Entrega</DialogTitle>
          <DialogDescription>
            Preencha as informações da entrega recebida.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Entrega</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do fornecedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Itens Entregues</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md bg-muted/30">
                  <FormField
                    control={form.control}
                    name={`items.${index}.itemId`}
                    render={({ field: selectField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Item</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            selectField.onChange(value);
                            handleStockItemChange(value, index);
                          }} 
                          defaultValue={selectField.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um item do estoque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stockItems.map(item => (
                              <SelectItem key={item.id} value={item.id}>{item.name} ({item.unit})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel className="text-xs">Qtd.</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Qtd" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Unit is now derived from selected stock item */}
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} disabled={stockItems.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
              </Button>
              {stockItems.length === 0 && <p className="text-xs text-muted-foreground">Nenhum item cadastrado no estoque. Cadastre itens primeiro.</p>}
              <FormMessage>{form.formState.errors.items?.message || form.formState.errors.items?.root?.message}</FormMessage>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alguma observação sobre a entrega..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Salvar Entrega</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
