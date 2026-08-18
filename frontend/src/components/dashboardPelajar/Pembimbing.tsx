"use client";

import { useState } from "react";
import { GraduationCap, Star, BookOpen, Users, Search, MessageCircle, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/dashboardPelajar/DashboardLayout";

type Category = "semua" | "programming" | "design" | "bahasa";

const MENTORS = [
  {
    id: 1,
    name: "Kak Ariel Saputra",
    title: "Senior Web Developer",
    category: "programming",
    specialties: ["HTML/CSS", "JavaScript", "React"],
    rating: 4.9,
    students: 1240,
    courses: 3,
    bio: "10+ tahun pengalaman di industri web. Mantan engineer di startup teknologi terkemuka, kini berdedikasi mendidik generasi developer baru.",
    avatar: "A",
    color: "from-[#008be3] to-[#0063A7]",
    badge: "⭐ Top Rated",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    id: 2,
    name: "Kak Dina Fitriani",
    title: "Full-Stack Engineer",
    category: "programming",
    specialties: ["Next.js", "TypeScript", "Node.js"],
    rating: 4.8,
    students: 980,
    courses: 2,
    bio: "Full-stack engineer dengan passion mengajar. Alumni Teknik Informatika yang kini membantu ratusan siswa menguasai framework modern.",
    avatar: "D",
    color: "from-purple-400 to-purple-600",
    badge: "🔥 Populer",
    badgeColor: "bg-orange-50 text-orange-500 border-orange-200",
  },
  {
    id: 3,
    name: "Kak Sekar Ayu",
    title: "UI/UX Designer",
    category: "design",
    specialties: ["Figma", "UI Design", "Prototyping"],
    rating: 4.9,
    students: 860,
    courses: 2,
    bio: "Designer berpengalaman di agensi internasional. Membawa perspektif human-centered design ke setiap materi yang diajarkan.",
    avatar: "S",
    color: "from-emerald-400 to-emerald-600",
    badge: "✨ Featured",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    id: 4,
    name: "Kak Mira Lestari",
    title: "English Coach",
    category: "bahasa",
    specialties: ["TOEFL", "Conversation", "Business English"],
    rating: 4.7,
    students: 1560,
    courses: 1,
    bio: "Certified TEFL instructor dengan pengalaman 8 tahun. Membantu ratusan siswa meraih skor TOEFL impian dan karir internasional.",
    avatar: "M",
    color: "from-rose-400 to-rose-600",
    badge: "🌟 Best Seller",
    badgeColor: "bg-rose-50 text-rose-500 border-rose-200",
  },
  {
    id: 5,
    name: "Kak Rizal Pratama",
    title: "Backend Engineer",
    category: "programming",
    specialties: ["Python", "Django", "PostgreSQL"],
    rating: 4.6,
    students: 720,
    courses: 2,
    bio: "Backend engineer spesialis Python & database. Pengalaman 7 tahun di perusahaan fintech membuatnya jago mengajarkan sistem yang skalabel.",
    avatar: "R",
    color: "from-indigo-400 to-indigo-600",
    badge: null,
    badgeColor: "",
  },
  {
    id: 6,
    name: "Kak Nadia Putri",
    title: "Product Designer",
    category: "design",
    specialties: ["UX Research", "Design System", "Motion"],
    rating: 4.8,
    students: 540,
    courses: 1,
    bio: "Product designer di perusahaan SaaS global. Keahliannya dalam UX research dan design system membantu siswa berpikir seperti desainer profesional.",
    avatar: "N",
    color: "from-pink-400 to-pink-600",
    badge: "🆕 Baru",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  semua: "Semua",
  programming: "Programming",
  design: "Design",
  bahasa: "Bahasa",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
        />
      ))}
    </div>
  );
}

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function PembimbingComponent() {
  const [category, setCategory] = useState<Category>("semua");
  const [search, setSearch] = useState("");

  const filtered = MENTORS.filter((m) => {
    const matchCat = category === "semua" || m.category === category;
    const matchSearch =
      search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <DashboardLayout searchPlaceholder="Cari pembimbing...">
      <main className="px-4 md:px-8 py-4 md:py-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-white" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Pembimbing</h1>
          </div>
          <p className="text-sm text-white/70">Belajar langsung dari para ahli di bidangnya</p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau keahlian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white text-sm text-slate-700 placeholder-slate-400 outline-none shadow-sm focus:ring-2 focus:ring-[#008be3]/30"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  category === cat
                    ? "bg-white text-[#008be3] shadow-md"
                    : "bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Mentor Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-10 h-10 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">Tidak ada pembimbing yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
              >
                {/* Card top gradient + avatar */}
                <div className={`relative h-28 bg-gradient-to-br ${mentor.color} flex items-center justify-center`}>
                  {/* Dot pattern */}
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />

                  <div className="relative w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg">
                    <span className="text-3xl font-extrabold text-white">{mentor.avatar}</span>
                  </div>

                  {/* Badge */}
                  {mentor.badge && (
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border ${mentor.badgeColor}`}>
                      {mentor.badge}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <h3 className="text-sm font-extrabold text-[#00172e] leading-tight">{mentor.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{mentor.title}</p>
                  </div>

                  {/* Rating + stats */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={mentor.rating} />
                      <span className="text-[11px] font-bold text-amber-500">{mentor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Users className="w-3 h-3" />
                      <span>{formatNumber(mentor.students)} siswa</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <BookOpen className="w-3 h-3" />
                      <span>{mentor.courses} kursus</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-3 flex-1">
                    {mentor.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mentor.specialties.map((sp) => (
                      <span key={sp} className="text-[10px] font-semibold bg-[#f0f7ff] text-[#008be3] px-2 py-0.5 rounded-full border border-[#008be3]/20">
                        {sp}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button className="flex-1 flex items-center justify-center gap-1.5 bg-[#008be3] hover:bg-[#0078c8] text-white text-xs font-bold py-2 rounded-xl transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Hubungi
                    </button>
                    <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
