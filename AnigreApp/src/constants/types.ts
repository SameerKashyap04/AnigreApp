export interface ScanResult {
  id: string;
  imageUri: string;
  diseaseName: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  date: string;
  treatments: string[];
}

export interface HistoryItem {
  id: string;
  cropName: string;
  diseaseName: string;
  date: string;
  icon: string;
  status: 'ok' | 'warn';
}
