import type { Metadata } from "next";
import ProjectManager from "@/components/admin/ProjectManager";
import PageHeader from "@/components/dash/PageHeader";
import { listProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjects() {
  const projects = await listProjects();
  return (
    <>
      <PageHeader
        title="Projects"
        description="The work shown on your portfolio. Featured projects lead the homepage."
      />
      <ProjectManager projects={projects} />
    </>
  );
}
