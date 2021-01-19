/**
 * External dependencies
 */
import { isFunction, zip } from 'lodash';

/**
 * Internal dependencies
 */
import defaultProcessor from './default-processor';

/**
 * Creates a batch, which can be used to combine multiple API requests into one
 * API request using the WordPress batch processing API (/v1/batch).
 *
 * ```
 * const batch = createBatch();
 * const dunePromise = batch.add( {
 *   path: '/v1/books',
 *   method: 'POST',
 *   data: { title: 'Dune' }
 * } );
 * const lotrPromise = batch.add( {
 *   path: '/v1/books',
 *   method: 'POST',
 *   data: { title: 'Lord of the Rings' }
 * } );
 * const isSuccess = await batch.run(); // Sends one POST to /v1/batch.
 * if ( isSuccess ) {
 *   console.log(
 *     'Saved two books:',
 *     await dunePromise,
 *     await lotrPromise
 *   );
 * }
 * ```
 *
 * @param {Function} [processor] Processor function. Can be used to replace the
 *                               default functionality which is to send an API
 *                               request to /v1/batch. Is given an aray of
 *                               inputs and must return a promise that
 *                               resolves to an array of objects containing
 *                               either `output` or `error`.
 */
export default function createBatch( processor = defaultProcessor ) {
	const queue = [];

	let expectedSize = 0,
		actualSize = 0,
		onFull = () => {};

	return {
		/**
		 * Adds an input to the batch and returns a promise that is resolved or
		 * rejected when the input is processed by `batch.run()`.
		 *
		 * You may also pass a thunk which allows inputs to be added
		 * asychronously.
		 *
		 * ```
		 * // Both are allowed:
		 * batch.add( { path: '/v1/books', ... } );
		 * batch.add( ( add ) => add( { path: '/v1/books', ... } ) );
		 * ```
		 *
		 * @param {any|Function} inputOrThunk Input to add or thunk to execute.
		 
		 * @return {Promise|any} If given an input, returns a promise that
		 *                       is resolved or rejected when the batch is
		 *                       processed. If given a thunk, returns the return
		 *                       value of that thunk.
		 */
		add( inputOrThunk ) {
			++expectedSize;

			const add = ( input ) =>
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
				return inputOrThunk( add );
			}

			return add( inputOrThunk );
		},

		/**
		 * Runs the batch. This calls `batchProcessor` and resolves or rejects
		 * all promises returned by `add()`.
		 *
		 * @return {Promise} A promise that resolves to a boolean which is true
		 *                   if all resolutions were succesful.
		 */
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
