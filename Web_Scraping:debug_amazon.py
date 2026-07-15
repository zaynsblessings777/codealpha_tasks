from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

try:
    print("Opening Amazon...")
    driver.get("https://www.amazon.com/s?k=laptop")
    
    print("Waiting for products...")
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div[data-component-type='s-search-result']"))
    )
    
    time.sleep(2)
    
    products = driver.find_elements(By.CSS_SELECTOR, "div[data-component-type='s-search-result']")
    print(f"Found {len(products)} products!\n")
    
    if products:
        first = products[0]
        
        # Try to find price with different selectors
        print("TESTING PRICE SELECTORS:")
        
        selectors_to_test = [
            ("span.a-price span.a-offscreen", "span.a-price span.a-offscreen"),
            ("span.a-offscreen", "span.a-offscreen"),
            (".a-price-whole", ".a-price-whole"),
            ("span[data-a-color='base']", "span[data-a-color='base']"),
        ]
        
        for name, selector in selectors_to_test:
            try:
                element = first.find_element(By.CSS_SELECTOR, selector)
                print(f"✓ {name}: {element.text}")
            except:
                print(f"✗ {name}: NOT FOUND")
        
        # Save HTML to file for inspection
        html = first.get_attribute("outerHTML")
        with open("product_html.txt", "w") as f:
            f.write(html)
        print("\n✓ Full HTML saved to product_html.txt")
        
finally:
    driver.quit()