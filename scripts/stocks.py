import sys
import json
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor

action = sys.argv[1]

if action == "list":
    quotes = []

    def get_stats(ticker):
        quote = yf.Tickers(ticker).tickers[ticker].info
        dict = {}
        dict["ticker"] = quote["symbol"]
        dict["name"] = quote.get("longName", quote.get("shortName", quote["symbol"]))
        dict["price"] = quote["regularMarketPrice"]
        dict["change_amount"] = quote["regularMarketChange"]
        dict["change_percent"] = quote["regularMarketChangePercent"]
        dict["volume"] = quote["regularMarketVolume"]
        quotes.append(dict)

    ticker_list = sys.argv[2:]

    with ThreadPoolExecutor() as executor:
        executor.map(get_stats, ticker_list)

    quotes.sort(key=lambda q: -q["change_percent"])

    print(json.dumps(quotes))
    exit(0)

if action == "day_gainers" or action == "day_losers" or action == "most_actives":
    screen = yf.screen(action)

    quotes = []

    for quote in screen["quotes"]:
        dict = {}
        dict["ticker"] = quote["symbol"]
        dict["name"] = quote.get("longName", quote.get("shortName", quote["symbol"]))
        dict["price"] = quote["regularMarketPrice"]
        dict["change_amount"] = quote["regularMarketChange"]
        dict["change_percent"] = quote["regularMarketChangePercent"]
        dict["volume"] = quote["regularMarketVolume"]
        quotes.append(dict)

    print(json.dumps(quotes))
    exit(0)

if action == "history":
    ticker = sys.argv[2]
    period = sys.argv[3]
    interval = "1d"
    if period == "1d":
        interval = "1m"
    elif period == "5d":
        interval = "5m"
    elif period == "1mo":
        interval = "30m"
    elif period == "3mo":
        interval = "1h"
    history = yf.Ticker(ticker).history(period=period, interval=interval)
    print(history.to_json(orient="records"))
    exit(0)
