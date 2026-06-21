import FolderCard from './FolderCard.jsx';

export default function FolderGrid({ folders, lockedFolders, onFolderClick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
      {folders.map(folder => (
        <FolderCard key={folder.id} folder={folder} locked={false} onClick={() => onFolderClick(folder.id)} />
      ))}
      {lockedFolders.map(folder => (
        <FolderCard key={folder.id} folder={folder} locked={true} onClick={undefined} />
      ))}
    </div>
  );
}
