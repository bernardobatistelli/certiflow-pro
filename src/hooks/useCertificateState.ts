import { useState, useEffect, useCallback } from "react";
import { AppState, CertificateConfig, ProcessedStudent, SendResult, Student } from "@/types/certificate";
import { loadState, saveState, defaultState } from "@/lib/storage";

export function useCertificateState() {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setIsLoaded(true);
  }, []);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      saveState(newState);
      return newState;
    });
  }, []);

  const setWebhookUrl = useCallback((webhookUrl: string) => {
    updateState({ webhookUrl });
  }, [updateState]);

  const setRawStudents = useCallback((rawStudents: Student[]) => {
    updateState({ rawStudents });
  }, [updateState]);

  const setProcessedStudents = useCallback((processedStudents: ProcessedStudent[]) => {
    updateState({ processedStudents });
  }, [updateState]);

  const setCertificateImage = useCallback((certificateImage: string | null) => {
    updateState({ certificateImage });
  }, [updateState]);

  const setCertificateConfig = useCallback((certificateConfig: CertificateConfig) => {
    updateState({ certificateConfig });
  }, [updateState]);

  const setSendResults = useCallback((sendResults: SendResult[]) => {
    updateState({ sendResults });
  }, [updateState]);

  const addSendResult = useCallback((result: SendResult) => {
    setState(prev => {
      const newResults = [...prev.sendResults, result];
      saveState({ sendResults: newResults });
      return { ...prev, sendResults: newResults };
    });
  }, []);

  const setCurrentStep = useCallback((currentStep: number) => {
    updateState({ currentStep });
  }, [updateState]);

  const resetState = useCallback(() => {
    setState(defaultState);
    saveState(defaultState);
  }, []);

  return {
    state,
    isLoaded,
    setWebhookUrl,
    setRawStudents,
    setProcessedStudents,
    setCertificateImage,
    setCertificateConfig,
    setSendResults,
    addSendResult,
    setCurrentStep,
    resetState,
  };
}
