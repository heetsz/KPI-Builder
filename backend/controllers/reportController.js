const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const Company = require('../models/companyModel');
const Insight = require('../models/insightsModel');

// Register Handlebars helpers
handlebars.registerHelper('ifEven', function (index, options) {
    if ((index % 2) === 0) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

handlebars.registerHelper('formatDate', function (date) {
    return moment(date).format('MMMM D, YYYY');
});

// Load and compile the template
const templatePath = path.join(__dirname, '../templates/report-template.html');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const template = handlebars.compile(templateSource);

/**
 * Generate a PDF report for a company
 * @route GET /api/reports/company/:companyId
 */
exports.generateCompanyReport = async (req, res) => {
    try {
        const { companyId } = req.params;

        // Fetch company and insight data
        const company = await Company.findOne({ companyId });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        const insight = await Insight.findOne({ companyId });

        if (!insight) {
            return res.status(404).json({
                success: false,
                message: 'Insight data not found for this company'
            });
        }

        // Prepare data for the template
        const reportData = {
            reportTitle: 'Dhruvaa Insights Report',
            companyName: company.name,
            generationDate: moment().format('MMMM D, YYYY'),
            executiveSummary: insight.executive_summary,
            companyOverview: {
                industry: company.industry,
                stage: company.stage,
                founded: company.founded,
                employees: company.employees,
                product: company.product,
                targetMarket: company.targetMarket,
                technologyReadinessLevel: company.technologyReadinessLevel,
                tam: company.tam,
                sam: company.sam,
                som: company.som,
                marketCAGR: `${company.marketCAGR}%`,
                elevatorPitch: company.elevatorPitch
            },
            swotAnalysis: insight.swot_analysis?.toObject ? insight.swot_analysis.toObject() : insight.swot_analysis,
            competitivePositioning: insight.competitive_positioning,
            growthTactics: insight.growth_tactics,
            kpiActionItems: insight.kpi_action_items,
            citations: Array.isArray(insight.citations)
                ? insight.citations.map(c => (c.toObject ? c.toObject() : c))
                : [],
            year: new Date().getFullYear()
        };
        // Render HTML with the data
        const html = template(reportData);

        // Generate PDF from HTML
        const pdf = await generatePDF(html, company.name);

        // Set headers for file download
        const fileName = `${company.name.replace(/\s+/g, '_')}_report_${moment().format('YYYY-MM-DD')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Send the PDF file
        res.send(pdf);

    } catch (error) {
        console.error('Error generating PDF report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF report',
            error: error.message
        });
    }
};

/**
 * Generate a PDF from an insight
 * @route GET /api/reports/insight/:insightId
 */
exports.getInsightPDF = async (req, res) => {
    try {
        const { insightId } = req.params;

        // Fetch the insight
        const insight = await Insight.findById(insightId);

        if (!insight) {
            return res.status(404).json({
                success: false,
                message: 'Insight not found'
            });
        }

        // Verify user has access to this insight's company
        if (req.company.companyId !== insight.companyId && !req.company.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this insight'
            });
        }

        // Fetch the company associated with this insight
        const company = await Company.findOne({ companyId: insight.companyId });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Prepare data for the template
        const reportData = {
            reportTitle: 'Insight Report',
            companyName: company.name,
            generationDate: moment().format('MMMM D, YYYY'),
            executiveSummary: insight.executive_summary,
            companyOverview: {
                industry: company.industry,
                stage: company.stage,
                founded: company.founded,
                employees: company.employees,
                product: company.product,
                targetMarket: company.targetMarket,
                technologyReadinessLevel: company.technologyReadinessLevel,
                tam: company.tam,
                sam: company.sam,
                som: company.som,
                marketCAGR: `${company.marketCAGR}%`,
                elevatorPitch: company.elevatorPitch
            },
            swotAnalysis: insight.swot_analysis,
            competitivePositioning: insight.competitive_positioning,
            growthTactics: insight.growth_tactics,
            kpiActionItems: insight.kpi_action_items,
            citations: insight.citations || [],
            year: new Date().getFullYear()
        };

        // Render HTML with the data
        const html = template(reportData);

        // Generate PDF from HTML
        const pdf = await generatePDF(html, `Insight_${insightId}`);

        // Set headers for file download
        const fileName = `Insight_${insightId}_${moment().format('YYYY-MM-DD')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Send the PDF file
        res.send(pdf);

    } catch (error) {
        console.error('Error generating insight PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF report',
            error: error.message
        });
    }
};

/**
 * Generate PDF from HTML content
 * @param {string} html - The HTML content
 * @param {string} title - The document title
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generatePDF(html, title) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set content to the page
    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    // Add page numbers with header and footer
    await page.addStyleTag({
        content: `
      @page {
        size: A4;
        margin: 0;
      }
      
      #pageFooter {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
        font-size: 10px;
        color: #333;
      }
    `
    });

    // Generate PDF
    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: ' ',
        footerTemplate: `
      <div style="width: 100%; font-size: 9px; padding: 5px 20px; text-align: center; color: #333;">
        <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        <div>© ${new Date().getFullYear()} Dhruvaa. All Rights Reserved.</div>
      </div>
    `,
        margin: {
            top: '50px',
            bottom: '70px',
            left: '50px',
            right: '50px'
        }
    });

    await browser.close();

    return pdf;
}

module.exports = exports;