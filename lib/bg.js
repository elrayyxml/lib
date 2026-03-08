const axios = require("axios");
const cheerio = require("cheerio");

async function solveCF(url, mode = "turnstile-min") {
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

const shortlink = "https://sfl.gl/41EapuZ";
const UA = "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/132 Mobile Safari/537.36";

console.log("=== STEP 1: Solve CF ===");
const cfHeaders = await solveCF(shortlink, "turnstile-min");
console.log("cfHeaders keys:", Object.keys(cfHeaders));
console.log("cfHeaders.cookie:", cfHeaders.cookie?.slice(0, 80));

console.log("\n=== STEP 2: GET sfl.gl shortlink ===");
const r1 = await axios.get(shortlink, {
  headers: { ...cfHeaders, "user-agent": UA },
  maxRedirects: 0,
  validateStatus: null,
});
console.log("Status:", r1.status);
console.log("Location:", r1.headers.location);
console.log("set-cookie:", r1.headers["set-cookie"]);
console.log("Body snippet:", String(r1.data).slice(0, 300));

// Extract rayId / alias
const $ = cheerio.load(r1.data);
const rayId = $('input[name="ray_id"]').val();
const alias = $('input[name="alias"]').val();
console.log("\nrayId:", rayId, "| alias:", alias);

// Follow redirects to get the real page
console.log("\n=== STEP 3: GET sfl.gl with redirects ===");
const r2 = await axios.get(shortlink, {
  headers: { ...cfHeaders, "user-agent": UA },
  maxRedirects: 5,
  validateStatus: null,
});
console.log("Final status:", r2.status);
console.log("Final URL (responseUrl):", r2.request?.res?.responseUrl || "N/A");
console.log("set-cookie:", r2.headers["set-cookie"]);
const $2 = cheerio.load(r2.data);
const rayId2 = $2('input[name="ray_id"]').val();
const alias2 = $2('input[name="alias"]').val();
console.log("rayId2:", rayId2, "| alias2:", alias2);
console.log("Body snippet:", String(r2.data).slice(0, 500));

// Try redirect.php directly
console.log("\n=== STEP 4: redirect.php ===");
if (rayId || rayId2) {
  const useRayId = rayId || rayId2;
  const useAlias = alias || alias2;
  const r3 = await axios.get("https://tutwuri.id/redirect.php", {
    params: { ray_id: useRayId, alias: useAlias },
    headers: { "user-agent": UA, referer: "https://sfl.gl/" },
    maxRedirects: 0,
    validateStatus: null,
  });
  console.log("Status:", r3.status);
  console.log("Location:", r3.headers.location);
  console.log("set-cookie:", r3.headers["set-cookie"]);
  console.log("Body:", String(r3.data).slice(0, 400));

  // Try with cookies
  const cookies1 = (r1.headers["set-cookie"] || []).map(c => c.split(";")[0]).join("; ");
  const cookies2 = (r2.headers["set-cookie"] || []).map(c => c.split(";")[0]).join("; ");
  const allCookies = [cfHeaders.cookie, cookies1, cookies2].filter(Boolean).join("; ");
  console.log("\nRetry redirect.php WITH cookies:", allCookies.slice(0, 100));
  const r4 = await axios.get("https://tutwuri.id/redirect.php", {
    params: { ray_id: useRayId, alias: useAlias },
    headers: { "user-agent": UA, referer: "https://sfl.gl/", cookie: allCookies },
    maxRedirects: 0,
    validateStatus: null,
  });
  console.log("Status:", r4.status);
  console.log("Location:", r4.headers.location);
  console.log("set-cookie:", r4.headers["set-cookie"]);
  console.log("Body:", String(r4.data).slice(0, 400));
}
