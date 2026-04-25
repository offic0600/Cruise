from pathlib import Path

from .runtime import TMP_ROOT, run_legacy_capture


def main(argv=None):
    argv = argv or []
    out_root = Path(argv[0]).expanduser() if argv else TMP_ROOT
    return run_legacy_capture(out_root=out_root)
