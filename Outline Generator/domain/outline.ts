export interface Section {
  h2: string;
  Content?: string[];
  paragraphs?: number;
}

export interface SuggestedOutline {
  h1: string;
  Sections: Section[];
}

export interface OutlineType {
  Title: string;
  Brief: string;
  URL: string;
  "Word Count": string;
  "Target Intent": string;
  "Target Audience": string[];
  "Page Template": string;
  "Difficulty Level": string;
  "Keywords’ global search volume": {
    "Focus keyword": {[key: string]: number;};
    "Longtail KWs": {
      [key: string]: number;
    };
  };
  "Commonly Asked Questions": string[];
  "Suggested Outline": SuggestedOutline;
  "Highlighted Referenced Links": string[];
}