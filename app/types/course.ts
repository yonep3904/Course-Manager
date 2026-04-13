export type RequirementSymbol = "◯" | "◎" | "*" | "" | "-";

export type Course = {
  id: string;
  name: string;
  credits: number;
  term: string;
  requirement: RequirementSymbol;
};

export type Program = {
  name: string;
  shortName: string;
  years: number;
  description: string;
  courses: Course[];
  href: string;
  slug: string;
};
