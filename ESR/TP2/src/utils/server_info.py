from math import inf
from datetime import datetime

class ServerInfo:
    def __init__(self):
        self.metric = inf
        self.delay = None
        self.sent = 0
        self.received = 0
        self.contents = list()
        self.status = False

    def __str__(self):
        return f"Metric: {self.metric} | Delay: {self.delay} | Sent: {self.sent} | Received: {self.received}| Contents: {self.contents} | Active: {self.status}"

    def __repr__(self):
        return f"Metric: {self.metric} | Delay: {self.delay} | Sent: {self.sent} | Received: {self.received}| Contents: {self.contents} | Active: {self.status}"


    def update_metrics(self, status, maxdelay, initial_timestamp=None, final_timestamp=None, contents=None):
        if status:
            diff = final_timestamp - initial_timestamp
            self.delay = diff.total_seconds()*1000
            self.sent += 1
            self.received += 1
            self.metric = 0.7*(self.delay/maxdelay) + 0.3*(1 - self.received/self.sent)
            self.contents = contents
        else:
            self.delay = inf
            self.sent += 1
            self.metric = 0.7*(self.delay/maxdelay) + 0.3*(1 - self.received/self.sent)
            