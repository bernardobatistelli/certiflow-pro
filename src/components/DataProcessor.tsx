import { useState, useEffect, useMemo } from "react";
import { Users, Edit3, Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Student, ProcessedStudent } from "@/types/certificate";
import { formatCPF, formatName, formatPhone, validateEmail } from "@/lib/validators";

interface DataProcessorProps {
  rawStudents: Student[];
  onProcess: (students: ProcessedStudent[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DataProcessor({ rawStudents, onProcess, onNext, onBack }: DataProcessorProps) {
  const [processedStudents, setProcessedStudents] = useState<ProcessedStudent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProcessedStudent>>({});

  useEffect(() => {
    const filtered = rawStudents.filter(
      (s) => s.certificado.toUpperCase().trim() === "SIM"
    );

    const processed: ProcessedStudent[] = filtered.map((student) => {
      const emailValidation = validateEmail(student.email);
      return {
        id: student.id,
        nome: formatName(student.nome),
        cpf: formatCPF(student.cpf),
        telefone: formatPhone(student.telefone),
        email: student.email.trim().toLowerCase(),
        isValid: emailValidation.isValid,
        emailError: emailValidation.error,
      };
    });

    setProcessedStudents(processed);
    onProcess(processed);
  }, [rawStudents, onProcess]);

  const validCount = useMemo(
    () => processedStudents.filter((s) => s.isValid).length,
    [processedStudents]
  );

  const invalidCount = useMemo(
    () => processedStudents.filter((s) => !s.isValid).length,
    [processedStudents]
  );

  const handleEdit = (student: ProcessedStudent) => {
    setEditingId(student.id);
    setEditValues({ ...student });
  };

  const handleSave = () => {
    if (!editingId || !editValues) return;

    const emailValidation = validateEmail(editValues.email || "");
    
    setProcessedStudents((prev) =>
      prev.map((s) =>
        s.id === editingId
          ? {
              ...s,
              ...editValues,
              isValid: emailValidation.isValid,
              emailError: emailValidation.error,
            }
          : s
      )
    );
    
    setEditingId(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Processamento de Dados
        </CardTitle>
        <CardDescription>
          Dados formatados automaticamente. Clique para editar se necessário.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 flex-wrap">
          <Badge variant="secondary" className="text-lg py-2 px-4">
            {processedStudents.length} alunos serão certificados
          </Badge>
          <Badge className="text-lg py-2 px-4 bg-accent text-accent-foreground">
            {validCount} válidos
          </Badge>
          {invalidCount > 0 && (
            <Badge variant="destructive" className="text-lg py-2 px-4">
              {invalidCount} com erros
            </Badge>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedStudents.map((student) => (
                  <TableRow key={student.id} className={!student.isValid ? "bg-destructive/5" : ""}>
                    {editingId === student.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editValues.nome || ""}
                            onChange={(e) => setEditValues({ ...editValues, nome: e.target.value })}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.cpf || ""}
                            onChange={(e) => setEditValues({ ...editValues, cpf: e.target.value })}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.telefone || ""}
                            onChange={(e) => setEditValues({ ...editValues, telefone: e.target.value })}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.email || ""}
                            onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8">
                              <Check className="w-4 h-4 text-accent" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancel} className="h-8 w-8">
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{student.nome}</TableCell>
                        <TableCell className="font-mono text-sm">{student.cpf}</TableCell>
                        <TableCell className="font-mono text-sm">{student.telefone}</TableCell>
                        <TableCell className="text-sm">{student.email}</TableCell>
                        <TableCell>
                          {student.isValid ? (
                            <Badge className="bg-accent/10 text-accent border-accent">Válido</Badge>
                          ) : (
                            <Badge variant="destructive">{student.emailError}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(student)}
                            className="h-8 w-8"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button 
            onClick={() => {
              onProcess(processedStudents);
              onNext();
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Continuar para Configuração
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
