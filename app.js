const $ = (selector) => document.querySelector(selector);

const fontCandidates = [
  "Arial",
  "Calibri",
  "Cambria",
  "Consolas",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Inter",
  "Malgun Gothic",
  "Noto Sans KR",
  "Segoe UI",
  "Times New Roman",
  "Verdana",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const isKoreanUser = navigator.language.toLowerCase().startsWith("ko");
const locale = isKoreanUser ? "ko" : "en";

const copy = {
  ko: {
    title: "taken.",
    lead: "당신은 이 페이지를 열었습니다. 권한 요청은 없었습니다.",
    sublead: "그래도 브라우저는 이미 몇 가지를 말했습니다.",
    languageChoice: "한국어를 좋아하는 것 같으니 한국말을 쓰도록 할게요.",
    wait: "잠시만요.",
    darkPreference: "당신은 다크모드를 선호하시네요?",
    lightPreference: "당신은 라이트 모드를 선호하시네요?",
    darkReady: "다크모드로 준비해드릴게요.",
    lightReady: "라이트 모드로 준비해드릴게요.",
    ready: "됐습니다. 이제 브라우저가 말한 것들을 펼쳐볼게요.",
    reading: "reading",
    done: "done",
    fingerprintLabel: "computed in your browser",
    fingerprintNote: "같은 브라우저 신호는 같은 줄무늬를 만듭니다. 서버로 전송하지 않습니다.",
    confessionLabel: "sources & confessions",
    confessionTitle: "이 페이지가 쓴 것",
    confessionCopy:
      "IP 기반 대략 위치, 브라우저 API, 화면 정보, 언어와 시간대, WebGL 그래픽 힌트, 설치 폰트 추정, 캔버스 렌더링 해시를 사용했습니다. 카메라, 마이크, 정확한 GPS 위치, 클립보드, 파일은 요청하지 않았습니다.",
    rescan: "다시 읽기",
  },
  en: {
    title: "taken.",
    lead: "You opened this page. No permission prompt appeared.",
    sublead: "Still, your browser has already said a few things.",
    languageChoice: "Your browser did not lead with Korean, so I will speak English.",
    wait: "One moment.",
    darkPreference: "You seem to prefer dark mode.",
    lightPreference: "You seem to prefer light mode.",
    darkReady: "I will prepare this in dark mode.",
    lightReady: "I will prepare this in light mode.",
    ready: "There. Now let us unfold what your browser said.",
    reading: "reading",
    done: "done",
    fingerprintLabel: "computed in your browser",
    fingerprintNote: "The same browser signals make the same stripes. They are not sent to a server.",
    confessionLabel: "sources & confessions",
    confessionTitle: "What this page used",
    confessionCopy:
      "This page used IP-based approximate location, browser APIs, screen data, language and timezone, WebGL graphics hints, font detection, and a canvas rendering hash. It did not request your camera, microphone, precise GPS location, clipboard, or files.",
    rescan: "Read again",
  },
};

const scrambleSets = [
  "taken. you opened this page still your browser spoke",
  "당신은 이 페이지를 열었습니다 그래도 브라우저는 말했습니다",
  "あなたはこのページを開きました ブラウザはもう話しました",
];

function simpleHash(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomGlyph(index) {
  const set = scrambleSets[index % scrambleSets.length];
  return set[Math.floor(Math.random() * set.length)] || " ";
}

function say(ko, en) {
  return locale === "ko" ? ko : en;
}

async function scrambleTo(element, target, options = {}) {
  const frames = options.frames || 24;
  const delay = options.delay || 34;
  const maxLength = Math.max(element.textContent.length, target.length);

  element.classList.add("scrambling");
  for (let frame = 0; frame <= frames; frame += 1) {
    const settled = Math.floor((frame / frames) * target.length);
    const text = Array.from({ length: maxLength }, (_, index) => {
      if (index < settled) return target[index] || "";
      if (index >= target.length && frame > frames * 0.65) return "";
      return target[index] === " " ? " " : randomGlyph(index + frame);
    }).join("");

    element.textContent = text;
    await sleep(delay);
  }

  element.textContent = target;
  element.classList.remove("scrambling");
}

async function settleIntroLanguage() {
  document.documentElement.lang = locale === "ko" ? "ko" : "en";
  await Promise.all([
    scrambleTo($("#title"), copy[locale].title, { frames: 18, delay: 42 }),
    scrambleTo($("#lead"), copy[locale].lead),
    scrambleTo($("#sublead"), copy[locale].sublead, { frames: 28, delay: 32 }),
  ]);
}

function localizeStaticCopy() {
  $("#fingerprint-label").textContent = copy[locale].fingerprintLabel;
  $("#fingerprint-note").textContent = copy[locale].fingerprintNote;
  $("#confession-label").textContent = copy[locale].confessionLabel;
  $("#confession-title").textContent = copy[locale].confessionTitle;
  $("#confession-copy").textContent = copy[locale].confessionCopy;
  $("#rescan").textContent = copy[locale].rescan;
}

function detectFonts() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const sample = "mmmmmmmmmmlliWW 한글테스트 1234567890";
  const baselines = ["monospace", "serif", "sans-serif"].map((family) => {
    context.font = `72px ${family}`;
    return context.measureText(sample).width;
  });

  return fontCandidates.filter((font) => {
    return ["monospace", "serif", "sans-serif"].some((family, index) => {
      context.font = `72px "${font}", ${family}`;
      return context.measureText(sample).width !== baselines[index];
    });
  });
}

function getWebGLInfo() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return { renderer: say("숨김", "hidden"), vendor: say("숨김", "hidden") };
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  return {
    renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
  };
}

