"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { AiChatResponse, courseService } from "@/services/courseService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getActiveMascotInfo, MascotInfo } from "@/lib/mascotNames";

type ChatItem = { role: "user" | "assistant"; content: string; time: string };

function sanitizeLatex(text: string): string {
  if (!text) return "";
  let clean = text;

  // 1. Remove slash wrappers like /\frac{a}{b}/ or /\dfrac{a}{b}/
  clean = clean.replace(/\/+(\\[a-zA-Z]+(\{[^{}]*\}\s*)+)\/+/g, "$1");

  // 2. Normalize \dfrac and \tfrac to \frac
  clean = clean.replace(/\\(d?frac|tfrac)/g, "\\frac");

  // 3. Normalize block math delimiters \[ ... \] to $$ ... $$
  clean = clean.replace(/\\\[([\s\S]*?)\\\]/g, "\n$$\n$1\n$$\n");

  // 4. Normalize inline math delimiters \( ... \) to $ ... $
  clean = clean.replace(/\\\(([\s\S]*?)\\\)/g, " $$1$ ");

  // 5. Replace comprehensive LaTeX math symbols, operators, Greek letters, and units
  const replacements: Array<[RegExp, string]> = [
    // Operators & Relations
    [/\\times/g, "×"],
    [/\\cdot/g, "·"],
    [/\\div/g, "÷"],
    [/\\pm/g, "±"],
    [/\\mp/g, "∓"],
    [/\\le(q)?\b/g, "≤"],
    [/\\ge(q)?\b/g, "≥"],
    [/\\neq\b/g, "≠"],
    [/\\approx\b/g, "≈"],
    [/\\equiv\b/g, "≡"],
    [/\\propto\b/g, "∝"],
    [/\\infty\b/g, "∞"],
    [/\\partial\b/g, "∂"],
    [/\\nabla\b/g, "∇"],
    [/\\sum\b/g, "∑"],
    [/\\prod\b/g, "∏"],
    [/\\int\b/g, "∫"],
    [/\\iint\b/g, "∬"],
    [/\\iiint\b/g, "∭"],

    // Greek Alphabet (Lower & Upper)
    [/\\alpha\b/g, "α"],
    [/\\beta\b/g, "β"],
    [/\\gamma\b/g, "γ"],
    [/\\delta\b/g, "δ"],
    [/\\epsilon\b/g, "ε"],
    [/\\zeta\b/g, "ζ"],
    [/\\eta\b/g, "η"],
    [/\\theta\b/g, "θ"],
    [/\\iota\b/g, "ι"],
    [/\\kappa\b/g, "κ"],
    [/\\lambda\b/g, "λ"],
    [/\\mu\b/g, "μ"],
    [/\\nu\b/g, "ν"],
    [/\\xi\b/g, "ξ"],
    [/\\pi\b/g, "π"],
    [/\\rho\b/g, "ρ"],
    [/\\sigma\b/g, "σ"],
    [/\\tau\b/g, "τ"],
    [/\\phi\b/g, "φ"],
    [/\\chi\b/g, "χ"],
    [/\\psi\b/g, "ψ"],
    [/\\omega\b/g, "ω"],
    [/\\Delta\b/g, "Δ"],
    [/\\Gamma\b/g, "Γ"],
    [/\\Theta\b/g, "Θ"],
    [/\\Lambda\b/g, "Λ"],
    [/\\Xi\b/g, "Ξ"],
    [/\\Pi\b/g, "Π"],
    [/\\Sigma\b/g, "Σ"],
    [/\\Phi\b/g, "Φ"],
    [/\\Psi\b/g, "Ψ"],
    [/\\Omega\b/g, "Ω"],

    // Roots & Accents
    [/\\sqrt\{([^}]+)\}/g, "√($1)"],
    [/\\sqrt\s*([0-9a-zA-Z]+)/g, "√$1"],
    [/\\text\{([^}]+)\}/g, "$1"],
    [/\\mathrm\{([^}]+)\}/g, "$1"],
    [/\\mathbf\{([^}]+)\}/g, "$1"],
    [/\\vec\{([^}]+)\}/g, "$1⃗"],
    [/\\hat\{([^}]+)\}/g, "$1̂"],

    // Formatting & Spacing
    [/\\,/g, " "],
    [/\\;/g, " "],
    [/\\:/g, " "],
    [/\\!/g, ""],
    [/\\/g, ""], // remove any remaining rogue backslashes before math words

    // Common Scientific & Engineering Units & Variable Subscripts
    [/F_b\b/g, "F<sub>b</sub>"],
    [/F_d\b/g, "F<sub>d</sub>"],
    [/C_d\b/g, "C<sub>d</sub>"],
    [/v2\b/g, "v<sup>2</sup>"],
    [/m3\b/g, "m<sup>3</sup>"],
    [/m2\b/g, "m<sup>2</sup>"],
    [/s2\b/g, "s<sup>2</sup>"],
    [/kg\/m3\b/g, "kg/m<sup>3</sup>"],
    [/kg\/m2\b/g, "kg/m<sup>2</sup>"],
    [/m\/s2\b/g, "m/s<sup>2</sup>"],
    [/m\/s\^2\b/g, "m/s<sup>2</sup>"],
    [/m\^3\b/g, "m<sup>3</sup>"],
    [/m\^2\b/g, "m<sup>2</sup>"],
    [/cm\^2\b/g, "cm<sup>2</sup>"],
    [/cm\^3\b/g, "cm<sup>3</sup>"],
    [/N\/m\^2\b/g, "N/m<sup>2</sup>"],
  ];

  for (const [pattern, replacement] of replacements) {
    clean = clean.replace(pattern, replacement);
  }

  return clean;
}

