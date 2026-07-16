# FAQ Chatbot

A simple chatbot that answers frequently asked questions using [keyword matching / NLP similarity — adjust].

## Files

- **app.py** — Main application/entry point.
- **[faq_matcher.py or similar]** — Core matching logic that maps user input to FAQ answers.
- **[faqs.json / faqs.csv]** — Dataset of question-answer pairs the bot draws from.
- **requirements.txt** — Python dependencies.

## Requirements

```bash
pip install -r requirements.txt
```

## Usage

```bash
python3 app.py
```

[Add here: does it run in terminal, or open a local web page like `localhost:5000`?]

## How it works

The bot takes user input, compares it against a set of predefined FAQs, and returns the closest matching answer. [Add detail: exact/fuzzy matching, TF-IDF, or an API like OpenAI?]

## Notes

- [Add any known limitations, e.g. "only handles exact keyword matches" or "requires internet for API calls."]
