"use client";

import { useMemo, useState } from "react";

type View = "home" | "translate" | "encyclopedia" | "diary";
type StateId = "relaxed" | "curious" | "fear" | "arousal" | "pain";
type Scores = [number, number, number, number, number];

type SignalCategory = {
  key: string;
  title: string;
  hint: string;
  options: { label: string; scores: Scores }[];
};

type EncyclopediaItem = {
  signal: string;
  grade: "A" | "B" | "C";
  meaning: string;
  action: string;
  limit: string;
};

type DiaryEntry = {
  id: string;
  timestamp: number;
  behavior: string;
  mood: string;
  note: string;
};

const stateDefinitions: {
  id: StateId;
  name: string;
  shortName: string;
  color: string;
  voice: string;
  advice: string;
}[] = [
  {
    id: "relaxed",
    name: "放鬆・正向社交",
    shortName: "放鬆",
    color: "#7E9A5F",
    voice: "喵～現在的我很鬆，你可以摸摸我。但這是本喵的恩賜，別得寸進尺喔。",
    advice: "讓牠主動決定距離，可以慢眨眼回應、輕撫頭頸。互動維持在「牠隨時能離開」的狀態最好。",
  },
  {
    id: "curious",
    name: "好奇・注意提高",
    shortName: "好奇",
    color: "#D6A94E",
    voice: "那邊有東西在動！本喵已鎖定目標，先別擋路，我要看牠會不會再動一下。",
    advice: "先確認光線再判讀瞳孔。給牠觀察的距離與退路；想陪玩就用逗貓棒模擬獵物，讓牠成功捕捉後收尾。",
  },
  {
    id: "fear",
    name: "害怕・焦慮",
    shortName: "害怕",
    color: "#7E8CC4",
    voice: "我……我有點怕怕的。拜託給我一個能躲起來的角落，不要一直靠近我好嗎。",
    advice: "停止靠近，提供可躲藏的箱子或高處，降低聲音、光線與人流。不要把牠從躲藏處拖出來，也不要凝視逼近。",
  },
  {
    id: "arousal",
    name: "過度刺激・煩躁",
    shortName: "煩躁",
    color: "#D07B52",
    voice: "夠了夠了！人類的手拿開。我現在很煩，再摸下去我可不保證會發生什麼事。",
    advice: "立刻暫停撫摸或中斷衝突，讓牠自行離開冷靜。多貓衝突時用屏障隔開，不要徒手拉開。",
  },
  {
    id: "pain",
    name: "疼痛風險",
    shortName: "疼痛",
    color: "#C56B72",
    voice: "人類……我好像哪裡怪怪的。別以為我在耍脾氣，可以帶我去看醫生嗎？",
    advice: "先記錄行為與觸摸反應。若同時有食慾、活動、跳躍或排泄的改變，別當成個性問題，盡快諮詢獸醫。",
  },
];

