
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Allow 60 seconds for PDF generation

export async function GET(req: NextRequest) {
    try {
        const isLocal = !process.env.AWS_REGION && !process.env.VERCEL;

        let browser;

        if (isLocal) {
            const puppeteer = await import('puppeteer');
            browser = await puppeteer.default.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        } else {
            const puppeteer = await import('puppeteer-core');
            const chromium = await import('@sparticuz/chromium');

            browser = await puppeteer.default.launch({
                args: (chromium.default as any).args,
                defaultViewport: (chromium.default as any).defaultViewport,
                executablePath: await (chromium.default as any).executablePath(),
                headless: (chromium.default as any).headless,
            });
        }

        const page = await browser.newPage();
        const url = new URL(req.url);
        const host = url.host;
        const protocol = url.protocol;

        // Resume URL
        const resumeUrl = `${protocol}//${host}/resume/print`;

        await page.goto(resumeUrl, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', bottom: '0', left: '0', right: '0' } // CSS handles margins
        });

        await browser.close();

        return new NextResponse(pdf as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="resume.pdf"'
            }
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
