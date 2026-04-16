import requests
from bs4 import BeautifulSoup
import sqlite3
import json

def fetch_html(url):
    print(f"Fetching {url}...")
    headers = {
        'User-Agent': 'OpportunityRadarBot/1.0 (Student Project; Contact: info@example.com)'
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.text

def parse_ycombinator_jobs(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    jobs = []
    
    # YCombinator jobs feed usually has class 'athing' for each item
    items = soup.find_all('tr', class_='athing')
    for item in items:
        title_element = item.find('span', class_='titleline')
        if title_element and title_element.a:
            raw_title = title_element.a.text
            url = title_element.a.get('href')
            
            # Simple heuristic since YC titles usually look like "Company (YC XX) is hiring Role"
            company = "Unknown"
            if " is hiring " in raw_title:
                parts = raw_title.split(" is hiring ")
                company = parts[0].strip()
                title = parts[1].strip()
            elif " hiring " in raw_title:
                parts = raw_title.split(" hiring ")
                company = parts[0].strip()
                title = parts[1].strip()
            else:
                title = raw_title
                
            jobs.append({
                'title': title,
                'company': company,
                'deadline': 'Unknown', 
                'requirements': '[]',
                'raw_text': raw_title,
                'source_url': url if url.startswith('http') else f"https://news.ycombinator.com/{url}"
            })
            
    return jobs

def save_to_database(jobs, db_path='opportunity_radar.db'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    inserted = 0
    for job in jobs:
        # Check if already exists by title and company to avoid dupes
        cursor.execute('SELECT id FROM opportunities WHERE title = ? AND company = ?', (job['title'], job['company']))
        if cursor.fetchone() is None:
            cursor.execute('''
                INSERT INTO opportunities (title, company, deadline, requirements, raw_text, source_url)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (job['title'], job['company'], job['deadline'], json.dumps(job['requirements']), job['raw_text'], job['source_url']))
            inserted += 1
            
    conn.commit()
    conn.close()
    print(f"Saved {inserted} new opportunities to the database.")

def main():
    target_url = "https://news.ycombinator.com/jobs"
    try:
        html = fetch_html(target_url)
        parsed_jobs = parse_ycombinator_jobs(html)
        print(f"Found {len(parsed_jobs)} jobs on HackerNews.")
        save_to_database(parsed_jobs)
    except Exception as e:
        print(f"Error scraping {target_url}: {e}")

if __name__ == "__main__":
    main()
