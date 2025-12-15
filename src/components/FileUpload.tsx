import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Student } from "@/types/certificate";
import { validateRequiredColumns, normalizeColumnName } from "@/lib/validators";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onDataLoaded: (students: Student[]) => void;
  onNext: () => void;
}

export function FileUpload({ onDataLoaded, onNext }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recordCount, setRecordCount] = useState(0);

  const processData = useCallback((data: Record<string, unknown>[]) => {
    if (data.length === 0) {
      setError("O arquivo está vazio");
      return;
    }

    const headers = Object.keys(data[0]);
    const validation = validateRequiredColumns(headers);

    if (!validation.valid) {
      setError(`Colunas obrigatórias faltando: ${validation.missing.join(", ")}`);
      return;
    }

    // Normalize column names + coerce values to string (Excel may return numbers)
    const normalizedData = data.map((row) => {
      const normalized: Record<string, string> = {};
      for (const key of Object.keys(row)) {
        const normalizedKey = normalizeColumnName(key);
        const value = (row as Record<string, unknown>)[key];
        normalized[normalizedKey] = value == null ? "" : String(value);
      }
      return normalized;
    });

    const students: Student[] = normalizedData.map((row, index) => ({
      id: `student-${index}`,
      nome: row.nome || "",
      cpf: row.cpf || "",
      telefone: row.telefone || "",
      email: row.email || "",
      certificado: row.certificado || "",
    }));

    setError(null);
    setSuccess(true);
    setRecordCount(students.length);
    onDataLoaded(students);
  }, [onDataLoaded]);

  const handleFile = useCallback((file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data as Record<string, unknown>[]);
        },
        error: () => {
          setError("Erro ao processar arquivo CSV");
        },
      });
    } else if (extension === "xlsx" || extension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
          processData(data);
        } catch {
          setError("Erro ao processar arquivo Excel");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError("Formato de arquivo não suportado. Use CSV ou Excel.");
    }
  }, [processData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Upload de Planilha
        </CardTitle>
        <CardDescription>
          Arraste um arquivo CSV ou Excel com as colunas: nome, cpf, telefone, email, certificado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
            isDragging && "border-primary bg-primary/5",
            !isDragging && "border-border hover:border-primary/50"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragging ? "Solte o arquivo aqui" : "Arraste ou clique para selecionar"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Suporta CSV e Excel (.xlsx, .xls)
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-accent bg-accent/10">
            <CheckCircle className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent">Sucesso!</AlertTitle>
            <AlertDescription>
              {recordCount} registros carregados com sucesso
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Button onClick={onNext} className="w-full bg-primary hover:bg-primary/90">
            Continuar para Processamento
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
