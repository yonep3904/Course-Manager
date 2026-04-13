import { CoursePlanner } from "@/app/components/course-planner";
import { programs } from "@/app/data/programs";

export default function Page() {
  const program = programs["electrical-engineering"];

  return (
    <CoursePlanner
      name={program.name}
      description={program.description}
      courses={program.courses}
      slug={program.slug}
      programs={Object.values(programs).map((p) => ({
        name: p.shortName,
        href: p.href,
        slug: p.slug,
        theme: p.theme,
      }))}
    />
  );
}
