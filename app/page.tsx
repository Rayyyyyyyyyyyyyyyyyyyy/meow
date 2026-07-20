"use client";

import { useMemo, useState } from "react";

const sounds = ["短短喵", "長～喵", "咕嚕咕嚕", "半夜嚎叫"];
const moods = ["尾巴豎高", "飛機耳", "慢慢眨眼", "躺著露肚"];

const translations: Record<string, { text: string; mood: string; tip: string }> = {
  "短短喵|尾巴豎高": {
    text: "嗨！你終於來了。先摸摸我，再看看碗裡。",
    mood: "開心・期待",
    tip: "用溫柔的聲音回應，再陪牠互動 3–5 分鐘。",
  },
  "長～喵|飛機耳": {
    text: "我有點不爽，請把那個吵吵的東西拿遠一點。",
    mood: "警戒・煩躁",
    tip: "先給牠空間，移除噪音或陌生刺激，不要強抱。",
  },
  "咕嚕咕嚕|慢慢眨眼": {
    text: "現在很舒服。我信任你，這個位置請不要停。",
    mood: "安心・親密",
    tip: "也對牠慢慢眨眼，這是貓咪版本的「我喜歡你」。",
  },
  "半夜嚎叫|躺著露肚": {
    text: "我不一定要摸肚子，但我現在真的很無聊。",
    mood: "精力旺盛",
    tip: "睡前安排 10 分鐘狩獵型遊戲，最後給一點小點心。",
  },
};

export default function Home() {
  const [sound, setSound] = useState(sounds[0]);
  const [mood, setMood] = useState(moods[0]);
  const [result, setResult] = useState(translations["短短喵|尾巴豎高"]);
  const [isTranslating, setIsTranslating] = useState(false);

  const key = useMemo(() => `${sound}|${mood}`, [sound, mood]);

  function translate() {
    setIsTranslating(true);
    window.setTimeout(() => {
      setResult(
        translations[key] ?? {
          text: sound === "半夜嚎叫"
            ? "我有重要的事要宣布：現在是玩耍時間。"
            : mood === "飛機耳"
              ? "我需要一點距離，等我準備好會再靠近你。"
              : "我正在跟你說話。請看著我，再猜一次！",
          mood: mood === "飛機耳" ? "緊張・需要空間" : "想被理解",
          tip: "同時觀察眼睛、耳朵與尾巴；單一訊號不一定代表全部。",
        }
      );
      setIsTranslating(false);
    }, 420);
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#" aria-label="貓語 Meowish 首頁">
          <span className="brand-mark">M</span>
          <span>貓語 Meowish</span>
        </a>
        <a className="nav-link" href="#how">怎麼運作？</a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">CAT–HUMAN COMMUNICATION LAB</p>
          <h1>你家主子<br />剛剛說什麼？</h1>
          <p className="lede">
            選擇牠的聲音和小動作，我們幫你翻譯成比較像人類聽得懂的話。
          </p>
          <div className="trust">
            <div className="faces" aria-hidden="true"><span>😸</span><span>😼</span><span>😽</span></div>
            <p><strong>12,480</strong> 位鏟屎官<br />今天少被白眼一次</p>
          </div>
        </div>

        <div className="translator" aria-label="貓咪翻譯器">
          <div className="cat-window">
            <div className="sun" />
            <div className="cat">
              <i className="ear left" /><i className="ear right" />
              <b className="eye left" /><b className="eye right" />
              <em className="nose" />
            </div>
            <div className="sound-wave"><span /><span /><span /><span /><span /></div>
            <p>正在聽主子的暗示…</p>
          </div>

          <div className="controls">
            <fieldset>
              <legend><span>01</span> 牠發出什麼聲音？</legend>
              <div className="chips">
                {sounds.map((item) => (
                  <button
                    type="button"
                    className={sound === item ? "chip active" : "chip"}
                    aria-pressed={sound === item}
                    onClick={() => setSound(item)}
                    key={item}
                  >{item}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend><span>02</span> 同時在做什麼？</legend>
              <div className="chips">
                {moods.map((item) => (
                  <button
                    type="button"
                    className={mood === item ? "chip active" : "chip"}
                    aria-pressed={mood === item}
                    onClick={() => setMood(item)}
                    key={item}
                  >{item}</button>
                ))}
              </div>
            </fieldset>
            <button className="translate" type="button" onClick={translate} disabled={isTranslating}>
              {isTranslating ? "翻譯中…" : "翻譯成貓話"} <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="result-section" aria-live="polite">
        <div className="result-label">MEOW → HUMAN</div>
        <div className={isTranslating ? "result-card loading" : "result-card"}>
          <div>
            <p className="result-kicker">翻譯結果</p>
            <blockquote>「{result.text}」</blockquote>
          </div>
          <div className="result-meta">
            <p><span>現在心情</span><strong>{result.mood}</strong></p>
            <p><span>鏟屎官可以這樣做</span>{result.tip}</p>
          </div>
        </div>
        <p className="disclaimer">貓咪翻譯機是趣味觀察工具，不取代獸醫師或動物行為專業建議。</p>
      </section>

      <section className="how" id="how">
        <p className="eyebrow">READ THE WHOLE CAT</p>
        <h2>翻譯貓咪，不能只聽一聲「喵」。</h2>
        <div className="how-grid">
          <article><span>01</span><h3>先聽聲音</h3><p>音高、長短和重複次數，都可能改變意思。</p></article>
          <article><span>02</span><h3>再看身體</h3><p>耳朵、尾巴和眼神，才是貓咪真正的字幕。</p></article>
          <article><span>03</span><h3>記得看情境</h3><p>同一個動作，在飯前和看醫生時可能完全不同。</p></article>
        </div>
      </section>

      <footer><span>貓語 Meowish © 2026</span><span>多看一眼，少猜一點。</span></footer>
    </main>
  );
}
