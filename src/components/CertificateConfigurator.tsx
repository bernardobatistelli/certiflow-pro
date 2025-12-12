import { useState, useCallback, useRef, useEffect } from "react";
import { Image, Type, Move } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CertificateConfig, ProcessedStudent } from "@/types/certificate";
import { cn } from "@/lib/utils";

interface CertificateConfiguratorProps {
  config: CertificateConfig;
  certificateImage: string | null;
  firstStudent: ProcessedStudent | null;
  onConfigChange: (config: CertificateConfig) => void;
  onImageChange: (image: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const FONTS = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
];

export function CertificateConfigurator({
  config,
  certificateImage,
  firstStudent,
  onConfigChange,
  onImageChange,
  onNext,
  onBack,
}: CertificateConfiguratorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const updateConfig = useCallback((updates: Partial<CertificateConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  }, [localConfig, onConfigChange]);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
      
      const img = new window.Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  useEffect(() => {
    if (!canvasRef.current || !certificateImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      if (firstStudent) {
        const scaledX = x + (localConfig.posX * scale);
        const scaledY = y + (localConfig.posY * scale);
        const scaledFontSize = localConfig.fontSize * scale;

        ctx.font = `${scaledFontSize}px ${localConfig.fontFamily}`;
        ctx.fillStyle = localConfig.fontColor;
        ctx.textAlign = "center";
        ctx.fillText(firstStudent.nome, scaledX, scaledY);
      }
    };
    img.src = certificateImage;
  }, [certificateImage, localConfig, firstStudent]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5 text-primary" />
          Configurar Certificado
        </CardTitle>
        <CardDescription>
          Faça upload do template e ajuste a posição do nome
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!certificateImage ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
              isDragging && "border-primary bg-primary/5",
              !isDragging && "border-border hover:border-primary/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("image-input")?.click()}
          >
            <input
              id="image-input"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">
              {isDragging ? "Solte a imagem aqui" : "Arraste o template do certificado"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              PNG ou JPG
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Move className="w-4 h-4" />
                    Posição X: {localConfig.posX}px
                  </Label>
                  <Slider
                    value={[localConfig.posX]}
                    onValueChange={([v]) => updateConfig({ posX: v })}
                    max={imageSize.width || 1000}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Move className="w-4 h-4" />
                    Posição Y: {localConfig.posY}px
                  </Label>
                  <Slider
                    value={[localConfig.posY]}
                    onValueChange={([v]) => updateConfig({ posY: v })}
                    max={imageSize.height || 800}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4" />
                    Tamanho da Fonte: {localConfig.fontSize}px
                  </Label>
                  <Slider
                    value={[localConfig.fontSize]}
                    onValueChange={([v]) => updateConfig({ fontSize: v })}
                    min={20}
                    max={60}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Cor do Texto</Label>
                  <Input
                    type="color"
                    value={localConfig.fontColor}
                    onChange={(e) => updateConfig({ fontColor: e.target.value })}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Fonte</Label>
                  <Select
                    value={localConfig.fontFamily}
                    onValueChange={(v) => updateConfig({ fontFamily: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => onImageChange("")}
                  className="w-full"
                >
                  Trocar Template
                </Button>
              </div>

              <div>
                <Label className="mb-2 block">Preview</Label>
                <div className="border rounded-lg p-2 bg-muted/20">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={400}
                    className="w-full rounded"
                  />
                </div>
                {firstStudent && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Visualizando: {firstStudent.nome}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button
            onClick={onNext}
            disabled={!certificateImage}
            className="bg-primary hover:bg-primary/90"
          >
            Continuar para Envio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
