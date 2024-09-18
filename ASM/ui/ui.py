import ttkbootstrap as ttk
from ttkbootstrap.tableview import Tableview
from ttkbootstrap.constants import *
from ttkbootstrap.toast import ToastNotification
from agents.manager import ManagerAgent
from agents.caller import CallerAgent

influencers = []
influencers_agents = {}

XMPP_SERVER = 'localhost'
PASSWORD = 'admin'

class PortfolioPage:   
    def __init__(self, manager):
        self.root = ttk.Window(themename="vapor")
        self.root.title("Settings")
        self.center_window(800, 600)
        self.current_page = 1
        self.rows_per_page = 10
        self.manager = manager
        self.wallet = self.manager.portfolio

        self.create_widgets()
    
    def create_widgets(self):
        # Label for the page title
        title_label = ttk.Label(self.root, text="Portfolio", font=('Lato', 30), bootstyle="light")
        title_label.pack(pady=10)
        
        frame = ttk.Frame(self.root, bootstyle="dark")
        frame.pack(padx=20, pady=20)
        
        total = ttk.Label(frame, text=f"Total: {self.wallet_value()}", bootstyle="light", font=('Lato', 18, 'bold'))
        total.pack(pady=5)
        
        coldata = [
            {"text": "Crypto", "stretch": False, "width": 170},
            {"text": "Quantity", "stretch": False, "width": 170},
            {"text": "Price", "stretch": False, "width": 170},
            {"text": "Value", "stretch": False, "width": 170},
            {"text": "Profit (%)", "stretch": False, "width": 170},
        ]   
        
        rowdata = []
        
        for asset in self.wallet.values():
            formatted_quantity = f"{asset.quantity:.2f}"
            formatted_current_price = f"{asset.current_price:.2f}"
            formatted_value = f"{asset.value:.2f}"
            formatted_profit = f"{asset.profit:.4f}"

            rowdata.append((asset.name, formatted_quantity, formatted_current_price, formatted_value, formatted_profit))
        
        dt = Tableview(
            master=self.root,
            coldata=coldata,
            rowdata=rowdata,
            paginated=True,
            searchable=True,
            bootstyle=PRIMARY,
            stripecolor=(None, None),
        )
        dt.pack(fill=BOTH, expand=YES, padx=10, pady=10)
        
        # Button to go back to the previous page
        return_button = ttk.Button(self.root, text="Back", command=self.return_to_main, bootstyle="light-outline")
        return_button.pack(pady=50)
    
    def wallet_value(self):
        total = self.manager.balance
        for asset in self.wallet.values():
            total += asset.value

        return round(total, 2)

    def return_to_main(self):
        from main import MainPage
        
        self.root.destroy()

        ttk.Style.instance = None
        MainPage(self.manager)

    def center_window(self, width, height):
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()

        x = (screen_width // 2) - (width // 2)
        y = (screen_height // 2) - (height // 2)

        self.root.geometry(f'{width}x{height}+{x}+{y}')


class SettingsPage:
    def __init__(self, manager):
        self.root = ttk.Window(themename="vapor")
        self.root.title("Settings")
        self.center_window(800, 600)
        self.manager = manager
        self.takeprofit = self.manager.takeprofit
        self.stoploss = self.manager.stoploss
        self.trade_balance = self.manager.trade_balance

        self.create_widgets()

    def create_widgets(self):
        # Label for the page title
        title_label = ttk.Label(self.root, text="Settings", font=('Lato', 30), bootstyle="light")
        title_label.pack(pady=10)
        
        frame = ttk.Frame(self.root)
        frame.pack(pady=20)

        # Takeprofit
        # Label for displaying current takeprofit value
        self.current_threshold_label = ttk.Label(frame, text=f"Takeprofit: {self.takeprofit}", bootstyle="light", font=('Lato', 18, 'bold'))
        self.current_threshold_label.grid(row=0, column=0, padx=(0, 5))

        # Text box for entering new threshold value
        self.takeprofit_entry = ttk.Entry(frame, width=15, style="primary.TEntry")
        self.takeprofit_entry.insert(0, self.takeprofit)  # Set initial value
        self.takeprofit_entry.grid(row=0, column=1, padx=(50,0))

        # Button to save new threshold value
        save_button = ttk.Button(frame, text="Change", command=self.save_takeprofit, bootstyle="light-outline")
        save_button.grid(row=0, column=2, padx=(15, 0))
        
        
        #Loss
        # Label for displaying current loss value
        self.current_loss_label = ttk.Label(frame, text=f"Stoploss: {self.stoploss}", bootstyle="light", font=('Lato', 18, 'bold'))
        self.current_loss_label.grid(row=1, column=0, padx=(0, 5), pady=(20,0))
        
        # Text box for entering new loss value
        self.stoploss_entry = ttk.Entry(frame, width=15, style="primary.TEntry")
        self.stoploss_entry.insert(0,self.stoploss)
        self.stoploss_entry.grid(row=1, column=1, padx=(50,0), pady=(20,0))
        
        # Button to save new loss value
        save_button_loss= ttk.Button(frame, text="Change", command=self.save_loss, bootstyle="light-outline")
        save_button_loss.grid(row=1, column=2, padx=(15, 0), pady=(20,0))


        # Trade Balance
        self.current_balance_label = ttk.Label(frame, text=f"Trade balance: {self.trade_balance}", bootstyle="light", font=('Lato', 18, 'bold'))
        self.current_balance_label.grid(row=2, column=0, padx=(0, 5), pady=(20,0))
        
        # Text box for entering new loss value
        self.balance_entry = ttk.Entry(frame, width=15, style="primary.TEntry")
        self.balance_entry.insert(0, self.trade_balance)
        self.balance_entry.grid(row=2, column=1, padx=(50,0), pady=(20,0))
        
        # Button to save new loss value
        save_button_balance= ttk.Button(frame, text="Change", command=self.save_balance, bootstyle="light-outline")
        save_button_balance.grid(row=2, column=2, padx=(15, 0), pady=(20,0))
        
        # Button to go back to the previous page
        return_button = ttk.Button(self.root, text="Back", command=self.return_to_main, bootstyle="light-outline")
        return_button.pack(pady=100)
        
    def save_takeprofit(self):
        takeprofit = float(self.takeprofit_entry.get())

        self.takeprofit = takeprofit
        self.current_threshold_label.config(text=f"Takeprofit: {self.takeprofit}")
        self.manager.takeprofit = self.takeprofit
        toast = ToastNotification(
            title="Settings",
            message="Takeprofit value successfully saved!",
            duration=3000,
            bootstyle="dark",
            position=(70,30,"ne")
        )
        toast.show_toast()

    
    def save_loss(self):
        loss_value = float(self.stoploss_entry.get())

        self.stoploss = loss_value
        self.current_loss_label.config(text=f"Stoploss: {self.stoploss}")
        self.manager.stoploss = self.stoploss
        toast = ToastNotification(
            title="Settings",
            message="Stoploss value successfully saved!",
            duration=3000,
            bootstyle="dark",
        )
        toast.show_toast()

    def save_balance(self):
        balance_value = float(self.balance_entry.get())

        self.trade_balance = balance_value
        self.current_balance_label.config(text=f"Trade balance: {self.trade_balance}")
        self.manager.trade_balance = self.trade_balance
        toast = ToastNotification(
            title="Settings",
            message="Trade balance value successfully saved!",
            duration=3000,
            bootstyle="dark",
        )
        toast.show_toast()
    
    def return_to_main(self):
        from main import MainPage
        
        self.root.destroy()

        ttk.Style.instance = None
        MainPage(self.manager)

    def center_window(self, width, height):
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()

        x = (screen_width // 2) - (width // 2)
        y = (screen_height // 2) - (height // 2)

        self.root.geometry(f'{width}x{height}+{x}+{y}')
    

class HistoryPage:
    def __init__(self, manager):
        self.root = ttk.Window(themename="vapor")
        self.root.title("History")
        self.center_window(800, 600)
        self.manager = manager
        self.history = self.manager.history
        self.current_page = 1
        self.rows_per_page = 10

        self.create_widgets()

    def create_widgets(self):
        title_label = ttk.Label(self.root, text="History", font=('Lato', 30), bootstyle="light")
        title_label.pack(pady=10)
        
        frame = ttk.Frame(self.root, bootstyle="dark")
        frame.pack(padx=20, pady=20)

        start_index = (self.current_page - 1) * self.rows_per_page
        end_index = min(start_index + self.rows_per_page, len(self.history))
        
        if len(self.history) == 0:
            label = ttk.Label(frame, text="No data available", bootstyle="light")
            label.pack(anchor="w", pady=5)

        else:
            for i in range(start_index, end_index):
                history = self.history[i]

                text = f"{history.timestamp} | {history.type} | Asset: {history.asset} | Quantity: {history.quantity:.4f} | Price: {history.price:.2f} | Balance: {history.balance:.2f}"
                label = ttk.Label(frame, text=text, bootstyle="light")
                label.pack(anchor="w",padx=(30,0),pady=5)

            if len(self.history) > self.rows_per_page:
                pagination_frame = ttk.Frame(self.root)  # Frame para os botões de paginação com estilo padrão
                pagination_frame.pack()
                self.create_pagination_controls(pagination_frame)
        
        # Button to go back to the previous page
        return_button = ttk.Button(self.root, text="Back", command=self.return_to_main, bootstyle="light-outline")
        return_button.pack()
    
    def create_pagination_controls(self, frame):
        # Calcular o número total de páginas
        total_pages = (len(self.history) + self.rows_per_page - 1) // self.rows_per_page

        # Botão "Página Anterior"
        prev_button = ttk.Button(frame, text="Página Anterior", command=self.prev_page, bootstyle="light-outline")
        prev_button.pack(side="left", padx=5, pady=15)

        # Label para exibir a página atual e o número total de páginas
        page_label = ttk.Label(frame, text=f"Página {self.current_page}/{total_pages}", bootstyle="light")
        page_label.pack(side="left", padx=5)

        # Botão "Próxima Página"
        next_button = ttk.Button(frame, text="Próxima Página", command=self.next_page, bootstyle="light-outline")
        next_button.pack(side="left", padx=5)

    def prev_page(self):
        if self.current_page > 1:
            self.current_page -= 1
            self.refresh_page()

    def next_page(self):
        total_pages = (len(self.history) + self.rows_per_page - 1) // self.rows_per_page
        if self.current_page < total_pages:
            self.current_page += 1
            self.refresh_page()

    def refresh_page(self):
        for widget in self.root.winfo_children():
            widget.destroy()

        self.create_widgets()
    
    def return_to_main(self):
        from main import MainPage
        
        self.root.destroy()

        ttk.Style.instance = None
        MainPage(self.manager)

    def center_window(self, width, height):
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()

        x = (screen_width // 2) - (width // 2)
        y = (screen_height // 2) - (height // 2)

        self.root.geometry(f'{width}x{height}+{x}+{y}')


class InfluencersPage:
    def __init__(self, manager):
        self.root = ttk.Window(themename="vapor")
        self.root.title("Influencers")
        self.center_window(800, 600)
        self.manager = manager

        self.create_widgets()

    def create_widgets(self):
        # Label for the page title
        title_label = ttk.Label(self.root, text="Influencers", font=('Lato', 18), bootstyle="light")
        title_label.pack(pady=10)
        
        # Frame for adding an influencer
        add_frame = ttk.Frame(self.root)
        add_frame.pack(fill='x', padx=10, pady=5)

        # Text box to enter the influencer name
        self.influencer_entry = ttk.Entry(add_frame, width=50)
        self.influencer_entry.pack(side='left', padx=(15, 5))  # Add padding to the right side of the entry widget

        # Button to add the influencer
        add_button = ttk.Button(add_frame, width=10, text="Add", command=self.add_influencer, bootstyle="light-outline")
        add_button.pack(side='left', padx=(15, 0))  # Add padding to the left side of the button

        # Frame to contain the list of influencers
        self.influencers_frame = ttk.Frame(self.root, bootstyle="dark")
        self.influencers_frame.pack(expand=True, fill='both', pady=10)

        # List of influencers
        self.influencer_widgets = []
        for influencer in influencers:
            influencer_frame = ttk.Frame(self.influencers_frame)
            influencer_frame.pack(fill='x', padx=10, pady=5)

            influencer_label = ttk.Label(influencer_frame, font=('Lato', 12, 'bold'),text=influencer, bootstyle="light")
            influencer_label.pack(side='left')

            remove_button = ttk.Button(influencer_frame, text="Remove", command=lambda i=influencer: self.remove_influencer(i), bootstyle="light-outline")
            remove_button.pack(side='right')

            self.influencer_widgets.append((influencer_frame, influencer_label, remove_button))

        # Button to go back to the previous page
        return_button = ttk.Button(self.root, text="Back", command=self.return_to_main, bootstyle="light-outline")
        return_button.pack(pady=10)
        

    def add_influencer(self):
        influencer_name = self.influencer_entry.get() 
        if influencer_name:
            influencers.append(influencer_name) 
            
            caller = CallerAgent(f"{influencer_name}@{XMPP_SERVER}", PASSWORD)
            caller.user = influencer_name

            caller.start(auto_register=True)

            influencers_agents[influencer_name] = caller

            self.update_widgets()
        else:
            print("Please enter a valid influencer name.")

    def remove_influencer(self, influencer):
        influencers.remove(influencer)
        influencers_agents[influencer].stop()
        del influencers_agents[influencer]
        
        self.update_widgets()

    def update_widgets(self):
        # Clear the influencers frame
        for widget_tuple in self.influencer_widgets:
            widget_tuple[0].destroy()

        # Recreate the widgets for each updated influencer
        self.influencer_widgets.clear()
        for influencer in influencers:
            influencer_frame = ttk.Frame(self.influencers_frame)
            influencer_frame.pack(fill='x', padx=10, pady=5)

            influencer_label = ttk.Label(influencer_frame, font=('Lato', 12, 'bold'),text=influencer, bootstyle="light")
            influencer_label.pack(side='left')

            remove_button = ttk.Button(influencer_frame, text="Remove", command=lambda i=influencer: self.remove_influencer(i), bootstyle="light-outline")
            remove_button.pack(side='right')

            self.influencer_widgets.append((influencer_frame, influencer_label, remove_button))
    
    def return_to_main(self):
        # Import MainPage class here to avoid circular import
        from main import MainPage
        
        # Destroy current page
        self.root.destroy()

        # Create and display Main page
        ttk.Style.instance = None
        MainPage(self.manager)

    def center_window(self, width, height):
        # Obter as dimensões da tela do sistema
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()

        # Calcular a posição x, y para centralizar a janela
        x = (screen_width // 2) - (width // 2)
        y = (screen_height // 2) - (height // 2)

        # Definir a geometria da janela centralizada
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        

class MainPage:
    def __init__(self, manager: ManagerAgent):
        self.root = ttk.Window(themename="vapor")
        self.root.title("Portfolio Manager")
        self.center_window(800, 600)
        self.manager  = manager
        
        self.create_widgets()

    def create_widgets(self):
        # Logo
        # Label para exibir o texto "Portfolio Manager"
        label = ttk.Label(self.root, text="Portfolio Manager", font=('Lato', 42), bootstyle="light")
        label.pack(pady=(130,0))
        
        # Influencer
        influencers_button = ttk.Button(bootstyle="light-outline", text="Influencers", width=30,command=self.open_influencers_page)
        influencers_button.pack(pady=(50,0))

        # Portfolio
        portfolio_button = ttk.Button(bootstyle="light-outline", text="Portfolio", width=30,command=self.open_portfolio_page)
        portfolio_button.pack(pady=(15,0))
        
        # History
        history_button = ttk.Button(bootstyle="light-outline", text="History", width=30,command=self.open_history_page)
        history_button.pack(pady=(15,0))
        
        # Settings
        settings_button = ttk.Button(bootstyle="light-outline", text="Settings", width=30,command=self.open_settings_page)
        settings_button.pack(pady=(15,0))
        

    def open_influencers_page(self):
        self.root.destroy()  # Close current window
        ttk.Style.instance = None
        InfluencersPage(self.manager)

    def open_history_page(self):
        self.root.destroy()  # Close current window
        ttk.Style.instance = None
        HistoryPage(self.manager)

    def open_settings_page(self):
        self.root.destroy()  # Close current window
        ttk.Style.instance = None
        SettingsPage(self.manager)
    
    def open_portfolio_page(self):
        self.root.destroy()
        ttk.Style.instance = None
        PortfolioPage(self.manager)

    def center_window(self, width, height):
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()

        x = (screen_width // 2) - (width // 2)
        y = (screen_height // 2) - (height // 2)

        self.root.geometry(f'{width}x{height}+{x}+{y}')
    