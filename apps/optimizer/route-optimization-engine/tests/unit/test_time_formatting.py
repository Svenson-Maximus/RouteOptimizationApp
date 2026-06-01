from datetime import time
from unittest import TestCase, main

from route_time import format_route_time, route_horizon_seconds, seconds_from_route_start


class RouteTimeTest(TestCase):

    def test_seconds_from_route_start_uses_0420_baseline(self):
        self.assertEqual(seconds_from_route_start(time(4, 20)), 0)
        self.assertEqual(seconds_from_route_start(time(5, 20)), 3600)

    def test_route_horizon_matches_configured_end_of_day(self):
        self.assertEqual(route_horizon_seconds(), 14 * 60 * 60 + 40 * 60)

    def test_format_route_time(self):
        self.assertEqual(format_route_time(0), "04:20")
        self.assertEqual(format_route_time(20 * 60), "04:40")
        self.assertEqual(format_route_time(60 * 60 + 16 * 60), "05:36")


if __name__ == "__main__":
    main()
