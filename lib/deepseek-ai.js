/*
Deepsek ai
Author: nath 
Base: https://deepseekfree.ai/
Note: Bantu push followers --> 50
Sumber: https://whatsapp.com/channel/0029VbC5OZT7T8bXkKXY2d30
*/


import { randomBytes } from "crypto";

const base = "https://api-preview.chatgot.io";

const hdrs = {
  "accept": "text/event-stream",
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "content-type": "application/json",
  "origin": "https://deepseekfree.ai",
  "referer": "https://deepseekfree.ai/",
  "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
};

const randomDeviceId = () => randomBytes(16).toString("hex");

async function chat(message) {
  const res = await fetch(`${base}/api/v1/char-gpt/conversations`, {
    method : "POST",
    headers: hdrs,
    body   : JSON.stringify({
      device_id        : randomDeviceId(),
      model_id         : 2,
      include_reasoning: false,
      messages         : [{ role: "user", content: message }],
    }),
  });

  let data = "";
  const decoder = new TextDecoder();
  
  for await (const chunk of res.body) {
    const lines = decoder.decode(chunk, { stream: true }).split("\n");
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      try {
        const json = JSON.parse(line.slice(5).trim());
        if (json?.data?.content) {
          data += json.data.content;
        }
      } catch {}
    }
  }

  return data;
}

chat("Halo, Perkenalkan Dirimu").then(console.log)