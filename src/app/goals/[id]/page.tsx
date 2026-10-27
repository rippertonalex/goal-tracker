import { getGoalDetail, getThemes } from "@/lib/actions";
import { notFound } from "next/navigation";
import GoalDetailClient from "./GoalDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params;
  const [goal, themes] = await Promise.all([getGoalDetail(id), getThemes()]);

  if (!goal) {
    notFound();
  }

  return (
    <GoalDetailClient
      goal={goal}
      themes={themes.map((theme) => ({ id: theme.id, title: theme.title }))}
    />
  );
}
