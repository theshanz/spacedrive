import { useCallback, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Object as SDObject, useLibraryMutation } from '@sd/client';
import { Divider, TextArea } from '@sd/ui';
import { MetaContainer, MetaTitle } from '../Inspector';

interface Props {
	data: SDObject;
}

export default function Note(props: Props) {
	// notes are cached in a store by their file id
	// this is so we can ensure every note has been sent to Rust even
	// when quickly navigating files, which cancels update function
	const [note, setNote] = useState(props.data.note || '');

	const { mutate: fileSetNote } = useLibraryMutation('files.setNote');

	const debounce = useDebouncedCallback(
		(note: string) =>
			fileSetNote({
				id: props.data.id,
				note
			}),
		2000
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedNote = useCallback(
		(note: string) => debounce(note),
		[props.data.id, fileSetNote]
	);

	// when input is updated, cache note
	function handleNoteUpdate(e: React.ChangeEvent<HTMLTextAreaElement>) {
		if (e.target.value !== note) {
			setNote(e.target.value);
			debouncedNote(e.target.value);
		}
	}

	return (
		<>
			<Divider />
			<MetaContainer>
				<MetaTitle>Note</MetaTitle>
				<TextArea
					className="mb-1 mt-2 !py-2 text-xs leading-snug"
					value={note || ''}
					onChange={handleNoteUpdate}
				/>{' '}
			</MetaContainer>
		</>
	);
}
