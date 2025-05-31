
"use client";
import { useState } from "react";
import { useAppData } from "@/contexts/AppDataContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";
import { getDemandAdjustmentSuggestions } from "./actions"; // Server Action
import { toast } from "@/hooks/use-toast";

export default function ForecastingPage() {
  const { consumptionRecords, deliveries, studentCount, setStudentCount: setGlobalStudentCount } = useAppData();
  const [localStudentCount, setLocalStudentCount] = useState<number | string>(studentCount);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    const numStudents = Number(localStudentCount);
    if (isNaN(numStudents) || numStudents <= 0) {
      toast({ title: "Entrada Inválida", description: "Por favor, insira um número válido de alunos.", variant: "destructive" });
      return;
    }
    // Update global student count if it's different
    if (numStudents !== studentCount) {
        setGlobalStudentCount(numStudents);
    }

    setIsLoading(true);
    setSuggestions(null);

    // Prepare data for AI - ensure it's stringified JSON as per flow input
    const consumptionHistoryStr = JSON.stringify(consumptionRecords.map(c => ({ date: c.date, items: c.items.map(i => ({ name: i.itemName, quantity: i.quantityConsumed, unit: i.unit})), notes: c.notes })));
    const deliveryHistoryStr = JSON.stringify(deliveries.map(d => ({ date: d.date, supplier: d.supplier, items: d.items.map(i => ({ name: i.itemName, quantity: i.quantity, unit: i.unit})), notes: d.notes })));
    
    const result = await getDemandAdjustmentSuggestions({
      consumptionHistory: consumptionHistoryStr,
      deliveryHistory: deliveryHistoryStr,
      studentCount: numStudents,
    });

    if ("error" in result) {
      toast({ title: "Erro na Previsão", description: result.error, variant: "destructive" });
    } else if (result.suggestedAdjustments) {
      setSuggestions(result.suggestedAdjustments);
      toast({ title: "Sugestões Geradas", description: "As sugestões de ajuste de demanda foram carregadas." });
    } else {
      toast({ title: "Previsão Incompleta", description: "Não foi possível gerar sugestões.", variant: "destructive" });
    }
    setIsLoading(false);
  };
  
  // Sync localStudentCount with global studentCount from context when page loads or global changes
  useState(() => {
    setLocalStudentCount(studentCount);
  }, [studentCount]);


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-7 w-7 text-accent" />
            Previsão de Demanda com IA
          </CardTitle>
          <CardDescription>
            Utilize inteligência artificial para analisar o histórico de consumo e entregas,
            e receba sugestões para ajustar a previsão de demanda de merenda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="studentCount" className="text-base">Número Atual de Alunos</Label>
            <Input
              id="studentCount"
              type="number"
              value={localStudentCount}
              onChange={(e) => setLocalStudentCount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 150"
              className="mt-1 text-base"
            />
             <p className="text-xs text-muted-foreground mt-1">Este valor será usado para a previsão e atualizado globalmente.</p>
          </div>
          <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full sm:w-auto text-base py-3">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando Dados...
              </>
            ) : (
              "Obter Sugestões da IA"
            )}
          </Button>
        </CardContent>
        {suggestions && (
          <CardFooter className="mt-4 border-t pt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Sugestões da IA:</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-muted p-4 rounded-md">
                {suggestions}
              </p>
            </div>
          </CardFooter>
        )}
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Dados Utilizados para Previsão</CardTitle>
          <CardDescription>
            A IA utiliza os seguintes dados para gerar as sugestões. Certifique-se que estão atualizados.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold">Histórico de Consumo</h4>
            <p className="text-sm text-muted-foreground">{consumptionRecords.length} registros de consumo.</p>
            <p className="text-xs text-muted-foreground">Ex: Quantidades consumidas por dia/turma.</p>
          </div>
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold">Histórico de Entregas</h4>
            <p className="text-sm text-muted-foreground">{deliveries.length} registros de entregas.</p>
            <p className="text-xs text-muted-foreground">Ex: Itens e quantidades recebidas dos fornecedores.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
