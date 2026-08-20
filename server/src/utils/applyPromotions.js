const SeasonalCollection = require('../models/SeasonalCollection');

async function getActiveCampaigns() {
  const now = new Date();
  return SeasonalCollection.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
}

function applyCampaignsToProduct(productDoc, activeCampaigns) {
  if (!productDoc || !activeCampaigns || activeCampaigns.length === 0) return productDoc;

  const prodObj = productDoc.toObject ? productDoc.toObject() : JSON.parse(JSON.stringify(productDoc));
  const prodIdStr = String(prodObj._id);

  let maxDiscountPercent = 0;
  for (const c of activeCampaigns) {
    if (c.discountPercent > 0) {
      if (c.applicableProducts === 'all') {
        maxDiscountPercent = Math.max(maxDiscountPercent, c.discountPercent);
      } else if (c.selectedProducts && Array.isArray(c.selectedProducts)) {
        const isSelected = c.selectedProducts.some((pId) => String(pId._id || pId) === prodIdStr);
        if (isSelected) {
          maxDiscountPercent = Math.max(maxDiscountPercent, c.discountPercent);
        }
      }
    }
  }

  if (maxDiscountPercent > 0) {
    prodObj.sizes = (prodObj.sizes || []).map((s) => {
      const price = Number(s.price) || 0;
      const currentSalePrice = Number(s.salePrice);
      const promoSalePrice = Math.round(price * (1 - maxDiscountPercent / 100));

      let finalSalePrice = promoSalePrice;
      if (!isNaN(currentSalePrice) && currentSalePrice > 0 && currentSalePrice < price && currentSalePrice < promoSalePrice) {
        finalSalePrice = currentSalePrice;
      }

      return {
        ...s,
        salePrice: finalSalePrice,
      };
    });
  }

  return prodObj;
}

async function applyPromotionsToProducts(products) {
  if (!products) return products;
  const activeCampaigns = await getActiveCampaigns();
  if (!activeCampaigns || activeCampaigns.length === 0) return products;

  if (Array.isArray(products)) {
    return products.map((p) => applyCampaignsToProduct(p, activeCampaigns));
  }
  return applyCampaignsToProduct(products, activeCampaigns);
}

module.exports = {
  getActiveCampaigns,
  applyCampaignsToProduct,
  applyPromotionsToProducts,
};
