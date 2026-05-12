import { AppDispatch, RootState } from "../../../store";
import { SEP1, SEP2 } from "../constants";
import { calcChangePercent, calcEquilibriumChangePercent, Price, PriceMap, update } from "../../../screens/Markets/modules/prices";

const SymbolDecode = (strX: string) => {
    const symbolMap: { [key: string]: string } = {
        "0": "FX'EURUSD",
        "1": "FX'EURTRY",
        "2": "FX'USDTRY",
        "3": "FX'TRYJPY",
        "4": "FX'EURJPY",
        "5": "FX'EURCAD",
        "6": "FX'EURGBP",
        "7": "FX'EURCHF",
        "8": "FX'GBPUSD",
        "9": "FX'GBPJPY",
        "10": "FX'GBPEUR",
        "11": "FX'USDJPY",
        "12": "EUREX'DAX-A",
        "13": "CBOTM'YM-A",
        "14": "CMEM'NQ-A",
        "15": "CMEM'ES-A",
        "16": "VIP'VIP-X030",
        "17": "VIP'VIP-USD",
        "18": "VIP'VIP-EUR",
        "19": "VIP'VIP-GLD",
        "20": "IMKBH'GARAN",
        "21": "IMKBH'HALKB",
        "22": "IMKBH'ISCTR",
        "23": "IMKBH'VAKBN",
        "24": "IMKBH'THYAO",
        "25": "IMKBH'EREGL",
        "26": "IMKBH'AKBNK",
        "27": "IMKBH'YKBNK",
        "28": "IMKBH'KRDMD",
        "29": "IMKBH'TCELL",
        "30": "IMKBH'ENKAI",
        "31": "IMKBH'BIMAS",
        "32": "IMKBH'SAHOL",
        "33": "IMKBH'PETKM",
        "34": "IMKBH'OTKAR",
        "35": "IMKBH'ASYAB",
        "36": "IMKBH'PGSUS",
        "37": "IMKBH'MGROS",
        "38": "IMKBH'ARCLK",
        "39": "IMKBH'KOZAA",
        "40": "IMKBH'TTKOM",
        "41": "IMKBH'EKGYO",
        "42": "IMKBH'ASELS",
        "43": "IMKBH'ULKER",
        "44": "IMKBH'KCHOL",
        "45": "IMKBH'TAVHL",
        "46": "IMKBH'FENER",
        "47": "IMKBH'NTTUR",
        "48": "IMKBH'NTHOL",
        "49": "IMKBH'TUPRS",
        "50": "IMKBH'BIZIM",
        "51": "KIYM'XGLD",
        "52": "DFN'GLDUSD",
        "53": "INTUSD'DLRBNK",
        "54": "BNKGS'ASYAEUR",
        "55": "BNKGS'ASYAUSD",
        "56": "BNKGS'HALKUSD",
        "57": "BNKGS'HALKEUR",
        "58": "BNKGS'ISBNKUSD",
        "59": "BNKGS'ISBNKEUR",
        "60": "BNKGS'SKBNEUR",
        "61": "BNKGS'SKBNUSD",
        "62": "BNKGS'VAKIFEUR",
        "63": "BNKGS'VAKIFUSD",
        "64": "BNKGS'DNZEUR",
        "65": "BNKGS'DNZUSD",
        "66": "BNKGS'AKBEUR",
        "67": "BNKGS'AKBUSD",
        "68": "BNKGS'GRNUSD",
        "69": "BNKGS'GRNEUR",
        "70": "BNKGS'YKBUSD",
        "71": "BNKGS'YKBEUR",
    };

    const str = symbolMap[strX];
    if (str) {
        const symbolnamearray = str.split("'");
        return symbolnamearray[1];
    }
    return strX;
};


const keyTransforms: { [key: string]: string } = {
    "0": "lastPrice",
    P: "dayClose",
    "2": "bid",
    "3": "ask",
};

export const realTimeUpdate = async (
    store: { dispatch: AppDispatch; getState: () => RootState },
    message: string
) => {

    //console.log("sadadASD=>=> ", message);

    let updateMap: PriceMap = {};
    // Store snapshot'unu tek seferde al — döngü içinde her sembol için tekrar
    // store.getState() çağırmak gereksiz maliyet (tick frekansı yüksek).
    const state = store.getState();
    const licences = state.auth.user?.licences || [];
    const symbols = state.symbols;
    const prices = state.prices;

    message.split(SEP1).slice(1).forEach((update) => {
        const parts = update.split(SEP2);
        const code = SymbolDecode(parts[0]);
        if (!prices[code] || !symbols[code]) {
            return;
        }

        const { prefix } = symbols[code];
        const hasWavgLicence =
            prefix === "IMKBX" ?
                licences.includes("IMKBX") ||
                (["XU030", "XU100"].includes(code) && licences.includes("COMEX")) :
                prefix === "IMKBH" ?
                    licences.includes("IMKBL1P") || licences.includes("IMKBL2") :
                    licences.includes("VIPL1P") || licences.includes("VIPL2");

        const price: Price = { ...prices[code] };
        let equilibriumChanged = false;

        parts.slice(1).forEach((part) => {
            const key = part[0];
            const val = parseFloat(part.slice(1));

            if (!hasWavgLicence && ["K", "M", "T", "U", "D", "F", "H"].includes(key)) {
                return;
            }

            if (!isNaN(val)) {
                price[keyTransforms[key] || key] = val;
            }

            if (key === "K") {
                equilibriumChanged = true;
            }
        });

        if (equilibriumChanged) {
            price["equilibriumChangePercent"] = calcEquilibriumChangePercent(price);
        }
        price.changePercent = calcChangePercent(price);
        price.updatedAt = new Date().getTime();

        // if (code === "ETILRR") {
        //     console.log("ETILRR =>>=> ", price, code);
        // }

        updateMap[code] = price;
    });

    if (Object.keys(updateMap).length > 0) {
        store.dispatch(update(updateMap));
    }
};

