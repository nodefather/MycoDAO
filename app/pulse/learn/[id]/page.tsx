"use client";

import { useParams } from "next/navigation";
import { usePulse } from "@/lib/pulse-provider";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { LEARN_TRACK_LABELS } from "@/lib/learn-tracks";

export default function LearnDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { learn } = usePulse();
  const lesson = learn.find((m) => m.id === id);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-stone-500">Lesson not found.</p>
        <Link href="/pulse/learn" className="text-stone-400 hover:text-stone-300 text-sm mt-2 inline-block min-h-[44px]">
          ← Back to Learn
        </Link>
      </div>
    );
  }

  const track = lesson.track ?? "markets-basics";
  const trackLabel = LEARN_TRACK_LABELS[track] ?? track;
  const links = lesson.resourceLinks ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <Link href="/pulse/learn" className="text-xs text-stone-500 hover:text-stone-300 mb-4 inline-block min-h-[44px]">
        ← Learn
      </Link>
      <article>
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-2">
          <span className="rounded bg-stone-800 px-2 py-0.5 text-amber-400/90 border border-stone-600">{trackLabel}</span>
          <span className="capitalize">{lesson.level}</span>
          <span>·</span>
          <span>{lesson.readingTimeMin} min read</span>
        </div>
        <h1 className="text-xl font-bold text-stone-100">{lesson.title}</h1>
        <p className="text-sm text-stone-400 mt-4">{lesson.summary}</p>
        <div className="mt-6 prose prose-invert prose-sm max-w-none prose-p:text-stone-300 prose-headings:text-stone-100 prose-a:text-amber-400">
          <ReactMarkdown>{lesson.contentMd}</ReactMarkdown>
        </div>

        {links.length > 0 && (
          <section className="mt-10 rounded border border-stone-700 bg-stone-900/60 p-4">
            <h2 className="text-sm font-semibold text-stone-200 mb-3">Tools & further reading</h2>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 text-sm underline-offset-2 hover:underline break-all"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-stone-500 mt-3">
              Links are neutral references (standards bodies, regulators, educational publishers). Inclusion is not an endorsement.
            </p>
          </section>
        )}

        <aside className="mt-8 rounded border border-stone-800 bg-stone-950/80 p-4 text-xs text-stone-500 leading-relaxed">
          <strong className="text-stone-400">Disclaimer:</strong> This lesson is for general education only. It is not investment,
          legal, tax, securities, or medical advice. Projects and tokens involve substantial risk; consult qualified professionals and
          applicable regulators before decisions.
        </aside>
      </article>
    </div>
  );
}
