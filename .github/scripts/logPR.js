const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const eventPath = process.env.GITHUB_EVENT_PATH;
const event = require(eventPath);
const pr = event.pull_request;

const filePath = path.join(__dirname, '../../data/prs.csv');
const contributor = pr.user.login;
const line = [
  pr.number,
  `"${pr.title.replace(/"/g, '""')}"`,
  contributor,
  pr.html_url,
  new Date().toISOString(),
  pr.state
].join(',') + '\n';

// Step 1: Create CSV if needed
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, 'PR Number,Title,Author,URL,Date,Status\n');
}

// Step 2: Append PR
fs.appendFileSync(filePath, line);
console.log(`Logged PR #${pr.number} from ${contributor}`);

// Step 3: Count PRs by this contributor
const allLines = fs.readFileSync(filePath, 'utf-8').split('\n').slice(1);
const userPRs = allLines.filter(line => line.includes(`,${contributor},`));

console.log(`${contributor} has made ${userPRs.length} PRs.`);

// Step 4: If 5 PRs, send email
if (userPRs.length === 5) {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `"GitHub Bot" <notify@yourproject.com>`,
    to: 'robbevanvliet@gmail.com',
    subject: `🎉 ${contributor} reached 5 PRs!`,
    text: `${contributor} has just submitted their 5th PR to the repo!`,
    html: `<p><strong>${contributor}</strong> has submitted their <strong>5th pull request</strong>! 🎉</p>`,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      return console.error('Email error:', err);
    }
    console.log('Email sent:', info.response);
  });
}
