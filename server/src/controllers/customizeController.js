import Template from '../models/Template.js';
import Order from '../models/Order.js';
import { generatePDF } from '../services/pdfService.js';

// @desc    Render customized invitation HTML
// @route   POST /api/customize/preview
export const renderPreview = async (req, res) => {
  try {
    const { templateId, customizationData } = req.body;

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Build the invitation HTML with customizations
    const html = buildInvitationHTML(template, customizationData);

    res.json({ success: true, html, template: template.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate PDF download
// @route   POST /api/customize/pdf
export const generatePDFDownload = async (req, res) => {
  try {
    const { templateId, customizationData, orderId } = req.body;

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const html = buildInvitationHTML(template, customizationData);
    const pdfBuffer = await generatePDF(html);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invitation-${template.slug}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save customization as order
// @route   POST /api/customize/save
export const saveCustomization = async (req, res) => {
  try {
    const { templateId, customizationData } = req.body;

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const order = await Order.create({
      user: req.user._id,
      template: template._id,
      customizationData,
      amount: template.price,
      status: template.price === 0 ? 'completed' : 'pending',
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Build invitation HTML from template + customizations
function buildInvitationHTML(template, data) {
  const {
    hostName = '',
    guestName = '',
    eventName = '',
    date = '',
    time = '',
    venue = '',
    message = '',
    watermarkText = 'GuestInvitation',
    primaryColor = template.themeColors?.primary || '#FF6B35',
    secondaryColor = template.themeColors?.secondary || '#FFD700',
    fontFamily = 'Playfair Display',
  } = data || {};

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;600&family=Dancing+Script:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: '${fontFamily}', serif;
    background: ${template.themeColors?.background || '#FFF8F0'};
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
  }
  .invitation-card {
    width: 600px;
    max-width: 100%;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    position: relative;
  }
  .invitation-header {
    background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
    padding: 40px 30px;
    text-align: center;
    color: white;
    position: relative;
  }
  .invitation-header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
  }
  .invitation-header h1 {
    font-size: 2.2em;
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .invitation-header .subtitle {
    font-size: 1.1em;
    opacity: 0.9;
    position: relative;
    z-index: 1;
  }
  .invitation-body {
    padding: 40px 30px;
    text-align: center;
    color: ${template.themeColors?.text || '#333'};
  }
  .guest-name {
    font-size: 1.8em;
    color: ${primaryColor};
    margin-bottom: 20px;
    font-weight: 700;
  }
  .event-details {
    margin: 25px 0;
  }
  .event-details .detail-item {
    margin: 12px 0;
    font-size: 1.05em;
    line-height: 1.6;
  }
  .detail-label {
    font-weight: 600;
    color: ${primaryColor};
    margin-right: 8px;
  }
  .custom-message {
    margin-top: 25px;
    padding: 20px;
    background: ${template.themeColors?.background || '#FFF8F0'};
    border-radius: 12px;
    font-style: italic;
    line-height: 1.6;
  }
  .decorative-border {
    height: 6px;
    background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryColor});
  }
  .watermark {
    position: absolute;
    bottom: 15px;
    right: 20px;
    font-size: 0.75em;
    color: rgba(0,0,0,0.2);
    font-family: 'Poppins', sans-serif;
    letter-spacing: 1px;
  }
  .mandala-decoration {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    border: 3px solid ${secondaryColor};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .mandala-decoration::before {
    content: '🙏';
    font-size: 2em;
  }
  @media print {
    body { padding: 0; }
    .invitation-card { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="invitation-card">
    <div class="invitation-header">
      <h1>${eventName || template.name}</h1>
      <div class="subtitle">${hostName ? 'Hosted by ' + hostName : ''}</div>
    </div>
    <div class="decorative-border"></div>
    <div class="invitation-body">
      <div class="mandala-decoration"></div>
      ${guestName ? `<div class="guest-name">Dear ${guestName},</div>` : ''}
      <div class="event-details">
        ${date ? `<div class="detail-item"><span class="detail-label">Date:</span> ${date}</div>` : ''}
        ${time ? `<div class="detail-item"><span class="detail-label">Time:</span> ${time}</div>` : ''}
        ${venue ? `<div class="detail-item"><span class="detail-label">Venue:</span> ${venue}</div>` : ''}
      </div>
      ${message ? `<div class="custom-message">${message}</div>` : ''}
    </div>
    <div class="decorative-border"></div>
    <div class="watermark">${watermarkText}</div>
  </div>
</body>
</html>`;
}