const signalCategories: SignalCategory[] = [
  {
    key: "posture",
    title: "身體姿勢",
    hint: "先看整體是柔軟還是緊繃",
    options: [
      { label: "身體柔軟、伸展、露肚", scores: [3, 0, 0, 0, 0] },
      { label: "屁股扭動、壓低準備撲", scores: [0, 3, 0, 1, 0] },
      { label: "壓低蜷縮、把自己縮小", scores: [0, 0, 3, 0, 0] },
      { label: "拱背、側身、毛豎起", scores: [0, 0, 2, 2, 0] },
      { label: "僵住不動、姿勢僵硬怪異", scores: [0, 0, 0, 0, 3] },
    ],
  },
  {
    key: "ears",
    title: "耳朵",
    hint: "耳位變化很靈敏",
    options: [
      { label: "自然朝前、放鬆", scores: [3, 1, 0, 0, 0] },
      { label: "明顯前傾、鬍鬚前伸", scores: [0, 3, 0, 0, 0] },
      { label: "轉向側面或後方", scores: [0, 0, 3, 0, 0] },
      { label: "完全壓平貼緊頭", scores: [0, 0, 1, 3, 0] },
      { label: "耳尖分開、向外旋轉", scores: [0, 0, 0, 0, 3] },
    ],
  },
  {
    key: "tail",
    title: "尾巴",
    hint: "速度與張力都重要",
    options: [
      { label: "直立、尾尖微彎靠近你", scores: [3, 0, 0, 0, 0] },
      { label: "輕鬆搖擺、邊走邊探索", scores: [1, 3, 0, 0, 0] },
      { label: "夾緊貼身或捲住身體", scores: [0, 0, 3, 0, 0] },
      { label: "快速大幅拍打甩動", scores: [0, 0, 0, 3, 0] },
      { label: "站立顫動／異常夾緊", scores: [0, 0, 0, 1, 3] },
    ],
  },
  {
    key: "face",
    title: "臉部與眼睛",
    hint: "瞳孔先排除光線影響",
    options: [
      { label: "慢慢眨眼、眼神柔和", scores: [3, 0, 0, 0, 0] },
      { label: "瞳孔放大、緊盯目標", scores: [0, 2, 0, 2, 0] },
      { label: "眼眶收緊、瞇眼或緊閉", scores: [0, 0, 0, 0, 3] },
      { label: "嘶聲、露牙、抬起前掌", scores: [0, 0, 1, 3, 0] },
      { label: "口鼻緊繃、變扁平橢圓", scores: [0, 0, 0, 0, 3] },
    ],
  },
  {
    key: "context",
    title: "現在的情境",
    hint: "情境會改變同一動作的意思",
    options: [
      { label: "在熟悉安全的家，牠主動靠近", scores: [3, 0, 0, 0, 0] },
      { label: "看到窗外鳥蟲或逗貓棒", scores: [0, 3, 0, 0, 0] },
      { label: "有陌生人、巨大聲響或其他貓", scores: [0, 0, 3, 0, 0] },
      { label: "已經被摸很久或一直被逼近", scores: [0, 0, 0, 3, 0] },
      { label: "最近食慾差、不願跳、常躲藏", scores: [0, 0, 0, 0, 3] },
    ],
  },
];

