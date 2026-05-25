import json

from playwright.sync_api import sync_playwright


URL = "http://127.0.0.1:8000/"
VIEWPORTS = (
    ("phone", 390, 844),
    ("tablet", 820, 1180),
    ("desktop", 1366, 768),
)
GAMES = ("tennis", "hockey")


def main():
    checks = []
    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for name, width, height in VIEWPORTS:
            page = browser.new_page(viewport={"width": width, "height": height})
            page.on(
                "console",
                lambda msg, viewport=name: console_errors.append(
                    {"viewport": viewport, "text": msg.text}
                )
                if msg.type == "error"
                and "ERR_NETWORK_ACCESS_DENIED" not in msg.text
                else None,
            )
            page.on(
                "pageerror",
                lambda exc, viewport=name: console_errors.append(
                    {"viewport": viewport, "text": str(exc)}
                ),
            )
            page.goto(URL, wait_until="networkidle")
            page.evaluate("window.gameEngine.startCup()")
            page.wait_for_timeout(450)

            for game in GAMES:
                page.evaluate("(game) => window.gameEngine.showCupStage(game)", game)
                page.wait_for_timeout(450)
                info = page.evaluate(
                    """
                    (game) => {
                        const container = document
                            .getElementById(`game-${game}-container`)
                            .getBoundingClientRect();
                        const canvas = document
                            .getElementById(`${game}-canvas`)
                            .getBoundingClientRect();
                        return {
                            game,
                            containerWidth: Math.round(container.width),
                            centerDelta: Math.round(
                                (container.left + container.width / 2) - (window.innerWidth / 2)
                            ),
                            canvasWidth: Math.round(canvas.width),
                            overflowX: document.documentElement.scrollWidth - window.innerWidth,
                        };
                    }
                    """,
                    game,
                )
                checks.append({"viewport": name, **info})
            page.close()
        browser.close()

    result = {
        "checks": checks,
        "centered": all(abs(item["centerDelta"]) <= 2 for item in checks),
        "noOverflow": all(item["overflowX"] <= 1 for item in checks),
        "consoleErrors": console_errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if not result["centered"] or not result["noOverflow"] or console_errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
