import { AlertObject, dydxV4OrderParams, dydxV4PositionSide } from '../../types';
import 'dotenv/config';
import { getStrategiesDB } from '../../helper';
import { OrderSide } from '@dydxprotocol/v4-client-js';
import { dydxV4GetAccount } from './getAccount';

export const dydxV4BuildOrderParams = async (alertMessage: AlertObject) => {
	const [db, rootData] = getStrategiesDB();

	const orderSide =
		alertMessage.order == 'buy' ? OrderSide.BUY : OrderSide.SELL;

	let positionSide = "";
	if (alertMessage.position == 'long') {
		positionSide = dydxV4PositionSide.LONG
	} else if (alertMessage.position == 'short') {
		positionSide = dydxV4PositionSide.SHORT
	} else {
		positionSide = dydxV4PositionSide.FLAT
	}

	const latestPrice = alertMessage.price;
	console.log('latestPrice', latestPrice);

	let orderSize: number;
	if (alertMessage.sizeByLeverage) {
		const { isReady, account } = await dydxV4GetAccount();

		orderSize =
			(account.equity * Number(alertMessage.sizeByLeverage)) / latestPrice;
	} else if (alertMessage.sizeUsd) {
		orderSize = Number(alertMessage.sizeUsd) / latestPrice;
	} else if (
		alertMessage.reverse &&
		rootData[alertMessage.strategy].isFirstOrder == 'false'
	) {
		orderSize = alertMessage.size * 2;
	} else {
		orderSize = alertMessage.size;
	}

	const market = alertMessage.market.replace(/_/g, '-');

	const orderParams: dydxV4OrderParams = {
		market,
		side: orderSide,
		position: positionSide as dydxV4PositionSide,
		size: Number(orderSize),
		price: Number(alertMessage.price)
	};
	console.log('orderParams for dydx', orderParams);
	return orderParams;
};
