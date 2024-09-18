from spade.agent import Agent
from behaviours.map_behav import MapBehaviour

class MapperAgent(Agent):
    async def setup(self):
        self.b = MapBehaviour()
        
        self.add_behaviour(self.b)