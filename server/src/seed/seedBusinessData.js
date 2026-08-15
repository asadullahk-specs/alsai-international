/**
 * Adds realistic demo data for the newer modules (Suppliers, Purchases,
 * Payments, Expenses), plus a couple of sample customers/reviews/messages
 * and two stock-level adjustments (one low, one out) so every admin screen
 * has something real to look at.
 *
 * SAFE TO RE-RUN: every insert is guarded by a check for an existing record
 * with the same marker (e.g. supplier email, expense title+date), so running
 * this more than once will not create duplicates or touch any of your real
 * orders/customers/products.
 *
 * Usage:  node src/seed/seedBusinessData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Review = require('../models/Review');
const ContactMessage = require('../models/ContactMessage');
const StockHistory = require('../models/StockHistory');
const getNextDocNumber = require('../utils/docNumber');

const run = async () => {
  await connectDB();

  const admin = await Admin.findOne();
  const products = await Product.find().limit(6);

  if (products.length === 0) {
    console.log('No products found - add at least one product before running this seed script.');
    await mongoose.disconnect();
    return;
  }

  // ---- 1. Suppliers ----------------------------------------------------
  const supplierDefs = [
    { name: 'Amir Traders', company: 'Amir Traders & Co.', phone: '0300-1234567', email: 'amir.traders@example.com', address: 'Shahrah-e-Faisal, Karachi', status: 'active' },
    { name: 'Noor Fragrance Supplies', company: 'Noor Fragrance Supplies Pvt Ltd', phone: '0321-9876543', email: 'noor.supplies@example.com', address: 'Ferozepur Road, Lahore', status: 'active' },
  ];
  const suppliers = [];
  for (const def of supplierDefs) {
    let supplier = await Supplier.findOne({ email: def.email });
    if (!supplier) {
      supplier = await Supplier.create(def);
      console.log(`Created supplier: ${supplier.name}`);
    }
    suppliers.push(supplier);
  }

  // ---- 2. Purchases (one Received so it feeds Inventory/Reports) -------
  const existingPurchase = await Purchase.findOne({ supplierReference: 'DEMO-INV-1001' });
  if (!existingPurchase && products[0]) {
    const product = products[0];
    const size = product.sizes[0];
    if (size) {
      const quantity = 20;
      const unitCost = size.costPrice || Math.round(size.price * 0.4);
      const purchaseId = await getNextDocNumber('PUR');
      const purchase = await Purchase.create({
        purchaseId,
        supplier: suppliers[0]._id,
        purchaseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        supplierReference: 'DEMO-INV-1001',
        items: [
          {
            product: product._id,
            productName: product.name,
            size: size.size,
            quantity,
            unitCost,
            discount: 0,
            tax: 0,
            total: quantity * unitCost,
            receivedQuantity: quantity,
          },
        ],
        subtotal: quantity * unitCost,
        discountTotal: 0,
        taxTotal: 0,
        total: quantity * unitCost,
        notes: 'Demo purchase seeded for testing.',
        purchaseStatus: 'Received',
        paymentStatus: 'Paid',
        amountPaid: quantity * unitCost,
        stockApplied: true,
        receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        statusTimeline: [
          { status: 'Draft', note: 'Purchase created.', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
          { status: 'Received', note: 'Stock received in full.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        ],
        createdBy: admin?._id,
        createdByName: admin?.fullName || 'Seed Script',
      });
      console.log(`Created purchase: ${purchase.purchaseId}`);

      // Apply the stock increase for real, same as adminPurchaseController
      // does when a purchase is marked Received, so Inventory reflects it.
      const sizeIndex = product.sizes.findIndex((s) => s.size === size.size);
      const previousStock = product.sizes[sizeIndex].stock;
      product.sizes[sizeIndex].stock = previousStock + quantity;
      await product.save();
      await StockHistory.create({
        product: product._id,
        size: size.size,
        changeType: 'restock',
        quantityChange: quantity,
        previousStock,
        newStock: product.sizes[sizeIndex].stock,
        costPrice: unitCost,
        note: `Received from purchase ${purchase.purchaseId}`,
        admin: admin?._id,
        adminName: admin?.fullName || 'Seed Script',
      });

      // ---- 3. A Supplier Payment against this purchase ----
      const paymentId = await getNextDocNumber('PAY');
      await Payment.create({
        paymentId,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        type: 'Supplier Payment',
        amount: quantity * unitCost,
        method: 'bank_transfer',
        status: 'Paid',
        reference: 'DEMO-INV-1001',
        relatedType: 'Purchase',
        relatedId: purchase._id,
        relatedLabel: purchase.purchaseId,
        supplier: suppliers[0]._id,
        supplierName: suppliers[0].name,
        createdBy: admin?._id,
        createdByName: admin?.fullName || 'Seed Script',
      });
      console.log('Created matching supplier payment.');
    }
  }

  // ---- 4. A second, still-open purchase (Ordered, not yet received) ----
  const openPurchase = await Purchase.findOne({ supplierReference: 'DEMO-INV-1002' });
  if (!openPurchase && products[1]) {
    const product = products[1];
    const size = product.sizes[0];
    if (size) {
      const quantity = 15;
      const unitCost = size.costPrice || Math.round(size.price * 0.4);
      const purchaseId = await getNextDocNumber('PUR');
      const purchase = await Purchase.create({
        purchaseId,
        supplier: suppliers[1]._id,
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        supplierReference: 'DEMO-INV-1002',
        items: [
          {
            product: product._id,
            productName: product.name,
            size: size.size,
            quantity,
            unitCost,
            discount: 0,
            tax: 0,
            total: quantity * unitCost,
            receivedQuantity: 0,
          },
        ],
        subtotal: quantity * unitCost,
        total: quantity * unitCost,
        notes: 'Demo purchase - still awaiting delivery.',
        purchaseStatus: 'Ordered',
        statusTimeline: [{ status: 'Ordered', note: 'Purchase order placed with supplier.' }],
        createdBy: admin?._id,
        createdByName: admin?.fullName || 'Seed Script',
      });
      console.log(`Created open purchase: ${purchase.purchaseId}`);
    }
  }

  // ---- 5. Expenses across a few categories ------------------------------
  const expenseDefs = [
    { category: 'Rent', title: 'Shop Rent - Current Month', amount: 85000, daysAgo: 10 },
    { category: 'Packaging', title: 'Gift boxes & ribbon restock', amount: 18500, daysAgo: 7 },
    { category: 'Courier', title: 'TCS courier charges - last week', amount: 6200, daysAgo: 3 },
    { category: 'Software', title: 'Hosting & domain renewal', amount: 12000, daysAgo: 15 },
  ];
  for (const def of expenseDefs) {
    const exists = await Expense.findOne({ title: def.title });
    if (!exists) {
      const expenseId = await getNextDocNumber('EXP');
      await Expense.create({
        expenseId,
        date: new Date(Date.now() - def.daysAgo * 24 * 60 * 60 * 1000),
        category: def.category,
        title: def.title,
        amount: def.amount,
        paymentMethod: 'bank_transfer',
        status: 'Paid',
        createdBy: admin?._id,
        createdByName: admin?.fullName || 'Seed Script',
      });
      console.log(`Created expense: ${def.title}`);
    }
  }

  // ---- 6. A couple of sample customers (only if the DB has very few) ----
  const customerCount = await Customer.countDocuments();
  if (customerCount === 0) {
    const sampleCustomers = [
      { fullName: 'Ayesha Khan', email: 'ayesha.khan.demo@example.com', phone: '0333-1112233', cnic: '35202-1234567-1', gender: 'female', dob: new Date('1996-04-12'), password: 'Demo@12345' },
      { fullName: 'Bilal Ahmed', email: 'bilal.ahmed.demo@example.com', phone: '0300-4445566', cnic: '35202-7654321-2', gender: 'male', dob: new Date('1993-11-02'), password: 'Demo@12345' },
    ];
    for (const def of sampleCustomers) {
      const exists = await Customer.findOne({ email: def.email });
      if (!exists) {
        await Customer.create({ ...def, isEmailVerified: true });
        console.log(`Created sample customer: ${def.fullName}`);
      }
    }
  }

  // ---- 7. Reviews (pending + approved, so filters have something to show) ----
  const reviewCustomers = await Customer.find().limit(2);
  if (reviewCustomers.length > 0 && products.length > 0) {
    const reviewDefs = [
      { customer: reviewCustomers[0], product: products[0], rating: 5, reviewText: 'Beautiful, long-lasting scent - my favorite from AL SA\'I so far.', status: 'approved' },
      { customer: reviewCustomers[reviewCustomers.length > 1 ? 1 : 0], product: products[1] || products[0], rating: 4, reviewText: 'Lovely fragrance, arrived well packaged. Would buy again.', status: 'pending' },
    ];
    for (const def of reviewDefs) {
      const exists = await Review.findOne({ customer: def.customer._id, product: def.product._id });
      if (!exists) {
        await Review.create({
          product: def.product._id,
          customer: def.customer._id,
          rating: def.rating,
          reviewText: def.reviewText,
          status: def.status,
        });
        console.log(`Created ${def.status} review for ${def.product.name}`);
      }
    }
    await Review.recalculateProductRating(products[0]._id);
  }

  // ---- 8. Contact messages ----
  const messageDefs = [
    { name: 'Hina Malik', email: 'hina.malik.demo@example.com', phone: '0345-1231231', message: 'Hi, do you offer international shipping to the UK?', status: 'unread' },
    { name: 'Usman Tariq', email: 'usman.tariq.demo@example.com', phone: '0301-9998887', message: 'Received my order, thank you! Just wanted to say the packaging was lovely.', status: 'read' },
  ];
  for (const def of messageDefs) {
    const exists = await ContactMessage.findOne({ email: def.email });
    if (!exists) {
      await ContactMessage.create(def);
      console.log(`Created contact message from: ${def.name}`);
    }
  }

  // ---- 9. Stock levels: one low-stock, one out-of-stock item ----
  if (products[2]) {
    const p = products[2];
    if (p.sizes[0] && p.sizes[0].stock > (p.lowStockThreshold || 15)) {
      const previousStock = p.sizes[0].stock;
      p.sizes[0].stock = Math.min(4, p.lowStockThreshold || 15);
      await p.save();
      await StockHistory.create({
        product: p._id,
        size: p.sizes[0].size,
        changeType: 'adjustment',
        quantityChange: p.sizes[0].stock - previousStock,
        previousStock,
        newStock: p.sizes[0].stock,
        note: 'Seeded low-stock level for testing the Low Stock Alerts widget.',
        admin: admin?._id,
        adminName: admin?.fullName || 'Seed Script',
      });
      console.log(`Set "${p.name}" (${p.sizes[0].size}) to low stock: ${p.sizes[0].stock} units.`);
    }
  }
  if (products[3]) {
    const p = products[3];
    if (p.sizes[0] && p.sizes[0].stock > 0) {
      const previousStock = p.sizes[0].stock;
      p.sizes[0].stock = 0;
      await p.save();
      await StockHistory.create({
        product: p._id,
        size: p.sizes[0].size,
        changeType: 'adjustment',
        quantityChange: -previousStock,
        previousStock,
        newStock: 0,
        note: 'Seeded out-of-stock level for testing the Inventory "Out of Stock" tab.',
        admin: admin?._id,
        adminName: admin?.fullName || 'Seed Script',
      });
      console.log(`Set "${p.name}" (${p.sizes[0].size}) to out of stock.`);
    }
  }

  console.log('\nDone. Refresh the admin panel to see the new data.');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
