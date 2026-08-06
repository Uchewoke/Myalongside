"use client";
// MyAlongside's 12 AI marketing employees. Two campaign tracks: mentor & mentee.

import React, { useEffect, useRef, useState } from "react";
import {
  Crown, FileText, Megaphone, Image as ImageIcon, Video, PenLine,
  Mail, Search, BarChart3, MessageCircle, UserCheck, LineChart,
  ArrowUp, Loader2, Copy, Check, RotateCcw, Zap, Heart, Download, Wand2, ShieldCheck,
} from "lucide-react";
import { AGENTS, AGENT_ORDER, AgentId, CampaignTrack, CAMPAIGN_LABELS } from "@/lib/agents-ui";
import { askAgent, generateAd, runCampaign, ChatMessage, CampaignEvent } from "@/lib/marketing-client";

const ICONS: Record<AgentId, React.ComponentType<{ size?: number }>> = {
  cmo: Crown, content: FileText, social: Megaphone, designer: ImageIcon, video: Video,
  copywriter: PenLine, email: Mail, seo: Search, research: BarChart3,
  support: MessageCircle, sales: UserCheck, analytics: LineChart,
};

const BRAND = "#0E7C7B";

interface Msg extends ChatMessage {
  imageUrl?: string;
  imagePrompt?: string;
}
type Card = { agentId: AgentId; name: string; accent: string; text: string; status: "running" | "done"; approved: boolean };

