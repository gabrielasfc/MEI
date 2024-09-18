class Asset:
    def __init__(self, coinid, name):
        self.coinid = coinid
        self.name = name
        self.quantity = None
        self.initial_price = None
        self.current_price = None
        self.value = None
        self.profit = 0

    def set_info(self, initial_price, quantity):
        self.quantity = quantity
        self.initial_price = initial_price
        self.current_price = initial_price
        self.value = quantity * initial_price

    def update(self, new_price):
        new_value = self.quantity * new_price
        
        self.current_price = new_price
        self.profit = ((new_value - self.value) / self.value ) * 100
        self.value = new_value
        
    def __str__(self):
        return f"Asset({self.coinid}, {self.name}, Quantity: {self.quantity}, Initial Price: {self.initial_price}, Current Price: {self.current_price}, Value: {self.value}, Profit: {self.profit})"

    def __repr__(self):
        return f"Asset(coinid={self.coinid}, name={self.name}, quantity={self.quantity}, initial_price={self.initial_price}, current_price={self.current_price}, value={self.value}, profit={self.profit})"


