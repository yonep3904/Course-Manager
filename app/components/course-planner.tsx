"use client";

import { useEffect, useState } from "react";
import type { Course, RequirementSymbol } from "@/app/types/course";

type RequirementKey =
  | "required"
  | "programRequired"
  | "electiveRequired"
  | "freeElective"
  | "programExternal";

type Totals = Record<RequirementKey, number>;

type Filters = {
  hideCompleted: boolean;
  hideRequired: boolean;
  hideProgramRequired: boolean;
  hideElectiveRequired: boolean;
  hideFreeElective: boolean;
  hideOther: boolean;
};

type ProgramLink = {
  name: string;
  href: string;
  slug: string;
  theme: {
    accent: string;
    subtle: string;
    border: string;
  };
};

type CoursePlannerProps = {
  name: string;
  description: string;
  courses: Course[];
  slug: string;

  programs: ProgramLink[];
};

const STORAGE_KEY_PREFIX = "course-planner-state";

const REQUIREMENT_META: Record<
  RequirementKey,
  {
    label: string;
    symbol: RequirementSymbol;
    lightClass: string;
    strongClass: string;
  }
> = {
  required: {
    label: "必修",
    symbol: "◯",
    lightClass: "bg-red-100 text-red-950",
    strongClass: "bg-red-300 text-red-950",
  },
  programRequired: {
    label: "プログラム指定科目",
    symbol: "◎",
    lightClass: "bg-red-100 text-red-950",
    strongClass: "bg-red-300 text-red-950",
  },
  electiveRequired: {
    label: "選択必修",
    symbol: "*",
    lightClass: "bg-emerald-100 text-emerald-950",
    strongClass: "bg-emerald-300 text-emerald-950",
  },
  freeElective: {
    label: "自由選択",
    symbol: "",
    lightClass: "bg-sky-100 text-sky-950",
    strongClass: "bg-sky-300 text-sky-950",
  },
  programExternal: {
    label: "プログラム外科目",
    symbol: "-",
    lightClass: "bg-slate-100 text-slate-900",
    strongClass: "bg-slate-300 text-slate-950",
  },
};

const EMPTY_TOTALS: Totals = {
  required: 0,
  programRequired: 0,
  electiveRequired: 0,
  freeElective: 0,
  programExternal: 0,
};

const DEFAULT_FILTERS: Filters = {
  hideCompleted: false,
  hideRequired: false,
  hideProgramRequired: false,
  hideElectiveRequired: false,
  hideFreeElective: false,
  hideOther: false,
};

function getRequirementKey(symbol: RequirementSymbol): RequirementKey {
  switch (symbol) {
    case "◯":
      return "required";
    case "◎":
      return "programRequired";
    case "*":
      return "electiveRequired";
    case "":
      return "freeElective";
    default:
      return "programExternal";
  }
}

function addToTotals(totals: Totals, course: Course) {
  const key = getRequirementKey(course.requirement);
  totals[key] += course.credits;
}

function formatRequirement(symbol: RequirementSymbol) {
  const key = getRequirementKey(symbol);
  const meta = REQUIREMENT_META[key];

  return symbol ? `${symbol} ${meta.label}` : meta.label;
}

