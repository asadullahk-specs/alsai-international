require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Role = require('../models/Role');
const Admin = require('../models/Admin');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Address = require('../models/Address');
const Order = require('../models/Order');

const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    description: 'Full access to every module and setting.',
    isSystemRole: true,
    permissions: [],
  },
  {
    name: 'Manager',
    description: 'Manages catalog, orders, and customers.',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'products', actions: ['view', 'create', 'edit'] },
      { module: 'orders', actions: ['view', 'edit'] },
      { module: 'customers', actions: ['view', 'edit'] },
      { module: 'reviews', actions: ['view', 'approve'] },
    ],
  },
  {
    name: 'Order Manager',
    description: 'Handles order lifecycle and shipping updates.',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'orders', actions: ['view', 'edit'] },
    ],
  },
  {
    name: 'Content Manager',
    description: 'Manages homepage content and website pages.',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'content', actions: ['view', 'edit'] },
      { module: 'reviews', actions: ['view', 'approve'] },
    ],
  },
  {
    name: 'Inventory Manager',
    description: 'Monitors and adjusts stock levels.',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'inventory', actions: ['view', 'edit'] },
      { module: 'products', actions: ['view', 'edit'] },
    ],
  },
  {
    name: 'Support',
    description: 'Handles customer messages and reviews.',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'customers', actions: ['view'] },
      { module: 'reviews', actions: ['view'] },
    ],
  },
];

