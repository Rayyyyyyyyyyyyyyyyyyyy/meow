"use client";

import { useMemo, useState } from "react";

type SignalOption = {
  label: string;
  note: string;
  weights: Partial<Record<StateKey, number>>;
  evidence: string;
};

type StateKey = "relaxed" | "curious" | "fear" | "overstimulated" | "pain";

const categories: { id: string; label: string; prompt: string; options: SignalOption[] }[] = [
  {
    id: "posture",
    label: "身體姿勢",
    prompt: "先看整體輪廓",
    options: [
      { label: "放鬆伸展", note: "身體柔軟、四肢自然", weights: { relaxed: 3 }, evidence: "RSPCA" },
      { label: "壓低蜷縮", note: "身體緊、頭低、尾巴貼身", weights: { fear: 3, pain: 1 }, evidence: "AAFP / RSPCA" },
      { label: "側身拱背", note: "身體轉側、毛豎起", weights: { fear: 2, overstimulated: 3 }, evidence: "RSPCA" },
      { label: "露出肚子", note: "需搭配肌肉是否放鬆", weights: { relaxed: 1, fear: 1 }, evidence: "RSPCA" },
    ],
  },
  {
    id: "ears",
    label: "耳朵",
    prompt: "耳朵是情緒雷達",
    options: [
      { label: "自然向前", note: "耳朵放鬆、朝前", weights: { relaxed: 2, curious: 1 }, evidence: "Cats Protection" },
      { label: "轉向側後", note: "一耳或雙耳向側／後", weights: { fear: 2, overstimulated: 1 }, evidence: "AAFP" },
      { label: "完全壓平", note: "貼近頭部", weights: { fear: 3, overstimulated: 2 }, evidence: "RSPCA" },
      { label: "向外分開", note: "耳尖外轉、間距增加", weights: { pain: 3 }, evidence: "Feline Grimace Scale" },
    ],
  },
  {
    id: "tail",
    label: "尾巴",
    prompt: "位置和速度都重要",
    options: [
      { label: "直立靠近", note: "尾巴向上、主動走近", weights: { relaxed: 2, curious: 1 }, evidence: "Deputte et al." },
      { label: "緊貼身體", note: "收緊或繞住身體", weights: { fear: 3 }, evidence: "RSPCA" },
      { label: "炸毛膨起", note: "尾毛豎立、體型放大", weights: { fear: 2, overstimulated: 3 }, evidence: "RSPCA" },
      { label: "快速甩動", note: "大幅、持續拍打", weights: { overstimulated: 3 }, evidence: "iCatCare" },
    ],
  },
  {
    id: "face",
    label: "眼睛與臉",
    prompt: "光線也會影響瞳孔",
    options: [
      { label: "柔和半閉", note: "臉部與鬍鬚放鬆", weights: { relaxed: 2 }, evidence: "Cats Protection" },
      { label: "慢慢眨眼", note: "連續半眨與閉眼", weights: { relaxed: 3 }, evidence: "Humphrey et al." },
      { label: "瞳孔放大", note: "需排除昏暗環境", weights: { fear: 2, curious: 1, overstimulated: 1 }, evidence: "AAFP / RSPCA" },
      { label: "瞇眼＋臉緊", note: "口鼻緊、鬍鬚前伸、頭低", weights: { pain: 4 }, evidence: "Feline Grimace Scale" },
    ],
  },
  {
    id: "context",
    label: "發生情境",
    prompt: "同一訊號可能有不同意思",
    options: [
      { label: "主動打招呼", note: "靠近熟悉的人或貓", weights: { relaxed: 2 }, evidence: "Deputte et al." },
      { label: "陌生刺激", note: "訪客、噪音、外出籠", weights: { fear: 2 }, evidence: "AAFP" },
      { label: "摸到一半", note: "觸摸或梳理過程中", weights: { overstimulated: 2, pain: 1 }, evidence: "AAFP" },
      { label: "行為突然改變", note: "和平常基準明顯不同", weights: { pain: 3 }, evidence: "Cornell / AAFP" },
    ],
  },
];