function applyAiBranding(content: string, mascotName: string) {
  const sanitized = sanitizeLatex(content);
  return sanitized
    .replace(/Qwen\s*3\.7/gi, mascotName)
    .replace(/Qwen/gi, mascotName)
    .replace(/EduWave\s*AI/gi, mascotName);
}

function renderInline(value: string): ReactNode[] {
  // Replace subscript expressions like Berat_{total}, Gaya_{apung}, R_{kabel}, \rho_{resistivitas}
  const cleanSubscripts = value.replace(/([a-zA-Z0-9α-ωΑ-Ω]+)_\{([^}]+)\}/g, "$1<sub>$2</sub>");

  const tokenPattern = /(\\frac\s*\{[^{}]*\}\s*\{[^{}]*\}|\$[^$]+\$|\*\*[^*]+\*\*|__[^_]+__|(?<!\w)\*[^*]+\*(?!\w)|(?<!\w)_[^_]+_(?!\w))/g;
  const parts = cleanSubscripts.split(tokenPattern);

  return parts.filter(Boolean).map((part, index) => {
    const fractionMatch = part.match(/^\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}$/);
    if (fractionMatch) {
      return (
        <span key={index} className="mx-1 inline-flex flex-col items-center align-middle text-[0.9em] leading-none text-slate-800">
          <span className="border-b border-slate-600 px-1 pb-0.5 font-medium">{renderInline(fractionMatch[1])}</span>
          <span className="px-1 pt-0.5 font-medium">{renderInline(fractionMatch[2])}</span>
        </span>
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      const math = part.slice(1, -1);
      return <span key={index} className="mx-0.5 font-serif italic text-[1.05em]">{renderMath(math)}</span>;
    }
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index} className="font-bold">{renderInline(part.slice(2, -2))}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{renderInline(part.slice(1, -1))}</em>;
    }
    if (part.includes("<sub>")) {
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    }
    return <span key={index}>{part}</span>;
  });
}

function renderMath(value: string): ReactNode[] {
  const parts = value.split(/(\\frac\s*\{[^{}]*\}\s*\{[^{}]*\})/g).filter(Boolean);
  return parts.map((part, index) => {
    const fractionMatch = part.match(/^\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}$/);
    if (!fractionMatch) {
      const expClean = part.replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>").replace(/\^([0-9a-zA-Z]+)/g, "<sup>$1</sup>");
      return <span key={index} dangerouslySetInnerHTML={{ __html: expClean }} />;
    }
    return (
      <span key={index} className="mx-1 inline-flex flex-col items-center align-middle not-italic text-[0.9em] leading-none">
        <span className="border-b border-current px-1 pb-0.5">{fractionMatch[1]}</span>
        <span className="px-1 pt-0.5">{fractionMatch[2]}</span>
      </span>
    );
  });
}

