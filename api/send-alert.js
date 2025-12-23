const sgMail = require('@sendgrid/mail');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, topic, count, articles } = req.body;
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const articlesHtml = articles
      .map(a => `<li><a href="${a.link}">${a.title}</a></li>`)
      .join('');
    
    await sgMail.send({
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: `🚨 News Spike Alert: ${topic}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #ef4444;">Spike Detected!</h2>
          <p><strong>Topic:</strong> ${topic}</p>
          <p><strong>Articles Found:</strong> ${count}</p>
          <h3>Recent Articles:</h3>
          <ul>${articlesHtml}</ul>
          <p style="color: #666; font-size: 12px;">
            ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
