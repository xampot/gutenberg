/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { Button, Spinner } from '@wordpress/components';
import { compose, useDebounce } from '@wordpress/compose';
import { speak } from '@wordpress/a11y';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DownloadableBlocksList from '../downloadable-blocks-list';
import { store as blockDirectoryStore } from '../../store';

function DownloadableBlocksPanel( {
	downloadableItems,
	filterValue,
	onSelect,
	onHover,
	hasItems,
	hasPermission,
	isLoading,
	isWaiting,
} ) {
	const debouncedSpeak = useDebounce( speak, 500 );
	const [ isPanelOpen, setPanelOpen ] = useState( false );
	useEffect( () => {
		setPanelOpen( false );
	}, [ filterValue ] );

	if ( typeof hasPermission === 'undefined' || isLoading || isWaiting ) {
		return (
			<p className="block-directory-downloadable-blocks-panel__description has-no-results">
				<Spinner />
			</p>
		);
	}

	if ( false === hasPermission ) {
		if ( ! hasItems ) {
			debouncedSpeak( __( 'No blocks found in your library.' ) );
			return (
				<p className="block-directory-downloadable-blocks-panel__description has-no-results">
					{ __( 'No blocks found in your library.' ) }
				</p>
			);
		}

		return null;
	}

	if ( ! isPanelOpen && downloadableItems.length ) {
		return (
			<div className="block-directory-downloadable-blocks-panel">
				<h2 className="block-directory-downloadable-blocks-panel__title">
					{ hasItems
						? __( 'More blocks to use' )
						: __( 'No installed blocks found' ) }
				</h2>
				<p className="block-directory-downloadable-blocks-panel__description">
					{ sprintf(
						/* translators: %d: number of available blocks. */
						_n(
							'%d additional block is available to install.',
							'%d additional blocks are available to install.',
							downloadableItems.length
						),
						downloadableItems.length
					) }
				</p>
				<Button
					isPrimary
					onClick={ () => setPanelOpen( ! isPanelOpen ) }
				>
					{ sprintf(
						/* translators: %d: number of available blocks. */
						_n(
							'Show %d block',
							'Show %d blocks',
							downloadableItems.length
						),
						downloadableItems.length
					) }
				</Button>
			</div>
		);
	}

	return (
		<div className="block-directory-downloadable-blocks-panel">
			<h2>
				{ sprintf(
					/* translators: %d: number of available blocks. */
					_n(
						'Showing %d available block',
						'Showing %d available blocks',
						downloadableItems.length
					),
					downloadableItems.length
				) }
			</h2>
			<p className="block-directory-downloadable-blocks-panel__description">
				{ __( 'These blocks can be downloaded and installed:' ) }
			</p>
			<DownloadableBlocksList
				items={ downloadableItems }
				onSelect={ onSelect }
				onHover={ onHover }
			/>
		</div>
	);
}

export default compose( [
	withSelect( ( select, { filterValue, rootClientId = null } ) => {
		const {
			getDownloadableBlocks,
			isRequestingDownloadableBlocks,
		} = select( blockDirectoryStore );
		const { canInsertBlockType } = select( blockEditorStore );

		const hasPermission = select( 'core' ).canUser(
			'read',
			'block-directory/search'
		);

		function getInstallableBlocks( term ) {
			return getDownloadableBlocks( term ).filter( ( block ) =>
				canInsertBlockType( block, rootClientId, true )
			);
		}

		const downloadableItems = hasPermission
			? getInstallableBlocks( filterValue )
			: [];
		const isLoading = isRequestingDownloadableBlocks( filterValue );

		return {
			downloadableItems,
			hasPermission,
			isLoading,
		};
	} ),
] )( DownloadableBlocksPanel );
