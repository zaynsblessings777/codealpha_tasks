from flask import Flask, render_template, request, jsonify
from translate import Translator

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.json
        text = data.get('text')
        source_lang = data.get('source_lang')
        target_lang = data.get('target_lang')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        #create translator
        translator = Translator(from_lang=source_lang, to_lang=target_lang)
        translated_text = translator.translate(text)

        return jsonify({
            'success': True,
            'translated_text': translated_text,
            'original_text': text,
            'source_lang': source_lang,
            'target_lang': target_lang
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__=='__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
    