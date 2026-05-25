import os
import re
import subprocess
import sys
import unittest
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parent
REQUIRED_FILES = ("index.html", "style.css", "app.js", "game.js")


def read_text(name):
    return (ROOT / name).read_text(encoding="utf-8")


class FietjeWebsiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.chdir(ROOT)
        cls.html = read_text("index.html")
        cls.css = read_text("style.css")
        cls.app_js = read_text("app.js")
        cls.game_js = read_text("game.js")

    def test_required_files_exist(self):
        for filename in REQUIRED_FILES:
            with self.subTest(filename=filename):
                self.assertTrue((ROOT / filename).is_file(), f"{filename} fehlt")

    def test_javascript_syntax(self):
        for filename in ("app.js", "game.js"):
            with self.subTest(filename=filename):
                result = subprocess.run(
                    ["node", "-c", filename],
                    cwd=ROOT,
                    capture_output=True,
                    text=True,
                    check=False,
                )
                self.assertEqual(result.returncode, 0, result.stderr)

    def test_game_html_contract(self):
        required_ids = (
            "slide-games",
            "slide-cup-final",
            "tab-penalty",
            "tab-keepup",
            "tab-tennis",
            "tab-hockey",
            "game-penalty-container",
            "game-keepup-container",
            "game-tennis-container",
            "game-hockey-container",
            "penalty-canvas",
            "keepup-canvas",
            "tennis-canvas",
            "hockey-canvas",
            "penalty-overlay",
            "keepup-overlay",
            "tennis-overlay",
            "hockey-overlay",
            "leaderboard-list",
            "cup-roadmap",
            "cup-total-score",
            "cup-summary-grid",
            "cup-player-name",
        )
        for element_id in required_ids:
            with self.subTest(element_id=element_id):
                self.assertIn(f'id="{element_id}"', self.html)

        self.assertIn("window.gameEngine.switchGame('penalty')", self.html)
        self.assertIn("window.gameEngine.switchGame('keepup')", self.html)
        self.assertIn("window.gameEngine.switchGame('tennis')", self.html)
        self.assertIn("window.gameEngine.switchGame('hockey')", self.html)
        self.assertIn("window.gameEngine.startPenaltyGame()", self.html)
        self.assertIn("window.gameEngine.startKeepUpGame()", self.html)
        self.assertIn("window.gameEngine.startTennisGame()", self.html)
        self.assertIn("window.gameEngine.startHockeyGame()", self.html)
        self.assertIn("window.gameEngine.startCup()", self.html)
        self.assertIn("window.gameEngine.submitCupScore()", self.html)
        self.assertNotIn("firebasejs/9.22.0", self.html, "Firebase darf lokale Spiele nicht beim Laden blockieren")

    def test_css_keeps_game_controls_usable(self):
        self.assertRegex(self.css, r"canvas\s*\{[^}]*touch-action:\s*none", "Canvas muss Touch-Scrolling blockieren")
        self.assertRegex(self.css, r"\.game-container\s*\{[^}]*display:\s*none", "Inaktive Spiele muessen versteckt sein")
        self.assertRegex(self.css, r"\.game-container\.active\s*\{[^}]*display:\s*block", "Aktives Spiel muss sichtbar sein")
        self.assertRegex(self.css, r"#confetti-canvas\s*\{[^}]*pointer-events:\s*none", "Konfetti darf Klicks nicht blockieren")
        self.assertIn(".game-overlay-start .overlay-content h3", self.css)
        self.assertIn('class="game-overlay game-overlay-start"', self.html)

    def test_switch_game_regression_guards(self):
        switch_block = self._extract_method("switchGame")

        self.assertIn("this.gameTypes.includes(gameType)", switch_block)
        self.assertIn("cancelAnimationFrame(this.penalty.animationId)", switch_block)
        self.assertIn("cancelAnimationFrame(this.keepup.animationId)", switch_block)
        self.assertIn("cancelAnimationFrame(this.tennis.animationId)", switch_block)
        self.assertIn("cancelAnimationFrame(this.hockey.animationId)", switch_block)
        self.assertIn("this.syncOverlayForGame(gameType)", switch_block)
        self.assertIn("this.resumeGames()", switch_block)

    def test_overlay_sync_exists_for_tabs(self):
        self.assertIn("syncOverlayForGame(gameType)", self.game_js)
        self.assertIn("penalty-overlay-title", self.game_js)
        self.assertIn("keepup-overlay-title", self.game_js)
        self.assertIn("tennis-overlay-title", self.game_js)
        self.assertIn("hockey-overlay-title", self.game_js)
        self.assertIn("overlay.style.display = 'none'", self.game_js)
        self.assertIn("overlay.style.display = 'flex'", self.game_js)

    def test_new_games_and_leaderboard_exist(self):
        for method_name in (
            "setupTennisListeners",
            "startTennisGame",
            "loopTennis",
            "drawTennis",
            "setupHockeyListeners",
            "startHockeyGame",
            "loopHockey",
            "drawHockey",
            "saveScoreToLeaderboard",
            "renderLeaderboard",
        ):
            with self.subTest(method_name=method_name):
                self.assertIn(f"{method_name}(", self.game_js)

        self.assertIn("fietje_friend_leaderboard", self.game_js)
        self.assertIn(".slice(0, 10)", self.game_js)
        self.assertIn("createCupSlides()", self.game_js)
        self.assertIn("startCup()", self.game_js)
        self.assertIn("submitCupScore()", self.game_js)
        self.assertIn("slide-cup-${type}", self.game_js)
        self.assertIn("providedName ?? prompt", self.game_js)

    def test_firebase_is_loaded_only_when_configured(self):
        self.assertIn("async function ensureFirebaseLoaded()", self.app_js)
        self.assertIn("loadExternalScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js')", self.app_js)
        self.assertIn("await initChat()", self.app_js)

    def test_keepup_mouse_no_longer_depends_only_on_canvas(self):
        keepup_listener_block = self._extract_method("setupKeepUpListeners")

        self.assertIn("getPointerX", keepup_listener_block)
        self.assertIn("updateFromPointer", keepup_listener_block)
        self.assertIn("window.addEventListener('mousemove', updateFromPointer)", keepup_listener_block)
        self.assertIn("this.activeGame !== 'keepup'", keepup_listener_block)

    def test_game_start_cancels_old_animation_frames(self):
        penalty_start = self._extract_method("startPenaltyGame")
        keepup_start = self._extract_method("startKeepUpGame")

        self.assertIn("cancelAnimationFrame(this.penalty.animationId)", penalty_start)
        self.assertIn("cancelAnimationFrame(this.keepup.animationId)", keepup_start)
        tennis_start = self._extract_method("startTennisGame")
        hockey_start = self._extract_method("startHockeyGame")
        self.assertIn("cancelAnimationFrame(this.tennis.animationId)", tennis_start)
        self.assertIn("cancelAnimationFrame(this.hockey.animationId)", hockey_start)

    def test_optional_local_server_smoke(self):
        url = os.environ.get("FIETJE_TEST_URL", "http://127.0.0.1:8000/")
        try:
            with urlopen(url, timeout=2) as response:
                body = response.read().decode("utf-8")
        except URLError as exc:
            self.skipTest(f"Lokaler Server nicht erreichbar: {exc}")

        self.assertEqual(response.status, 200)
        self.assertIn("Alles Gute zum 15. Geburtstag, Fietje!", body)
        self.assertIn("game.js", body)
        self.assertIn("app.js", body)

    def _extract_method(self, method_name):
        pattern = re.compile(rf"\n\s+{re.escape(method_name)}\([^)]*\)\s*\{{")
        match = pattern.search(self.game_js)
        self.assertIsNotNone(match, f"Methode {method_name} nicht gefunden")

        start = match.start()
        depth = 0
        seen_open = False
        for index in range(match.end() - 1, len(self.game_js)):
            char = self.game_js[index]
            if char == "{":
                depth += 1
                seen_open = True
            elif char == "}":
                depth -= 1
                if seen_open and depth == 0:
                    return self.game_js[start:index + 1]

        self.fail(f"Methode {method_name} konnte nicht vollstaendig gelesen werden")


if __name__ == "__main__":
    print("=== Fietje Website Regressionstest ===")
    unittest.main(verbosity=2)
