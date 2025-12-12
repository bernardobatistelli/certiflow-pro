export interface Student {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  certificado: string;
}

export interface ProcessedStudent {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  isValid: boolean;
  emailError?: string;
}

export interface CertificateConfig {
  posX: number;
  posY: number;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
}

export interface SendResult {
  student: ProcessedStudent;
  success: boolean;
  error?: string;
  retryCount: number;
}

export interface AppState {
  webhookUrl: string;
  rawStudents: Student[];
  processedStudents: ProcessedStudent[];
  certificateImage: string | null;
  certificateConfig: CertificateConfig;
  sendResults: SendResult[];
  currentStep: number;
}
