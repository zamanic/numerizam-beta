// Configuration for MistralAI integration
export interface MistralAiConfig {
  apiEndpoint: string;
  apiKey?: string;
  model: string;
  timeout: number;
  maxFileSize: number;
  supportedFormats: string[];
  confidenceThreshold: number;
  enableFallback: boolean;
}

export const mistralAiConfig: MistralAiConfig = {
  // Default configuration - can be overridden via environment variables
  apiEndpoint:
    import.meta.env.VITE_MISTRAL_API_ENDPOINT || "https://api.mistral.ai/v1",
  apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
  model: import.meta.env.VITE_MISTRAL_MODEL || "mistral-large-latest",
  timeout: parseInt(import.meta.env.VITE_MISTRAL_TIMEOUT || "600000"), // 10 minutes timeout
  maxFileSize: parseInt(
    import.meta.env.VITE_MISTRAL_MAX_FILE_SIZE || "10485760"
  ), // 10MB
  supportedFormats: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
  confidenceThreshold: parseFloat(
    import.meta.env.VITE_MISTRAL_CONFIDENCE_THRESHOLD || "0.8"
  ),
  enableFallback: import.meta.env.VITE_MISTRAL_ENABLE_FALLBACK !== "false",
};

export const validateMistralConfig = (): boolean => {
  if (!mistralAiConfig.apiEndpoint) {
    console.warn("MistralAI API endpoint not configured.");
    return false;
  }

  if (!mistralAiConfig.apiKey) {
    console.warn(
      "MistralAI API key not provided. Please set VITE_MISTRAL_API_KEY environment variable."
    );
    return false;
  }

  return true;
};

export const getMistralSupportedFormats = (): string[] => {
  return mistralAiConfig.supportedFormats;
};

export const isMistralFileSupported = (file: File): boolean => {
  return mistralAiConfig.supportedFormats.includes(file.type);
};

export const getMistralFileSizeLimit = (): number => {
  return mistralAiConfig.maxFileSize;
};

export const isMistralFileSizeValid = (file: File): boolean => {
  return file.size <= mistralAiConfig.maxFileSize;
};

export const getMistralModel = (): string => {
  return mistralAiConfig.model;
};

export const getMistralTimeout = (): number => {
  return mistralAiConfig.timeout;
};
