import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  return <WorkspaceShell moduleId={moduleId} />;
}