const encyclopediaGroups: { tab: string; items: EncyclopediaItem[] }[] = [
  {
    tab: "放鬆・社交",
    items: [
      { signal: "尾巴直立並靠近", grade: "B", meaning: "社交接近、願意互動。", action: "停下讓牠先嗅聞，讓牠決定距離。", limit: "不是固定的「開心」標誌；社會關係與情境會影響。" },
      { signal: "慢慢眨眼", grade: "A", meaning: "正向情緒溝通、較願意接近。", action: "可慢眨回應，並稍微移開凝視。", limit: "單側瞇眼、分泌物或持續閉眼需排除眼部不適。" },
      { signal: "臉頰／身體磨蹭", grade: "B", meaning: "氣味標記，也常見於熟悉的社交。", action: "讓牠主動磨蹭，可輕撫頭頸。", limit: "急促磨蹭伴隨踱步或大叫，可能是挫折。" },
      { signal: "咕嚕＋全身放鬆", grade: "B", meaning: "常見於舒適、維持接觸或要求互動。", action: "以整體姿勢與情境一起確認。", limit: "疼痛、緊張與臨終也可能咕嚕，不能單獨當成開心。" },
    ],
  },
  {
    tab: "好奇・狩獵",
    items: [
      { signal: "耳朵向前、鬍鬚前伸", grade: "B", meaning: "注意力朝向刺激、探索或狩獵準備。", action: "讓牠觀察，提供距離與退路。", limit: "若身體壓低且僵硬，可能是恐懼或衝突。" },
      { signal: "瞳孔放大", grade: "B", meaning: "喚起程度提高；可能玩耍、驚訝、恐懼或疼痛。", action: "先確認光線，再看全身與觸發事件。", limit: "昏暗環境自然放大瞳孔，不能單獨判讀。" },
      { signal: "盯住、屁股扭、撲擊", grade: "B", meaning: "狩獵序列與遊戲。", action: "用逗貓棒模擬獵物，讓牠成功捕捉後結束。", limit: "不要用手腳當玩具；追逐另一隻貓需確認互惠。" },
      { signal: "對窗外顫顎／喀喀聲", grade: "C", meaning: "常見於看到獵物時的高度注意。", action: "提供安全觀察位置與室內遊戲。", limit: "功能尚無單一結論，不宜翻成固定語句。" },
    ],
  },
  {
    tab: "害怕・防禦",
    items: [
      { signal: "身體壓低蜷縮", grade: "B", meaning: "降低能見度、準備逃避，常見於擔心或害怕。", action: "停止靠近，提供箱子、高處或外出籠。", limit: "不要把牠從躲藏處拖出來。" },
      { signal: "耳朵轉向側後／壓平", grade: "B", meaning: "警戒、害怕或防禦升級。", action: "拉開距離，等耳位與肌肉放鬆。", limit: "不要凝視、伸手靠近臉部。" },
      { signal: "拱背、側身、毛豎起", grade: "B", meaning: "使體型看起來更大，常見於強烈恐懼或防禦。", action: "給出清楚退路並遠離。", limit: "不要追逐、處罰或大聲喝斥。" },
      { signal: "嘶聲、低吼、抬前掌", grade: "B", meaning: "明確的距離增加訊號，可能即將揮擊。", action: "立刻停止互動，讓牠退開。", limit: "不要把嘶聲解讀成壞脾氣。" },
    ],
  },
  {
    tab: "過度刺激・衝突",
    items: [
      { signal: "尾巴快速大幅拍打", grade: "B", meaning: "喚起升高、挫折或觸摸耐受度降低。", action: "立即暫停撫摸，讓牠自行離開。", limit: "細小尾尖移動可能只是專注；速度與張力才是關鍵。" },
      { signal: "突然回頭咬／抓", grade: "B", meaning: "過度刺激、疼痛、恐懼或低接觸耐受。", action: "記錄觸摸部位與前兆，改為短暫、由貓主動的互動。", limit: "不是毫無預警；常有細微前兆。" },
      { signal: "踱步、急促磨蹭、大叫", grade: "B", meaning: "挫折或高度期待，也可能是發情、甲狀腺或認知問題。", action: "檢查需求與環境；突然出現或持續就醫。", limit: "不要只用食物或注意力壓下而忽略原因。" },
    ],
  },
  {
    tab: "日常行為",
    items: [
      { signal: "抓抓", grade: "B", meaning: "天生的伸展、磨除爪鞘、視覺與氣味標記。", action: "提供穩固抓板，放在牠常抓的動線上。", limit: "抓點突然改變或只抓低處，可能與活動力或疼痛有關。" },
      { signal: "踩奶", grade: "C", meaning: "常見於舒適、熟悉接觸或氣味標記；個體差異大。", action: "讓牠踩，鋪一條專屬毯子。", limit: "伴隨啃食布料、皮膚受傷或難中斷，請諮詢專業人士。" },
      { signal: "舔毛", grade: "B", meaning: "日常整理與氣味維持，也可能是自我安撫。", action: "維持穩定作息與環境。", limit: "脫毛、紅腫、破皮、局部集中舔或突然大增，先排除搔癢與疼痛。" },
      { signal: "砂盆外排泄", grade: "B", meaning: "砂盆偏好、資源衝突、壓力或醫療問題；不是報復。", action: "先做獸醫檢查，再改善砂盆數量與位置。", limit: "頻繁進出砂盆卻排不出尿是急症，立即就醫。" },
    ],
  },
];

