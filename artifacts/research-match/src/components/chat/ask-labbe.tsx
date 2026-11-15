import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  CornerDownLeft,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { api } from "@/lib/convex-api";
import { Layout, PageHeader } from "@/components/layout";
import { InterestButton, SaveButton } from "@/components/bits";
import { cn } from "@/lib/utils";

type ChatCard = {
  sourceId: string;
  title: string;
  department: string;
  faculty: string;
  summary: string;
  open: boolean;
};

type ChatMessage = {
  _id: string;
  isViewer: boolean;
  text: string;
  streaming?: boolean;
  sources?: { sourceId: string; title: string; sourceUrl?: string }[];
  cards?: ChatCard[];
};

function renderMarkdown(text: string) {
  const blocks: { type: "text" | "li"; runs: { text: string; bold: boolean }[] }[] =
    [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    const isBullet = /^[-*•]\s+/.test(line);
    const content = isBullet ? line.replace(/^[-*•]\s+/, "") : line;
    if (!content && !isBullet) continue;
    const runs = content
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((part) => ({
        text: part.replace(/\*\*/g, ""),
        bold: part.startsWith("**") && part.endsWith("**"),
      }));
    blocks.push({ type: isBullet ? "li" : "text", runs });
  }
  return (
    <>
      {blocks.map((block, index) =>
        block.type === "li" ? (
          <p key={index} className="flex gap-2">
            <span className="text-primary">•</span>
            <span>
              {block.runs.map((run, runIndex) => (
                <span key={runIndex} className={run.bold ? "font-semibold" : ""}>
                  {run.text}
                </span>
              ))}
            </span>
          </p>
        ) : (
          <p key={index}>
            {block.runs.map((run, runIndex) => (
              <span key={runIndex} className={run.bold ? "font-semibold" : ""}>
                {run.text}
              </span>
            ))}
          </p>
        ),
      )}
    </>
  );
}

const STARTERS = [
  "Which labs work on machine learning and healthcare?",
  "I know Python — what can I do with it?",
  "Anything accepting interest this term with flexible hours?",
];

// Conversational assistant over the lab catalog: refined questions ranked by
// vector search + BM25, answered with the retrieved labs as context.
export function AskLabbe() {
  const messages = useQuery(api.chat.myMessages, {});
  const sendQuestion = useMutation(api.chat.send);
  const clearChat = useMutation(api.chat.clear);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const loaded = messages ?? [];
  const ordered = loaded
    .slice()
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  const streaming = ordered.some((message) => message.streaming);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [ordered.length, streaming, ordered.at(-1)?.text]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError("");
    try {
      await sendQuestion({ question: trimmed });
      setDraft("");
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("Uncaught")
          ? "The assistant couldn't respond. Try again shortly."
          : err instanceof Error
            ? err.message
            : "The assistant couldn't respond. Try again shortly.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <PageHeader eyebrow="Ask LABBE" title="Your research assistant">
        Ask anything about USC research — answers are grounded in the live
        catalog with sources.
      </PageHeader>
      <div className="px-5 pb-12 md:px-10">
      <div className="flex h-[calc(100dvh-330px)] min-h-[560px] flex-col border border-primary/20 bg-card">
      <div className="flex items-center gap-2 border-b border-primary/15 px-5 py-4">
        <Sparkles className="text-chart-2" size={18} />
        <h2 className="font-display text-xl">Ask LABBE</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          AI over {82}+ USC labs
        </span>
        {loaded.length > 0 && (
          <button
            aria-label="Clear conversation"
            onClick={() => {
              void clearChat({});
              setError("");
            }}
            className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={13} /> New chat
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {ordered.length === 0 && (
          <div className="space-y-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ask anything about USC research — refined queries get the best
              matches.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => void send(starter)}
                  className="border border-primary/25 px-3 py-2 text-xs text-primary hover:bg-primary/5"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}
        {ordered.map((message) => (
          <div
            key={message._id}
            className={cn(
              "max-w-[85%] px-4 py-3 text-sm leading-relaxed",
              message.isViewer
                ? "ml-auto bg-primary text-primary-foreground"
                : "border border-primary/15 bg-background",
            )}
          >
            {message.streaming && (
              <span className="mr-1 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle" />
            )}
            <div className="space-y-1.5">{renderMarkdown(message.text)}</div>
            {message.cards && message.cards.length > 0 && (
              <div className={cn("mt-3 space-y-2", message.role === "user" && "mt-0")}>
                {(message.cards ?? []).map((card: ChatCard) => (
                  <div
                    key={card.sourceId}
                    data-testid={`chat-card-${card.sourceId}`}
                    className="border border-primary/15 bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base leading-snug">{card.title}</h3>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {card.department} · {card.faculty}
                        </p>
                      </div>
                      <SaveButton id={card.sourceId} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {card.summary}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <InterestButton projectId={card.sourceId} open={card.open} />
                      <span
                        className={
                          card.open
                            ? "bg-chart-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-accent-foreground"
                            : "border border-primary/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground"
                        }
                      >
                        {card.open ? "recruiting" : "inquire"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-primary/10 pt-3">
                {(message.sources ?? []).map((source: { sourceId: string; title: string; sourceUrl?: string }) => (
                  <span
                    key={source.sourceId}
                    className="inline-flex items-center gap-1 border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] text-primary"
                  >
                    {source.title.slice(0, 40)}
                    {source.sourceUrl && (
                      <a
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${source.title}`}
                        className="hover:opacity-70"
                      >
                        <ArrowUpRight size={11} />
                      </a>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {(streaming || sending) && (
          <div
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
            role="status"
          >
            <LoaderCircle className="animate-spin" size={14} /> Searching labs
            and thinking…
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-primary/15 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about labs, skills, hours — anything research"
          className="min-h-14 flex-1 border border-primary/25 bg-background px-4 py-3 text-[15px] outline-none focus:border-primary/50"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send question"
          className="grid h-14 w-14 place-items-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <CornerDownLeft size={17} />
        </button>
      </form>
      </div>
      </div>
    </Layout>
  );
}
