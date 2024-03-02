import {
	OrderExecution,
	OrderSide,
	OrderTimeInForce,
	OrderType,
	PositionStatus
} from '@dydxprotocol/v4-client-js';
import { dydxV4OrderParams, dydxV4PositionSide } from '../../types';
import { dydxV4Client } from './client';
import { _sleep } from '../../helper';

const pyramidingMax = 3;

export const dydxV4CreateOrder = async (orderParams: dydxV4OrderParams) => {
	const { client, subaccount } = await dydxV4Client();
	const market = orderParams.market;
	const positionSide = orderParams.position;
	let side = orderParams.side;
	let size = orderParams.size;

	// obtain current/open position for the given market, if it exists
	const subPerpPositions = await client.indexerClient.account.getSubaccountPerpetualPositions("", 0, PositionStatus.OPEN)
	const positions = subPerpPositions.positions;
	const currPosition = positions.find(p => p.market == market);
    console.log("currPosition", {currPosition});

    // if the incoming order is 'flat', then the strategy is indicating that we should not have any positions open for this market
    if (positionSide === dydxV4PositionSide.FLAT) {
        // if there is an active position for this market, then configure this order to negate it (close it)
        // else return early which will result in no order placed
        if (currPosition) {
            console.log(`strategy side is ${positionSide} but currPosition exists with side ${currPosition.side} so will close currPosition`);
            side = currPosition.side.toLowerCase() === dydxV4PositionSide.LONG.toLowerCase() ? OrderSide.SELL : OrderSide.BUY;
            size = Math.abs(Number(currPosition.size));
            //orderParams.reduceOnly = true; TEMPORARILY DISABLED
        } else {
            console.log(`strategy side is ${positionSide} and no existing position so will not place any order`);
            return;
        }
    } else {
		if (currPosition) {
			if (currPosition.side.toLowerCase() !== positionSide.toLowerCase()) {
				// If the Side has changed we must reverse the current position
				console.log(`strategy side has changed from ${currPosition.side.toLowerCase()} to ${positionSide.toLowerCase()} so position will be reversed`);
				size += Math.abs(Number(currPosition.size));
			} else {
				// Else (the Side has NOT changed) we must enforce max pyramiding level
				if (currPosition.size >= size*pyramidingMax) {
					console.log(`currPosition size (${currPosition.size}) indicates that we have reached our pyramiding max (${pyramidingMax}) so will not place any order`);
					return;
				}
			}
		}
	}

	const clientId = generateRandomInt32();
	const type = OrderType.MARKET;
	const timeInForce = OrderTimeInForce.GTT;
	const execution = OrderExecution.DEFAULT;
	const slippagePercentage = 0.05;
	const price =
		side == OrderSide.BUY
			? orderParams.price * (1 + slippagePercentage)
			: orderParams.price * (1 - slippagePercentage);
	const postOnly = false;
	const reduceOnly = false;
	const triggerPrice = null;
	let count = 0;
	const maxTries = 5;
	while (count <= maxTries) {
		try {
			const tx = await client.placeOrder(
				subaccount,
				market,
				type,
				side,
				price,
				size,
				clientId,
				timeInForce,
				60000, // 1 minute
				execution,
				postOnly,
				reduceOnly,
				triggerPrice
			);
			console.log('Transaction Result: ', tx);
			return {
				side: orderParams.side,
				size: orderParams.size,
				price: orderParams.price,
				market: orderParams.market,
				clientId: clientId
			};
		} catch (error) {
			console.error(error);
			count++;

			await _sleep(5000);
		}
	}
};

function generateRandomInt32(): number {
	const maxInt32 = 2147483647;
	return Math.floor(Math.random() * (maxInt32 + 1));
}
