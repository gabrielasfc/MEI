from spade.agent import Agent
from behaviours.caller_behav import CallerBehaviour

class CallerAgent(Agent):
    user = ""
    last_tweet = {}
    first_time = True

    async def setup(self):
        self.b = CallerBehaviour(period=20)
        
        self.add_behaviour(self.b)