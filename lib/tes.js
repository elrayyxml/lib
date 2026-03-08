const axios = require("axios");
const cheerio = require("cheerio");

class TutwuriBypassClient {
  constructor() {
    this.cookies = [];
    this.cfHeaders = {};
    this.refererLocation = "";
    this.turnstileToken = "";
    this.verification = null;
  }

  async solveCF(url, mode = "turnstile-min") {
    const res = await fetch("https://cf.zenzxz.web.id/solve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, mode }),
    });
    const data = await res.json();
    if (!data?.status) throw new Error(`CF solve gagal: ${JSON.stringify(data)}`);
    return {
      ...data.data.headers,
      cookie: (data.data.cookies || []).map(c => `${c.name}=${c.value}`).join("; "),
    };
  }

  async get(shortlink) {
    console.log("[1/5] Solve Cloudflare...");
    this.cfHeaders = await this.solveCF(shortlink, "turnstile-min");
    if (this.cfHeaders.cookie) {
      this.cfHeaders.cookie.split(";").map(c => c.trim()).filter(Boolean).forEach(c => {
        if (!this.cookies.includes(c)) this.cookies.push(c);
      });
    }

    console.log("[2/5] Ambil parameter sfl.gl...");
    await this.step1_getInitialPage(shortlink);
    console.log("  → rayId:", this.rayId, "| alias:", this.alias);

    console.log("[3/5] Redirect ke tutwuri.id...");
    await this.step2_redirectWithParams();
    console.log("  → refererLocation:", this.refererLocation);
    console.log("  → cookies count:", this.cookies.length);
    console.log("  → cookie header:", this.getCookieHeader().slice(0, 120) + "...");

    console.log("[4/5] Bypass Turnstile...");
    await this.step4_bypassTurnstile();
    console.log("  → turnstileToken:", this.turnstileToken ? this.turnstileToken.slice(0, 40) + "..." : "NULL");

    console.log("[4.5] Kirim verify (debug)...");
    await this.step5_verify_debug();

    console.log("[5/5] Ambil link asli...");
    const rawUrl = await this.step7_go();

    if (rawUrl && rawUrl.includes("sfl.gl/ready/go")) {
      const finalLink = await this.followSflGl(rawUrl);
      return { sfl: rawUrl, link: finalLink };
    }
    return { sfl: null, link: rawUrl };
  }

  async step5_verify_debug() {
    const cookieHeader = this.getCookieHeader();
    const referer = `https://tutwuri.id/${this.refererLocation}`;

    // Coba 3 cara berbeda, print hasilnya
    const attempts = [
      {
        label: "form-urlencoded",
        data: new URLSearchParams({ _a: "0", "cf-turnstile-response": this.turnstileToken }).toString(),
        contentType: "application/x-www-form-urlencoded",
      },
      {
        label: "JSON",
        data: JSON.stringify({ _a: 0, "cf-turnstile-response": this.turnstileToken }),
        contentType: "application/json",
      },
      {
        label: "form-urlencoded _a=1",
        data: new URLSearchParams({ _a: "1", "cf-turnstile-response": this.turnstileToken }).toString(),
        contentType: "application/x-www-form-urlencoded",
      },
    ];

    for (const attempt of attempts) {
      try {
        const res = await axios.post(
          "https://tutwuri.id/api/v1/verify",
          attempt.data,
          {
            headers: {
              authority: "tutwuri.id",
              accept: "application/json, text/plain, */*",
              "content-type": attempt.contentType,
              cookie: cookieHeader,
              origin: "https://tutwuri.id",
              referer,
              "user-agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/132 Mobile Safari/537.36",
              "x-requested-with": "XMLHttpRequest",
            },
            validateStatus: null,
          }
        );
        console.log(`  [${attempt.label}] Status: ${res.status} | Response:`, JSON.stringify(res.data).slice(0, 200));
        if (res.status === 200) {
          this.verification = res.data;
          console.log("  ✓ Berhasil dengan:", attempt.label);
          return;
        }
      } catch (e) {
        console.log(`  [${attempt.label}] Error:`, e.message);
      }
    }
    throw new Error("Semua attempt verify gagal");
  }

  async followSflGl(sflUrl) {
    try {
      const r = await axios.get(sflUrl, {
        headers: { ...this.defaultHeaders("sfl.gl"), ...this.cfHeaders },
        maxRedirects: 5,
        validateStatus: null,
      });
      const responseUrl = r.request?.res?.responseUrl || r.request?.responseURL || "";
      if (responseUrl && !responseUrl.includes("sfl.gl")) return responseUrl;
      const html = String(r.data);
      const extracted = this.extractLink(html);
      return extracted || sflUrl;
    } catch (e) {
      return sflUrl;
    }
  }

  extractLink(html) {
    const m1 = html.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
    if (m1) return m1[1].replace(/\\\//g, "/");
    const m2 = html.match(/(?<![.\w])location\.href\s*=\s*["']([^"']+)["']/);
    if (m2) return m2[1].replace(/\\\//g, "/");
    const m3 = html.match(/location\.replace\(["']([^"']+)["']\)/);
    if (m3) return m3[1].replace(/\\\//g, "/");
    const m4 = html.match(/content=["']\d+;\s*url=([^"']+)["']/i);
    if (m4) return m4[1].trim();
    const $ = cheerio.load(html);
    let found = null;
    $("a[href]").each((_, el) => {
      if (found) return;
      const href = $(el).attr("href") || "";
      if (href.startsWith("http") && (
        href.includes("mediafire") || href.includes("drive.google") ||
        href.includes("mega.nz") || href.includes("dropbox") ||
        href.includes("1drv") || href.includes("4shared") ||
        href.includes("gofile") || href.includes("pixeldrain")
      )) found = href;
    });
    if (found) return found;
    const m5 = html.match(/https?:\/\/(?:www\.)?mediafire\.com\/[^\s"'<>]+/);
    if (m5) return m5[0];
    return null;
  }

  async step1_getInitialPage(shortlink) {
    let res = await axios.get(shortlink, {
      headers: { ...this.defaultHeaders("sfl.gl"), ...this.cfHeaders },
      validateStatus: null,
    });
    if (res.status === 403) {
      res = await axios.get(shortlink, {
        headers: { ...this.defaultHeaders("sfl.gl") },
        validateStatus: null,
      });
    }
    this.appendCookies(res.headers["set-cookie"]);
    const $ = cheerio.load(res.data);
    this.rayId = $('input[name="ray_id"]').val();
    this.alias = $('input[name="alias"]').val();
    if (!this.rayId || !this.alias) throw new Error("Gagal ambil rayId/alias");
  }

  async step2_redirectWithParams() {
    const res = await axios.get("https://tutwuri.id/redirect.php", {
      params: { ray_id: this.rayId, alias: this.alias },
      headers: {
        ...this.defaultHeaders("tutwuri.id"),
        cookie: this.getCookieHeader(),
        referer: "https://sfl.gl/",
      },
      maxRedirects: 0,
      validateStatus: null,
    });
    this.appendCookies(res.headers["set-cookie"]);
    this.refererLocation = (res.headers.location || "").replace(/^\//, "");

    if (this.refererLocation) {
      const visit = await axios.get(`https://tutwuri.id/${this.refererLocation}`, {
        headers: {
          ...this.defaultHeaders("tutwuri.id"),
          cookie: this.getCookieHeader(),
          referer: "https://sfl.gl/",
        },
        validateStatus: null,
      });
      this.appendCookies(visit.headers["set-cookie"]);

      // Cek apakah ada token/field tersembunyi di halaman tutwuri
      const $ = cheerio.load(visit.data);
      const hiddenFields = {};
      $("input[type=hidden]").each((_, el) => {
        hiddenFields[$(el).attr("name")] = $(el).val();
      });
      if (Object.keys(hiddenFields).length) {
        console.log("  → hidden fields di tutwuri page:", JSON.stringify(hiddenFields));
      }
    }
  }

  async step4_bypassTurnstile() {
    const res = await fetch("https://cf.zenzxz.web.id/solve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: "https://tutwuri.id/",
        siteKey: "0x4AAAAAAAfjzEk6sEUVcFw1",
        mode: "turnstile-min",
      }),
    });
    const data = await res.json();
    if (!data?.status) throw new Error("Turnstile gagal");
    this.turnstileToken = data.data.token;
  }

  async step7_go() {
    const res = await axios.post(
      "https://tutwuri.id/api/v1/go",
      {
        key: Math.floor(Math.random() * 1000),
        size: "2278.3408",
        _dvc: Buffer.from(Math.floor(Math.random() * 1000).toString()).toString("base64"),
      },
      {
        headers: {
          ...this.apiHeaders(),
          origin: "https://tutwuri.id",
          referer: `https://tutwuri.id/${this.refererLocation}`,
        },
        validateStatus: null,
      }
    );
    const redirectUrl = res.data?.url;
    if (!redirectUrl) throw new Error("Tidak ada URL dari /api/v1/go: " + JSON.stringify(res.data));
    const verifyTarget = this.verification?.target;
    if (!verifyTarget) return redirectUrl;
    const r = await axios.get(verifyTarget, {
      headers: {
        ...this.defaultHeaders("app.khaddavi.net"),
        cookie: this.getCookieHeader(),
      },
      maxRedirects: 10,
      validateStatus: null,
    });
    const html = String(r.data);
    const extracted = this.extractLink(html);
    return extracted || redirectUrl;
  }

  defaultHeaders(host) {
    return {
      authority: host,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/132 Mobile Safari/537.36",
    };
  }

  apiHeaders() {
    return {
      authority: "tutwuri.id",
      accept: "application/json, text/plain, */*",
      cookie: this.getCookieHeader(),
      "user-agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/132 Mobile Safari/537.36",
    };
  }

  appendCookies(arr) {
    if (!Array.isArray(arr)) return;
    this.cookies.push(...arr.map(c => c.split(";")[0]));
  }

  getCookieHeader() {
    return [...new Set(this.cookies)].filter(Boolean).join("; ");
  }
}

const client = new TutwuriBypassClient();
const result = await client.get("https://sfl.gl/41EapuZ");
console.log(JSON.stringify(result, null, 2));
