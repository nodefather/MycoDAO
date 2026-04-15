"use client";

import { useParams } from "next/navigation";
import { usePulse } from "@/lib/pulse-provider";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function LearnDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { learn } = usePulse();
  const lesson = learn.find((m) => m.id === id);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-stone-500">Lesson not found.</p>
        <Link href="/pulse/learn" className="text-stone-400 hover:text-stone-300 text-sm mt-2 inline-block">
          ← Back to Learn
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/pulse/learn" className="text-xs text-stone-500 hover:text-stone-300 mb-4 inline-block">
        ← Learn
      </Link>
      <article>
        <h1 className="text-xl font-bold text-stone-100">{lesson.title}</h1>
        <div className="flex gap-2 text-xs text-stone-500 mt-2">
          <span className="capitalize">{lesson.level}</span>
          <span>·</span>
          <span>{lesson.readingTimeMin} min</span>
        </div>
        <p className="text-sm text-stone-400 mt-4">{lesson.summary}</p>
        <div className="mt-6 prose prose-invert prose-sm max-w-none prose-p:text-stone-300 prose-headings:text-stone-100 prose-a:text-amber-400">
          <ReactMarkdown>{lesson.contentMd}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
