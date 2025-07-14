export const allSchoolStandards = {
  hmt: {
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
      classes: ["Dhruv", "Nachiketa", "Prahlad", "Jee", "Neet", "Eng-Jee", "Eng-Neet"],
    },
    "12": {
      classes: ["Maths", "Biology", "Jee", "Neet", "Eng-Jee", "Eng-Neet"],
    },
  },
  talod: {
    KG1: {
      classes: ["A"],
    },
    KG2: {
      classes: ["A"],
    },
    "1": {
      classes: ["A"],
    },
    "2": {
      classes: ["A"],
    },
    "3": {
      classes: ["A"],
    },
    "4": {
      classes: ["A"],
    },
    "5": {
      classes: ["A"],
    },
    "6": {
      classes: ["A"],
    },
    "7": {
      classes: ["A"],
    },
    "8": {
      classes: ["A"],
    },
    "9": {
      classes: ["A"],
    },
    "10": {
      classes: ["A"],
    },
    "11": {
      classes: ["A", "B"],
    },
    "12": {
      classes: ["A", "B"],
    },
  },
} as const;

export type SchoolKey = keyof typeof allSchoolStandards;

export function getStandards(school: SchoolKey) {
  // console.log("index",school);
  
  return allSchoolStandards[school];
}

export type Standards = ReturnType<typeof getStandards>;
export type StandardKey = keyof Standards;
export type ClassData = Standards[StandardKey];
