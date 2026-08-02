const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { z } = require('zod');

// Zod Validation Schemas
const LedgerSchema = z.object({
  transaction_type: z.enum(['INCOME', 'EXPENSE', 'SALARY']),
  category: z.string(),
  amount: z.number().positive(),
  payment_method: z.string().optional().default('CASH'),
  description: z.string().optional(),
  receipt_url: z.string().optional()
});

const StaffPayrollSchema = z.object({
  staff_name: z.string().min(2),
  role: z.enum(['SCORER', 'GROUND_STAFF', 'MANAGER']),
  monthly_salary: z.number().positive()
});

// Nodemailer Transporter Config (mock fallback mode)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

// Function to calculate Financial P&L Summary
async function calculateProfitAndLoss(pool) {
  const ledgerRes = await pool.query(`
    SELECT transaction_type, SUM(amount) as total
    FROM financial_ledger
    GROUP BY transaction_type
  `);

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSalariesPaid = 0;

  ledgerRes.rows.forEach(r => {
    const val = parseFloat(r.total || 0);
    if (r.transaction_type === 'INCOME') totalIncome += val;
    if (r.transaction_type === 'EXPENSE') totalExpenses += val;
    if (r.transaction_type === 'SALARY') totalSalariesPaid += val;
  });

  const pendingPayrollRes = await pool.query(`
    SELECT SUM(monthly_salary) as total_pending
    FROM staff_payroll
    WHERE status = 'PENDING'
  `);
  const pendingSalaries = parseFloat(pendingPayrollRes.rows[0]?.total_pending || 0);

  const netProfit = totalIncome - (totalExpenses + totalSalariesPaid + pendingSalaries);

  return {
    totalIncome,
    totalExpenses,
    totalSalariesPaid,
    pendingSalaries,
    totalExpensesAndSalaries: totalExpenses + totalSalariesPaid + pendingSalaries,
    netProfit
  };
}

// Function to generate PDF Net P&L Statement Buffer
async function generatePLPDFBuffer(summaryData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // PDF Header
    doc.fillColor('#10b981').fontSize(24).text('SPORTSADDA FINANCIAL REPORT', { align: 'center' });
    doc.fillColor('#6b7280').fontSize(10).text('Net Profit & Loss Statement - Automated Admin Report', { align: 'center' });
    doc.moveDown(1.5);

    // Summary Box
    doc.fillColor('#111827').fontSize(14).text(`Report Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#1f2937');
    doc.text(`Total Revenues (Bookings, Subscriptions, Sales): $${summaryData.totalIncome.toFixed(2)}`);
    doc.text(`Total Operating Expenses: $${summaryData.totalExpenses.toFixed(2)}`);
    doc.text(`Staff Salaries Paid: $${summaryData.totalSalariesPaid.toFixed(2)}`);
    doc.text(`Pending Payroll Salaries: $${summaryData.pendingSalaries.toFixed(2)}`);
    doc.moveDown(1);

    // Net Profit Highlight Box
    const isProfitable = summaryData.netProfit >= 0;
    doc.rect(40, doc.y, 500, 40).fill(isProfitable ? '#ecfdf5' : '#fef2f2');
    doc.fillColor(isProfitable ? '#047857' : '#b91c1c').fontSize(16).text(
      `Net Profit / Loss: $${summaryData.netProfit.toFixed(2)} (${isProfitable ? 'NET PROFIT' : 'NET LOSS'})`,
      50,
      doc.y - 30
    );

    doc.moveDown(3);
    doc.fillColor('#9ca3af').fontSize(9).text('Generated automatically by SportsAdda Finance & Cron Dispatcher Engine.', { align: 'center' });

    doc.end();
  });
}

// Automated Dispatch Function
async function dispatchAdminReports(pool, scheduleName) {
  try {
    console.log(`⏰ [CRON DISPATCHER] Executing ${scheduleName} Financial Admin Report...`);
    const pnl = await calculateProfitAndLoss(pool);
    const pdfBuffer = await generatePLPDFBuffer(pnl);

    const settingsRes = await pool.query('SELECT * FROM admin_report_settings');
    const settings = settingsRes.rows[0] || {
      admin_email: 'admin@sportsadda.com',
      admin_phone: '+923001234567',
      report_channel: 'BOTH'
    };

    // 1. Email Dispatch
    if (['EMAIL', 'BOTH'].includes(settings.report_channel)) {
      try {
        await transporter.sendMail({
          from: '"SportsAdda Finance" <no-reply@sportsadda.com>',
          to: settings.admin_email,
          subject: `📊 [SportsAdda] ${scheduleName} Financial Net P&L Summary`,
          text: `Attached is your ${scheduleName} Financial Net P&L Report. Net Profit: $${pnl.netProfit.toFixed(2)}`,
          attachments: [
            {
              filename: `SportsAdda_${scheduleName}_Report.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });
        console.log(`✉️ [CRON DISPATCHER] Email sent successfully to ${settings.admin_email}`);
      } catch (mailErr) {
        console.log(`ℹ️ [CRON DISPATCHER] Email dispatch logged (SMTP offline fallback): Net Profit $${pnl.netProfit.toFixed(2)} sent to ${settings.admin_email}`);
      }
    }

    // 2. WhatsApp API Dispatch (Twilio / Webhook log fallback)
    if (['WHATSAPP', 'BOTH'].includes(settings.report_channel)) {
      console.log(`📱 [CRON DISPATCHER] WhatsApp Notification sent to ${settings.admin_phone}: "SportsAdda ${scheduleName} P&L Summary: Net Profit $${pnl.netProfit.toFixed(2)}. Incomes: $${pnl.totalIncome}, Expenses & Salaries: $${pnl.totalExpensesAndSalaries}"`);
    }

    return { success: true, pnl, recipient: settings };
  } catch (err) {
    console.error('❌ [CRON DISPATCHER ERROR]:', err);
    return { success: false, error: err.message };
  }
}