function renderAiMessage(content: string) {
  const lines = content.split("\n");
  const rendered: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed === "---" || trimmed === "***") {
      rendered.push(<hr key={index} className="my-3 border-slate-200" />);
    } else if (trimmed.startsWith("$$")) {
      const mathLines: string[] = [];
      const first = trimmed.slice(2);
      if (first.endsWith("$$")) {
        mathLines.push(first.slice(0, -2));
      } else {
        if (first) mathLines.push(first);
        index += 1;
        while (index < lines.length && !lines[index].trim().endsWith("$$")) {
          mathLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) mathLines.push(lines[index].trim().slice(0, -2));
      }
      rendered.push(
        <div key={index} className="my-3 overflow-x-auto rounded-xl bg-slate-50 p-3 text-center font-serif text-sm text-slate-800">
          {renderMath(mathLines.join(" "))}
        </div>
      );
    } else {
      // Check for standalone stacked fraction patterns in plain text like:
      // V =
      // 147.15
      // 1025 × 9.81
      // or:
      // Massa_{tambahan} =
      // 13.73 N
      // 9.81 m/s^2
      const isNextLineFraction =
        index + 2 < lines.length &&
        (trimmed.endsWith("=") || trimmed.includes("=")) &&
        lines[index + 1].trim() !== "" &&
        lines[index + 2].trim() !== "" &&
        !lines[index + 1].trim().startsWith("#") &&
        !lines[index + 2].trim().startsWith("#") &&
        !lines[index + 1].trim().startsWith("-") &&
        !lines[index + 2].trim().startsWith("-");

      if (isNextLineFraction) {
        const prefix = trimmed;
        const numerator = lines[index + 1].trim();
        const denominator = lines[index + 2].trim();

        // Ensure numerator & denominator look like math numbers/expressions
        if (numerator.length < 40 && denominator.length < 40) {
          rendered.push(
            <div key={index} className="my-2 flex items-center gap-2 font-medium">
              <span>{prefix}</span>
              <span className="inline-flex flex-col items-center align-middle text-[0.9em] leading-none text-slate-800">
                <span className="border-b border-slate-600 px-1 pb-0.5 font-bold">{renderInline(numerator)}</span>
                <span className="px-1 pt-0.5 font-bold">{renderInline(denominator)}</span>
              </span>
            </div>
          );
          index += 3;
          continue;
        }
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
      const numbered = line.match(/^\s*(\d+)\.\s+(.+)$/);
      const quote = line.match(/^\s*>\s?(.+)$/);

      if (heading) {
        const level = heading[1].length;
        const className = level <= 2 ? "mt-3 text-base font-extrabold text-[#00172e]" : "mt-2 text-sm font-extrabold text-[#00172e]";
        rendered.push(<span key={index} className={`block min-h-[1.25em] ${className}`}>{renderInline(heading[2])}</span>);
      } else if (bullet) {
        rendered.push(<span key={index} className="block min-h-[1.25em] pl-3 before:mr-2 before:content-['•']">{renderInline(bullet[1])}</span>);
      } else if (numbered) {
        rendered.push(<span key={index} className="block min-h-[1.25em] pl-3"><strong>{numbered[1]}.</strong> {renderInline(numbered[2])}</span>);
      } else if (quote) {
        rendered.push(<span key={index} className="my-1 block border-l-2 border-[#008be3] pl-3 italic text-slate-500">{renderInline(quote[1])}</span>);
      } else {
        rendered.push(<span key={index} className="block min-h-[1.25em]">{renderInline(line)}</span>);
      }
    }
    index += 1;
  }
  return rendered;
}

