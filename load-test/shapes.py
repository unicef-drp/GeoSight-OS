# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '21/02/2026'
__copyright__ = ('Copyright 2026, Unicef')

import math
from locust import LoadTestShape


class StepLoadShape(LoadTestShape):
    r"""Ramp-up load shape: increase users in discrete steps.

    Timeline (default values)
    -------------------------
    0 s  →  60 s   : 10 users  (step 1)
    60 s → 120 s   : 20 users  (step 2)
    120 s → 180 s  : 30 users  (step 3)
    ...until step_count is reached, then the test ends.

    Override class attributes to customise the shape:

    .. code-block:: python

        class MyStep(StepLoadShape):
            step_duration = 120   # seconds per step
            step_users    = 20    # users added each step
            step_count    = 5     # total number of steps
            spawn_rate    = 5     # users/second when ramping

    Usage
    -----
        locust -f locustfile.py --host=https://... --headless \\
            --shape StepLoadShape FullJourneyUser
    """

    #: Seconds spent at each user level before stepping up.
    step_duration: int = 60
    #: Number of users added at every step.
    step_users: int = 10
    #: Total number of steps (test ends after the last step completes).
    step_count: int = 5
    #: Users spawned per second when transitioning between steps.
    spawn_rate: int = 2

    def tick(self):
        """Return (user_count, spawn_rate) for the current point in time.

        Returns ``None`` to stop the test after all steps have elapsed.
        :return: Tuple of (target user count, spawn rate)
            or ``None`` to end test.
        :rtype: Optional[Tuple[int, int]]
        """
        elapsed = self.get_current_time()
        total_duration = self.step_duration * self.step_count

        if elapsed >= total_duration:
            return None  # test finished

        current_step = math.floor(elapsed / self.step_duration) + 1
        target_users = current_step * self.step_users
        return target_users, self.spawn_rate


class StressTestShape(LoadTestShape):
    r"""Stress test shape: ramp up to peak, hold, then ramp down.

    Timeline (default values)
    -------------------------
    Phase 1 — ramp-up  :   0 s → 120 s  (0 → 100 users)
    Phase 2 — hold     : 120 s → 420 s  (100 users sustained)
    Phase 3 — ramp-down: 420 s → 540 s  (100 → 0 users)

    Override class attributes to customise the shape:

    .. code-block:: python

        class MyStress(StressTestShape):
            peak_users    = 200
            ramp_up_time  = 180   # seconds to reach peak
            hold_time     = 600   # seconds to sustain peak
            ramp_down_time = 120  # seconds to wind down
            spawn_rate    = 10

    Usage
    -----
        locust -f locustfile.py --host=https://... --headless \\
            --shape StressTestShape FullJourneyUser
    """

    #: Maximum concurrent users reached during the hold phase.
    peak_users: int = 100
    #: Seconds to linearly ramp from 0 to ``peak_users``.
    ramp_up_time: int = 120
    #: Seconds to sustain ``peak_users`` load.
    hold_time: int = 300
    #: Seconds to linearly ramp from ``peak_users`` back to 0.
    ramp_down_time: int = 120
    #: Users spawned/stopped per second when transitioning.
    spawn_rate: int = 5

    def tick(self):
        """Return (user_count, spawn_rate) for the current point in time.

        Returns ``None`` to stop the test once ramp-down is complete.
        :return: Tuple of (target user count, spawn rate)
            or ``None`` to end test.
        :rtype: Optional[Tuple[int, int]]
        """
        elapsed = self.get_current_time()
        ramp_up_end = self.ramp_up_time
        hold_end = ramp_up_end + self.hold_time
        ramp_down_end = hold_end + self.ramp_down_time

        if elapsed < ramp_up_end:
            # Linear ramp-up
            progress = elapsed / self.ramp_up_time
            users = math.ceil(progress * self.peak_users)
            return max(users, 1), self.spawn_rate

        if elapsed < hold_end:
            # Sustain peak load
            return self.peak_users, self.spawn_rate

        if elapsed < ramp_down_end:
            # Linear ramp-down
            progress = (elapsed - hold_end) / self.ramp_down_time
            users = math.ceil((1 - progress) * self.peak_users)
            return max(users, 1), self.spawn_rate

        return None  # test finished


