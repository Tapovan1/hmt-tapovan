export const standards = {
  KG1: {
    classes: ["Dhruv"],
  },
  KG2: {
    classes: ["Dhruv"],
  },
  "1": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
  },
  "2": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
  },
  "3": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
  },
  "4": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
  },
  "5": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
  },
  "6": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
  },
  "7": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi"],
  },
  "8": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Nambi", "Foundation"],
  },
  "9": {
    classes: ["Nachiketa", "Dhruv", "Prahlad", "Foundation"],
  },
  "10": {
    classes: ["Nachiketa", "Dhruv", "Prahlad"],
  },
  "11": {
    classes: [
      "Dhruv",
      "Nachiketa",
      "Prahlad",
      "Jee",
      "Neet",
      "Eng-Jee",
      "Eng-Neet",
    ],
  },
  "12": {
    classes: ["Maths", "Biology", "Jee", "Neet", "Eng-Jee", "Eng-Neet"],
  },
} as const;

export type StandardKey = keyof typeof standards;
export type ClassData = (typeof standards)[StandardKey];