function getCurrentTimeStr(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}.${mm}`;
}

export default function AiChat({ courseId, lessonId }: { courseId?: string; lessonId?: string }) {
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mascot, setMascot] = useState<MascotInfo>({ name: "Quli", avatarUrl: "/quli-maskot.webp" });
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMascot(getActiveMascotInfo());
    const handleUpdate = () => setMascot(getActiveMascotInfo());
    window.addEventListener("active_mascot_updated", handleUpdate);
    return () => window.removeEventListener("active_mascot_updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (open) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  const userName = user?.full_name || "Pelajar";
  const userAvatar = user?.avatar_url || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;
    if (message.length > 4000) {
      setError("Pertanyaan maksimal 4.000 karakter.");
      return;
    }
    setError("");
    setDraft("");
    const timeNow = getCurrentTimeStr();
    setMessages((current) => [...current, { role: "user", content: message, time: timeNow }]);
    setLoading(true);

    try {
      const response = await courseService.sendAiChat({
        message,
        course_context_id: courseId,
        lesson_context_id: lessonId,
        conversation_id: conversationId,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "AI tidak tersedia.");
      }
      const data: AiChatResponse = response.data;
      setConversationId(data.conversation_id || conversationId);
      const brandedResponse = applyAiBranding(data.message, mascot.name);
      setMessages((current) => [...current, { role: "assistant", content: brandedResponse, time: getCurrentTimeStr() }]);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: { code?: string; message?: string } } } };
      const apiMessage = apiError.response?.data?.error?.message;
      setError(
        apiError.response?.data?.error?.code === "AI_SERVICE_UNAVAILABLE"
          ? "AI sedang tidak tersedia. Coba lagi nanti."
          : apiMessage || (err instanceof Error ? err.message : "AI tidak tersedia. Coba lagi nanti.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-5 z-30 flex items-center gap-2 rounded-full bg-[#008be3] px-4 py-3 text-xs font-extrabold text-white shadow-xl shadow-blue-900/20 hover:bg-[#0078c8] transition-all"
        >
          <Sparkles className="h-4 w-4" /> Tanya {mascot.name}
        </button>
      )}

      {open && (
        <section className="fixed bottom-5 right-5 z-40 flex h-[min(620px,calc(100vh-2rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
          {/* Header */}
          <header className="flex items-center justify-between bg-[#00172e] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                <Image src={mascot.avatarUrl} alt={mascot.name} fill className="object-contain p-1" />
              </div>
              <div>
                <p className="font-extrabold text-sm">{mascot.name}</p>
                <p className="text-[10px] text-white/60">Teman belajar EduWave</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Tutup AI Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Messages Container (Original Light Theme) */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.length === 0 && (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm border border-slate-100">
                <p className="font-bold text-[#00172e]">Hai, aku {mascot.name}! 👋</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Butuh bantuan memahami materi ini? Tanyakan rumusan, penjelasan, atau contoh langsung ke aku!
                </p>
              </div>
            )}

            {messages.map((item, index) => {
              const isUser = item.role === "user";
              return (
                <div key={`${item.role}-${index}`} className="flex flex-col gap-0.5">
                  {/* Sender Header Name + Timestamp (as in Image 1) */}
                  <div className={`flex items-center gap-2 text-[11px] font-semibold ${isUser ? "justify-end text-slate-600" : "justify-start text-slate-600"}`}>
                    {!isUser && <span className="font-extrabold text-[#008be3]">{mascot.name}</span>}
                    {isUser && <span className="font-extrabold text-slate-700">{userName}</span>}
                    <span className="text-[10px] text-slate-400 font-normal">{item.time}</span>
                  </div>

                  {/* Message Row with Profile Avatar */}
                  <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        <Image src={mascot.avatarUrl} alt={mascot.name} fill className="object-contain p-0.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
                        isUser
                          ? "bg-[#008be3] text-white shadow-sm rounded-br-none"
                          : "bg-white text-slate-700 shadow-sm rounded-bl-none border border-slate-100"
                      }`}
                    >
                      {isUser ? item.content : renderAiMessage(item.content)}
                    </div>

                    {isUser && (
                      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-200 bg-[#008be3] font-bold text-white text-xs shadow-sm">
                        {userAvatar ? (
                          <Image src={userAvatar} alt={userName} fill className="object-cover" />
                        ) : (
                          <span>{userInitial}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-1">
                <Loader2 className="h-4 w-4 animate-spin text-[#008be3]" /> {mascot.name} sedang berpikir...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {error && <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{error}</p>}

          {/* Form Input */}
          <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (draft.trim() && !loading) {
                    event.currentTarget.form?.requestSubmit();
                  }
                }
              }}
              maxLength={4000}
              rows={2}
              placeholder={`Tanyakan sesuatu ke ${mascot.name}...`}
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#008be3]"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{draft.length}/4000</span>
              <button
                type="submit"
                disabled={!draft.trim() || loading}
                className="flex items-center gap-1.5 rounded-xl bg-[#008be3] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#0078c8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" /> Kirim
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
