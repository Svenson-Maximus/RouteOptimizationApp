from datetime import time, timedelta


ROUTE_START = time(4, 20)
ROUTE_END = time(19, 0)


def seconds_from_route_start(value: time) -> int:
    base = timedelta(hours=ROUTE_START.hour, minutes=ROUTE_START.minute, seconds=ROUTE_START.second)
    current = timedelta(hours=value.hour, minutes=value.minute, seconds=value.second)
    return int((current - base).total_seconds())


def route_horizon_seconds() -> int:
    return seconds_from_route_start(ROUTE_END)


def format_route_time(seconds_after_start: int) -> str:
    total_minutes = ROUTE_START.hour * 60 + ROUTE_START.minute + seconds_after_start // 60
    hours = (total_minutes // 60) % 24
    minutes = total_minutes % 60
    return f"{hours:02d}:{minutes:02d}"
