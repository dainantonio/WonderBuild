"use client";

import { useMemo, useState } from "react";

type TemplateType = "STORY" | "QUIZ" | "FLASHCARDS" | "MINIGAME";

type Project = {
  id: string;
  templateType: TemplateType;
  title: string;
  dataJson: Record<string, unknown>;
  safetyFlags: string[];
  isShareApproved: boolean;
  shareToken: string | null;
};

const templatePrompts: Record<TemplateType, string[]> = {
  STORY: ["Story title", "Theme", "Reading level", "Hero name", "Scene 1", "Choice A", "Choice B"],
  QUIZ: ["Quiz topic", "Difficulty", "Question", "Choice 1", "Choice 2", "Choice 3", "Correct choice #"],
  FLASHCARDS: ["Subject", "Card 1 front", "Card 1 back", "Card 2 front", "Card 2 back"],
  MINIGAME: ["Theme", "Round duration seconds", "How many taps to win?", "Bonus points"]
};

export function KidBuildStudio({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [templateType, setTemplateType] = useState<TemplateType>("STORY");
  const [answers, setAnswers] = useState<string[]>(Array(7).fill(""));
  const [toast, setToast] = useState<string>("");
  const [parentOpen, setParentOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [ageBand, setAgeBand] = useState("AGE_6_8");
  const [allowedCategories, setAllowedCategories] = useState<string[]>(["math", "reading", "science"]);

  const prompts = useMemo(() => templatePrompts[templateType], [templateType]);

  const templateData = () => {
    if (templateType === "STORY") {
      return {
        title: answers[0] || "My Story",
        theme: answers[1] || "Adventure",
        readingLevel: answers[2] || "Easy",
        characters: [answers[3] || "Hero"],
        scenes: [
          {
            text: answers[4] || "A big surprise appears.",
            choices: [answers[5] || "Go left", answers[6] || "Go right"]
          }
        ]
      };
    }
    if (templateType === "QUIZ") {
      return {
        topic: answers[0] || "Animals",
        difficulty: answers[1] || "Easy",
        questions: [
          {
            q: answers[2] || "Which one can fly?",
            choices: [answers[3] || "Cat", answers[4] || "Bird", answers[5] || "Dog"],
            answerIndex: Math.max(0, Number(answers[6] || "2") - 1),
            explanation: "Great thinking!"
          }
        ]
      };
    }
    if (templateType === "FLASHCARDS") {
      return {
        subject: answers[0] || "Math",
        cards: [
          { front: answers[1] || "2+2", back: answers[2] || "4" },
          { front: answers[3] || "3+5", back: answers[4] || "8" }
        ]
      };
    }
    return {
      theme: answers[0] || "Space",
      duration: Number(answers[1] || "30"),
      targetCount: Number(answers[2] || "15"),
      bonusPoints: Number(answers[3] || "2")
    };
  };

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2000);
  };

  async function refreshProjects() {
    const response = await fetch("/api/projects");
    setProjects(await response.json());
  }

  async function createProject() {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateType, title: answers[0] || `${templateType} Project`, dataJson: templateData() })
    });

    if (!response.ok) {
      showToast("Oops! fix answers and try again.");
      return;
    }

    await refreshProjects();
    showToast("Project built! Try remix knobs below.");
  }

  async function deleteProject(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    await refreshProjects();
  }

  async function unlockParentMode() {
    const response = await fetch("/api/auth/parent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin })
    });
    if (response.ok) {
      setAuthorized(true);
      showToast("Parent mode unlocked");
    } else {
      showToast("Wrong PIN");
    }
  }

  async function saveSettings() {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ageBand, allowedCategories })
    });
    showToast("Parent settings saved");
  }

  async function approveShare(id: string, approve: boolean) {
    const response = await fetch(`/api/share/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve })
    });

    if (!response.ok) {
      showToast("Parent unlock required");
      return;
    }

    await refreshProjects();
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl p-4 pb-24">
      <header className="rounded-3xl bg-white/90 p-5 shadow-card">
        <h1 className="text-3xl font-black">KidBuild Studio</h1>
        <p className="mt-2 text-sm">Safe, guided project maker with no open chat and no external links.</p>
      </header>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-card">
        <h2 className="text-lg font-bold">Pick a template</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["STORY", "QUIZ", "FLASHCARDS", "MINIGAME"] as TemplateType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setTemplateType(type);
                setAnswers(Array(7).fill(""));
              }}
              className={`min-h-12 rounded-2xl px-3 py-2 text-sm font-semibold ${
                templateType === type ? "bg-ocean text-white" : "bg-slate-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {prompts.map((label, idx) => (
            <label key={label} className="block text-sm font-medium">
              {label}
              <input
                value={answers[idx] ?? ""}
                onChange={(event) => {
                  const copy = [...answers];
                  copy[idx] = event.target.value;
                  setAnswers(copy);
                }}
                className="mt-1 min-h-12 w-full rounded-2xl border border-slate-300 px-3"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={createProject} className="min-h-12 rounded-2xl bg-bubblegum px-3 py-2 text-white font-semibold">
            Build now
          </button>
          <button
            onClick={() => {
              const copy = [...answers];
              copy[1] = copy[1] === "Easy" ? "Hard" : "Easy";
              copy[4] = `${copy[4] || "Scene"} ⭐`;
              setAnswers(copy);
              showToast("Remix applied: difficulty + sparkle theme");
            }}
            className="min-h-12 rounded-2xl bg-mint px-3 py-2 font-semibold text-night"
          >
            Remix
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">My projects</h2>
          <button className="text-sm font-semibold text-ocean" onClick={() => setParentOpen(!parentOpen)}>
            Parent mode
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-sm">No projects yet. Start with a template above!</p>
        ) : (
          <div className="mt-3 space-y-3">
            {projects.map((project) => (
              <article key={project.id} className="rounded-2xl border border-slate-200 p-3">
                <h3 className="font-bold">{project.title}</h3>
                <p className="text-xs text-slate-600">{project.templateType}</p>
                {project.safetyFlags.length > 0 && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">Safety flags: {project.safetyFlags.join(", ")}</p>
                )}
                <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-50 p-2 text-xs">{JSON.stringify(project.dataJson, null, 2)}</pre>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => deleteProject(project.id)} className="min-h-10 rounded-xl bg-slate-200 px-3 text-xs">
                    Delete
                  </button>
                  <button
                    onClick={() => approveShare(project.id, !project.isShareApproved)}
                    className="min-h-10 rounded-xl bg-ocean px-3 text-xs text-white"
                  >
                    {project.isShareApproved ? "Unapprove share" : "Approve share"}
                  </button>
                  {project.isShareApproved && project.shareToken && (
                    <span className="text-xs text-emerald-700">Link: /s/{project.shareToken}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {parentOpen && (
        <section className="mt-4 rounded-3xl bg-white p-4 shadow-card">
          <h2 className="text-lg font-bold">Parent dashboard</h2>
          {!authorized ? (
            <div className="mt-3 space-y-2">
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="Enter 4-digit PIN"
                className="min-h-12 w-full rounded-2xl border border-slate-300 px-3"
              />
              <button onClick={unlockParentMode} className="min-h-12 w-full rounded-2xl bg-night text-white font-semibold">
                Unlock Parent Mode
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <label className="text-sm font-medium block">
                Kid age level
                <select value={ageBand} onChange={(e) => setAgeBand(e.target.value)} className="mt-1 min-h-12 w-full rounded-2xl border px-3">
                  <option value="AGE_6_8">6-8</option>
                  <option value="AGE_9_12">9-12</option>
                  <option value="AGE_13_16">13-16</option>
                </select>
              </label>
              <div>
                <p className="text-sm font-medium">Allowed categories</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {["math", "reading", "science", "Bible", "geography"].map((category) => (
                    <button
                      key={category}
                      onClick={() =>
                        setAllowedCategories((prev) =>
                          prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
                        )
                      }
                      className={`min-h-11 rounded-xl border px-2 ${
                        allowedCategories.includes(category) ? "bg-mint border-mint" : "bg-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveSettings} className="min-h-12 w-full rounded-2xl bg-bubblegum text-white font-semibold">
                Save parent settings
              </button>
              <a href="/api/projects/export" className="block min-h-12 w-full rounded-2xl bg-ocean px-4 py-3 text-center font-semibold text-white">
                Export projects JSON
              </a>
            </div>
          )}
        </section>
      )}

      {toast && <div className="fixed bottom-4 left-1/2 w-11/12 -translate-x-1/2 rounded-2xl bg-night p-3 text-center text-sm text-white">{toast}</div>}
    </main>
  );
}
