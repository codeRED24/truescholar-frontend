import { redirect } from "next/navigation";

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const collegeId = Number(match[2]);
  return isNaN(collegeId) ? null : { collegeId, slug: match[1] };
};

export default async function Eligibility(props: {
  params: Promise<{ "slug-id": string }>;
}) {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return redirect("/");

  const { collegeId } = parsed;
  const baseSlug = parsed.slug?.replace(/(?:-\d+)+$/, "") || "";
  const correctSlugId = `${baseSlug}-${collegeId}`;

  if (slugId !== correctSlugId) {
    return redirect(`/colleges/${correctSlugId}`);
  }

  return redirect(`/colleges/${correctSlugId}`);
}
