import puppeteer from 'puppeteer';

export const generatePDF = async (html) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Set viewport to match invitation card size
    await page.setViewport({ width: 800, height: 1200 });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    return pdf;
  } finally {
    if (browser) await browser.close();
  }
};
