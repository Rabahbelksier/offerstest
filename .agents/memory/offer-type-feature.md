---
name: Offer type feature
description: How offerType and price3pcs work across the DB, server, and client screens
---

# Offer Type Feature

## Offer type values
- `normal` = عرض عادي (default)
- `currency` = عرض عملات
- `super` = عرض السوبر
- `bigsave` = عرض البيڤ سايف
- `bundle` = عرض الحزمات

## Rules
- seller_coupon hidden for: super, bigsave, bundle
- price3pcs field shown only for: bundle
- promo codes (cod_1/2/3) hidden in OfferDetailsScreen for: super, bigsave
- Copy/share template selected by offer type:
  - normal → `trending`
  - currency → `trending_currency`
  - bundle → `trending_bundle`
  - super or bigsave → `trending_super_bigsave`

## DB template keys added
- `trending_currency`, `trending_bundle`, `trending_super_bigsave`
- Multilingual variants: `_en`, `_fr`, `_pt`
- Seeded on server start via DEFAULT_TEMPLATES in server/db.ts

## New keywords
- `{info}` = admin note (info field in offres)
- `{price3pcs}` = price of 3 pieces (bundle only)

## Files modified
- shared/schema.ts — offerType + price3pcs columns
- server/db.ts — migration + 3 new template defaults
- server/routes.ts — bulk INSERT + PUT include new fields
- client/lib/storage.ts — ProductItem types, storage keys, defaults, formatProductMessage
- client/screens/admin/AdminAddOffreScreen.tsx — offer type picker
- client/screens/admin/AdminEditOffreScreen.tsx — offer type picker
- client/navigation/RootStackNavigator.tsx — AdminEditOffre params
- client/components/TrendingOffersView.tsx — Offre interface + navigation
- client/screens/OfferDetailsScreen.tsx — getTrendingTemplateKey, conditional UI
- client/screens/MessageDesignScreen.tsx — 3 new TemplateType values + tabs
- client/constants/translations.ts — kw_info + kw_price3pcs in 4 languages

**Why:** User requested offer type classification with different display/template rules per type.
**How to apply:** When adding new offer types in future, follow same pattern.
