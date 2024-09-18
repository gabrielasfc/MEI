from spade.agent import Agent
from behaviours.broker_behav import BrokerBehaviour

class BrokerAgent(Agent):
    async def setup(self):
        self.b = BrokerBehaviour()
        
        self.add_behaviour(self.b)