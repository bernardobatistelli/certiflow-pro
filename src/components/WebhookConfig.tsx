import { useState } from "react";
import { Settings, CheckCircle, XCircle, Loader2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface WebhookConfigProps {
  webhookUrl: string;
  onWebhookChange: (url: string) => void;
}

export function WebhookConfig({ webhookUrl, onWebhookChange }: WebhookConfigProps) {
  const [url, setUrl] = useState(webhookUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleSave = () => {
    onWebhookChange(url);
    toast.success("Webhook URL salva com sucesso!");
  };

  const handleTest = async () => {
    if (!url) {
      toast.error("Por favor, insira uma URL de webhook");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "Teste de conexão do Sistema de Certificados",
        }),
      });

      if (response.ok) {
        setTestResult("success");
        toast.success("Conexão estabelecida com sucesso!");
      } else {
        setTestResult("error");
        toast.error(`Erro na conexão: ${response.status}`);
      }
    } catch (error) {
      setTestResult("error");
      toast.error("Erro ao conectar com o webhook");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Configuração do Webhook
        </CardTitle>
        <CardDescription>
          Cole a URL do webhook do Make para enviar os certificados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="https://hook.make.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSave} variant="outline">
            Salvar
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleTest} 
            disabled={testing || !url}
            className="bg-primary hover:bg-primary/90"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Testar Conexão
          </Button>
          
          {testResult === "success" && (
            <div className="flex items-center gap-2 text-accent">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Conexão OK</span>
            </div>
          )}
          
          {testResult === "error" && (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Falha na conexão</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
