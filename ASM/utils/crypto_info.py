import requests
from utils.env import API_KEY


def get_cryptos_by_ticker(ticker):
    matching_coins = []

    url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/map"

    parameters = {
        'symbol': ticker.upper()
    }

    headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': API_KEY
    }

    response = requests.get(url, params=parameters, headers=headers)

    if response.status_code == 200:
        data = response.json()

        if data['status']['error_code'] == 0 and data['data']:
            for coin in data['data']:
                matching_coins.append(coin['id'])
    
    return matching_coins


def get_coinid(ticker):
    coinid = 0

    matching_coins = get_cryptos_by_ticker(ticker)

    print(matching_coins)

    if len(matching_coins) == 0:
        return None

    url = f"https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
    
    parameters = {
        'id': ','.join(str(coinid) for coinid in matching_coins)
    }

    headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': API_KEY
    }

    response = requests.get(url, params=parameters, headers=headers)

    if response.status_code == 200:
        data = response.json()

        if data['status']['error_code'] == 0 and data['data']:
            volumes = {matching_id: data['data'][str(matching_id)]['quote']['USD']['volume_24h'] for matching_id in matching_coins}
            coinid = max(volumes, key=volumes.get)
        
    return coinid, data['data'][str(coinid)]['name']


def get_market_data(coinid):
    url = f"https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"

    parameters = {
        'id': coinid,
        'convert': 'USD',
        'aux': 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply,market_cap_by_total_supply,volume_24h_reported,volume_7d,volume_7d_reported,volume_30d,volume_30d_reported,is_active,is_fiat'
    }

    headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': API_KEY
    }

    response = requests.get(url, params=parameters, headers=headers)
    
    if response.status_code == 200:
        data = response.json()

        if data['status']['error_code'] == 0 and data['data']:
            return data['data'][str(coinid)]

        else:
            return "No data available for this cryptocurrency."
    
    else:
        return "Failed to retrieve data, status code: {}".format(response.status_code)
