import asyncio
from playwright.async_api import async_playwright
import sqlite3
import json
import random

async def random_delay(min_sec=1.5, max_sec=4.5):
    delay = random.uniform(min_sec, max_sec)
    print(f"Waiting {delay:.2f} seconds to simulate human behavior...")
    await asyncio.sleep(delay)

async def run_dynamic_scraper():
    print("Initializing Playwright Headless Browser...")
    async with async_playwright() as p:
        # Launch browser in headless mode
        browser = await p.chromium.launch(headless=True)
        
        # Set up a context that mimics a real user
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 800},
            device_scale_factor=1,
            has_touch=False
        )
        
        page = await context.new_page()
        
        target_url = "https://news.ycombinator.com/jobs"
        print(f"Navigating to {target_url}...")
        
        await page.goto(target_url, wait_until="domcontentloaded")
        await random_delay(2.0, 4.0)

        # Scroll down naturally to trigger any lazy loaded items
        print("Simulating human scrolling...")
        await page.evaluate("window.scrollBy(0, 500)")
        await random_delay(1.0, 2.0)
        await page.evaluate("window.scrollBy(0, 500)")
        await random_delay(0.5, 1.5)
        
        # Wait for the specific dynamic content selector
        print("Waiting for primary feed selector...")
        await page.wait_for_selector("tr.athing", timeout=10000)
        
        # Extract titles using JS evaluation directly inside the browser context
        print("Extracting elements via browser JS engine...")
        jobs_data = await page.evaluate('''() => {
            const items = document.querySelectorAll('tr.athing');
            const data = [];
            items.forEach(item => {
                const titleSpan = item.querySelector('span.titleline');
                if (titleSpan && titleSpan.querySelector('a')) {
                    data.push({
                        title: titleSpan.querySelector('a').innerText,
                        url: titleSpan.querySelector('a').href
                    });
                }
            });
            return data;
        }''')
        
        print(f"Successfully scraped {len(jobs_data)} elements from dynamic DOM.")
        
        # Transform data matching our schema requirements
        normalized_jobs = []
        for job in jobs_data:
            company = "Unknown"
            if " is hiring " in job['title']:
                parts = job['title'].split(" is hiring ")
                company = parts[0].strip()
                title = parts[1].strip()
            else:
                title = job['title']
                
            normalized_jobs.append({
                'title': title,
                'company': company,
                'deadline': 'Dynamic-Extraction',
                'requirements': '["JavaScript", "Dynamic Analysis", "Headless Browser"]',
                'raw_text': job['title'],
                'source_url': job['url']
            })
            
        save_to_database(normalized_jobs)
        await browser.close()
        print("Browser instance closed cleanly.")

def save_to_database(jobs, db_path='opportunity_radar.db'):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    inserted = 0
    for job in jobs:
        cursor.execute('SELECT id FROM opportunities WHERE title = ? AND company = ?', (job['title'], job['company']))
        if cursor.fetchone() is None:
            cursor.execute('''
                INSERT INTO opportunities (title, company, deadline, requirements, raw_text, source_url)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (job['title'], job['company'], job['deadline'], job['requirements'], job['raw_text'], job['source_url']))
            inserted += 1
            
    conn.commit()
    conn.close()
    print(f"Dynamically inserted {inserted} new records into SQLite storage.")

if __name__ == "__main__":
    asyncio.run(run_dynamic_scraper())
