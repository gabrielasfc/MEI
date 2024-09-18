from spade.agent import Agent
from behaviours.collect_behav import CollectBehaviour

class CollectorAgent(Agent):
    crypto = None

    async def setup(self):
        self.b = CollectBehaviour(period=60)

        self.add_behaviour(self.b)