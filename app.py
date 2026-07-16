from flask import Flask, render_template, request, jsonify
from nlp_processor import FAQProcessor
import os

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Create Flask app with explicit paths
app = Flask(__name__,
            template_folder=os.path.join(BASE_DIR, 'templates'),
            static_folder=os.path.join(BASE_DIR, 'static'),
            static_url_path='/static')

app.config['JSON_SORT_KEYS'] = False

# Initialize NLP processor
try:
    faq_processor = FAQProcessor()
    print("✅ NLP processor initialized")
except Exception as e:
    print(f"❌ Error initializing NLP: {e}")
    faq_processor = None


@app.route('/')
def index():
    """Serve the main chatbot page"""
    return render_template('index.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    if not faq_processor:
        return jsonify({"success": False, "error": "NLP not ready"}), 500
    
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"success": False, "error": "Empty message"}), 400
        
        result = faq_processor.find_best_match(user_message)
        
        response = {
            "success": True,
            "user_message": user_message,
            "match_found": result["match_found"],
            "answer": result.get("answer", result.get("message")),
            "matched_question": result.get("question"),
            "confidence": round(result.get("similarity", 0) * 100, 1),
            "faq_id": result.get("faq_id")
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"❌ Error in chat: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/faqs', methods=['GET'])
def get_faqs():
    """Get all FAQs"""
    if not faq_processor:
        return jsonify({"success": False, "error": "NLP not ready"}), 500
    
    try:
        faqs = faq_processor.get_all_faqs()
        return jsonify({
            "success": True,
            "faqs": faqs,
            "total": len(faqs)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        "status": "ok",
        "nlp_ready": faq_processor is not None
    })


if __name__ == '__main__':
    print("🚀 Starting FAQ Chatbot...")
    app.run(debug=False, port=5001)