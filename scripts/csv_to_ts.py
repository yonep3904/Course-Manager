#!/usr/bin/env python3

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

INPUT_PATH = ROOT / "courses.csv"
OUTPUT_PATH = ROOT / "courses.ts"


HEADER = """\
import type { Course } from "@/app/types/course";

export const courses: Course[] = [
"""

FOOTER = """\
];
"""


def main() -> None:
    rows = list(csv.DictReader(INPUT_PATH.open(encoding="utf-8")))
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    lines = [HEADER.rstrip("\n")]
    for index, row in enumerate(rows, start=1):
        name = json.dumps(row["授業科目"], ensure_ascii=False)
        term = json.dumps(row["開講時期"], ensure_ascii=False)
        requirement = json.dumps(row["必修選択"], ensure_ascii=False)
        credits = int(row["単位数"])

        lines.extend(
            [
                f'  {{ id: "course-{index}", name: {name}, credits: {credits}, term: {term}, requirement: {requirement} }},'
            ]
        )

    lines.append(FOOTER.rstrip("\n"))
    OUTPUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
