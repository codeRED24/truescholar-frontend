import { Card, CardContent } from "@/components/ui/card";

interface StatItemProps {
  label: string;
  value: number;
}

const StatItem = ({ label, value }: StatItemProps) => (
  <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors group cursor-pointer">
    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
      {label}
    </span>
    <span className="text-xs font-semibold text-primary">{value}</span>
  </div>
);

export default function StatsCard({
  stats,
}: {
  stats: {
    followers: number;
    posts: number;
    following: number;
  };
}) {
  return (
    <Card className="border border-border shadow-sm bg-card rounded-xl overflow-hidden">
      <CardContent className="p-2">
        <div className="space-y-0.5">
          <StatItem label="Followers" value={stats.followers} />
          <StatItem label="Who viewed your profile" value={stats.posts * 5} />
        </div>
      </CardContent>
    </Card>
  );
}
