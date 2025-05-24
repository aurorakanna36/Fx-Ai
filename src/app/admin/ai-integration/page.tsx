
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Terminal, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const aiIntegrationFormSchema = z.object({
  aiProviderName: z.string().min(2, {
    message: "AI Provider name must be at least 2 characters.",
  }).default("Gemini AI (Default)"),
  apiKey: z.string().min(10, { // Basic validation for API key length
    message: "API Key seems too short.",
  }).optional().or(z.literal('')), // API key can be optional if using default
  apiPrompt: z.string().min(20, {
    message: "API Prompt must be at least 20 characters.",
  }).optional().or(z.literal('')),
});

type AiIntegrationFormValues = z.infer<typeof aiIntegrationFormSchema>;

// This can be exported to a config file
const defaultValues: Partial<AiIntegrationFormValues> = {
  aiProviderName: "Gemini AI (Default)",
  apiKey: "",
  apiPrompt: `You are an expert Forex trading analyst. Analyze the provided Forex chart image and provide a trading recommendation (Buy, Sell, or Wait) along with a detailed explanation of your reasoning.

Chart Image: {{media url=chartDataUri}}

Provide the output in JSON format.
`,
};

export default function AiIntegrationPage() {
  const { toast } = useToast();
  const [isDefaultAi, setIsDefaultAi] = useState(true); // Assuming Gemini is default

  const form = useForm<AiIntegrationFormValues>({
    resolver: zodResolver(aiIntegrationFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: AiIntegrationFormValues) {
    // In a real application, you would save these settings securely on the server.
    // For this mock, we'll just show a toast.
    console.log("AI Integration Data Submitted:", data);
    toast({
      title: "AI Settings Updated (Mock)",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">AI Integration Settings</CardTitle>
          </div>
          <CardDescription>
            Configure the AI provider and API settings. This section is for administrators only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Developer Note</AlertTitle>
            <AlertDescription>
              This is a mock interface. API keys and prompts are not saved or used in this demo.
              In a production environment, handle API keys securely on the server-side.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="aiProviderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Provider Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Gemini, OpenAI GPT-4" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of the AI service provider currently in use.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key {isDefaultAi && "(Optional for Default AI)"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter API Key for a custom AI" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the API key for the selected AI provider. Leave blank if using the default integrated AI.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI API Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the system prompt for the AI model..."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The system prompt used to instruct the AI model for chart analysis.
                      Use `{{media url=chartDataUri}}` as a placeholder for the chart image.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <KeyRound className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
