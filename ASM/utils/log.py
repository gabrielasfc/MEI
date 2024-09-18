import datetime

class Log:
    @staticmethod
    def log(agent, message, level='INFO'):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")

        print(f"{timestamp} | {level} | {agent} : {message}")