const run = async () => {
  await connectDB();

  for (const roleData of DEFAULT_ROLES) {
    await Role.findOneAndUpdate({ name: roleData.name }, roleData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  console.log('Default roles ready: ' + DEFAULT_ROLES.map((r) => r.name).join(', '));

  const superAdminRole = await Role.findOne({ name: 'Super Admin' });
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@alsai.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await Admin.findOne({ email });
  if (!existingAdmin) {
    await Admin.create({ fullName: 'Super Administrator', email, password, role: superAdminRole._id });
    console.log(`Super Admin created -> email: ${email} / password: ${password}`);
    console.log('IMPORTANT: log in and change this password immediately.');
  } else {
    console.log('Super Admin already exists, skipping.');
  }

  // The two collections that split the entire catalog in the navbar, shop
  // filters, and admin Products dropdown: Perfumes and Attars.
  const perfumesCollection = await Collection.findOneAndUpdate(
    { slug: 'perfumes' },
    { name: 'Perfumes', slug: 'perfumes', description: 'Extrait de Parfum', displayOrder: 1 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const attarsCollection = await Collection.findOneAndUpdate(
    { slug: 'attars' },
    { name: 'Attars', slug: 'attars', description: 'Alcohol-free oil perfumes', displayOrder: 2 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Collections ready: Perfumes, Attars');

  // One demo product per collection so the storefront and admin panel aren't
  // empty when the client reviews a fresh environment.
  const demoProduct = await Product.findOneAndUpdate(
    { slug: 'oud-elixir' },
    {
      name: 'Oud Elixir',
      slug: 'oud-elixir',
      shortDescription: 'Deep. Powerful. Unforgettable.',
      fullDescription:
        'Oud Elixir is an intense and sophisticated extrait de parfum crafted for those who appreciate depth and character.',
      collection: perfumesCollection._id,
      fragranceNotes: { top: ['Saffron', 'Black Pepper', 'Bergamot'], heart: ['Oud', 'Cedarwood', 'Patchouli'], base: ['Amber', 'Musk', 'Sandalwood'] },
      facts: { concentration: 'Extrait de Parfum', longevity: '8-10 Hours', sillage: 'Strong', gender: 'Unisex', ingredients: 'Alcohol Denat, Parfum (Fragrance), Aqua (Water)' },
      shippingInfo: {
        deliveryTime: 'Karachi: 1-2 Working Days · Other Cities: 2-4 Working Days',
        shippingCharges: 'Free Shipping on orders over PKR 10,000; Standard Shipping: PKR 250',
        returnExchange: '7-day return policy. Items must be unused, undamaged, and in original packaging.',
        orderCancellation: 'Orders can be cancelled within 15 minutes of placing the order.',
      },
      sizes: [
        { size: '30ml', sku: 'ALS-OUD-001-30', price: 8500, stock: 40, costPrice: 3200 },
        { size: '50ml', sku: 'ALS-OUD-001-50', price: 11500, salePrice: 9200, stock: 60, costPrice: 4300 },
        { size: '75ml', sku: 'ALS-OUD-001-75', price: 15500, stock: 25, costPrice: 5800 },
        { size: '100ml', sku: 'ALS-OUD-001-100', price: 19500, stock: 15, costPrice: 7200 },
      ],
      isFeatured: true,
      isBestSeller: true,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Product.findOneAndUpdate(
    { slug: 'saffron-attar' },
    {
      name: 'Saffron Attar',
      slug: 'saffron-attar',
      shortDescription: 'A rich, alcohol-free oil attar.',
      fullDescription: 'A concentrated, long-lasting alcohol-free attar built around warm saffron and sandalwood.',
      collection: attarsCollection._id,
      facts: { concentration: 'Attar (Oil)', longevity: '10-12 Hours', sillage: 'Moderate', gender: 'Unisex', ingredients: 'Sandalwood Oil, Saffron Extract' },
      sizes: [
        { size: '12ml', sku: 'ALS-ATR-001-12', price: 4500, stock: 50, costPrice: 1600 },
        { size: '24ml', sku: 'ALS-ATR-001-24', price: 8200, stock: 30, costPrice: 2900 },
      ],
      isNewArrival: true,
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Demo products ready: Oud Elixir (Perfumes), Saffron Attar (Attars)');

  // A demo customer + address + order, purely so the client can log into the
  // storefront and verify the customer panel end-to-end. Per the client's
  // instruction, this is the ONLY customer account ever created outside of
  // self-service signup - the admin panel has no "create customer" feature.
  const demoCustomerEmail = 'demo.customer@alsai.com';
  let demoCustomer = await Customer.findOne({ email: demoCustomerEmail });
  if (!demoCustomer) {
    demoCustomer = await Customer.create({
      fullName: 'Ali Raza Khan',
      email: demoCustomerEmail,
      phone: '0300-1234567',
      cnic: '17301-1234567-1',
      gender: 'male',
      dob: new Date('1995-05-14'),
      password: 'Demo@123',
      status: 'active',
    });
    console.log(`Demo customer created -> email: ${demoCustomerEmail} / password: Demo@123`);
  } else {
    console.log('Demo customer already exists, skipping.');
  }

  let demoAddress = await Address.findOne({ customer: demoCustomer._id });
  if (!demoAddress) {
    demoAddress = await Address.create({
      customer: demoCustomer._id,
      fullName: demoCustomer.fullName,
      phone: demoCustomer.phone,
      addressLine: 'House No. 123, Street 5, Block A, Phase 6, Johar Town',
      city: 'Lahore',
      province: 'Punjab',
      country: 'Pakistan',
      isDefault: true,
    });
  }

  const existingOrder = await Order.findOne({ customer: demoCustomer._id });
  if (!existingOrder && demoProduct) {
    const size = demoProduct.sizes[1]; // 50ml
    const subtotal = size.price * 1;
    const shippingCharge = subtotal >= 10000 ? 0 : 250;
    await Order.create({
      orderNumber: `ALSAI-${Date.now()}`,
      customer: demoCustomer._id,
      items: [
        {
          product: demoProduct._id,
          name: demoProduct.name,
          image: demoProduct.mainImage,
          size: size.size,
          sku: size.sku,
          price: size.salePrice || size.price,
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: demoAddress.fullName,
        phone: demoAddress.phone,
        addressLine: demoAddress.addressLine,
        city: demoAddress.city,
        province: demoAddress.province,
        country: demoAddress.country,
      },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'processing',
      subtotal,
      shippingCharge,
      discount: 0,
      total: subtotal + shippingCharge,
      statusTimeline: [
        { status: 'pending', note: 'Order placed successfully.' },
        { status: 'confirmed', note: 'Order confirmed by AL SA\'I.' },
        { status: 'processing', note: 'Preparing your order.' },
      ],
      cancellableUntil: new Date(Date.now() - 1000), // seeded in the past, so it's already outside the 15-minute cancellation window
    });
    console.log('Demo order created for the demo customer.');
  } else {
    console.log('Demo customer already has an order, skipping.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
