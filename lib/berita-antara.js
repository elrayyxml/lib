import axios from 'axios';
import * as cheerio from 'cheerio';

async function scrapeAntaraNews() {
    const response = await axios.get("https://www.antaranews.com", {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "accept-language": "en-US,en;q=0.9,id;q=0.8",
        },
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $("#editor_picks .item").each((_, element) => {
        const $item = $(element);

        const title = $item.find(".post_title a").text().trim();
        const link = $item.find(".post_title a").attr("href");
        const image = $item.find("img").data("src");
        const category = $item.find(".list-inline .text-primary").text().trim();
        const isInfographic = $item.find(".format-overlay").length > 0;

        if (title && link) {
            results.push({
                title,
                link,
                image,
                category,
                type: isInfographic ? "infographic" : "article",
            });
        }
    });

    if (results.length === 0) {
        throw new Error("No news found");
    }

    return results;
}

export const metadata = {
    path: '/berita/antara',
    method: 'get',
    tags: ['Berita'],
    summary: 'Antara',
    description: 'Mendapatkan berita terbaru dari Antara News'
};

export const handler = async (req, res) => {
    try {
        const data = await scrapeAntaraNews();
        
        res.status(200).json({
            status: true,
            result: data
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        });
    }
};