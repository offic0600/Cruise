import sys
from pathlib import Path

from linear_capture_runtime.legacy_adapter import main


if __name__ == "__main__":
    out_root = Path(sys.argv[2]).expanduser() if len(sys.argv) > 2 else None
    raise SystemExit(main([str(out_root)] if out_root else []))
