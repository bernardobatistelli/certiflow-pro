import { useState, useCallback, useRef, useEffect } from "react";
import { Send, CheckCircle, XCircle, Loader2, Pause, Play, Download, Clock, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CertificateConfig, ProcessedStudent, SendResult } from "@/types/certificate";

interface SendProcessorProps {
  webhookUrl: string;
  students: ProcessedStudent[];
  certificateImage: string;
  config: CertificateConfig;
  results: SendResult[];
  onResultAdd: (result: SendResult) => void;
  onBack: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export function SendProcessor({
  webhookUrl,
  students,
  certificateImage,
  config,
  results,
  onResultAdd,
  onBack,
}: SendProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

  const validStudents = students.filter((s) => s.isValid);
  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;
  const progress = validStudents.length > 0 ? (results.length / validStudents.length) * 100 : 0;

  const estimatedTimeRemaining = useCallback(() => {
    if (!startTime || results.length === 0) return null;
    const elapsed = Date.now() - startTime;
    const avgTime = elapsed / results.length;
    const remaining = (validStudents.length - results.length) * avgTime;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }, [startTime, results.length, validStudents.length]);

  const sendToWebhook = async (student: ProcessedStudent, retryCount: number = 0): Promise<SendResult> => {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aluno: {
            nome: student.nome,
            cpf: student.cpf,
            email: student.email,
            telefone: student.telefone,
          },
          certificadoTemplate: certificateImage,
          config: {
            posX: config.posX,
            posY: config.posY,
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            fontColor: config.fontColor,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { student, success: true, retryCount };
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return sendToWebhook(student, retryCount + 1);
      }
      return {
        student,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        retryCount,
      };
    }
  };

  const processAll = async () => {
    setIsProcessing(true);
    setStartTime(Date.now());
    abortRef.current = false;
    pauseRef.current = false;

    for (let i = currentIndex; i < validStudents.length; i++) {
      if (abortRef.current) break;

      while (pauseRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (abortRef.current) break;
      }

      if (abortRef.current) break;

      const student = validStudents[i];
      const result = await sendToWebhook(student);
      onResultAdd(result);
      setCurrentIndex(i + 1);
    }

    setIsProcessing(false);
  };

  const handlePause = () => {
    pauseRef.current = true;
    setIsPaused(true);
  };

  const handleResume = () => {
    pauseRef.current = false;
    setIsPaused(false);
  };

  const handleStop = () => {
    abortRef.current = true;
    pauseRef.current = false;
    setIsProcessing(false);
    setIsPaused(false);
  };

  const downloadReport = () => {
    const headers = ["Nome", "CPF", "Email", "Telefone", "Status", "Erro", "Tentativas"];
    const rows = results.map((r) => [
      r.student.nome,
      r.student.cpf,
      r.student.email,
      r.student.telefone,
      r.success ? "Sucesso" : "Erro",
      r.error || "",
      r.retryCount.toString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-certificados-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Enviar Certificados
        </CardTitle>
        <CardDescription>
          Enviar {validStudents.length} certificados via webhook
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Badge variant="secondary" className="text-lg py-2 px-4">
            Total: {validStudents.length}
          </Badge>
          <Badge className="text-lg py-2 px-4 bg-accent text-accent-foreground">
            <CheckCircle className="w-4 h-4 mr-2" />
            {successCount} Sucesso
          </Badge>
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-lg py-2 px-4">
              <XCircle className="w-4 h-4 mr-2" />
              {errorCount} Erros
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso: {results.length} de {validStudents.length}</span>
            {estimatedTimeRemaining() && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {estimatedTimeRemaining()} restante
              </span>
            )}
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="flex gap-3 flex-wrap">
          {!isProcessing && results.length === 0 && (
            <Button onClick={processAll} className="bg-primary hover:bg-primary/90">
              <Send className="w-4 h-4 mr-2" />
              Processar Todos
            </Button>
          )}

          {isProcessing && !isPaused && (
            <Button onClick={handlePause} variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          )}

          {isProcessing && isPaused && (
            <Button onClick={handleResume} className="bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          )}

          {isProcessing && (
            <Button onClick={handleStop} variant="destructive">
              Parar
            </Button>
          )}

          {results.length > 0 && !isProcessing && (
            <Button onClick={downloadReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório CSV
            </Button>
          )}

          {results.length > 0 && results.length < validStudents.length && !isProcessing && (
            <Button onClick={processAll} className="bg-primary hover:bg-primary/90">
              <RotateCcw className="w-4 h-4 mr-2" />
              Continuar Envio
            </Button>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Log de Envio</h4>
          <ScrollArea className="h-64 border rounded-lg p-3">
            {isProcessing && results.length < validStudents.length && (
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando {currentIndex + 1} de {validStudents.length}...
              </div>
            )}
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 py-1 ${
                  result.success ? "text-accent" : "text-destructive"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="flex-1 truncate">{result.student.nome}</span>
                <span className="text-sm">
                  {result.success ? "Sucesso" : `Erro: ${result.error}`}
                </span>
                {result.retryCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {result.retryCount} retry
                  </Badge>
                )}
              </div>
            ))}
            {results.length === 0 && !isProcessing && (
              <p className="text-muted-foreground text-center py-8">
                Clique em "Processar Todos" para iniciar
              </p>
            )}
          </ScrollArea>
        </div>

        {results.length === validStudents.length && validStudents.length > 0 && (
          <div className="bg-accent/10 border border-accent rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent" />
            <h3 className="font-semibold text-lg">Processamento Concluído!</h3>
            <p className="text-muted-foreground">
              {successCount} certificados enviados com sucesso, {errorCount} com erro
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
