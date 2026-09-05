"use client";

import { useRef, useState, useMemo } from "react";
import { marked } from "marked";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Code, Code2, List, ListOrdered, Quote, Minus,
  Eye, Pencil, HelpCircle, X,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const GUIDE = [
  { syntax: "# Judul 1", desc: "Heading besar" },
  { syntax: "## Judul 2", desc: "Heading sedang" },
  { syntax: "### Judul 3", desc: "Heading kecil" },
  { syntax: "**teks**", desc: "Teks tebal" },
  { syntax: "*teks*", desc: "Teks miring" },
  { syntax: "`kode`", desc: "Kode inline" },
  { syntax: "```bash\nkode\n```", desc: "Blok kode" },
  { syntax: "- item", desc: "List bullet" },
  { syntax: "1. item", desc: "List nomor" },
  { syntax: "> teks", desc: "Blockquote / kutipan" },
  { syntax: "---", desc: "Garis pemisah" },
  { syntax: "| A | B |\n|---|---|\n| 1 | 2 |", desc: "Tabel" },
];

type ToolbarAction = {
  icon: React.ReactNode;
  label: string;
  action: (sel: string) => { text: string; offset: number };
};

const TOOLBAR: ToolbarAction[] = [
  {
    icon: <Heading1 className="w-3.5 h-3.5" />, label: "H1",
    action: (sel) => ({ text: `# ${sel || "Judul"}`, offset: 2 }),
  },
  {
    icon: <Heading2 className="w-3.5 h-3.5" />, label: "H2",
    action: (sel) => ({ text: `## ${sel || "Judul"}`, offset: 3 }),
  },
  {
    icon: <Heading3 className="w-3.5 h-3.5" />, label: "H3",
    action: (sel) => ({ text: `### ${sel || "Judul"}`, offset: 4 }),
  },
  { icon: <span className="w-px h-4 bg-slate-300 mx-0.5 inline-block" />, label: "|", action: (s) => ({ text: s, offset: 0 }) },
  {
    icon: <Bold className="w-3.5 h-3.5" />, label: "Bold",
    action: (sel) => ({ text: `**${sel || "teks"}**`, offset: 2 }),
  },
  {
    icon: <Italic className="w-3.5 h-3.5" />, label: "Italic",
    action: (sel) => ({ text: `*${sel || "teks"}*`, offset: 1 }),
  },
  { icon: <span className="w-px h-4 bg-slate-300 mx-0.5 inline-block" />, label: "|", action: (s) => ({ text: s, offset: 0 }) },
  {
    icon: <Code className="w-3.5 h-3.5" />, label: "Inline Code",
    action: (sel) => ({ text: `\`${sel || "kode"}\``, offset: 1 }),
  },
  {
    icon: <Code2 className="w-3.5 h-3.5" />, label: "Blok Kode",
    action: (sel) => ({ text: `\`\`\`bash\n${sel || "kode di sini"}\n\`\`\``, offset: 7 }),
  },
  { icon: <span className="w-px h-4 bg-slate-300 mx-0.5 inline-block" />, label: "|", action: (s) => ({ text: s, offset: 0 }) },
  {
    icon: <List className="w-3.5 h-3.5" />, label: "Bullet List",
    action: (sel) => ({ text: `- ${sel || "item"}`, offset: 2 }),
  },
  {
    icon: <ListOrdered className="w-3.5 h-3.5" />, label: "Numbered List",
    action: (sel) => ({ text: `1. ${sel || "item"}`, offset: 3 }),
  },
  {
    icon: <Quote className="w-3.5 h-3.5" />, label: "Blockquote",
    action: (sel) => ({ text: `> ${sel || "kutipan"}`, offset: 2 }),
  },
  {
    icon: <Minus className="w-3.5 h-3.5" />, label: "Garis Pemisah",
    action: () => ({ text: "\n---\n", offset: 5 }),
  },
];

export default function LessonContentEditor({ value, onChange, placeholder }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [showGuide, setShowGuide] = useState(false);

  const preview = useMemo(() => marked.parse(value || "") as string, [value]);

  function applyToolbar(action: ToolbarAction["action"]) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end);
    const { text, offset } = action(sel);
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = sel ? start + text.length : start + offset + (sel || "").length;
      ta.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-400 transition-all">
      {/* Header: tabs + buttons */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${tab === "edit" ? "bg-[#0073e6] text-white" : "text-slate-500 hover:bg-slate-200"}`}
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${tab === "preview" ? "bg-[#0073e6] text-white" : "text-slate-500 hover:bg-slate-200"}`}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Panduan Markdown
        </button>
      </div>

      {/* Toolbar (only in edit tab) */}
      {tab === "edit" && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-white border-b border-slate-100">
          {TOOLBAR.map((tool, i) =>
            tool.label === "|" ? (
              <span key={i} className="w-px h-4 bg-slate-200 mx-1 inline-block" />
            ) : (
              <button
                key={i}
                type="button"
                title={tool.label}
                onClick={() => applyToolbar(tool.action)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                {tool.icon}
              </button>
            )
          )}
        </div>
      )}

      {/* Edit textarea */}
      {tab === "edit" && (
        <textarea
          ref={textareaRef}
          rows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Tulis konten lesson menggunakan Markdown..."}
          className="w-full px-4 py-3 text-sm text-slate-700 font-mono outline-none resize-y bg-white"
        />
      )}

      {/* Preview */}
      {tab === "preview" && (
        <div className="px-4 py-3 min-h-[200px] bg-white">
          {value ? (
            <div className="lesson-prose" dangerouslySetInnerHTML={{ __html: preview }} />
          ) : (
            <p className="text-slate-400 text-sm italic">Belum ada konten untuk dipreview.</p>
          )}
        </div>
      )}

      {/* Markdown Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#00172e]">Panduan Format Markdown</h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              {GUIDE.map((item) => (
                <div key={item.syntax} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <code className="shrink-0 bg-slate-100 text-[#0073e6] px-2 py-1 rounded-lg text-xs font-mono whitespace-pre leading-relaxed">
                    {item.syntax}
                  </code>
                  <span className="text-sm text-slate-600 pt-1">{item.desc}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <p className="text-xs text-slate-400">Tip: Pilih teks di editor lalu klik tombol toolbar untuk wrap otomatis.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
