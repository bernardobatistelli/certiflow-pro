export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email vazio" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Formato de email inválido" };
  }
  
  return { isValid: true };
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.length >= 1 && cleaned.length <= 11;
}

export function formatCPF(cpf: string): string {
  let cleaned = cpf.replace(/\D/g, "");
  cleaned = cleaned.padStart(11, "0");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatName(name: string): string {
  let formatted = name.toUpperCase();
  formatted = formatted.replace(/copy/gi, "").trim();
  formatted = formatted.replace(/\s+/g, " ");
  return formatted;
}

export function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned.startsWith("55") && cleaned.length <= 11) {
    cleaned = "55" + cleaned;
  }
  return "+" + cleaned;
}

export function validateRequiredColumns(headers: string[]): { valid: boolean; missing: string[] } {
  const required = ["nome", "cpf", "telefone", "email", "certificado"];
  const normalized = headers.map(h => h.toLowerCase().trim());
  const missing = required.filter(col => !normalized.includes(col));
  
  return {
    valid: missing.length === 0,
    missing
  };
}
