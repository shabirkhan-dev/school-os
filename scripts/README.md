# School OS scripts

Scripts live under **`scripts/`** at repo root, organized by language: **bash**, **python**.

## Layout

```
scripts/
├── bash/           # Bash – ShellCheck, shfmt
│   ├── main.sh
│   └── .shellcheckrc
├── python/         # Python – ruff (lint + format)
│   ├── main.py
│   └── pyproject.toml
└── README.md       # This file
```

## Commands (from root)

| Command | Purpose |
|---------|---------|
| `bun run scripts:lint` | Lint bash (ShellCheck), python (ruff) |
| `bun run scripts:format` | Format bash (shfmt), python (ruff format) |
| `bun run scripts:run` | Run bash main script (same as `scripts:run:bash`) |
| `bun run scripts:run:bash` | Run `scripts/bash/main.sh` |
| `bun run scripts:run:python` | Run `scripts/python/main.py` via `uv` |
| `bun run test:scripts` | Run script tests for bash and python |

## Python (`scripts/python`)

The python script uses **uv** for its environment — it depends on `openai`, which is
**not** installed into your system python. Run it through uv only:

```bash
# from repo root
bun run scripts:run:python
# or directly
uv --directory scripts/python run main.py
# run the tests
uv --directory scripts/python run python -m unittest tests/test_main.py
```

`uv` reads `scripts/python/pyproject.toml` + `uv.lock`, creates a project venv, and
installs the locked dependencies automatically (first run downloads them).

### API key config

The script validates an OpenAI-compatible API key by listing models. The key is read
from the `OPENAI_API_KEY` env var (with optional `OPENAI_BASE_URL` override, default
`https://co.agentrouter.org/v1`). Set it either way:

```bash
# option 1 — export it
export OPENAI_API_KEY=sk-your-key-here

# option 2 — .env file (git-ignored)
cp scripts/python/.env.example scripts/python/.env
# then edit scripts/python/.env with your key
```

Never hardcode keys in `main.py` or commit `.env`.

## Prerequisites

- **Bash** – for `scripts/bash`
- **Python 3.11+** – for `scripts/python`

Optional (for lint/format):

- Bash: **ShellCheck**, **shfmt** (e.g. `pacman -S shellcheck shfmt`)
- Python: **ruff** (e.g. `pip install ruff` or `pacman -S ruff`)

## QoL / goodies

- **bash** – `.shellcheckrc`, shfmt 4-space indent.
- **python** – `pyproject.toml` (ruff + black-style line-length 100, Python 3.11).

