/**
 * Internal dependencies
 */
import createBatch from '../create-batch';

describe( 'createBatch', () => {
	test( 'running an empty batch', async () => {
		const processor = async ( inputs ) => inputs;
		const batch = createBatch( processor );
		expect( await batch.run() ).toBe( true );
	} );

	test( 'running resolves promises when processor returns output', async () => {
		const processor = async ( inputs ) =>
			inputs.map( ( input ) => ( {
				output: input,
			} ) );
		const batch = createBatch( processor );
		const promise1 = batch.add( 1 );
		const promise2 = batch.add( 2 );
		expect( await batch.run() ).toBe( true );
		expect( await promise1 ).toBe( 1 );
		expect( await promise2 ).toBe( 2 );
	} );

	test( 'running resolves promises when processor returns non-objects', async () => {
		const processor = async ( inputs ) => inputs.map( ( input ) => input );
		const batch = createBatch( processor );
		const promise1 = batch.add( 1 );
		const promise2 = batch.add( 2 );
		expect( await batch.run() ).toBe( true );
		expect( await promise1 ).toBe( 1 );
		expect( await promise2 ).toBe( 2 );
	} );

	test( 'running waits for all thunks to finish', async () => {
		const processor = async ( inputs ) =>
			inputs.map( ( input ) => ( {
				output: input,
			} ) );
		const batch = createBatch( processor );
		const promise1 = batch.add( async ( add ) => {
			await Promise.resolve(); // Simulates a delay.
			return add( 1 );
		} );
		const promise2 = batch.add( async ( add ) => {
			await Promise.resolve(); // Simulates a delay.
			return add( 2 );
		} );
		expect( await batch.run() ).toBe( true );
		expect( await promise1 ).toBe( 1 );
		expect( await promise2 ).toBe( 2 );
	} );

	test( 'running rejects promises when processor returns errors', async () => {
		const processor = async ( inputs ) =>
			inputs.map( ( input ) => ( {
				error: input,
			} ) );
		const batch = createBatch( processor );
		const promise1 = batch.add( 1 );
		const promise2 = batch.add( 2 );
		expect( await batch.run() ).toBe( false );
		await expect( promise1 ).rejects.toBe( 1 );
		await expect( promise2 ).rejects.toBe( 2 );
	} );

	test( 'running rejects promises and rethrows when processor throws', async () => {
		const processor = async () => {
			throw 'Jikes!';
		};
		const batch = createBatch( processor );
		const promise1 = batch.add( 1 );
		const promise2 = batch.add( 2 );
		await expect( batch.run() ).rejects.toBe( 'Jikes!' );
		await expect( promise1 ).rejects.toBe( 'Jikes!' );
		await expect( promise2 ).rejects.toBe( 'Jikes!' );
	} );

	test( 'running rejects promises and throws when processor returns wrong length', async () => {
		const processor = async () => [ 1 ];
		const batch = createBatch( processor );
		const promise1 = batch.add( 1 );
		const promise2 = batch.add( 2 );
		await expect( batch.run() ).rejects.toBeInstanceOf( Error );
		await expect( promise1 ).rejects.toBeInstanceOf( Error );
		await expect( promise2 ).rejects.toBeInstanceOf( Error );
	} );
} );
