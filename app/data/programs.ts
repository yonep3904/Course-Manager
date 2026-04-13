import type { Program } from "@/app/types/course";

import { courses as informationEngineeringCourses } from "./courses/information-engineering";
import { courses as electronicEngineeringCourses } from "./courses/electronic-engineering";
import { courses as electricalEngineeringCourses } from "@/app/data/courses/electrical-engineering";

export type ProgramKey =
  | "electrical-engineering"
  | "electronic-engineering-2024"
  | "information-engineering-2024";

export const programs: Record<ProgramKey, Program> = {
  "electrical-engineering": {
    name: "情報電気工学科 電気工学教育プログラム(2024年度)",
    shortName: "電気工学('24)",
    years: 2024,
    description:
      "2024年度便覧 電気工学教育プログラムの科目一覧をもとに、履修済みと履修登録予定を分けて管理します。",
    courses: electricalEngineeringCourses,
    href: "/programs/electrical-engineering",
    slug: "electrical-engineering",
  },
  "electronic-engineering-2024": {
    name: "情報電気工学科 電子工学教育プログラム(2024年度)",
    shortName: "電子工学('24)",
    years: 2024,
    description:
      "2024年度便覧 電子工学教育プログラムの科目一覧をもとに、履修済みと履修登録予定を分けて管理します。",
    courses: electronicEngineeringCourses,
    href: "/programs/electronic-engineering",
    slug: "electronic-engineering-2024",
  },
  "information-engineering-2024": {
    name: "情報電気工学科 情報工学教育プログラム(2024年度)",
    shortName: "情報工学('24)",
    years: 2024,
    description:
      "2024年度便覧 情報工学教育プログラムの科目一覧をもとに、履修済みと履修登録予定を分けて管理します。",
    courses: informationEngineeringCourses,
    href: "/programs/information-engineering",
    slug: "information-engineering-2024",
  },
};
