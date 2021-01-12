/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { store as editPostStore } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
import DownloadableBlockListItem from '../downloadable-block-list-item';
import { store as blockDirectoryStore } from '../../store';

function DownloadableBlocksList( { items, onHover = noop, onSelect } ) {
	const composite = useCompositeState();
	const { installBlockType } = useDispatch( blockDirectoryStore );
	const { setIsInserterOpened } = useDispatch( editPostStore );

	if ( ! items.length ) {
		return null;
	}

	return (
		<Composite
			{ ...composite }
			role="listbox"
			className="block-directory-downloadable-blocks-list"
			aria-label={ __( 'Blocks available for install' ) }
		>
			{ items.map( ( item ) => {
				return (
					<DownloadableBlockListItem
						key={ item.id }
						composite={ composite }
						onClick={ () => {
							installBlockType( item ).then( ( success ) => {
								if ( success ) {
									onSelect( item );
									setIsInserterOpened( false );
								}
							} );
							onHover( null );
						} }
						onHover={ onHover }
						item={ item }
					/>
				);
			} ) }
		</Composite>
	);
}

export default DownloadableBlocksList;
