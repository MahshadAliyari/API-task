# Crypto Price Tracker

A simple web app that shows live cryptocurrency prices and their 24-hour changes. Built with HTML, CSS, and  JavaScript. Data comes from the CoinGecko API (no API key needed).

---

## Features

- Shows the top 12 coins by market cap on load
- Add any coin by name (for example `bitcoin`) or by its Persian name
- Refresh prices with one click
- Remove coins from the list
- Dark and light theme (saved in the browser)
- Responsive layout with RTL (Persian) support

---

## Tech Stack

- HTML
- CSS (variables, Grid, Flexbox)
- JavaScript (Fetch API, async/await)
- CoinGecko API

---

## Project Structure

```
.
├── index.html
├── css/
│   └── style.css
└── js/
    └── script.js
```

---

## Usage

- Type a coin name in the input and click **Add**.
- Click **Refresh** to update prices.
- Click **Remove** on a card to delete it.
- Use the theme button in the header to switch between dark and light.

---

## Notes

- The free CoinGecko API has rate limits. If you get an error, wait a few seconds and try again.
- Only the theme is saved between visits, not the coin list.

---

## Live Demo


---

## AI Transparency

- **Section:** JavaScript logic for the API exercise, and the light/dark mode toggle button.
- **How I used it:** I asked the AI to explain the JavaScript concepts required for working with the API. After writing the code myself, I asked it to point out any issues in my code. For enabling the light/dark toggle button, I asked the AI for guidance on how to implement it.
- **What I changed:** I wrote and corrected the core logic myself; the AI was used for concept explanation, code review, and guidance on implementing the theme toggle feature.