const fs = require('fs');
const path = require('path');

const eventPath = process.env.GITHUB_EVENT_PATH;
const event = require(eventPath);
const pr = event.pull_request;

const filePath = path.join(__dirname, '../../data/prs.csv');
const line = [
  pr.number,
  `"${pr.title.replace(/"/g, '""')}"`,
  pr.user.login,
  pr.html_url,
  new Date().toISOString(),
  pr.state
].join(',') + '\n';

// Create file if it doesn't exist
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, 'PR Number,Title,Author,URL,Date,Status\n');
}

// Append to file
fs.appendFileSync(filePath, line);

console.log(`Logged PR #${pr.number} to CSV.`);