const stateCopy: Record<StateKey, {
  title: string;
  subtitle: string;
  response: string;
  flag: string;
  tone: string;
}> = {
  relaxed: {
    title: "較可能放鬆、願意互動",
    subtitle: "目前訊號偏向安全與正向社交，但仍應尊重牠是否主動靠近。",
    response: "保持動作緩慢，讓牠先嗅聞；可慢慢眨眼，並在牠離開時停止互動。",
    flag: "若半閉眼只出現在單側，或伴隨分泌物、抓眼，請諮詢獸醫。",
    tone: "positive",
  },
  curious: {
    title: "較可能好奇或注意力提高",
    subtitle: "牠正在收集環境資訊；興奮程度可能快速變化。",
    response: "讓牠自行探索，保持退路，避免突然伸手或抱起。",
    flag: "瞳孔大小也受光線影響，不能單獨用來判斷情緒。",
    tone: "curious",
  },
  fear: {
    title: "較可能擔心、害怕或想避開",
    subtitle: "壓低身體、耳朵後轉與尾巴貼身是需要空間的組合。",
    response: "停止逼近與凝視，降低聲光刺激，提供紙箱、高處或熟悉外出籠作為躲藏處。",
    flag: "不要把躲藏處拉開、強抱或處罰；那可能使防禦反應升級。",
    tone: "caution",
  },
  overstimulated: {
    title: "較可能高度喚起、挫折或過度刺激",
    subtitle: "快速甩尾、壓耳與身體緊繃常表示互動應暫停。",
    response: "把手移開、拉開距離，讓牠自行冷靜；不要徒手介入貓咪衝突。",
    flag: "若伴隨持續追逐、堵路、低吼或尖叫，較不像互惠玩耍。",
    tone: "alert",
  },
  pain: {
    title: "出現疼痛或不適的警示組合",
    subtitle: "耳位外轉、瞇眼、口鼻緊繃、鬍鬚改變與頭低是經驗證疼痛量表所使用的線索。",
    response: "記錄出現時間、拍攝短片，觀察食慾、活動、排泄與呼吸，聯絡獸醫評估。",
    flag: "網站不能診斷疼痛；突然改變、不吃、呼吸費力、無法排尿或明顯虛弱應儘快就醫。",
    tone: "danger",
  },
};

const sourceCards = [
  {
    tag: "臨床量表",
    title: "Feline Grimace Scale",
    text: "以耳位、眼眶收緊、口鼻張力、鬍鬚與頭部位置評估急性疼痛；研究顯示良好效度與一致性。",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6911058/",
  },
  {
    tag: "實驗研究",
    title: "慢眨眼與人貓溝通",
    text: "貓在人類慢眨眼後更常做出眼睛收窄動作，也更可能接近先前不熟悉的實驗者。",
    href: "https://pubmed.ncbi.nlm.nih.gov/33020542/",
  },
  {
    tag: "觀察研究",
    title: "尾巴直立與社交接近",
    text: "尾巴直立常見於社交接近；在人貓互動中，直尾與直立耳朵的組合尤其常見。",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8469685/",
  },
  {
    tag: "臨床指南",
    title: "AAFP／ISFM 環境需求",
    text: "強調躲藏是壓力下的因應行為，並建議提供安全處、分散資源、遊戲與可預測的人貓互動。",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11383066/",
  },
  {
    tag: "互動研究",
    title: "玩耍還是打架？",
    text: "互惠摔抱較接近玩耍；大量叫聲與非互惠追逐則較接近衝突，兩者之間也存在灰色地帶。",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9879969/",
  },
  {
    tag: "照護資料",
    title: "行為變化與健康",
    text: "過度舔毛、亂尿與突然躲藏可能與壓力或疾病相關，需先排除皮膚、疼痛與泌尿問題。",
    href: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/cats-lick-too-much",
  },
];

function scoreSelections(selections: number[]) {
  const scores: Record<StateKey, number> = { relaxed: 0, curious: 0, fear: 0, overstimulated: 0, pain: 0 };
  const evidence: string[] = [];
  categories.forEach((category, index) => {
    const option = category.options[selections[index]];
    Object.entries(option.weights).forEach(([key, value]) => {
      scores[key as StateKey] += value ?? 0;
    });
    evidence.push(`${category.label}：${option.label}`);
  });
  const ordered = (Object.entries(scores) as [StateKey, number][]).sort((a, b) => b[1] - a[1]);
  const top = ordered[0];
  const second = ordered[1];
  const confidence = top[1] >= 10 && top[1] - second[1] >= 4 ? "較高" : top[1] >= 7 && top[1] - second[1] >= 2 ? "中等" : "有限";
  return { state: top[0], confidence, evidence, scores };
}