class SpikeTestShape(LoadTestShape):
    r"""Spike test shape: baseline → sudden spike → back to baseline → end.

    Timeline (default values)
    -------------------------
    Phase 1 — baseline :   0 s →  60 s  (10 users)
    Phase 2 — spike-up :  60 s →  70 s  (10 → 150 users in 10 s)
    Phase 3 — spike hold: 70 s → 130 s  (150 users for 60 s)
    Phase 4 — recovery : 130 s → 140 s  (150 → 10 users in 10 s)
    Phase 5 — baseline : 140 s → 200 s  (10 users, post-spike)

    Override class attributes to customise the shape:

    .. code-block:: python

        class MySpike(SpikeTestShape):
            baseline_users     = 20
            spike_users        = 300
            baseline_duration  = 120  # seconds of normal load before spike
            spike_ramp_time    = 15   # seconds to reach spike peak
            spike_hold_time    = 60   # seconds at spike peak
            recovery_time      = 15   # seconds to return to baseline
            post_spike_duration = 120 # seconds of normal load after spike
            spike_spawn_rate   = 50   # fast spawning during spike transition

    Usage
    -----
        locust -f locustfile.py --host=https://... --headless \\
            --shape SpikeTestShape FullJourneyUser
    """

    #: Steady-state user count before and after the spike.
    baseline_users: int = 10
    #: Peak user count during the spike.
    spike_users: int = 150
    #: Seconds of baseline load before the spike begins.
    baseline_duration: int = 60
    #: Seconds to ramp from baseline to spike peak.
    spike_ramp_time: int = 10
    #: Seconds to sustain the spike peak.
    spike_hold_time: int = 60
    #: Seconds to recover from spike back to baseline.
    recovery_time: int = 10
    #: Seconds of baseline load after the spike (cool-down).
    post_spike_duration: int = 60
    #: Spawn rate used during the rapid spike transition.
    spike_spawn_rate: int = 50
    #: Spawn rate used during baseline phases.
    baseline_spawn_rate: int = 2

    def tick(self):
        """Return (user_count, spawn_rate) for the current point in time.

        Returns ``None`` to stop the test once post-spike baseline ends.
        :return: Tuple of (target user count, spawn rate)
            or ``None`` to end test.
        :rtype: Optional[Tuple[int, int]]
        """
        elapsed = self.get_current_time()

        t1 = self.baseline_duration
        t2 = t1 + self.spike_ramp_time
        t3 = t2 + self.spike_hold_time
        t4 = t3 + self.recovery_time
        t5 = t4 + self.post_spike_duration

        if elapsed < t1:
            # Pre-spike baseline
            return self.baseline_users, self.baseline_spawn_rate

        if elapsed < t2:
            # Rapid ramp-up to spike
            progress = (elapsed - t1) / self.spike_ramp_time
            users = math.ceil(
                self.baseline_users +
                progress * (self.spike_users - self.baseline_users)
            )
            return users, self.spike_spawn_rate

        if elapsed < t3:
            # Spike hold
            return self.spike_users, self.spike_spawn_rate

        if elapsed < t4:
            # Rapid recovery back to baseline
            progress = (elapsed - t3) / self.recovery_time
            users = math.ceil(
                self.spike_users -
                progress * (self.spike_users - self.baseline_users)
            )
            return max(users, self.baseline_users), self.spike_spawn_rate

        if elapsed < t5:
            # Post-spike baseline (cool-down)
            return self.baseline_users, self.baseline_spawn_rate

        return None  # test finished
