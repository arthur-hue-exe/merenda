
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
import { useAppData } from "@/contexts/AppDataContext";
import { useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

const consumptionItemSchema = z.object({
  itemId: z.string().min(1, "Selecione um item."),
  itemName: z.string(), // Will be populated
  quantityConsumed: z.coerce.number().min(0.01, "Quantidade deve ser maior que zero."),
  unit: z.string(), // Will be populated
});

const formSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida." }),
  classOrStudent: z.string().min(2, "Turma/Aluno deve ter pelo menos 2 caracteres."),
  items: z.array(consumptionItemSchema).min(1, "Adicione pelo menos um item consumido."),
  notes: z.string().optional(),
});

type ConsumptionFormValues = z.infer<typeof formSchema>;

interface ConsumptionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsumptionForm({ isOpen, onOpenChange }: ConsumptionFormProps) {
  const { addConsumptionRecord, stockItems } = useAppData();

  const form = useForm<ConsumptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      classOrStudent: "",
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
        classOrStudent: "",
        items: [],
        notes: "",
      });
    }
  }, [isOpen, form]);

  const handleAddItem = () => {
    if (stockItems.length > 0) {
      const firstStockItem = stockItems[0];
      append({ 
        itemId: firstStockItem.id, 
        itemName: firstStockItem.name, 
        quantityConsumed: 1, 
        unit: firstStockItem.unit 
      });
    } else {
       append({ itemId: "", itemName: "", quantityConsumed: 1, unit: "" });
    }
  };

  const handleStockItemChange = (value: string, index: number) => {
    const selectedStockItem = stockItems.find(item => item.id === value);
    if (selectedStockItem) {
      form.setValue(`items.${index}.itemName`, selectedStockItem.name);
      form.setValue(`items.${index}.unit`, selectedStockItem.unit);
    }
  };

  function onSubmit(values: ConsumptionFormValues) {
     const processedItems = values.items.map(item => {
        const stockItemDetails = stockItems.find(si => si.id === item.itemId);
        return {
            ...item,
            itemName: stockItemDetails?.name || item.itemName,
            unit: stockItemDetails?.unit || item.unit,
        };
    });
    addConsumptionRecord({...values, items: processedItems});
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Novo Consumo</DialogTitle>
          <DialogDescription>
            Preencha as informações do consumo diário.
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
                    <FormLabel>Data do Consumo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classOrStudent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turma/Aluno</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Turma 3A, João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Itens Consumidos</FormLabel>
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
                              <SelectValue placeholder="Selecione um item" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stockItems.filter(si => si.quantity > 0).map(item => ( // Only show items with quantity > 0
                              <SelectItem key={item.id} value={item.id}>{item.name} (Disp: {item.quantity} {item.unit})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantityConsumed`}
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
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} disabled={stockItems.filter(si => si.quantity > 0).length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item Consumido
              </Button>
              {stockItems.filter(si => si.quantity > 0).length === 0 && <p className="text-xs text-muted-foreground">Nenhum item com quantidade positiva no estoque.</p>}
              <FormMessage>{form.formState.errors.items?.message || form.formState.errors.items?.root?.message}</FormMessage>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alguma observação sobre o consumo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Registrar Consumo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

