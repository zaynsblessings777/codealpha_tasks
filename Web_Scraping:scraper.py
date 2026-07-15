import requests
from bs4 import BeautifulSoup
import csv
# Download the webpage
url = "http://books.toscrape.com/"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

#find all books
books = soup.select("article.product_pod")
print(f"Found {len(books)} books!\n")

books = soup.select("article.product_pod")
print(f"Found {len(books)} books!\n")

books_data = []
# Loop through each book
for book in books:
    
    title_elem = book.select_one("h3 a")
    title = title_elem.get("title") if title_elem else "N/A"

    price_elem = book.select_one("p.price_color")
    price = price_elem.text.strip() if price_elem else "N/A"

    rating_elem = book.select_one("p.star_rating")
    rating = rating_elem.text.strip() if rating_elem else "N/A"

    availability_elem = book.select_one("p.instock.availability")
    availability = availability_elem.text.strip() if availability_elem else "N/A"

    books_data.append({
        "Title": title,
        "Price": price,
        "Rating": rating,
        "Availability": availability
    })

    print(f"Title: {title}")
    print(f"Price: {price}")
    print(f"Rating: {rating}")
    print(f"Availability: {availability}")
    print("-" * 50) 

with open("books_data.csv", "w", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=["Title", "Price", "Rating", "Availability"])
    writer.writeheader()
    writer.writerows(books_data)

print(f"\n Data saved to book_data csv!")