export default function Home() {
  const [selections, setSelections] = useState([0, 0, 0, 0, 0]);
  const [submitted, setSubmitted] = useState(false);
  const result = useMemo(() => scoreSelections(selections), [selections]);
  const copy = stateCopy[result.state];

  function choose(categoryIndex: number, optionIndex: number) {
    setSelections((current) => current.map((value, index) => index === categoryIndex ? optionIndex : value));
    setSubmitted(false);
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#" aria-label="貓語行為觀察室首頁">
          <span className="brand-mark">M</span>
          <span>貓語行為觀察室</span>
        </a>
        <div className="nav-actions">
          <a href="#evidence">研究依據</a>
          <a className="doc-link" href="./cat-behavior-translation-guide-zh.docx" download>下載完整指南</a>
        </div>
      </nav>

      <header className="hero behavior-hero">
        <div className="hero-copy">
          <p className="eyebrow">EVIDENCE-INFORMED CAT BEHAVIOUR GUIDE</p>
          <h1>讀懂整隻貓，<br />不猜一句話。</h1>
          <p className="lede">
            從姿勢、耳朵、尾巴、眼睛與情境，整理出較可能的情緒狀態與安全回應。不是讀心術，而是有來源的觀察工具。
          </p>
          <div className="principles">
            <span>多重訊號</span><span>對照平常</span><span>納入情境</span>
          </div>
        </div>
        <div className="hero-note">
          <span className="note-number">01</span>
          <p>單一動作沒有固定答案</p>
          <strong>露肚子可能是信任，也可能是防禦姿勢；咕嚕可能舒服，也可能出現在壓力或疼痛時。</strong>
          <div className="observation-line"><i /><i /><i /><i /><i /></div>
        </div>
      </header>

      <section className="observer" id="observer">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BEHAVIOUR OBSERVER</p>
            <h2>你現在觀察到什麼？</h2>
          </div>
          <p>每一欄選一個最接近的狀態。若看不清楚，寧可稍後再觀察。</p>
        </div>

        <div className="observer-layout">
          <div className="signal-panel">
            {categories.map((category, categoryIndex) => (
              <fieldset className="signal-group" key={category.id}>
                <legend>
                  <span>{String(categoryIndex + 1).padStart(2, "0")}</span>
                  <b>{category.label}</b>
                  <small>{category.prompt}</small>
                </legend>
                <div className="signal-options">
                  {category.options.map((option, optionIndex) => (
                    <button
                      type="button"
                      key={option.label}
                      className={selections[categoryIndex] === optionIndex ? "signal-option selected" : "signal-option"}
                      aria-pressed={selections[categoryIndex] === optionIndex}
                      onClick={() => choose(categoryIndex, optionIndex)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.note}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
            <button className="analyze" type="button" onClick={() => setSubmitted(true)}>
              分析行為線索 <span>→</span>
            </button>
          </div>

          <aside className={`analysis-card ${submitted ? "revealed" : ""}`}>
            <div className="analysis-topline">
              <span>OBSERVATION SUMMARY</span>
              <span className={`status-dot ${copy.tone}`} />
            </div>
            {!submitted ? (
              <div className="analysis-empty">
                <div className="cat-face-mini"><i /><i /><b /><b /></div>
                <h3>選好五項線索後開始分析</h3>
                <p>結果會呈現可能狀態，不會假裝翻譯成一句人話。</p>
              </div>
            ) : (
              <div className="analysis-result" aria-live="polite">
                <p className="result-kicker">較可能的狀態</p>
                <h3>{copy.title}</h3>
                <p className="result-summary">{copy.subtitle}</p>

                <div className="confidence">
                  <span>判讀信心</span><strong>{result.confidence}</strong>
                  <div><i /><i className={result.confidence !== "有限" ? "on" : ""} /><i className={result.confidence === "較高" ? "on" : ""} /></div>
                </div>

                <div className="evidence-list">
                  <span>你選的線索</span>
                  {result.evidence.map((item) => <p key={item}>{item}</p>)}
                </div>

                <div className="response-box">
                  <span>現在可以怎麼做</span>
                  <p>{copy.response}</p>
                </div>

                <div className="warning-box">
                  <span>需要留意</span>
                  <p>{copy.flag}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="rule-section">
        <p className="eyebrow">THE FOUR-RULE METHOD</p>
        <h2>可靠判讀的四條規則</h2>
        <div className="rule-grid">
          <article><span>01</span><h3>看組合</h3><p>耳朵、尾巴和姿勢要一起看；不要用單一訊號下結論。</p></article>
          <article><span>02</span><h3>看情境</h3><p>昏暗會放大瞳孔；遊戲、陌生人與獸醫院會改變同一動作的意思。</p></article>
          <article><span>03</span><h3>看基準</h3><p>和這隻貓平常的樣子比較，比和網路上的「標準貓」比較更重要。</p></article>
          <article><span>04</span><h3>看變化</h3><p>突然躲藏、不吃、亂尿或不願跳躍，可能是健康警訊，不只是心情。</p></article>
        </div>
      </section>

      <section className="evidence-section" id="evidence">
        <div className="section-heading light">
          <div>
            <p className="eyebrow">RESEARCH & CLINICAL GUIDANCE</p>
            <h2>判讀依據</h2>
          </div>
          <p>研究結果告訴我們「較可能」，不是每一隻貓都適用的固定字典。</p>
        </div>
        <div className="source-grid">
          {sourceCards.map((source, index) => (
            <a href={source.href} target="_blank" rel="noreferrer" className="source-card" key={source.title}>
              <div><span>{source.tag}</span><b>{String(index + 1).padStart(2, "0")}</b></div>
              <h3>{source.title}</h3>
              <p>{source.text}</p>
              <em>開啟原始資料 ↗</em>
            </a>
          ))}
        </div>
      </section>

      <section className="medical-note">
        <div>
          <p className="eyebrow">WHEN BEHAVIOUR BECOMES A HEALTH SIGNAL</p>
          <h2>行為突然變了，先想到健康。</h2>
        </div>
        <div>
          <p>持續躲藏、食慾下降、排泄改變、過度舔毛、不願跳躍、突然攻擊或臉部疼痛表情，都值得記錄並詢問獸醫。</p>
          <p className="urgent">呼吸費力、無法排尿、昏厥、癲癇或明顯虛弱屬緊急情況。</p>
        </div>
      </section>

      <footer>
        <span>貓語行為觀察室 © 2026</span>
        <span>資料整理日期：2026 年 7 月 20 日</span>
        <span>教育用途，不取代獸醫診斷</span>
      </footer>
    </main>
  );
}
