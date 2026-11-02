import type { LucideIcon } from 'lucide-react';
import { COMMUNITY_COMING_SOON } from '@/lib/community-content';

export default function CommunityComingSoon({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div role="status" className="rounded-xl border border-dashed border-slate-300 dark:border-[#1A365D] p-12 text-center bg-white/50 dark:bg-[#0C1E38]/50">
      <Icon className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{COMMUNITY_COMING_SOON.title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{message}</p>
    </div>
  );
}
