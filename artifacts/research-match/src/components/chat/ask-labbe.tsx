import { useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
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

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: { sourceId: string; title: string; sourceUrl?: string }[];
  cards?: ChatCard[];
};

const STARTERS = [
  "Which labs work on machine learning and healthcare?",
  "I know Python — what can I do with it?",
  "Anything accepting interest this term with flexible hours?",
];

// Conversational assistant over the lab catalog: refined questions ranked by
// vector search + BM25, answered with the retrieved labs as context.
export function AskLabbe() {
  const ask = useAction(api.chat.ask);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const result = await ask({
        question: trimmed,
        history: history.slice(-6),
      });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.reply,
          sources: result.sources.filter((s) => s.title),
          cards: result.cards,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error && !err.message.includes("Uncaught")
          ? err.message
          : "The assistant couldn't respond. Try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <PageHeader eyebrow="Ask LABBE" title="Your research assistant">
        Ask anything about USC research — answers are grounded in the live
        catalog with sources.
      </PageHeader>
      <div className="px-5 pb-12 md:px-10">
      <div className="flex h-[calc(100dvh-420px)] min-h-[420px] flex-col border border-primary/20 bg-card">
      <div className="flex items-center gap-2 border-b border-primary/15 px-5 py-4">
        <Sparkles className="text-chart-2" size={18} />
        <h2 className="font-display text-xl">Ask LABBE</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          AI over {82}+ USC labs
        </span>
        {messages.length > 0 && (
          <button
            aria-label="Clear conversation"
            onClick={() => {
              setMessages([]);
              setError("");
            }}
            className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={13} /> New chat
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
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
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[85%] px-4 py-3 text-sm leading-relaxed",
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "border border-primary/15 bg-background",
            )}
          >
            {message.content && (
              <p className="whitespace-pre-line">{message.content}</p>
            )}
            {message.cards && message.cards.length > 0 && (
              <div className={cn("mt-3 space-y-2", message.role === "user" && "mt-0")}>
                {message.cards.map((card) => (
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
                {message.sources.map((source) => (
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
        {busy && (
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
          className="h-11 flex-1 border border-primary/25 bg-background px-4 text-sm outline-none focus:border-primary/50"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          aria-label="Send question"
          className="grid h-11 w-11 place-items-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <CornerDownLeft size={17} />
        </button>
      </form>
      </div>
      </div>
    </Layout>
  );
}