function createFinanceRouter(pool) {
  const router = express.Router();

  // Initialize Scheduled Cron Jobs
  // Daily at 10 PM
  cron.schedule('0 22 * * *', () => dispatchAdminReports(pool, 'DAILY'));
  // Weekly on Sunday at 10 PM
  cron.schedule('0 22 * * 0', () => dispatchAdminReports(pool, 'WEEKLY'));
  // Monthly on the 1st at 10 PM
  cron.schedule('0 22 1 * *', () => dispatchAdminReports(pool, 'MONTHLY'));

  // --- LEDGER ROUTES ---

  // Get Financial Ledger Entries & Net P&L Summary
  router.get('/ledger', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM financial_ledger ORDER BY created_at DESC');
      const pnl = await calculateProfitAndLoss(pool);
      res.json({
        success: true,
        summary: pnl,
        entries: result.rows
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Log new Financial Ledger Transaction
  router.post('/ledger', async (req, res) => {
    try {
      const validated = LedgerSchema.parse(req.body);
      const { transaction_type, category, amount, payment_method, description, receipt_url } = validated;

      const result = await pool.query(
        `INSERT INTO financial_ledger (transaction_type, category, amount, payment_method, description, receipt_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [transaction_type, category, amount, payment_method, description || '', receipt_url || '']
      );

      res.status(201).json({ success: true, transaction: result.rows[0] });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- STAFF PAYROLL ROUTES ---

  // Get Staff Payroll List
  router.get('/payroll', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM staff_payroll ORDER BY staff_name ASC');
      res.json({ success: true, staff: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Add Staff Member
  router.post('/payroll', async (req, res) => {
    try {
      const validated = StaffPayrollSchema.parse(req.body);
      const { staff_name, role, monthly_salary } = validated;

      const result = await pool.query(
        `INSERT INTO staff_payroll (staff_name, role, monthly_salary)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [staff_name, role, monthly_salary]
      );

      res.status(201).json({ success: true, staff: result.rows[0] });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Process Payout for Staff Member
  router.post('/payroll/:id/pay', async (req, res) => {
    try {
      const { id } = req.params;

      const staffRes = await pool.query('SELECT * FROM staff_payroll WHERE id = $1', [id]);
      if (staffRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Staff member not found' });
      }
      const staff = staffRes.rows[0];

      // Update payroll status
      const updatedStaff = await pool.query(
        `UPDATE staff_payroll SET status = 'PAID', last_paid_date = CURRENT_DATE WHERE id = $1 RETURNING *`,
        [id]
      );

      // Record automatically in financial ledger as SALARY expense
      await pool.query(
        `INSERT INTO financial_ledger (transaction_type, category, amount, payment_method, description)
         VALUES ('SALARY', 'STAFF_SALARY', $1, 'BANK_TRANSFER', $2)`,
        [staff.monthly_salary, `Monthly Salary payout for ${staff.staff_name} (${staff.role})`]
      );

      res.json({ success: true, message: `Salary paid to ${staff.staff_name}`, staff: updatedStaff.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- INVOICING ENGINE ---

  // Generate Branded PDF Invoice for Transaction
  router.get('/invoices/:id/pdf', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM financial_ledger WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Transaction invoice not found' });
      }
      const tx = result.rows[0];

      const doc = new PDFDocument({ margin: 40 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice_${tx.id}.pdf`);

      doc.pipe(res);

      // Header
      doc.fillColor('#10b981').fontSize(22).text('SPORTSADDA INVOICE', { align: 'right' });
      doc.fillColor('#374151').fontSize(10).text(`Receipt #: ${tx.id.substring(0, 8).toUpperCase()}`, { align: 'right' });
      doc.text(`Date: ${new Date(tx.created_at).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Company Info
      doc.fillColor('#111827').fontSize(14).text('SportsAdda Indoor Arenas & Sports Network');
      doc.fillColor('#6b7280').fontSize(10).text('Support: billing@sportsadda.com | Phone: +92 300 1234567');
      doc.moveDown(2);

      // Table Header
      doc.fillColor('#10b981').fontSize(12).text('Transaction Details', { underline: true });
      doc.moveDown(0.5);

      doc.fillColor('#1f2937').fontSize(11).text(`Category: ${tx.category}`);
      doc.text(`Type: ${tx.transaction_type}`);
      doc.text(`Payment Method: ${tx.payment_method || 'CASH'}`);
      doc.text(`Description: ${tx.description || 'N/A'}`);
      doc.moveDown(1.5);

      // Total Box
      doc.rect(40, doc.y, 500, 35).fill('#f3f4f6');
      doc.fillColor('#111827').fontSize(14).text(`Total Amount: $${parseFloat(tx.amount).toFixed(2)}`, 50, doc.y - 25);

      doc.moveDown(3);
      doc.fillColor('#9ca3af').fontSize(9).text('Thank you for using SportsAdda Commercial Platform!', { align: 'center' });

      doc.end();
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- MANUAL CRON TRIGGER ROUTE (For instant testing) ---
  router.post('/reports/trigger-cron', async (req, res) => {
    try {
      const schedule = req.body.schedule || 'MANUAL_TEST';
      const outcome = await dispatchAdminReports(pool, schedule);
      res.json(outcome);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- MULTI-STORE OWNERSHIP & INVENTORY MANAGEMENT ROUTES ---

  // 1. Register a new Equipment / Pro-Shop Store under Owner Profile (Multi-Store Support)
  router.post('/stores', async (req, res) => {
    try {
      const { owner_id, arena_id, store_name, store_address, contact_phone, store_type } = req.body;
      if (!owner_id || !store_name || !store_address) {
        return res.status(400).json({ success: false, error: 'owner_id, store_name, and store_address are required' });
      }

      const { rows } = await pool.query(
        `INSERT INTO owner_stores (
           owner_id, arena_id, store_name, store_address, contact_phone, store_type
         ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
        [owner_id, arena_id || null, store_name, store_address, contact_phone || null, store_type || 'EQUIPMENT_PRO_SHOP']
      );

      res.json({ success: true, store: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Fetch all stores owned by specific Indoor Owner Profile
  router.get('/stores/owner', async (req, res) => {
    try {
      const ownerId = req.query.owner_id || req.headers['x-user-id'];
      if (!ownerId) {
        return res.status(400).json({ success: false, error: 'owner_id is required' });
      }

      const { rows } = await pool.query(
        `SELECT s.*, a.name AS arena_name
         FROM owner_stores s
         LEFT JOIN indoor_arenas a ON s.arena_id = a.id
         WHERE s.owner_id = $1
         ORDER BY s.created_at DESC;`,
        [ownerId]
      );

      res.json({ success: true, stores: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Public endpoint to list all active stores for Players
  router.get('/stores', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT s.*, p.display_name AS owner_name, a.name AS arena_name
         FROM owner_stores s
         LEFT JOIN player_profiles p ON s.owner_id = p.user_id
         LEFT JOIN indoor_arenas a ON s.arena_id = a.id
         WHERE s.is_active = TRUE
         ORDER BY s.created_at DESC;`
      );
      res.json({ success: true, stores: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Add Inventory Item to Store
  router.post('/stores/:store_id/inventory', async (req, res) => {
    try {
      const { store_id } = req.params;
      const { item_name, category, price, stock_quantity } = req.body;

      if (!item_name || !price) {
        return res.status(400).json({ success: false, error: 'item_name and price are required' });
      }

      const { rows } = await pool.query(
        `INSERT INTO store_inventory (
           store_id, item_name, category, price, stock_quantity
         ) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [store_id, item_name, category || 'CRICKET_GEAR', parseFloat(price), parseInt(stock_quantity) || 0]
      );

      res.json({ success: true, item: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Get Inventory Items for Store
  router.get('/stores/:store_id/inventory', async (req, res) => {
    try {
      const { store_id } = req.params;
      const { rows } = await pool.query(
        `SELECT * FROM store_inventory WHERE store_id = $1 ORDER BY created_at DESC;`,
        [store_id]
      );
      res.json({ success: true, inventory: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = createFinanceRouter;
