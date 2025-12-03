export interface StyleOption {
  id: string;
  label: string;
  description: string;
  promptAddon: string;
  color: string;
  darkColor: string;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  CONFIG = 'CONFIG',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  EDITING = 'EDITING',
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash-image',
  PRO = 'gemini-3-pro-image-preview',
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9';

export interface GenerationConfig {
  styleId: string;
  customPrompt?: string;
  modelType: ModelType;
  size: ImageSize;
  aspectRatio: AspectRatio;
}

export interface AnalysisResult {
  description: string;
  tags: string[];
}

export type BackgroundOption = 'original' | 'simple' | 'room' | 'nature' | 'fantasy' | 'galaxy';

export interface ColorPalette {
  id: string;
  label: string;
  hex: string;
  prompt: string;
}

export interface QuickFilter {
  id: string;
  label: string;
  prompt: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
}