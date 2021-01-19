/**
 * External dependencies
 */
import { isFunction, zip } from 'lodash';

/**
 * Internal dependencies
 */
import defaultProcessor from './default-processor';

export default function createBatch( processor = defaultProcessor ) {
	const queue = [];

	let expectedSize = 0,
		actualSize = 0,
		onFull = () => {};

	return {
		add( inputOrThunk ) {
			++expectedSize;

			const doAdd = ( input ) =>
				new Promise( ( resolve, reject ) => {
					queue.push( {
						input,
						resolve,
						reject,
					} );

					if ( ++actualSize === expectedSize ) {
						onFull();
					}
				} );

			if ( isFunction( inputOrThunk ) ) {
				return inputOrThunk( doAdd );
			}

			return doAdd( inputOrThunk );
		},

		async run() {
			if ( actualSize !== expectedSize ) {
				await new Promise( ( resolve ) => {
					onFull = resolve;
				} );
			}

			let results;

			try {
				results = await processor(
					queue.map( ( { input } ) => input )
				);

				if ( results.length !== queue.length ) {
					throw new Error(
						'run: Array returned by processor must be same size as input array.'
					);
				}
			} catch ( error ) {
				for ( const { reject } of queue ) {
					reject( error );
				}

				throw error;
			}

			let isSuccess = true;

			for ( const [ result, { resolve, reject } ] of zip(
				results,
				queue
			) ) {
				if ( result?.error ) {
					reject( result.error );
					isSuccess = false;
				} else {
					resolve( result?.output ?? result );
				}
			}

			return isSuccess;
		},
	};
}
