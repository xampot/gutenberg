/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { useEffect, useState } from '@wordpress/element';
import { speak } from '@wordpress/a11y';

function DownloadableBlocksInserterPanel( {
	children,
	downloadableItems,
	filterValue,
	hasLocalBlocks,
} ) {
	// The panel should default to "open" if there are no local blocks found.
	const [ isPanelOpen, setPanelOpen ] = useState( ! hasLocalBlocks );
	useEffect( () => setPanelOpen( ! hasLocalBlocks ), [ filterValue ] );
	const debouncedSpeak = useDebounce( speak, 500 );
	debouncedSpeak(
		sprintf(
			/* translators: %d: number of available blocks. */
			_n(
				'%d additional block is available to install.',
				'%d additional blocks are available to install.',
				downloadableItems.length
			),
			downloadableItems.length
		)
	);

	return (
		<>
			{ hasLocalBlocks && (
				<div className="block-editor-inserter__quick-inserter-separator" />
			) }

			<div className="block-directory-downloadable-blocks-panel">
				<div className="block-directory-downloadable-blocks-panel__heading">
					<h2 className="block-directory-downloadable-blocks-panel__title">
						{ ! isPanelOpen || hasLocalBlocks
							? __( 'More blocks to use' )
							: __( 'No installed blocks found' ) }
					</h2>
					<p className="block-directory-downloadable-blocks-panel__description">
						{ isPanelOpen
							? __(
									'These blocks can be downloaded and installed.'
							  )
							: sprintf(
									/* translators: %d: number of available blocks. */
									_n(
										'%d additional block is available to install.',
										'%d additional blocks are available to install.',
										downloadableItems.length
									),
									downloadableItems.length
							  ) }
					</p>
				</div>
				{ isPanelOpen ? (
					children
				) : (
					<Button isPrimary onClick={ () => setPanelOpen( true ) }>
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
				) }
			</div>
		</>
	);
}

export default DownloadableBlocksInserterPanel;
