# Language Translation Tool

A Flask-based web app for translating text between languages.

## Files

- **app.py** — Flask application entry point and routes.
- **templates/** — HTML templates for the web interface.
- **static/** — CSS/JS assets.
- **requirements.txt** — Python dependencies.

## Requirements

```bash
pip install -r requirements.txt
```

## Usage

```bash
python3 app.py
```

Then open `http://localhost:5000` in your browser.

## How it works

Users enter text and select a target language; the app sends the request to [Google Translate API / deep-translator / other library — adjust] and displays the translated result.

## Notes

- [Add if it needs an API key — e.g. "Requires a `.env` file with `API_KEY=your_key_here` (not included, add your own)."]