const facts = [
  { question: "貓為什麼會對你「慢慢眨眼」？", answer: "研究發現，人對貓慢眨眼，貓較願意接近你。這被視為一種正向的情緒溝通，你也可以慢眨回應牠。" },
  { question: "貓咪的「咕嚕」一定代表開心嗎？", answer: "不一定。咕嚕常見於舒適與要求互動，但疼痛、緊張甚至臨終時也可能出現，要看整體姿勢與情境。" },
  { question: "露肚子是要我摸肚肚嗎？", answer: "露肚可能代表牠覺得安全，但不等於邀請摸腹。若身體緊繃、四肢準備踢，也可能是防禦姿勢。" },
  { question: "玩耍和打架怎麼分？", answer: "研究指出，互惠摔抱最接近玩耍；大量叫聲與單方追逐較接近衝突，但兩者之間也存在灰色地帶。" },
  { question: "貓的鬍鬚會洩漏心情？", answer: "會。放鬆時鬍鬚自然；狩獵或興奮時前伸；疼痛時可能變直、呈刺狀，但要搭配耳朵與眼睛一起看。" },
];

const behaviorOptions = ["摩蹭我的腿", "慢慢眨眼", "踩奶", "瘋狂衝刺（午夜暴衝）", "躲起來", "對我哈氣／低吼", "一直舔毛", "在窗邊顫顎", "咬人／揮爪", "踱步大叫", "食慾變差", "其他"];
const moodOptions = [
  { label: "很鬆", color: "#7E9A5F" },
  { label: "好奇", color: "#D6A94E" },
  { label: "怕怕", color: "#7E8CC4" },
  { label: "煩躁", color: "#D07B52" },
  { label: "怪怪的", color: "#C56B72" },
];

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [selections, setSelections] = useState<Record<string, number | null>>({
    posture: null,
    ears: null,
    tail: null,
    face: null,
    context: null,
  });
  const [encyclopediaTab, setEncyclopediaTab] = useState(0);
  const [diary, setDiary] = useState<DiaryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("cat-diary-v1");
      return saved ? JSON.parse(saved) as DiaryEntry[] : [];
    } catch {
      return [];
    }
  });
  const [behavior, setBehavior] = useState(behaviorOptions[0]);
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [factIndex, setFactIndex] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareDate, setShareDate] = useState("");

  const result = useMemo(() => {
    const chosen = signalCategories.flatMap((category) => {
      const index = selections[category.key];
      return index === null ? [] : [category.options[index]];
    });
    if (chosen.length < 2) return { count: chosen.length, totals: [0, 0, 0, 0, 0] as Scores, sum: 0, top: 0, confidence: "" };

    const totals: Scores = [0, 0, 0, 0, 0];
    chosen.forEach((option) => option.scores.forEach((score, index) => { totals[index] += score; }));
    const sum = totals.reduce((total, score) => total + score, 0) || 1;
    const top = totals.indexOf(Math.max(...totals));
    const share = totals[top] / sum;
    const confidence = chosen.length < 3
      ? "偏低（線索還不夠）"
      : share > 0.5
        ? "較高"
        : share > 0.34
          ? "中等"
          : "偏低（訊號有點打架）";
    return { count: chosen.length, totals, sum, top, confidence };
  }, [selections]);

  const currentState = stateDefinitions[result.top];

  function navigate(next: View) {
    setView(next);
    setShowShareCard(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveDiary(next: DiaryEntry[]) {
    setDiary(next);
    try {
      window.localStorage.setItem("cat-diary-v1", JSON.stringify(next));
    } catch {
      // The diary still works for this session if storage is unavailable.
    }
  }

  function addDiaryEntry() {
    const entry: DiaryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      behavior,
      mood: mood ?? "很鬆",
      note: note.trim(),
    };
    saveDiary([entry, ...diary]);
    setBehavior(behaviorOptions[0]);
    setMood(null);
    setNote("");
  }

  async function copyShareCard() {
    const text = `【貓語翻譯機】我家貓主子現在是「${currentState.name}」\n「${currentState.voice}」\n判讀信心：${result.confidence}｜僅供娛樂與教育，不能取代獸醫`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="site-shell">
      <nav className="top-nav" aria-label="主要導覽">
        <button className="wordmark" type="button" onClick={() => navigate("home")}>
          <span className="wordmark-cat">喵</span>
          <span>貓語翻譯機</span>
        </button>
        <div className="nav-spacer" />
        <div className="nav-items">
          {([
            ["home", "首頁"],
            ["translate", "翻譯器"],
            ["encyclopedia", "行為百科"],
            ["diary", "行為日記"],
          ] as [View, string][]).map(([id, label]) => (
            <button
              className={view === id ? "nav-button active" : "nav-button"}
              type="button"
              onClick={() => navigate(id)}
              key={id}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {view === "home" && (
        <main className="home-screen">
          <section className="home-hero">
            <div className="hero-copy">
              <span className="paper-label">以研究為基礎・但由本喵親自開口</span>
              <h1>你的貓到底<br />在說什麼？</h1>
              <p className="hero-lede">貓咪沒有字典，但有「訊號組合」。選出牠現在的姿勢、耳朵、尾巴、表情與情境，我們幫你拼出牠最可能的心情——然後讓牠用第一人稱告訴你。</p>
              <p className="hero-fineprint">單一動作沒有唯一意思；至少兩三個一致的訊號，判讀才可靠。</p>
              <div className="hero-actions">
                <button className="button primary" type="button" onClick={() => navigate("translate")}>開始翻譯 →</button>
                <button className="button secondary" type="button" onClick={() => navigate("encyclopedia")}>翻行為百科</button>
              </div>
            </div>
            <div className="photo-card" aria-label="貓咪照片展示區">
              <div className="cat-doodle" aria-hidden="true">
                <span className="cat-ear left" />
                <span className="cat-ear right" />
                <span className="cat-head"><i /><i /><b /></span>
                <span className="cat-body" />
                <span className="cat-tail" />
              </div>
              <span className="photo-caption">你家貓主子的照片</span>
            </div>
          </section>

          <section className="home-cards" aria-label="判讀原則">
            <article>
              <h2>四步判讀法</h2>
              <p>看整體 → 看組合 → 看情境 → 看變化。光線會影響瞳孔，疼痛會改變一切；和平常不一樣，比動作本身更重要。</p>
            </article>
            <article>
              <h2>不是貓語字典</h2>
              <p>我們用「較可能」而不是「一定是」。翻譯結果附上判讀信心，線索互相打架時，會老實跟你說。</p>
            </article>
            <article>
              <h2>健康優先</h2>
              <p>貓很會忍痛。突然躲藏、不吃、不願跳，先想健康、再想個性。本站不能取代獸醫檢查。</p>
            </article>
          </section>
        </main>
      )}

      {view === "translate" && (
        <main className="page-screen">
          <header className="page-heading">
            <span className="page-kicker">SIGNAL COMBINATIONS</span>
            <h1>行為翻譯器</h1>
            <p>每一組選一項。至少選兩組才會開始翻譯，選越多越準。</p>
          </header>

          <div className="translator-layout">
            <section className="signal-stack" aria-label="貓咪行為線索">
              {signalCategories.map((category, categoryIndex) => (
                <fieldset className="signal-card" key={category.key}>
                  <legend>
                    <span>{String(categoryIndex + 1).padStart(2, "0")}</span>
                    <strong>{category.title}</strong>
                    <small>{category.hint}</small>
                  </legend>
                  <div className="chips">
                    {category.options.map((option, optionIndex) => {
                      const selected = selections[category.key] === optionIndex;
                      return (
                        <button
                          className={selected ? "chip selected" : "chip"}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSelections((current) => ({
                            ...current,
                            [category.key]: selected ? null : optionIndex,
                          }))}
                          key={option.label}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              <button
                className="reset-button"
                type="button"
                onClick={() => setSelections({ posture: null, ears: null, tail: null, face: null, context: null })}
              >
                全部重選
              </button>
            </section>

            <aside className="result-column" aria-live="polite">
              {result.count < 2 ? (
                <div className="empty-result">
                  <span>？</span>
                  <p>{result.count === 0 ? "再選兩組訊號，本喵就開口。" : "很好，再選一組（至少兩組）就能開始翻譯。"}</p>
                </div>
              ) : (
                <div className="result-card">
                  <div className="result-head" style={{ background: currentState.color }}>
                    <small>較可能的狀態</small>
                    <h2>{currentState.name}</h2>
                  </div>
                  <div className="result-content">
                    <blockquote>「{currentState.voice}」<cite>—— 本喵親口翻譯</cite></blockquote>
                    <p className="mini-label">情緒指數</p>
                    <div className="emotion-bars">
                      {stateDefinitions.map((state, index) => {
                        const percent = Math.round((result.totals[index] / result.sum) * 100);
                        return (
                          <div className="emotion-row" key={state.id}>
                            <span>{state.shortName}</span>
                            <div><i style={{ width: `${percent}%`, background: state.color }} /></div>
                            <b>{percent}%</b>
                          </div>
                        );
                      })}
                    </div>
                    <div className="confidence-line">
                      <i style={{ background: result.confidence === "較高" ? "#7E9A5F" : result.confidence === "中等" ? "#D6A94E" : "#C56B72" }} />
                      判讀信心：{result.confidence}
                    </div>
                    <p className="result-advice">{currentState.advice}</p>
                    {currentState.id === "pain" && (
                      <div className="pain-note">出現疼痛相關線索。這不是診斷，但若同時有食慾、活動或排泄改變，請盡快諮詢獸醫。</div>
                    )}
                    <button className="button share" type="button" onClick={() => { setCopied(false); setShareDate(formatDate(Date.now())); setShowShareCard(true); }}>產生分享卡片</button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </main>
      )}

      {view === "encyclopedia" && (
        <main className="page-screen">
          <header className="page-heading">
            <span className="page-kicker">BEHAVIOUR ENCYCLOPEDIA</span>
            <h1>行為百科</h1>
            <p>整理自同儕審查研究與獸醫機構指南。A 為較強提示、B 適合形成照護建議、C 只作探索提示。</p>
          </header>
          <div className="encyclopedia-tabs" role="tablist" aria-label="行為類別">
            {encyclopediaGroups.map((group, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={encyclopediaTab === index}
                className={encyclopediaTab === index ? "tab-button active" : "tab-button"}
                onClick={() => setEncyclopediaTab(index)}
                key={group.tab}
              >
                {group.tab}
              </button>
            ))}
          </div>
          <section className="encyclopedia-list">
            {encyclopediaGroups[encyclopediaTab].items.map((item) => (
              <article className="encyclopedia-card" key={item.signal}>
                <header>
                  <h2>{item.signal}</h2>
                  <span className={`grade grade-${item.grade.toLowerCase()}`}>{item.grade}</span>
                </header>
                <div>
                  <p><small>較可能代表</small>{item.meaning}</p>
                  <p><small>你可以這樣做</small>{item.action}</p>
                  <p><small>限制／反例</small>{item.limit}</p>
                </div>
              </article>
            ))}
          </section>
        </main>
      )}

      {view === "diary" && (
        <main className="page-screen">
          <header className="page-heading">
            <span className="page-kicker">PERSONAL BASELINE</span>
            <h1>行為日記</h1>
            <p>「和平常不一樣」是最重要的線索——記下每天的行為，才有你家貓的基準線。</p>
          </header>
          <div className="diary-layout">
            <section className="diary-form-column">
              <div className="diary-form">
                <h2>今天貓主子做了什麼？</h2>
                <label>
                  <span>行為</span>
                  <select value={behavior} onChange={(event) => setBehavior(event.target.value)}>
                    {behaviorOptions.map((option) => <option value={option} key={option}>{option}</option>)}
                  </select>
                </label>
                <fieldset>
                  <legend>今日心情</legend>
                  <div className="mood-options">
                    {moodOptions.map((option) => (
                      <button
                        className={mood === option.label ? "mood-button selected" : "mood-button"}
                        style={mood === option.label ? { background: option.color } : undefined}
                        type="button"
                        aria-pressed={mood === option.label}
                        onClick={() => setMood(option.label)}
                        key={option.label}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label>
                  <span>備註（情境、和平常不同的地方）</span>
                  <textarea
                    rows={4}
                    placeholder="例如：今天只吃了一半的飯，一直躲在床下……"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </label>
                <button className="button primary full-width" type="button" onClick={addDiaryEntry}>記下來</button>
              </div>
              <div className="fact-card">
                <div>
                  <h2>貓貓小知識</h2>
                  <button type="button" onClick={() => setFactIndex((factIndex + 1) % facts.length)}>換一則</button>
                </div>
                <strong>{facts[factIndex].question}</strong>
                <p>{facts[factIndex].answer}</p>
              </div>
            </section>

            <section className="diary-entries" aria-label="行為日記紀錄">
              {diary.length === 0 ? (
                <div className="empty-diary">日記還空空的。<br />從左邊記下第一筆，幾天後你就會有<br />自家貓主子的「平常基準」。</div>
              ) : diary.map((entry) => {
                const moodOption = moodOptions.find((option) => option.label === entry.mood);
                return (
                  <article className="diary-entry" key={entry.id}>
                    <span className="entry-mood" style={{ background: moodOption?.color ?? "#C9A66B" }}>{entry.mood}</span>
                    <div>
                      <h2>{entry.behavior}<small>{formatDate(entry.timestamp)}</small></h2>
                      {entry.note && <p>{entry.note}</p>}
                    </div>
                    <button type="button" aria-label={`刪除 ${entry.behavior} 紀錄`} onClick={() => saveDiary(diary.filter((item) => item.id !== entry.id))}>×</button>
                  </article>
                );
              })}
            </section>
          </div>
        </main>
      )}

      {showShareCard && result.count >= 2 && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowShareCard(false)}>
          <section className="share-card-modal" role="dialog" aria-modal="true" aria-labelledby="share-card-title" onMouseDown={(event) => event.stopPropagation()}>
            <header style={{ background: currentState.color }}>
              <small>貓語翻譯機・鑑定結果</small>
              <h2 id="share-card-title">{currentState.name}</h2>
            </header>
            <div className="share-card-body">
              <blockquote>「{currentState.voice}」</blockquote>
              <p><i style={{ background: currentState.color }} />判讀信心 {result.confidence}・{shareDate}</p>
              <footer><strong>貓語翻譯機</strong><span>僅供娛樂與教育・不能取代獸醫</span></footer>
              <div className="share-actions">
                <button className="button primary" type="button" onClick={copyShareCard}>{copied ? "已複製 ✓" : "複製文字"}</button>
                <button className="button secondary" type="button" onClick={() => setShowShareCard(false)}>關閉</button>
              </div>
            </div>
          </section>
        </div>
      )}

      <footer className="site-footer">
        <p>整理自 AAFP／ISFM 指南、Feline Grimace Scale 與同儕審查研究・本站為教育與娛樂用途，不是診斷工具。</p>
        <p>貓咪出現突然或持續的行為改變、疼痛線索或緊急症狀，請聯絡合格獸醫師。</p>
        <a href="./cat-behavior-translation-guide-zh.docx" download>下載完整研究指南（含 12 筆參考資料）</a>
      </footer>
    </div>
  );
}