export function MarketingTeam() {
  const [activeId, setActiveId] = useState<AgentId | "campaign">("cmo");
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [track, setTrack] = useState<CampaignTrack>("mentor");
  const [campaignRunning, setCampaignRunning] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);

  const agent = activeId !== "campaign" ? AGENTS[activeId] : null;
  const thread = activeId !== "campaign" ? threads[activeId] ?? [] : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread, loading, activeId, cards]);

  const pushMsg = (id: string, msg: Msg) =>
    setThreads((t) => ({ ...t, [id]: [...(t[id] ?? []), msg] }));

  async function send(text: string) {
    if (activeId === "campaign" || loading) return;
    const id = activeId;
    pushMsg(id, { role: "user", content: text });
    setLoading(true);
    try {
      if (AGENTS[id].kind === "image") {
        const ad = await generateAd(text);
        pushMsg(id, { role: "assistant", content: ad.prompt, imageUrl: ad.dataUrl, imagePrompt: ad.prompt });
      } else {
        const history: ChatMessage[] = [
          ...(threads[id] ?? []).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ];
        const reply = await askAgent(id, history);
        pushMsg(id, { role: "assistant", content: reply });
      }
    } catch (e) {
      pushMsg(id, { role: "assistant", content: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  function submit() {
    const t = input.trim();
    if (!t) return;
    setInput("");
    void send(t);
  }

  async function startCampaign() {
    setCampaignRunning(true);
    setCards([]);
    await runCampaign(track, (e: CampaignEvent) => {
      if (e.type === "step_start" && e.agentId != null) {
        setCards((c) => [...c, { agentId: e.agentId!, name: e.name!, accent: AGENTS[e.agentId!].accent, text: "", status: "running", approved: false }]);
      } else if (e.type === "step_done" && e.index != null) {
        setCards((c) => c.map((x, j) => (j === e.index ? { ...x, text: e.text ?? "", status: "done" } : x)));
      }
    }).catch((err) => {
      setCards((c) => [...c, { agentId: "cmo", name: "Error", accent: BRAND, text: String(err), status: "done", approved: false }]);
    });
    setCampaignRunning(false);
  }

  const kitReady = cards.length > 0 && cards.every((c) => c.status === "done");

  // Mentee-facing copy reaches people in crisis, so it must be human-approved
  // section-by-section before it can leave the tool. Mentor copy exports freely.
  const requiresReview = track === "mentee";
  const allApproved = cards.length > 0 && cards.every((c) => c.approved);
  const canExport = kitReady && (!requiresReview || allApproved);

  function toggleApprove(index: number) {
    setCards((c) => c.map((x, j) => (j === index ? { ...x, approved: !x.approved } : x)));
  }

  function exportKit() {
    if (!canExport) return;
    const today = new Date().toISOString().slice(0, 10);
    const label = CAMPAIGN_LABELS[track];
    let md = `# MyAlongside — ${label} Campaign Kit\nGenerated ${today}\n\nPeer mentorship for life's hardest moments. myalongside.com\n\n> MyAlongside is a peer-support platform, not a substitute for professional care. In crisis, call 988 (US) or local emergency services.\n`;
    if (requiresReview) md += `\n_All sections human-reviewed and approved before export._\n`;
    cards.forEach((c, i) => (md += `\n---\n\n## ${i + 1}. ${c.name}\n\n${c.text}\n`));
    const blob = new Blob([md], { type: "text/markdown" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `MyAlongside-${track}-Kit-${today}.md`;
    a.click();
    URL.revokeObjectURL(u);
  }

  return (
    <div className="al-team">
      <aside className="al-side">
        <div className="al-brand"><Heart size={16} /><span>MyAlongside</span></div>
        <h1 className="al-title">Marketing Team</h1>

        <button className={`al-campaign-btn ${activeId === "campaign" ? "on" : ""}`} onClick={() => setActiveId("campaign")}>
          <span className="ic" style={{ background: `${BRAND}18`, color: BRAND }}><Zap size={15} /></span>
          <span>Run Full Campaign</span>
        </button>

        <div className="al-nav">
          {AGENT_ORDER.map((id) => {
            const A = ICONS[id];
            const on = id === activeId;
            const a = AGENTS[id];
            return (
              <button key={id} className={`al-nav-item ${on ? "on" : ""}`} style={on ? { borderColor: a.accent } : undefined} onClick={() => setActiveId(id)}>
                <span className="ic" style={{ background: `${a.accent}18`, color: a.accent }}><A size={15} /></span>
                <span style={on ? { color: a.accent, fontWeight: 700 } : undefined}>{a.name.replace("AI ", "")}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="al-panel">
        {activeId === "campaign" ? (
          <>
            <header className="al-head">
              <div className="al-head-l">
                <span className="ic lg" style={{ background: `${BRAND}18`, color: BRAND }}><Zap size={18} /></span>
                <div>
                  <div className="name" style={{ color: BRAND }}>Full Campaign</div>
                  <div className="sub">Chained — each agent builds on the last.</div>
                </div>
              </div>
              <div className="al-head-actions">
                {kitReady && (
                  <button className="btn ghost" onClick={exportKit} disabled={!canExport} title={!canExport ? "Approve every section first" : "Export"}>
                    <Download size={15} /> Export Kit
                  </button>
                )}
                <button className="btn primary" onClick={startCampaign} disabled={campaignRunning}>
                  {campaignRunning ? <Loader2 className="spin" size={15} /> : <Wand2 size={15} />}
                  {campaignRunning ? "Running…" : cards.length ? "Re-run" : "Generate Kit"}
                </button>
              </div>
            </header>

            <div className="al-track">
              <span className="al-track-label">Recruitment focus:</span>
              <div className="al-toggle">
                <button className={track === "mentor" ? "on" : ""} onClick={() => setTrack("mentor")} disabled={campaignRunning}>Mentor Recruitment</button>
                <button className={track === "mentee" ? "on" : ""} onClick={() => setTrack("mentee")} disabled={campaignRunning}>Mentee Acquisition</button>
              </div>
            </div>

            <div className="al-scroll" ref={scrollRef}>
              {cards.length === 0 ? (
                <p className="al-empty">
                  Pick a focus and click <b>Generate Kit</b>. Six agents run in sequence — Research → CMO → Copywriter → Social → Email → SEO — each reading the previous outputs, tuned for {track === "mentor" ? "recruiting mentors" : "reaching mentees"}. Then export the kit.
                </p>
              ) : (
                <>
                  {requiresReview && kitReady && (
                    <div className={`al-review-banner ${allApproved ? "ok" : ""}`}>
                      <ShieldCheck size={15} />
                      {allApproved
                        ? "All sections approved — this mentee-facing kit is cleared for export."
                        : `Human review required. Approve each section below (${cards.filter((c) => c.approved).length}/${cards.length}) before this mentee-facing kit can be exported.`}
                    </div>
                  )}
                  {cards.map((c, i) => (
                    <div key={i} className="al-card">
                      <div className="al-card-head" style={{ background: `${c.accent}0c` }}>
                        <span className="num" style={{ background: `${c.accent}22`, color: c.accent }}>{i + 1}</span>
                        <span style={{ color: c.accent, fontWeight: 700 }}>{c.name}</span>
                        <span className="status">{c.status === "running" ? "working…" : "done"}</span>
                      </div>
                      <div className="al-card-body">{c.text || <span className="muted"><Loader2 className="spin" size={14} /> generating…</span>}</div>
                      {requiresReview && c.status === "done" && (
                        <div className="al-card-review">
                          <button className={`approve ${c.approved ? "on" : ""}`} onClick={() => toggleApprove(i)}>
                            {c.approved ? <><Check size={13} /> Approved</> : "Approve this section"}
                          </button>
                          <span className="al-review-hint">Reviewer confirms this is safe, accurate, and non-exploitative.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <header className="al-head">
              <div className="al-head-l">
                {(() => { const A = ICONS[activeId]; return <span className="ic lg" style={{ background: `${agent!.accent}18`, color: agent!.accent }}><A size={18} /></span>; })()}
                <div><div className="name" style={{ color: agent!.accent }}>{agent!.name}</div><div className="sub">{agent!.blurb}</div></div>
              </div>
              {thread.length > 0 && <button className="btn ghost" onClick={() => setThreads((t) => ({ ...t, [activeId]: [] }))}><RotateCcw size={13} /> Clear</button>}
            </header>
            <div className="al-scroll" ref={scrollRef}>
              {agent!.note && thread.length === 0 && <div className="al-note">{agent!.note}</div>}
              {thread.length === 0 && !loading ? (
                <div>
                  <div className="al-starters-label">Try a starter:</div>
                  {agent!.starters.map((s, i) => (
                    <button key={i} className="al-starter" onClick={() => void send(s)}>{s}</button>
                  ))}
                </div>
              ) : (
                <>
                  {thread.map((m, i) => <Bubble key={i} msg={m} accent={agent!.accent} />)}
                  {loading && <div className="al-typing"><Loader2 className="spin" size={16} /> {agent!.name} is working…</div>}
                </>
              )}
            </div>
            <div className="al-input">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
                placeholder={`Ask the ${agent!.name.replace("AI ", "").toLowerCase()}…`}
                rows={1}
              />
              <button className="send" onClick={submit} disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? agent!.accent : "#ddd" }}>
                <ArrowUp size={20} />
              </button>
            </div>
          </>
        )}
      </section>

      <style jsx>{`
        .al-team { font-family: 'Inter', system-ui, sans-serif; display: grid; grid-template-columns: 244px 1fr; gap: 18px; max-width: 1120px; margin: 0 auto; padding: 22px 18px; color: #1a1a1a; }
        .al-brand { display: flex; align-items: center; gap: 8px; color: ${BRAND}; }
        .al-brand span { font-size: 12px; letter-spacing: .5px; text-transform: uppercase; color: #789; font-weight: 700; }
        .al-title { font-size: 21px; font-weight: 800; margin: 2px 0 14px; letter-spacing: -0.5px; }
        .ic { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ic.lg { width: 34px; height: 34px; border-radius: 9px; }
        .al-campaign-btn { display: flex; align-items: center; gap: 9px; width: 100%; padding: 11px 12px; border-radius: 11px; border: 1.5px solid #e6e6e6; background: linear-gradient(90deg,#fff,#f0f9f8); cursor: pointer; margin-bottom: 14px; font-size: 13.5px; font-weight: 700; color: ${BRAND}; }
        .al-campaign-btn.on { border-color: ${BRAND}; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.06); }
        .al-nav { display: flex; flex-direction: column; gap: 5px; }
        .al-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 10px; border: 1.5px solid transparent; background: transparent; cursor: pointer; text-align: left; font-size: 13px; color: #444; }
        .al-nav-item.on { background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.05); }
        .al-panel { background: #fff; border-radius: 16px; border: 1px solid #ececec; overflow: hidden; box-shadow: 0 2px 14px rgba(0,0,0,.04); display: flex; flex-direction: column; height: calc(100vh - 44px); min-height: 560px; }
        .al-head { padding: 15px 18px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .al-head-l { display: flex; align-items: center; gap: 11px; }
        .al-head .name { font-weight: 700; font-size: 15.5px; }
        .al-head .sub { font-size: 12.5px; color: #888; margin-top: 1px; }
        .al-head-actions { display: flex; gap: 8px; }
        .btn { display: flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; border-radius: 9px; padding: 9px 14px; cursor: pointer; border: none; }
        .btn.primary { color: #fff; background: ${BRAND}; }
        .btn.primary:disabled { background: #ccc; cursor: default; }
        .btn.ghost { color: ${BRAND}; background: #fff; border: 1.5px solid ${BRAND}; }
        .al-track { display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-bottom: 1px solid #f0f0f0; background: #fbfdfd; }
        .al-track-label { font-size: 12.5px; color: #789; font-weight: 600; }
        .al-toggle { display: inline-flex; background: #eef4f4; border-radius: 9px; padding: 3px; }
        .al-toggle button { border: none; background: transparent; padding: 7px 13px; border-radius: 7px; font-size: 12.5px; font-weight: 600; color: #567; cursor: pointer; }
        .al-toggle button.on { background: #fff; color: ${BRAND}; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
        .al-scroll { flex: 1; overflow-y: auto; padding: 18px; background: #fafafa; }
        .al-empty, .al-starters-label { color: #999; font-size: 14px; line-height: 1.6; }
        .al-starters-label { margin-bottom: 12px; font-weight: 500; }
        .al-starter { display: block; width: 100%; text-align: left; padding: 12px 14px; margin-bottom: 9px; border-radius: 11px; border: 1px solid #ececec; background: #fff; cursor: pointer; font-size: 14px; color: #333; line-height: 1.4; }
        .al-note { font-size: 12.5px; color: #0e7490; background: #e7f6f9; border: 1px solid #a5e0ec; border-radius: 9px; padding: 9px 12px; margin-bottom: 14px; }
        .al-typing { display: flex; align-items: center; gap: 8px; color: #999; font-size: 14px; }
        .al-card { margin-bottom: 16px; background: #fff; border: 1px solid #ececec; border-radius: 12px; overflow: hidden; }
        .al-card-head { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid #f2f2f2; }
        .al-card-head .num { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .al-card-head .status { margin-left: auto; font-size: 11.5px; color: #aaa; }
        .al-card-body { padding: 12px 15px; font-size: 14px; line-height: 1.55; white-space: pre-wrap; }
        .al-card-review { display: flex; align-items: center; gap: 10px; padding: 10px 15px; border-top: 1px solid #f2f2f2; background: #fcfcfb; flex-wrap: wrap; }
        .al-card-review .approve { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 600; color: #b45309; background: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 8px; padding: 6px 11px; cursor: pointer; }
        .al-card-review .approve.on { color: #15803d; background: #f0fdf4; border-color: #bbf7d0; }
        .al-review-hint { font-size: 11.5px; color: #999; }
        .al-review-banner { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #b45309; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 11px 14px; margin-bottom: 14px; }
        .al-review-banner.ok { color: #15803d; background: #f0fdf4; border-color: #bbf7d0; }
        .muted { color: #aaa; }
        .al-input { padding: 14px; border-top: 1px solid #f0f0f0; background: #fff; display: flex; gap: 10px; align-items: flex-end; }
        .al-input textarea { flex: 1; resize: none; border: 1px solid #e2e2e2; border-radius: 12px; padding: 11px 14px; font-size: 14.5px; font-family: inherit; outline: none; max-height: 120px; }
        .send { color: #fff; border: none; border-radius: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 720px) { .al-team { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function Bubble({ msg, accent }: { msg: Msg; accent: string }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const copy = () => { navigator.clipboard?.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const download = () => {
    if (!msg.imageUrl) return;
    const a = document.createElement("a");
    a.href = msg.imageUrl; a.download = "myalongside-ad.png"; a.click();
  };
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 14 }}>
      <div style={{ maxWidth: "84%", padding: "12px 15px", borderRadius: 14, fontSize: 14.5, lineHeight: 1.55, whiteSpace: msg.imageUrl ? "normal" : "pre-wrap", background: isUser ? accent : "#fff", color: isUser ? "#fff" : "#1a1a1a", border: isUser ? "none" : "1px solid #ececec" }}>
        {msg.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={msg.imageUrl} alt="Generated ad" style={{ maxWidth: 360, borderRadius: 8, display: "block" }} />
            <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>Prompt: {msg.imagePrompt}</div>
            <button onClick={download} style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: accent, background: "none", border: "none", cursor: "pointer", padding: 0 }}><Download size={13} /> Download PNG</button>
          </>
        ) : (
          <>
            {msg.content}
            {!isUser && (
              <button onClick={copy} style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
