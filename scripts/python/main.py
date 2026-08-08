"""Validate an OpenAI-compatible API key by listing the available models.

Run from the repo root:

    bun run scripts:run:python

or directly through uv:

    uv --directory scripts/python run main.py

The API key is read from the ``OPENAI_API_KEY`` environment variable. It can
also be provided via a local ``.env`` file (see ``.env.example``). Never
hardcode keys in this file.
"""

import os
import sys
from pathlib import Path

from openai import OpenAI

DEFAULT_BASE_URL = "https://agentrouter.org/v1"


def load_dotenv(path: Path) -> None:
    """Load ``KEY=VALUE`` pairs from a .env file without extra dependencies.

    Existing environment variables always win over the file.
    """
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, _, value = stripped.partition("=")
        key = key.strip()
        value = value.strip().strip("\"'")
        if key:
            os.environ.setdefault(key, value)


def api_config() -> tuple[str, str] | None:
    """Resolve the API key and base URL, loading .env files when present.

    Returns ``None`` when the key is missing so the caller can print a
    friendly message instead of failing on a raw ``AuthenticationError``.
    """
    script_dir = Path(__file__).resolve().parent
    load_dotenv(Path.cwd() / ".env")
    load_dotenv(script_dir / ".env")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    return api_key, os.getenv("OPENAI_BASE_URL", DEFAULT_BASE_URL)


def main() -> int:
    config = api_config()
    if config is None:
        print("❌ OPENAI_API_KEY is not set.")
        print("   Copy scripts/python/.env.example to scripts/python/.env")
        print("   and add your key, then run the script again.")
        return 1

    api_key, base_url = config
    client = OpenAI(api_key=api_key, base_url=base_url)

    try:
        models = client.models.list()
    except Exception as exc:  # noqa: BLE001 - report any provider/network error
        print(f"❌ Error: {exc}")
        return 1

    print("✅ API key is valid!")
    print(f"\nEndpoint: {base_url}")
    print("\nAvailable models:\n")

    for model in models.data:
        print("-", model.id)

    return 0


if __name__ == "__main__":
    sys.exit(main())
