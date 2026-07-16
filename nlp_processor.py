import spacy
import json
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class FAQProcessor:
    """
    Handles all NLP processing:
    1. Load FAQ questions
    2. Process them with spaCy
    3. Generate word vectors
    4. Match user questions using cosine similarity
    """
    
    def __init__(self, faq_file="faq_data.json", model="en_core_web_sm"):
        """
        Initialize the FAQ processor
        
        Args:
            faq_file: Path to JSON file with FAQs
            model: spaCy model to load (en_core_web_sm is lightweight)
        """
        print("🧠 Loading spaCy model...")
        
        # Try to load spaCy model
        try:
            self.nlp = spacy.load(model)
        except OSError:
            print(f"❌ Model {model} not found. Installing...")
            import subprocess
            subprocess.run(["python3", "-m", "spacy", "download", model])
            self.nlp = spacy.load(model)
        
        print("✅ spaCy model loaded")
        
        # Load FAQ data from JSON
        print("📂 Loading FAQ data...")
        with open(faq_file, 'r') as f:
            self.faq_data = json.load(f)
        
        print(f"✅ Loaded {len(self.faq_data['faqs'])} FAQs")
        
        # Storage for vectors
        self.faq_vectors = []
        self.faq_questions = []
        
        # Process all FAQs
        self._process_faqs()
    
    def _process_faqs(self):
        """
        Process each FAQ question with spaCy and store vectors.
        This happens once when the app starts.
        """
        for faq in self.faq_data["faqs"]:
            question = faq["question"]
            
            # Use spaCy to process the question
            doc = self.nlp(question)
            
            # Store the question and its vector
            self.faq_questions.append(question)
            self.faq_vectors.append(doc.vector)
        
        print(f"✓ Processed {len(self.faq_vectors)} FAQ questions with spaCy")
    
    def preprocess_text(self, text):
        """
        Clean and preprocess user input.
        
        Steps:
        1. Convert to lowercase
        2. Tokenize (split into words)
        3. Remove stop words (the, is, a, etc.)
        4. Lemmatize (run → running → run)
        5. Generate vector
        """
        # Convert to lowercase
        text = text.lower()
        
        # Process with spaCy
        doc = self.nlp(text)
        
        # Extract tokens, removing stop words and punctuation
        tokens = [token.lemma_ for token in doc 
                  if not token.is_stop and not token.is_punct]
        
        cleaned_text = " ".join(tokens)
        
        return cleaned_text, doc
    
    def find_best_match(self, user_question, threshold=0.3):
        """
        Find the best matching FAQ for a user question.
        
        How it works:
        1. Preprocess user question
        2. Generate vector using spaCy
        3. Compare with all FAQ vectors using cosine similarity
        4. Return best match if confidence > threshold
        
        Args:
            user_question: Raw user input
            threshold: Minimum similarity score (0-1) to consider a match
            
        Returns:
            Dictionary with answer, confidence score, and metadata
        """
        # Preprocess user question
        cleaned, user_doc = self.preprocess_text(user_question)
        user_vector = user_doc.vector
        
        # Check if vector is empty (only stop words or empty input)
        if np.allclose(user_vector, 0):
            return {
                "match_found": False,
                "question": None,
                "answer": None,
                "similarity": 0,
                "message": "I couldn't understand your question. Could you rephrase it?"
            }
        
        # Calculate similarity between user question and all FAQs
        # cosine_similarity returns a 2D array, we want the first row
        similarities = cosine_similarity([user_vector], self.faq_vectors)[0]
        
        # Find the FAQ with highest similarity
        best_idx = np.argmax(similarities)
        best_score = similarities[best_idx]
        
        # Check if score meets minimum threshold
        if best_score < threshold:
            return {
                "match_found": False,
                "question": None,
                "answer": None,
                "similarity": float(best_score),
                "message": "I'm not sure about that. Could you try asking differently?"
            }
        
        # Return the best matching FAQ
        matched_faq = self.faq_data["faqs"][best_idx]
        return {
            "match_found": True,
            "question": matched_faq["question"],
            "answer": matched_faq["answer"],
            "similarity": float(best_score),
            "faq_id": matched_faq["id"]
        }
    
    def get_all_faqs(self):
        """Return all FAQ questions and answers"""
        return self.faq_data["faqs"]


# This creates a global processor instance that Flask will use
print("⏳ Initializing FAQ processor...")
try:
    faq_processor = FAQProcessor()
except Exception as e:
    print(f"❌ Error: {e}")
    faq_processor = None