import {
	OrderSide,
	OrderType,
	TimeInForce,
	Market
} from '@dydxprotocol/v3-client';
import { PositionSide } from '@perp/sdk-curie';
import { gmxOrderType } from './services/gmx/constants';
import { OrderSide as v4OrderSide } from '@dydxprotocol/v4-client-js';

export type AlertObject = {
	exchange: string;
	strategy: string;
	market: string;
	size?: number;
	sizeUsd?: number;
	sizeByLeverage?: number;
	order: string;
	price: number;
	position: string;
	reverse: boolean;
	passphrase?: string;
	collateral?: string;
};

export type dydxOrderParams = {
	market: Market;
	side: OrderSide;
	type: OrderType.MARKET;
	timeInForce: TimeInForce.FOK;
	postOnly: false;
	size: string;
	price: string;
	limitFee: string;
	expiration: string;
};

export const enum dydxV4PositionSide {
    LONG = 'long',
    SHORT = 'short',
    FLAT = 'flat'
}

export type dydxV4OrderParams = {
	market: string;
	side: v4OrderSide;
	position: dydxV4PositionSide;
	size: number;
	price: number;
};

export type perpOrderParams = {
	tickerSymbol: string;
	side: PositionSide;
	amountInput: number;
	isAmountInputBase: boolean;
	referralCode: string;
};

export type gmxOrderParams = {
	marketAddress: string;
	isLong: boolean;
	sizeUsd: number;
	price: number;
	collateral?: string;
};

export type gmxOrderResult = {
	txHash: string;
	sizeUsd: number;
	isLong: boolean;
};

export type GmxPositionResponse = {
	orderType: gmxOrderType;
	hasLongPosition?: boolean;
	positionSizeUsd?: number;
	collateralAmount?: number;
};
