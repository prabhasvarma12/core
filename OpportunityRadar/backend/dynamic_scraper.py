import asyncio
from playwright.async_api import async_playwright
import sqlite3
import json
import random

async def random_delay(min_sec=1.5, max_sec=4.5):
    delay = random.uniform(min_sec, max_sec)
    print(f"Waiting {delay:.2f} seconds to simulate human behavior...")
    await asyncio.sleep(delay)

async def mask_webdriver(page):
    await page.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.navigator.chrome = { runtime: {} };
    """)

async def simulate_human_interaction(page):
    print("Simulating human mouse movements and scroll...")
    for _ in range(3):
        x = random.randint(100, 800)
        y = random.randint(100, 600)
        await page.mouse.move(x, y, steps=10)
        await asyncio.sleep(random.uniform(0.1, 0.4))
    await page.evaluate("window.scrollBy(0, window.innerHeight / 2)")
    await random_delay(0.5, 1.5)

async def scrape_source(page, source_config):
    await mask_webdriver(page)
    print(f"Navigating to {source_config['url']}...")
    try:
        await page.goto(source_config['url'], wait_until="domcontentloaded", timeout=15000)
        await random_delay(2.0, 4.0)
        print("Simulating human scrolling...")
        await page.evaluate("window.scrollBy(0, 500)")
        await random_delay(1.0, 2.0)
        await page.evaluate("window.scrollBy(0, 500)")
        await random_delay(0.5, 1.5)
        
        print(f"Waiting for primary feed selector: {source_config['item_selector']}...")
        await page.wait_for_selector(source_config['item_selector'], timeout=10000)
        
        # Extract fields directly via JS Evaluation
        jobs_data = await page.evaluate('''([itemSelector, titleSelector, linkSelector]) => {
            const items = document.querySelectorAll(itemSelector);
            const data = [];
            items.forEach(item => {
                const titleNode = titleSelector ? item.querySelector(titleSelector) : item;
                if (!titleNode) return;
                const linkNode = item.querySelector(linkSelector);
                
                let titleText = titleNode.innerText || titleNode.textContent;
                data.push({
                    title: titleText.trim(),
                    url: linkNode ? linkNode.href : window.location.href,
                    raw_text: item.innerText || ''
                });
            });
            return data;
        }''', [source_config['item_selector'], source_config['title_selector'], source_config['link_selector']])
        
        print(f"Successfully scraped {len(jobs_data)} elements from {source_config['url']}. Entering Deep Crawl for top 3 hits...")
        
        normalized_jobs = []
        import re
        for job in jobs_data[:3]: # Cap to 3 to prevent timeouts but fetch FULL data!
            try:
                print(f"Deep crawling: {job['url']}")
                await page.goto(job['url'], wait_until="domcontentloaded", timeout=15000)
                await simulate_human_interaction(page)
                
                full_text = await page.evaluate("document.body.innerText")
                salary_match = re.search(r'\$?\d{2,3}[kK](?:\s*-\s*\$?\d{2,3}[kK])?|\$\d{2,3}(?:,\d{3})?(?:\s*-\s*\$\d{2,3}(?:,\d{3})?)?|₹\s?\d{1,3}(?:,\d{3})*(?:\s*-\s*₹?\s?\d{1,3}(?:,\d{3})*)?', full_text)
                salary = salary_match.group(0) if salary_match else 'Salary Negotiable'
                
                deadline_match = re.search(r'(?:deadline|closes|apply by|end date|last date)[^\w\n]*\d{1,2}(?:st|nd|rd|th)?\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', full_text, re.IGNORECASE)
                deadline = deadline_match.group(0).strip() if deadline_match else 'Rolling / Continuous'
                
                normalized_jobs.append({
                    'title': job['title'],
                    'company': source_config.get('default_company', "Unknown"),
                    'deadline': deadline,
                    'requirements': json.dumps(source_config.get('tags', ["General"])),
                    'raw_text': full_text[:4000],  # Full rigorous text body
                    'source_url': job['url'],
                    'salary': salary
                })
            except Exception as deep_e:
                print(f"Deep crawl failed {job['url']}, skipping...")
        
        return normalized_jobs
    except Exception as e:
        print(f"Failed to scrape index {source_config['url']}: {e}")
        return []

async def run_dynamic_scraper():
    print("Initializing Playwright Headless Browser for Multi-Source Aggregation...")
    
    SOURCES = [
        {
            "url": "https://news.ycombinator.com/jobs",
            "item_selector": "tr.athing",
            "title_selector": "span.titleline > a",
            "link_selector": "span.titleline > a",
            "default_company": "Startup",
            "tags": ["Full-time", "Engineering", "High-Growth"]
        },
        {
            "url": "https://unstop.com/hackathons?oppstatus=open",
            "item_selector": "app-opportunity-list-item",
            "title_selector": "h2",
            "link_selector": "a.clickable-element",
            "default_company": "Unstop Hackathons (Telangana region filters applied)",
            "tags": ["Hackathon", "Telangana", "Competition", "Tech"]
        },
        {
            "url": "https://tworks.telangana.gov.in/careers",
            "item_selector": "div.summary-item",
            "title_selector": "a.summary-title-link",
            "link_selector": "a.summary-title-link",
            "default_company": "T-Works Telangana",
            "tags": ["Hardware", "Prototyping", "Telangana", "Incubator"]
        },
        {
            "url": "https://rnd.iitd.ac.in/jobs/project-staff",
            "item_selector": "tr",
            "title_selector": "td > strong",
            "link_selector": "td > a",
            "default_company": "IIT Research Feed (National)",
            "tags": ["Research", "Academic", "NIT", "IIT"]
        },
        {
            "url": "https://www.buddy4study.com/scholarships",
            "item_selector": "article.scholarship-card",
            "title_selector": "h4.scholarship-title",
            "link_selector": "a",
            "default_company": "Buddy4Study Network",
            "tags": ["Scholarship", "Funding", "Student"]
        },
        {
            "url": "https://www.linkedin.com/jobs/search?keywords=Software%20Intern&location=Worldwide",
            "item_selector": "div.base-card",
            "title_selector": "h3.base-search-card__title",
            "link_selector": "a.base-card__full-link",
            "default_company": "LinkedIn Listed Company",
            "tags": ["Internship", "Software", "Corporate"]
        },
        {
            "url": "https://www.indeed.com/jobs?q=software+intern",
            "item_selector": "div.job_seen_beacon",
            "title_selector": "span[title]",
            "link_selector": "h2.jobTitle > a",
            "default_company": "Indeed Search",
            "tags": ["Intern", "Technology"]
        },
        {
            "url": "https://www.glassdoor.com/Job/jobs.htm?sc.keyword=software%20intern",
            "item_selector": "li.JobsList_jobListItem__JBBUV",
            "title_selector": "a.JobCard_jobTitle___eA2",
            "link_selector": "a.JobCard_jobTitle___eA2",
            "default_company": "Glassdoor Finding",
            "tags": ["Internship", "Corporate"]
        },
        {
            "url": "https://www.naukri.com/software-intern-jobs",
            "item_selector": "div.srp-jobtuple-wrapper",
            "title_selector": "a.title",
            "link_selector": "a.title",
            "default_company": "Naukri Listed",
            "tags": ["Internship", "India", "Tech"]
        }
    ]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 800},
            device_scale_factor=1,
            has_touch=False
        )
        page = await context.new_page()
        
        all_jobs = []
        for source in SOURCES:
            jobs = await scrape_source(page, source)
            all_jobs.extend(jobs)
            
        save_to_database(all_jobs)
        export_database_to_json()
        await browser.close()
        print("Browser instance closed cleanly.")

def save_to_database(jobs, db_path='opportunity_radar.db'):
    import os
    if not os.path.exists(db_path):
        db_path = os.path.join(os.path.dirname(__file__), '..', 'opportunity_radar.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    inserted = 0
    for job in jobs:
        cursor.execute('SELECT id FROM opportunities WHERE title = ? AND source_url = ?', (job['title'], job['source_url']))
        if cursor.fetchone() is None:
            # We append Salary to the raw text payload to avoid schema migration overhead
            composite_text = f"SALARY: {job.get('salary', 'Unknown')} | {job['raw_text']}"
            cursor.execute('''
                INSERT INTO opportunities (title, company, deadline, requirements, raw_text, source_url)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (job['title'], job['company'], job['deadline'], job['requirements'], composite_text, job['source_url']))
            inserted += 1
            
    conn.commit()
    conn.close()
    print(f"Dynamically inserted {inserted} new aggregate records into SQLite.")

def export_database_to_json(db_path='opportunity_radar.db'):
    import os
    if not os.path.exists(db_path):
        db_path = os.path.join(os.path.dirname(__file__), '..', 'opportunity_radar.db')
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM opportunities ORDER BY id DESC LIMIT 100')
    rows = cursor.fetchall()
    
    frontend_data = []
    for r in rows:
        domain = r['source_url'].split('/')[2] if '/' in r['source_url'] else "external site"
        
        # safely extract prepended salary
        raw = r['raw_text'] or ''
        salary = "Competitive"
        if "SALARY: " in raw:
            parts = raw.split(" | ", 1)
            salary = parts[0].replace("SALARY: ", "")
            raw = parts[1] if len(parts) > 1 else raw

        frontend_data.append({
            'id': str(r['id']),
            'title': r['title'],
            'company': r['company'],
            'location': 'Various / Remote',
            'type': 'Live Opportunity',
            'deadline': r['deadline'] or 'Continuous',
            'tags': json.loads(r['requirements']),
            'salary': salary,
            'description': f"Extracted Salary: {salary}\n\nDeep Scrape Analysis:\n{raw[:600]}...",
            'source_url': r['source_url'],
            'url': r['source_url']
        })
        
    conn.close()
    
    output_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'liveData.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(frontend_data, f, indent=2)
    print(f"Exported {len(frontend_data)} live records to {output_path} for Frontend consumption.")

if __name__ == "__main__":
    asyncio.run(run_dynamic_scraper())
