/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import DownloadableBlocksList from '../downloadable-blocks-list';
import DownloadableBlocksInserterPanel from './inserter-panel';
import DownloadableBlocksNoResults from './no-results';
import { store as blockDirectoryStore } from '../../store';

function DownloadableBlocksPanel( {
	downloadableItems,
	filterValue,
	onSelect,
	onHover,
	hasLocalBlocks,
	hasPermission,
	isLoading,
	isTyping,
} ) {
	if ( typeof hasPermission === 'undefined' || isLoading || isTyping ) {
		return (
			<div className="block-directory-downloadable-blocks-panel__heading">
				<p className="block-directory-downloadable-blocks-panel__description has-blocks-loading">
					<Spinner />
				</p>
			</div>
		);
	}

	if ( false === hasPermission ) {
		if ( ! hasLocalBlocks ) {
			return <DownloadableBlocksNoResults />;
		}

		return null;
	}

	return !! downloadableItems.length ? (
		<DownloadableBlocksInserterPanel
			downloadableItems={ downloadableItems }
			filterValue={ filterValue }
			hasLocalBlocks={ hasLocalBlocks }
		>
			<DownloadableBlocksList
				items={ downloadableItems }
				onSelect={ onSelect }
				onHover={ onHover }
			/>
		</DownloadableBlocksInserterPanel>
	) : (
		! hasLocalBlocks && <DownloadableBlocksNoResults />
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
