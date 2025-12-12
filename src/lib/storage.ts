import { AppState, CertificateConfig, ProcessedStudent, SendResult, Student } from "@/types/certificate";

const STORAGE_KEY = "certificate-system-state";

const defaultConfig: CertificateConfig = {
  posX: 400,
  posY: 350,
  fontSize: 36,
  fontColor: "#000000",
  fontFamily: "Arial",
};

export const defaultState: AppState = {
  webhookUrl: "",
  rawStudents: [],
  processedStudents: [],
  certificateImage: null,
  certificateConfig: defaultConfig,
  sendResults: [],
  currentStep: 0,
};

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultState, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error loading state:", error);
  }
  return defaultState;
}

export function saveState(state: Partial<AppState>): void {
  try {
    const current = loadState();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving state:", error);
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing state:", error);
  }
}
