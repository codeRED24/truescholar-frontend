import { redirect } from "next/navigation";

interface ProfileUserAliasPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ProfileUserAliasPage({
  params,
}: ProfileUserAliasPageProps) {
  const { userId: identifier } = await params;
  redirect(`/feed/profile/${identifier}`);
}
