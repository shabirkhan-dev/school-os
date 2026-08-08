import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
MAIN_SCRIPT = REPO_ROOT / "scripts" / "python" / "main.py"


def run_script(env: dict[str, str] | None, cwd: Path) -> subprocess.CompletedProcess[str]:
    """Run main.py with the current interpreter (uv venv python)."""
    full_env = os.environ.copy()
    full_env.pop("OPENAI_API_KEY", None)
    full_env.pop("OPENAI_BASE_URL", None)
    if env:
        full_env.update(env)
    return subprocess.run(
        [sys.executable, str(MAIN_SCRIPT)],
        capture_output=True,
        text=True,
        env=full_env,
        cwd=str(cwd),
        timeout=60,
        check=False,
    )


class MainScriptTest(unittest.TestCase):
    def test_missing_key_fails_gracefully(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            result = run_script(None, Path(tmp))
        self.assertEqual(result.returncode, 1)
        self.assertIn("OPENAI_API_KEY is not set", result.stdout)

    def test_key_from_env_reaches_provider(self) -> None:
        # Point at an unreachable local port: the script must attempt the call
        # (proving the env key is picked up) and fail with a connection error.
        with tempfile.TemporaryDirectory() as tmp:
            result = run_script(
                {
                    "OPENAI_API_KEY": "sk-test",
                    "OPENAI_BASE_URL": "http://127.0.0.1:9/v1",
                },
                Path(tmp),
            )
        self.assertEqual(result.returncode, 1)
        self.assertNotIn("OPENAI_API_KEY is not set", result.stdout)
        self.assertIn("Error", result.stdout)

    def test_key_from_dotenv_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            Path(tmp, ".env").write_text(
                "OPENAI_API_KEY=sk-from-dotenv\nOPENAI_BASE_URL=http://127.0.0.1:9/v1\n",
                encoding="utf-8",
            )
            result = run_script(None, Path(tmp))
        self.assertEqual(result.returncode, 1)
        self.assertNotIn("OPENAI_API_KEY is not set", result.stdout)
        self.assertIn("Error", result.stdout)

    def test_env_overrides_dotenv(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            Path(tmp, ".env").write_text(
                "OPENAI_BASE_URL=http://127.0.0.1:9/v1\n",
                encoding="utf-8",
            )
            result = run_script(
                {"OPENAI_API_KEY": "sk-env-wins", "OPENAI_BASE_URL": "http://127.0.0.1:9/v1"},
                Path(tmp),
            )
        self.assertEqual(result.returncode, 1)
        self.assertNotIn("OPENAI_API_KEY is not set", result.stdout)


if __name__ == "__main__":
    unittest.main()
