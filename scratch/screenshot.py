import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Launch browser in headful or headless mode
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = await context.new_page()

        print("Navigating to login page...")
        await page.goto("http://localhost:8001/login")
        await page.wait_for_load_state("networkidle")

        print("Filling credentials...")
        await page.fill("input[type='email']", "admin@mabdc.test")
        await page.fill("input[type='password']", "password")
        
        print("Submitting login form...")
        await page.click("button[type='submit']")
        await page.wait_for_url("**/dashboard")
        print("Logged in successfully!")

        print("Navigating to learner profile page...")
        await page.goto("http://localhost:8001/learners/97")
        await page.wait_for_load_state("networkidle")
        # Give React/Inertia a moment to render
        await page.wait_for_timeout(2000)

        # Print layout dimensions and checks
        dimensions = await page.evaluate("""() => {
            return {
                bodyScrollHeight: document.body.scrollHeight,
                bodyClientHeight: document.body.clientHeight,
                htmlScrollHeight: document.documentElement.scrollHeight,
                htmlClientHeight: document.documentElement.clientHeight,
                windowInnerHeight: window.innerHeight,
                windowScrollY: window.scrollY
            };
        }""")
        print("Page dimensions:", dimensions)

        # Take screenshot
        screenshot_path = r"C:\Users\DENNIS\.gemini\antigravity\brain\3ed15e02-5628-48b2-842e-e3f32aef056f\screenshot_learner_97.png"
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to: {screenshot_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
