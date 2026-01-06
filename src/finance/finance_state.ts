import config from "../config";
import { execAsync } from "ags/process";
import { createPollState } from "../utils/gnim";
import { Accessor, createRoot, createState } from "gnim";

export enum StockHistoryPeriod {
    Period1D = "1d",
    Period5D = "5d",
    Period1M = "1mo",
    Period3M = "3mo",
    Period6M = "6mo",
    Period1Y = "1y",
    Period2Y = "2y",
    Period5Y = "5y",
    Period10Y = "10y",
    PeriodYTD = "ytd",
    PeriodMax = "max",
}

export type StockMovement = {
    ticker: string;
    name: string;
    price: number;
    change_amount: number;
    change_percent: number;
    volume: number;
};

export type TopStockMovements = {
    favorites: StockMovement[];
    topGainers: StockMovement[];
    topLosers: StockMovement[];
    mostActive: StockMovement[];
};

export type FinanceState = {
    stockHistory: Accessor<number[] | null>;
    selectedTicker: Accessor<string | null>;
    selectedPeriod: Accessor<StockHistoryPeriod>;
    topStockMovements: Accessor<TopStockMovements>;
    refreshStocks: () => void;
    refreshStockHistory: () => void;
    selectTicker: (ticker: string | null) => void;
    selectPeriod: (period: StockHistoryPeriod) => void;
};

let financeStateInstance: FinanceState | null = null;

function createFinanceState(): FinanceState {
    const [stockHistory, setStockHistory] = createState<number[] | null>(null);
    const [selectedTicker, setSelectedTicker] = createState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = createState(StockHistoryPeriod.Period1D);

    const [topStockMovements, setTopStockMovements] = createPollState(
        {
            favorites: [],
            topGainers: [],
            topLosers: [],
            mostActive: [],
        },
        600_000,
        getLatestTopStockMovements
    );

    function refreshStockHistory() {
        setStockHistory(null);
        const ticker = selectedTicker.peek();
        execAsync(`${config.path.python} ${SRC}/scripts/stocks.py history ${ticker} ${selectedPeriod.peek()}`).then(
            (raw) => {
                if (selectedTicker.peek() === ticker) {
                    setStockHistory(JSON.parse(raw).map((d: { Close: number }) => d.Close));
                }
            }
        );
    }

    function selectTicker(ticker: string | null) {
        if (selectedTicker.peek() === ticker) return;
        setSelectedTicker(ticker);
        refreshStockHistory();
    }

    function selectPeriod(period: StockHistoryPeriod) {
        if (selectedPeriod.peek() === period) return;
        setSelectedPeriod(period);
        refreshStockHistory();
    }

    async function getLatestTopStockMovements() {
        try {
            const favorites = execAsync(
                `${config.path.python} ${SRC}/scripts/stocks.py list ${config.finance.favorite_stocks.join(" ")}`
            );
            const gainers = execAsync(`${config.path.python} ${SRC}/scripts/stocks.py day_gainers`);
            const losers = execAsync(`${config.path.python} ${SRC}/scripts/stocks.py day_losers`);
            const mostActive = execAsync(`${config.path.python} ${SRC}/scripts/stocks.py most_actives`);

            const movements = {
                favorites: JSON.parse(await favorites),
                topGainers: JSON.parse(await gainers),
                topLosers: JSON.parse(await losers),
                mostActive: JSON.parse(await mostActive),
            } as TopStockMovements;

            if (selectedTicker.peek() === null) {
                selectTicker(movements.mostActive[0].ticker ?? null);
            }

            return movements;
        } catch (e) {
            printerr("Couldn't fetch stock data", e);
            return {
                favorites: [],
                topGainers: [],
                topLosers: [],
                mostActive: [],
            };
        }
    }

    function refreshStocks() {
        getLatestTopStockMovements().then(setTopStockMovements);
        refreshStockHistory();
    }

    financeStateInstance = {
        stockHistory,
        selectedTicker,
        selectedPeriod,
        topStockMovements,
        refreshStocks,
        refreshStockHistory,
        selectTicker,
        selectPeriod,
    };

    return financeStateInstance;
}

export function financeState() {
    return financeStateInstance ?? createRoot(createFinanceState);
}
