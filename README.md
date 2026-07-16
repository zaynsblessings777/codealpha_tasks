# Web Scraping

A collection of Python scripts for practicing web scraping using `requests` and `BeautifulSoup`.

## Files

- **scraper.py** — Scrapes book data (title, price, rating, availability) from [books.toscrape.com](http://books.toscrape.com/) and saves results to `books_data.csv`.
- **amazon_scraper_basic.py** — Basic Amazon product scraper.
- **debug_amazon.py** — Debugging script for troubleshooting the Amazon scraper.
- **amazon_laptops.csv** — Sample scraped output data.
- **product_html.txt** — Saved HTML snapshot used for offline parsing/testing.

## Requirements

```bash
pip install requests beautifulsoup4
```

## Usage

```bash
python3 scraper.py
```

This will print the scraped book data to the console and save it to `books_data.csv` in the same folder.

## Notes

- `scraper.py` targets books.toscrape.com, a sandbox site built for practicing scraping.
- Amazon-related scripts may fail due to anti-bot protections (CAPTCHAs, blocked headers) rather than code issues.
