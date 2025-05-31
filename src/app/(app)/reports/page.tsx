
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, BarChartBig, Loader2 } from "lucide-react"; // BarChartBig para IA
import { useAppData } from "@/contexts/AppDataContext";
import { toast } from "@/hooks/use-toast";
import { getSpendingReport } from "./actions"; // Server Action para relatório de IA
import ReactMarkdown from 'react-markdown'; // Para renderizar markdown

export default function ReportsPage() {
  const { stockItems, consumptionRecords, isLoadingData: isLoadingContextData } = useAppData(); // deliveries removido
  const [reportType, setReportType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [isGeneratingIAReport, setIsGeneratingIAReport] = useState(false);
  const [iaReportContent, setIaReportContent] = useState<string | null>(null);
  const [iaReportStartDate, setIaReportStartDate] = useState<string>("");
  const [iaReportEndDate, setIaReportEndDate] = useState<string>("");

  const handleGenerateSimulatedReport = () => {
    if (!reportType) {
      toast({ title: "Erro", description: "Selecione um tipo de relatório para simulação.", variant: "destructive" });
      return;
    }
    if ((startDate && !endDate) || (!startDate && endDate)) {
        toast({ title: "Erro", description: "Para simulação, selecione ambas as datas (início e fim) ou nenhuma.", variant: "destructive" });
        return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        toast({ title: "Erro", description: "Data de início não pode ser posterior à data de fim na simulação.", variant: "destructive" });
        return;
    }

    toast({ title: "Relatório Gerado (Simulação)", description: `Simulação da geração do relatório de ${reportType}. A funcionalidade de PDF real requer 'jsPDF'.` });
    console.log("Gerar relatório simulado:", { reportType, startDate, endDate, stockItems, consumptionRecords });
  };

  const handleGenerateIAReport = async () => {
    if ((iaReportStartDate && !iaReportEndDate) || (!iaReportStartDate && iaReportEndDate)) {
        toast({ title: "Datas Inválidas", description: "Para relatório IA, forneça ambas as datas de período ou nenhuma.", variant: "destructive" });
        return;
    }
    if (iaReportStartDate && iaReportEndDate && new Date(iaReportStartDate) > new Date(iaReportEndDate)) {
        toast({ title: "Datas Inválidas", description: "Data de início não pode ser posterior à data de fim para relatório IA.", variant: "destructive" });
        return;
    }

    setIsGeneratingIAReport(true);
    setIaReportContent(null);

    const result = await getSpendingReport(
      consumptionRecords, 
      stockItems, 
      iaReportStartDate || undefined, 
      iaReportEndDate || undefined
    );

    if ("error" in result) {
      toast({ title: "Erro no Relatório IA", description: result.error, variant: "destructive" });
    } else if (result.reportText) {
      setIaReportContent(result.reportText);
      toast({ title: "Relatório IA Gerado", description: "O relatório de análise de gastos foi carregado." });
    } else {
      toast({ title: "Relatório IA Incompleto", description: "Não foi possível gerar o relatório de gastos.", variant: "destructive" });
    }
    setIsGeneratingIAReport(false);
  };
  
  if (isLoadingContextData) {
    return <div className="flex h-full items-center justify-center"><p>Carregando dados para relatórios...</p></div>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BarChartBig className="h-7 w-7 text-accent" />
            Análise de Gastos com IA
          </CardTitle>
          <CardDescription>
            Utilize inteligência artificial para analisar os gastos com merenda e obter um relatório detalhado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iaStartDate">Data de Início do Período (Opcional)</Label>
              <Input 
                id="iaStartDate" 
                type="date" 
                value={iaReportStartDate}
                onChange={(e) => setIaReportStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iaEndDate">Data de Fim do Período (Opcional)</Label>
              <Input 
                id="iaEndDate" 
                type="date"
                value={iaReportEndDate}
                onChange={(e) => setIaReportEndDate(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Deixe as datas em branco para analisar todos os dados de consumo disponíveis.</p>
           <Button onClick={handleGenerateIAReport} disabled={isGeneratingIAReport} className="w-full sm:w-auto text-base py-3">
            {isGeneratingIAReport ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Relatório IA...
              </>
            ) : (
              "Gerar Análise de Gastos com IA"
            )}
          </Button>
        </CardContent>
        {iaReportContent && (
          <CardFooter className="mt-4 border-t pt-6">
            <div className="space-y-2 w-full prose prose-sm max-w-none dark:prose-invert">
              <h3 className="text-lg font-semibold mb-2">Relatório de Análise de Gastos:</h3>
              <ReactMarkdown className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                {iaReportContent}
              </ReactMarkdown>
            </div>
          </CardFooter>
        )}
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            Relatórios de Dados (Simulação de PDF)
          </CardTitle>
          <CardDescription>
            Gere relatórios de dados brutos sobre estoque e consumo. A geração de PDF real não está implementada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reportType">Tipo de Relatório (Simulação)</Label>
            <Select onValueChange={setReportType} value={reportType}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Estoque Atual</SelectItem>
                {/* <SelectItem value="deliveries">Histórico de Entregas</SelectItem> // Removido */}
                <SelectItem value="consumption">Histórico de Consumo</SelectItem>
                <SelectItem value="full_data">Dados Completos (Estoque, Consumo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início (Simulação - Opcional)</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim (Simulação - Opcional)</Label>
              <Input 
                id="endDate" 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
           <p className="text-xs text-muted-foreground">Deixe as datas em branco para simular um relatório com todos os dados.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateSimulatedReport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Gerar Relatório (Simulação)
          </Button>
        </CardFooter>
      </Card>
      
    </div>
  );
}