export function CoursePlanner({
  name,
  description,
  slug,
  programs,
  courses,
}: CoursePlannerProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [plannedIds, setPlannedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchText, setSearchText] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const storageKey = `${STORAGE_KEY_PREFIX}:${slug}`;
  const currentProgram = programs.find((program) => program.slug === slug);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      setHasLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<{
        completedIds: string[];
        plannedIds: string[];
        filters: Filters;
        searchText: string;
      }>;

      setCompletedIds(
        Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      );
      setPlannedIds(Array.isArray(parsed.plannedIds) ? parsed.plannedIds : []);
      setFilters({ ...DEFAULT_FILTERS, ...parsed.filters });
      setSearchText(
        typeof parsed.searchText === "string" ? parsed.searchText : "",
      );
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setHasLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ completedIds, plannedIds, filters, searchText }),
    );
  }, [completedIds, plannedIds, filters, searchText, hasLoaded, storageKey]);

  const completedSet = new Set(completedIds);
  const plannedSet = new Set(plannedIds);

  const currentTotals: Totals = { ...EMPTY_TOTALS };
  const futureTotals: Totals = { ...EMPTY_TOTALS };
  const addedTotals: Totals = { ...EMPTY_TOTALS };

  for (const course of courses) {
    const isCompleted = completedSet.has(course.id);
    const isPlanned = plannedSet.has(course.id);

    if (isCompleted) {
      addToTotals(currentTotals, course);
      addToTotals(futureTotals, course);
      continue;
    }

    if (isPlanned) {
      addToTotals(futureTotals, course);
      addToTotals(addedTotals, course);
    }
  }

  const visibleCourses = courses.filter((course) => {
    const isCompleted = completedSet.has(course.id);
    const key = getRequirementKey(course.requirement);
    const normalizedSearch = searchText.trim().toLowerCase();

    if (filters.hideCompleted && isCompleted) {
      return false;
    }

    if (filters.hideRequired && key === "required") {
      return false;
    }

    if (filters.hideProgramRequired && key === "programRequired") {
      return false;
    }

    if (filters.hideElectiveRequired && key === "electiveRequired") {
      return false;
    }

    if (filters.hideFreeElective && key === "freeElective") {
      return false;
    }

    if (filters.hideOther && key === "programExternal") {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      course.name.toLowerCase().includes(normalizedSearch) ||
      course.term.toLowerCase().includes(normalizedSearch)
    );
  });

  function toggleCompleted(courseId: string) {
    setCompletedIds((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );
  }

  function togglePlanned(courseId: string) {
    setPlannedIds((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );
  }

  function updateFilter(key: keyof Filters) {
    setFilters((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">
              Class Manager
            </p>
            <div className="space-y-2">
              <h1
                className="border-l-4 pl-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
                style={{
                  borderColor: currentProgram?.theme.accent ?? "#0f172a",
                }}
              >
                {name}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                {description}
                集計は区分ごとに表示し、状態はブラウザのローカルストレージに保存します。
              </p>
            </div>
            <nav aria-label="プログラム選択" className="flex flex-wrap gap-2">
              {programs.map((item) => {
                const isCurrent = item.slug === slug;

                return (
                  <a
                    key={item.slug}
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    style={{
                      backgroundColor: isCurrent
                        ? item.theme.accent
                        : item.theme.subtle,
                      borderColor: isCurrent
                        ? item.theme.accent
                        : item.theme.border,
                      boxShadow: isCurrent
                        ? `0 10px 24px ${item.theme.border}55`
                        : undefined,
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isCurrent
                        ? "border text-white"
                        : "border text-slate-700"
                    }`}
                  >
                    {item.name}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-900 px-4 py-3 text-slate-50">
              <p className="text-xs tracking-[0.16em] uppercase text-slate-300">
                履修済み
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {completedIds.length}
              </p>
              <p className="text-sm text-slate-300">科目</p>
            </div>
            <div className="rounded-2xl bg-amber-300 px-4 py-3 text-slate-950">
              <p className="text-xs tracking-[0.16em] uppercase text-slate-700">
                履修登録
              </p>
              <p className="mt-2 text-3xl font-semibold">{plannedIds.length}</p>
              <p className="text-sm text-slate-700">科目</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-slate-950 ring-1 ring-slate-200">
              <p className="text-xs tracking-[0.16em] uppercase text-slate-500">
                表示中
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {visibleCourses.length}
              </p>
              <p className="text-sm text-slate-500">科目</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">単位集計</h2>
            <span className="text-xs text-slate-500">
              現在 / 履修登録後 / 今回追加
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">区分</th>
                  <th className="px-3 py-2 text-right font-medium">現在</th>
                  <th className="px-3 py-2 text-right font-medium">
                    履修登録後
                  </th>
                  <th className="px-3 py-2 text-right font-medium">今回追加</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(REQUIREMENT_META).map(([key, meta]) => {
                  const totalsKey = key as RequirementKey;

                  return (
                    <tr key={key} className="border-t border-slate-200">
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {meta.label}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {currentTotals[totalsKey]}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {futureTotals[totalsKey]}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {addedTotals[totalsKey]}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t border-slate-300 bg-slate-950 text-white">
                  <td className="px-3 py-2 font-semibold">合計</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {Object.values(currentTotals).reduce(
                      (sum, value) => sum + value,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {Object.values(futureTotals).reduce(
                      (sum, value) => sum + value,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {Object.values(addedTotals).reduce(
                      (sum, value) => sum + value,
                      0,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_16px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-950">絞り込み</h2>
              <p className="text-sm text-slate-600">
                履修済みや区分ごとに非表示にできます。
              </p>
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">検索</span>
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                placeholder="科目名・開講時期で検索"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.hideCompleted}
                  onChange={() => updateFilter("hideCompleted")}
                />
                履修済みを除外
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.hideRequired}
                  onChange={() => updateFilter("hideRequired")}
                />
                必修を除外
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.hideProgramRequired}
                  onChange={() => updateFilter("hideProgramRequired")}
                />
                プログラム指定科目を除外
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.hideElectiveRequired}
                  onChange={() => updateFilter("hideElectiveRequired")}
                />
                選択必修を除外
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.hideFreeElective}
                  onChange={() => updateFilter("hideFreeElective")}
                />
                自由選択を除外
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.hideOther}
                  onChange={() => updateFilter("hideOther")}
                />
                未分類を除外
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-950 text-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">履修済み</th>
                <th className="px-4 py-3 text-left font-medium">履修登録</th>
                <th className="px-4 py-3 text-left font-medium">授業科目</th>
                <th className="px-4 py-3 text-left font-medium">単位</th>
                <th className="px-4 py-3 text-left font-medium">開講時期</th>
                <th className="px-4 py-3 text-left font-medium">必修選択</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((course) => {
                const isCompleted = completedSet.has(course.id);
                const isPlanned = plannedSet.has(course.id);
                const requirementKey = getRequirementKey(course.requirement);
                const meta = REQUIREMENT_META[requirementKey];

                const rowClass = isCompleted
                  ? "bg-slate-700 text-slate-50"
                  : isPlanned
                    ? meta.strongClass
                    : meta.lightClass;

                return (
                  <tr
                    key={course.id}
                    className={`border-t border-white/60 ${rowClass}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleCompleted(course.id)}
                        aria-label={`${course.name} を履修済みにする`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isPlanned}
                        onChange={() => togglePlanned(course.id)}
                        aria-label={`${course.name} を履修登録にする`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{course.name}</td>
                    <td className="px-4 py-3">{course.credits}</td>
                    <td className="px-4 py-3">{course.term}</td>
                    <td className="px-4 py-3">
                      {formatRequirement(course.requirement)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
