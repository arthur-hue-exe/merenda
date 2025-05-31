'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChefHat, Loader2, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { GenerateRecipeInputSchema, type GenerateRecipeInput, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';
import { getAiRecipe } from './actions';

export default function RecipesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GenerateRecipeOutput | null>(null);

  const form = useForm<GenerateRecipeInput>({
    resolver: zodResolver(GenerateRecipeInputSchema),
    defaultValues: {
      mainIngredients: '',
      dietaryRestrictions: '',
      numberOfStudents: 50,
      mealType: 'lunch',
    },
  });

  const onSubmit = async (data: GenerateRecipeInput) => {
    setIsLoading(true);
    setGeneratedRecipe(null);
    const result = await getAiRecipe(data);
    setIsLoading(false);

    if ('error' in result) {
      toast({
        title: 'Erro ao Gerar Receita',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setGeneratedRecipe(result);
      toast({
        title: 'Receita Gerada!',
        description: `A IA criou a receita "${result.recipeName}".`,
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ChefHat className="h-7 w-7 text-primary" />
            Assistente Culinário IA
          </CardTitle>
          <CardDescription>
            Peça à IA para criar receitas nutritivas e deliciosas para a merenda escolar.
            Forneça alguns detalhes e a IA fará a mágica!
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="mainIngredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredientes Principais</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Frango desfiado, cenoura, batata" {...field} />
                    </FormControl>
                    <FormDescription>
                      Liste os ingredientes chave que você tem ou deseja usar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="numberOfStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Alunos</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Refeição (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lunch">Almoço</SelectItem>
                          <SelectItem value="snack">Lanche</SelectItem>
                          <SelectItem value="breakfast">Café da Manhã</SelectItem>
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restrições Alimentares (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sem glúten, vegetariano, sem lactose" {...field} />
                    </FormControl>
                    <FormDescription>
                      Informe se há alguma restrição alimentar a ser considerada.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="text-base py-3">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Receita...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Gerar Receita com IA
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {generatedRecipe && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">{generatedRecipe.recipeName}</CardTitle>
            {generatedRecipe.description && (
              <CardDescription>{generatedRecipe.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ingredientes:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {generatedRecipe.ingredients.map((ing, index) => (
                  <li key={index}>
                    {ing.quantity} de {ing.name}
                  </li>
                ))}
              </ul>
            </div>
            
            {(generatedRecipe.preparationTime || generatedRecipe.cookingTime) && (
                 <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    {generatedRecipe.preparationTime && (
                        <p><strong>Tempo de Preparo:</strong> {generatedRecipe.preparationTime}</p>
                    )}
                    {generatedRecipe.cookingTime && (
                        <p><strong>Tempo de Cozimento:</strong> {generatedRecipe.cookingTime}</p>
                    )}
                 </div>
            )}


            <div>
              <h3 className="text-lg font-semibold mb-2">Instruções de Preparo:</h3>
              <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert bg-muted/50 p-4 rounded-md">
                {generatedRecipe.instructions}
              </ReactMarkdown>
            </div>

            {generatedRecipe.nutritionalNotes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notas Nutricionais/Dicas:</h3>
                <p className="text-sm text-muted-foreground italic bg-accent/20 p-3 rounded-md">{generatedRecipe.nutritionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
