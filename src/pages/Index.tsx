import { Award } from "lucide-react";
import { useCertificateState } from "@/hooks/useCertificateState";
import { StepIndicator } from "@/components/StepIndicator";
import { WebhookConfig } from "@/components/WebhookConfig";
import { FileUpload } from "@/components/FileUpload";
import { DataProcessor } from "@/components/DataProcessor";
import { CertificateConfigurator } from "@/components/CertificateConfigurator";
import { SendProcessor } from "@/components/SendProcessor";

const STEPS = [
  { id: 0, title: "Upload", description: "Carregar planilha" },
  { id: 1, title: "Processar", description: "Validar dados" },
  { id: 2, title: "Configurar", description: "Template" },
  { id: 3, title: "Enviar", description: "Processar envios" },
];

const Index = () => {
  const {
    state,
    isLoaded,
    setWebhookUrl,
    setRawStudents,
    setProcessedStudents,
    setCertificateImage,
    setCertificateConfig,
    addSendResult,
    setCurrentStep,
  } = useCertificateState();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sistema de Certificados</h1>
              <p className="text-sm text-muted-foreground">Emissão em massa via webhook</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <WebhookConfig
            webhookUrl={state.webhookUrl}
            onWebhookChange={setWebhookUrl}
          />

          <StepIndicator
            steps={STEPS}
            currentStep={state.currentStep}
            onStepClick={(step) => {
              if (step < state.currentStep) {
                setCurrentStep(step);
              }
            }}
          />

          {state.currentStep === 0 && (
            <FileUpload
              onDataLoaded={setRawStudents}
              onNext={() => setCurrentStep(1)}
            />
          )}

          {state.currentStep === 1 && (
            <DataProcessor
              rawStudents={state.rawStudents}
              onProcess={setProcessedStudents}
              onNext={() => setCurrentStep(2)}
              onBack={() => setCurrentStep(0)}
            />
          )}

          {state.currentStep === 2 && (
            <CertificateConfigurator
              config={state.certificateConfig}
              certificateImage={state.certificateImage}
              firstStudent={state.processedStudents[0] || null}
              onConfigChange={setCertificateConfig}
              onImageChange={setCertificateImage}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {state.currentStep === 3 && (
            <SendProcessor
              webhookUrl={state.webhookUrl}
              students={state.processedStudents}
              certificateImage={state.certificateImage || ""}
              config={state.certificateConfig}
              results={state.sendResults}
              onResultAdd={addSendResult}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Sistema de Certificados &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
