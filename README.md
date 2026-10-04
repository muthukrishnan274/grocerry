# Seematti Grocery Shop

Standalone HTML/CSS/JavaScript grocery website.

## Price setup
Product prices intentionally start as `null` so the project does not invent prices.
Open `script.js`, find `window.SEEMATTI_PRODUCTS` in the HTML data section, and replace a product's `"price": null` with a real numeric price, for example `"price": 60`.

Checkout is automatically blocked while any cart item has no valid price.

## Billing flow
PRODUCT → CART → CHECKOUT → BILL → PRINT / PDF → WHATSAPP

The "Download Bill PDF" button opens the browser's print dialog using the same print-only invoice stylesheet. Choose **Save as PDF**. This avoids external PDF libraries and works offline.

## WhatsApp
All WhatsApp order links use `9342896913` (international link format `919342896913`).

## Images
Every product has a local SVG placeholder under `assets/images/`. Replace these SVGs with real product photos later without changing the product logic.
