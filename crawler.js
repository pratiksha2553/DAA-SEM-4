const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const maxDepth = 2;
const seedURL = 'https://moodle.spit.ac.in/';
const queue = [{ url: seedURL, depth: 1 }];
const visited = new Set();
// Create a SQLite database connection
const db = new sqlite3.Database('webcrawler.db');
// Create a table to store the crawled data
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS weblink (id INTEGER PRIMARY KEY, url TEXT, rank INTEGER, keywords TEXT)");
});
async function crawl() {
  while (queue.length > 0) {
    const { url, depth } = queue.pop();
    if (visited.has(url)) {
      continue;
    }
    visited.add(url);
    console.log("Crawling webpage: ", url);
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        // Extract and store keywords (4/5 keywords)
        const keywordElements = $('meta[name=keywords]');
        let pageKeywords = keywordElements.attr('content');
        if (!pageKeywords) {
          const descriptionKeywords = $('meta[name=description]').attr('content');
          pageKeywords = descriptionKeywords || 'N/A';
        }
        // Split the keywords into an array and take the first 5
        const keywordsArray = pageKeywords.split(',').map(keyword => keyword.trim());
        const selectedKeywords = keywordsArray.slice(0, 5).join(',');
        console.log(`Rank: ${depth}`);
        console.log(`Keywords: ${selectedKeywords || 'N/A'}`);
        console.log('----------------------------------------------------------');
        // Insert data into the SQLite database
        db.run("INSERT INTO weblink (url, rank, keywords) VALUES (?, ?, ?)", [url, depth, selectedKeywords]);
        if (depth < maxDepth) {
          $('a').each((index, element) => {
            const link = $(element).attr('href');
            if (link && link.startsWith('http')) {
              queue.push({ url: link, depth: depth + 1 });
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}: ${error.message}`);
    }
  }
  // Call the function to view the database contents
  viewDatabase();
}
// Function to view the contents of the SQLite database
function viewDatabase() {
  db.all('SELECT * FROM weblink', (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Viewing database contents:');
    console.log(rows);
    // Close the database connection when crawling is finished
    db.close();
    console.log("Crawling Over");
  });
}
crawl();
