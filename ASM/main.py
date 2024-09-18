from agents.manager import ManagerAgent
from agents.collector import CollectorAgent
from agents.mapper import MapperAgent
from agents.caller import CallerAgent
from agents.manager import ManagerAgent
from agents.broker import BrokerAgent
from spade import quit_spade
from utils.env import XMPP_SERVER, PASSWORD
from ui.ui import MainPage
import time


if __name__ == "__main__":
    mapper = MapperAgent(f"mapper@{XMPP_SERVER}", PASSWORD)
    broker = BrokerAgent(f"broker@{XMPP_SERVER}", PASSWORD)
    manager = ManagerAgent(f"manager@{XMPP_SERVER}", PASSWORD)

    res_manager = manager.start(auto_register=True)
    res_manager.result()

    time.sleep(1)

    res_mapper = mapper.start(auto_register=True)
    res_mapper.result()

    time.sleep(1)

    res_broker = broker.start(auto_register=True)
    res_broker.result()

    time.sleep(1)

    app = MainPage(manager)
    app.root.mainloop()

    # Handle interruption of all agents
    while manager.is_alive():
        try:
            time.sleep(1)
        except KeyboardInterrupt:
            # stop all agents
            manager.stop()
            broker.stop()
            mapper.stop()

            break

    print("Agents finished")

    quit_spade()
    