function getCanvasSignature() {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 120;
  const context = canvas.getContext("2d");
  context.textBaseline = "top";
  context.fillStyle = "#f4efe5";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#16120d";
  context.font = "22px Georgia";
  context.fillText("Tell me what the browser gave away.", 18, 22);
  context.fillStyle = "rgba(156, 51, 40, 0.72)";
  context.font = "30px Arial";
  context.fillText("권한 없이 읽힌 문장", 18, 60);
  return simpleHash(canvas.toDataURL()).toString(16).padStart(8, "0");
}

function browserName() {
  const ua = navigator.userAgent;
  if (navigator.brave) return say("Brave 계열", "Brave-like");
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("OPR/")) return "Opera";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Chrome/")) return say("Chrome 계열", "Chromium-based");
  if (ua.includes("Safari/")) return "Safari";
  return say("이름을 숨긴 브라우저", "a browser hiding its name");
}

function osName() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS or iPadOS";
  if (ua.includes("Linux")) return "Linux";
  return navigator.platform || say("알 수 없음", "unknown");
}

function maskedIp(ip) {
  if (!ip) return say("IP는 보였지만 화면에는 숨겼습니다", "the IP was visible, but hidden here");
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.x.x.${parts[3]}`;
  return `${ip.slice(0, 4)}…${ip.slice(-4)}`;
}

async function getIpObservation() {
  try {
    const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!response.ok) throw new Error("location lookup failed");
    const data = await response.json();
    const place = [data.city, data.region, data.country_name].filter(Boolean).join(", ");
    return {
      title: place
        ? say(`대략 ${place} 근처에 있습니다.`, `You appear to be somewhere near ${place}.`)
        : say("당신의 대략적인 지역을 읽으려 했습니다.", "This page tried to read your approximate region."),
      detail: say(
        `정확한 GPS가 아니라 요청에 실린 IP 주소를 위치 데이터베이스에 물었습니다. 화면에는 ${maskedIp(data.ip)}만 남깁니다. ISP 힌트: ${data.org || "숨김"}.`,
        `Not precise GPS. It asked a location database about the IP address on the request. Only ${maskedIp(data.ip)} remains on screen. ISP hint: ${data.org || "hidden"}.`,
      ),
      raw: {
        city: data.city,
        region: data.region,
        country: data.country_name,
        maskedIp: maskedIp(data.ip),
        org: data.org,
      },
    };
  } catch {
    return {
      title: say("위치 조회는 막혔습니다.", "The location lookup was blocked."),
      detail: say(
        "네트워크, CORS, 광고 차단기, 또는 로컬 환경 때문에 IP 위치 조회가 실패했습니다. 그래도 다른 브라우저 신호는 남아 있습니다.",
        "Network settings, CORS, an ad blocker, or the local environment stopped the IP lookup. Other browser signals still remain.",
      ),
      raw: { ipLocation: "failed" },
    };
  }
}

function makeLocalObservations() {
  const graphics = getWebGLInfo();
  const fonts = detectFonts();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const memory = navigator.deviceMemory ? say(`${navigator.deviceMemory}GB 근사치`, `about ${navigator.deviceMemory}GB`) : say("숨김", "hidden");
  const cores = navigator.hardwareConcurrency ? say(`${navigator.hardwareConcurrency}개 논리 코어`, `${navigator.hardwareConcurrency} logical cores`) : say("숨김", "hidden");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const canvas = getCanvasSignature();

  const observations = [
    {
      title: say(`언어는 ${navigator.language}입니다.`, `Your language is ${navigator.language}.`),
      detail: say(
        `선호 언어 목록은 ${(navigator.languages || []).join(", ") || "숨김"}입니다. 페이지는 이것만으로도 당신에게 맞는 문장을 고를 수 있습니다.`,
        `Your preferred languages are ${(navigator.languages || []).join(", ") || "hidden"}. A page can choose its voice from that alone.`,
      ),
      raw: { language: navigator.language, languages: navigator.languages },
    },
    {
      title: say(`시간대는 ${timezone}입니다.`, `Your timezone is ${timezone}.`),
      detail: say(
        `시계 권한은 없었지만, 브라우저는 로컬 시간대를 공개했습니다. 지금 이 탭의 시간은 ${new Date().toLocaleString()}입니다.`,
        `No clock permission was needed, but the browser exposed your local timezone. In this tab, it is ${new Date().toLocaleString()}.`,
      ),
      raw: { timezone },
    },
    {
      title: say(`${browserName()}에서 ${osName()} 신호가 보입니다.`, `${browserName()} is showing signs of ${osName()}.`),
      detail: say(
        "User-Agent와 플랫폼 문자열은 완벽하지 않지만, 여전히 많은 사이트가 이 조각으로 당신의 환경을 분류합니다.",
        "User-Agent and platform strings are imperfect, but many sites still use them to classify your environment.",
      ),
      raw: { browser: browserName(), os: osName(), platform: navigator.platform },
    },
    {
      title: say(
        `화면은 ${screen.width} x ${screen.height}, 현재 창은 ${innerWidth} x ${innerHeight}입니다.`,
        `Your screen is ${screen.width} x ${screen.height}; this window is ${innerWidth} x ${innerHeight}.`,
      ),
      detail: say(
        `픽셀 비율 ${devicePixelRatio}, 색상 깊이 ${screen.colorDepth}bit. 창 크기 하나도 지문 조합의 일부가 됩니다.`,
        `Pixel ratio ${devicePixelRatio}, color depth ${screen.colorDepth}bit. Even a window size can become part of a fingerprint.`,
      ),
      raw: {
        screen: `${screen.width}x${screen.height}`,
        viewport: `${innerWidth}x${innerHeight}`,
        pixelRatio: devicePixelRatio,
        colorDepth: screen.colorDepth,
      },
    },
    {
      title: say(`하드웨어 힌트는 CPU ${cores}, 메모리 ${memory}입니다.`, `Hardware hints say CPU ${cores}, memory ${memory}.`),
      detail: say(
        "이 값들은 정확한 모델명이 아니라 브라우저가 일부러 둥글게 만든 힌트입니다. 그래도 충분히 분류에는 쓸 수 있습니다.",
        "These are not exact model names. They are rounded browser hints, but still useful for classification.",
      ),
      raw: { cores: navigator.hardwareConcurrency, memory: navigator.deviceMemory },
    },
    {
      title: fonts.length
        ? say(`설치된 듯한 폰트 ${fonts.length}개를 감지했습니다.`, `${fonts.length} likely installed fonts were detected.`)
        : say("폰트 목록은 거의 숨겨졌습니다.", "The font list stayed mostly hidden."),
      detail: fonts.length
        ? say(
            `${fonts.slice(0, 8).join(", ")}${fonts.length > 8 ? "..." : ""}. 글자 폭을 재서 추정했습니다. 파일 목록을 읽은 것은 아닙니다.`,
            `${fonts.slice(0, 8).join(", ")}${fonts.length > 8 ? "..." : ""}. It guessed by measuring text width, not by reading your files.`,
          )
        : say("브라우저가 폰트 지문을 잘 막았거나 후보 폰트가 적었습니다.", "Your browser blocked font fingerprinting well, or the candidate list was short."),
      raw: { fonts },
    },
    {
      title: say(`그래픽 렌더러는 ${graphics.renderer}입니다.`, `The graphics renderer is ${graphics.renderer}.`),
      detail: say(
        `WebGL은 GPU와 드라이버의 흔적을 남깁니다. 벤더 힌트는 ${graphics.vendor}입니다.`,
        `WebGL leaves traces of your GPU and driver. Vendor hint: ${graphics.vendor}.`,
      ),
      raw: graphics,
    },
    {
      title: say(`캔버스 렌더링 해시는 ${canvas}입니다.`, `Your canvas rendering hash is ${canvas}.`),
      detail: say(
        "같은 글자를 그려도 운영체제, 폰트, GPU, 안티앨리어싱 차이로 픽셀이 조금씩 달라질 수 있습니다.",
        "The same text can produce slightly different pixels across operating systems, fonts, GPUs, and antialiasing.",
      ),
      raw: { canvas },
    },
    {
      title: connection?.effectiveType
        ? say(`네트워크는 ${connection.effectiveType}로 보입니다.`, `The network looks like ${connection.effectiveType}.`)
        : say("네트워크 힌트는 숨겨졌습니다.", "Network hints stayed hidden."),
      detail: connection
        ? say(
            `다운링크 추정 ${connection.downlink || "숨김"}Mbps, 데이터 절약 모드 ${connection.saveData ? "켜짐" : "꺼짐 또는 숨김"}.`,
            `Estimated downlink ${connection.downlink || "hidden"}Mbps, data saver ${connection.saveData ? "on" : "off or hidden"}.`,
          )
        : say(
            `온라인 상태는 ${navigator.onLine ? "연결됨" : "끊김"}으로만 보입니다.`,
            `Only the online state is visible: ${navigator.onLine ? "connected" : "disconnected"}.`,
          ),
      raw: {
        online: navigator.onLine,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        saveData: connection?.saveData,
      },
    },
  ];

  return observations;
}

function drawBarcode(seed) {
  const hash = simpleHash(seed);
  const bars = Array.from({ length: 16 }, (_, index) => {
    const shifted = (hash >>> (index % 24)) ^ seed.charCodeAt(index % seed.length);
    return 16 + (shifted % 104);
  });

  $("#barcode").innerHTML = bars
    .map((height, index) => `<span style="height: ${height}px; animation-delay: ${index * 40}ms"></span>`)
    .join("");
}

async function render() {
  const list = $("#observations");
  const reading = $("#reading-state");
  list.innerHTML = "";
  reading.textContent = copy[locale].reading;

  const local = makeLocalObservations();
  const ip = await getIpObservation();
  const observations = [ip, ...local];
  const seed = JSON.stringify(observations.map((item) => item.raw));

  drawBarcode(seed);
  $("#fingerprint-title").textContent = `${simpleHash(seed).toString(16)} / 16 bars`;

  for (const [index, item] of observations.entries()) {
    await sleep(index === 0 ? 250 : 420);
    const li = document.createElement("li");
    li.style.animationDelay = "0ms";
    li.innerHTML = `<strong>${item.title}</strong><span>${item.detail}</span>`;
    list.append(li);
  }

  reading.textContent = copy[locale].done;
}

async function preparePage() {
  const setupLine = $("#setup-line");
  const revealContent = $("#reveal-content");
  const wantsDark = prefersDark.matches;

  document.body.classList.remove("theme-dark", "theme-light");
  revealContent.classList.remove("visible");
  setupLine.classList.remove("switching");
  setupLine.textContent = copy[locale].wait;

  await settleIntroLanguage();
  localizeStaticCopy();

  await sleep(600);
  await scrambleTo(setupLine, copy[locale].languageChoice, { frames: 30, delay: 30 });

  await sleep(900);
  setupLine.textContent = wantsDark ? copy[locale].darkPreference : copy[locale].lightPreference;

  await sleep(1500);
  setupLine.classList.add("switching");
  setupLine.textContent = wantsDark ? copy[locale].darkReady : copy[locale].lightReady;
  document.body.classList.add(wantsDark ? "theme-dark" : "theme-light");

  await sleep(1200);
  setupLine.classList.remove("switching");
  setupLine.textContent = copy[locale].ready;

  await sleep(900);
  revealContent.classList.add("visible");
  await render();
}

$("#rescan").addEventListener("click", render);
addEventListener("resize", () => {
  clearTimeout(window.__resizeTimer);
  window.__resizeTimer = setTimeout(render, 200);
});

preparePage();
