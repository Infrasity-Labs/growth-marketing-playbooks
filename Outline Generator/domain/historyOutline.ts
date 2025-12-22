import { OutlineType } from "./outline";
export interface HistoryOutline {
  topic: string;
  outline: OutlineType;
  additionalInfo: string;
  client: string;
  date: string;
  difficulty: string;
}